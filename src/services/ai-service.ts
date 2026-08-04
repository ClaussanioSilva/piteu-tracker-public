import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export interface MealPlanRequest {
  prompt: string
  userGoals?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  userProfile?: {
    age?: number
    weight?: number
    height?: number
    activityLevel?: string
    dietaryRestrictions?: string[]
    allergies?: string[]
  }
}

export interface MealPlanResponse {
  success: boolean
  mealPlan?: {
    breakfast: string
    morning_snack: string
    lunch: string
    afternoon_snack: string
    dinner: string
    evening_snack: string
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    recommendations: string[]
    explanation?: string
  }
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

const MEAL_PLAN_CACHE_VERSION = 'v2'

type MealKey = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'

// Tipos auxiliares para a resposta do Groq e mensagens de chat
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
interface GroqChoiceMessage { content?: string }
interface GroqChoice { message?: GroqChoiceMessage }
interface GroqUsage { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
interface GroqChatResponse { choices?: GroqChoice[]; usage?: GroqUsage }

// ====== Novos tipos para extração de rótulo ======
type FoodInsert = Database['public']['Tables']['foods']['Insert']

type VisionContentText = { type: 'text'; text: string }
type VisionContentImage = { type: 'image_url'; image_url: string }
type VisionMessage = { role: 'system' | 'user'; content: Array<VisionContentText | VisionContentImage> }

export interface NutritionExtractResponse {
  success: boolean
  food?: Partial<FoodInsert>
  raw?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}


class AIService {
  private async callEdgeFunction<T>(name: string, body: unknown): Promise<T> {
    const { data, error } = await supabase.functions.invoke<T>(name, { body })
    if (error) {
      throw new Error(error.message || `Erro ao chamar função ${name}`)
    }
    return data as T
  }

  private async cacheMealPlan(request: MealPlanRequest, response: MealPlanResponse): Promise<void> {
    try {
      const requestHash = this.hashRequest(request)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Cache for 24 hours

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('ai_meal_plan_cache')
        .upsert({
          request_hash: requestHash,
          request_data: request,
          response_data: response,
          expires_at: expiresAt.toISOString()
        })
    } catch (error) {
      console.error('Error caching meal plan:', error)
    }
  }

  private async getCachedMealPlan(request: MealPlanRequest): Promise<MealPlanResponse | null> {
    try {
      const requestHash = this.hashRequest(request)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('ai_meal_plan_cache')
        .select('response_data, expires_at')
        .eq('request_hash', requestHash)
        .maybeSingle()

      const row = data as { response_data: MealPlanResponse; expires_at: string } | null
      if (row && new Date(row.expires_at) > new Date()) {
        return row.response_data
      }

      return null
    } catch (error) {
      return null
    }
  }

  private hashRequest(request: MealPlanRequest): string {
    const requestString = JSON.stringify({
      version: MEAL_PLAN_CACHE_VERSION,
      prompt: request.prompt,
      goals: request.userGoals,
      profile: request.userProfile
    })
    
    let hash = 0
    for (let i = 0; i < requestString.length; i++) {
      const char = requestString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      // garante inteiro 32-bit
      hash |= 0
    }
    return hash.toString()
  }

  private createSystemPrompt(): string {
    return `Você é um nutricionista especializado em criar planos alimentares personalizados apenas. 
    
    Sua tarefa é criar um plano alimentar completo baseado nas informações fornecidas pelo usuário.
    
    IMPORTANTE:
    - Sempre responda em português brasileiro
    - Seja específico com as quantidades dos alimentos, usando medidas e porções realistas do dia a dia
    - Todas as quantidades devem ser expressas apenas em gramas (g) ou mililitros (ml) para líquidos. Não use xícaras, colheres de sopa, colheres de chá, fatias, unidades vagas ou qualquer medida caseira.
    - EXCEÇÃO PARA OVOS: Para ovos, você DEVE indicar a quantidade numérica de unidades seguida do peso entre parênteses. Exemplo: "2 ovos cozidos (100g)", "3 ovos mexidos (150g)".
    - Para os demais alimentos, escreva sempre no formato "Alimento (XXX g)" ou "Bebida (YYY ml)". Exemplo: em vez de "2 colheres de sopa de azeite", use "Azeite de oliva (10 g)"; em vez de "1 xícara de frutas", use "Frutas variadas (150 g)"
    - Considere as metas nutricionais fornecidas
    - Se o usuário mencionar explicitamente uma quantidade de calorias por dia (ex: "quero 1800 kcal"), use esse valor como alvo principal de calorias, mesmo que seja diferente das metas salvas no perfil
    - Inclua 6 refeições: café da manhã, lanche da manhã, almoço, lanche da tarde, jantar e ceia
    - Em cada refeição principal (especialmente almoço e jantar), use no máximo UMA fonte principal de proteína animal (por exemplo: frango OU carne OU peixe), evitando combinações irreais como frango e bife juntos na mesma refeição, a menos que o usuário peça claramente
    - Prefira combinações simples e comuns na cultura brasileira/portuguesa (ex: arroz + feijão + proteína + salada, pão integral com queijo magro, iogurte com fruta e aveia, frutas típicas, etc.)
    - Evite porções exageradas; distribua calorias de forma equilibrada ao longo do dia: café da manhã 20–25%, almoço 25–35%, jantar 20–30%, lanches dividindo o restante
    - Não escreva macros no meio do texto da refeição usando padrões como "Calorias: 420, Proteínas: 18g, Carboidratos: 60g, Gorduras: 20g". O texto principal de cada refeição deve focar apenas na descrição dos alimentos e quantidades.
    - Para CADA refeição (breakfast, morning_snack, lunch, afternoon_snack, dinner, evening_snack), ao final da descrição inclua SEMPRE um único resumo dos macros dessa refeição no formato compacto: "Total: XXX kcal – Yg prot, Zg carb, Wg gord"
    - Forneça recomendações práticas e úteis
    - Seja realista e prático nas sugestões
    - Respeite estritamente todas as preferências, restrições e objetivos descritos pelo usuário e no perfil (restrições alimentares, alergias, estilo de dieta, objetivo de emagrecer/ganhar massa, horários preferidos, etc.)
    - Responda EXCLUSIVAMENTE com um bloco de código JSON válido (RFC 8259), sem texto adicional antes ou depois
    - Em strings, represente quebras de linha como \\n (não use strings multilinha)
    - Não inclua comentários, nem vírgulas finais (trailing commas)
    
    Formato da resposta (JSON):
    {
      "breakfast": "descrição detalhada do café da manhã",
      "morning_snack": "descrição do lanche da manhã",
      "lunch": "descrição do almoço",
      "afternoon_snack": "descrição do lanche da tarde",
      "dinner": "descrição do jantar",
      "evening_snack": "descrição da ceia",
      "totalCalories": número total de calorias,
      "totalProtein": total de proteínas em gramas,
      "totalCarbs": total de carboidratos em gramas,
      "totalFat": total de gorduras em gramas,
      "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
      "explanation": "explicação breve do plano criado"
    }`
  }

  // Prompt específico para o modo coach (perguntas e respostas)
  private createCoachSystemPrompt(): string {
    return `Você é o NutriCoach — um nutricionista e coach de fitness muito experiente.
    
    Objetivo: responder dúvidas sobre nutrição, dieta, o que consumir como pré-treino e pós-treino, suplementação e hábitos saudáveis (sem planos).
    
    Diretrizes:
    - Sempre responda em português brasileiro
    - Seja claro, objetivo e prático; use listas quando ajudar
    - Traga recomendações embasadas e atualizadas; evite alegações sem suporte
    - Adapte as respostas ao contexto do usuário quando fornecido
    - Quando necessário, faça 1-2 perguntas de clarificação antes de sugerir algo específico
    - Se a dúvida for clínica/médica, informe que não substitui acompanhamento profissional
    - Evite diagnósticos médicos; foque em orientações gerais e seguras
    - Dê alternativas acessíveis (comidas simples, mercado comum)
    - Mantenha tom acolhedor, natural e motivador, sem prometer resultados irreais
    - Evite dar respostas longas demais; mantenha respostas concisas
    
    Restrições (obrigatórias):
    - Não crie planos alimentares nesta conversa; direcione para a tela "Plano IA" em /ai-meal-plan
    - Não crie planos de treino
    - Não responda dúvidas específicas de exercícios de musculação; mantenha foco em nutrição e hábitos alimentares
    
    Formato da resposta:
    - Use parágrafos curtos e quebras de linha claras
    - Ao enumerar, utilize bullets com "- " para cada item
    - Evite blocos de código ou JSON; foque em texto
    `
  }

  // Chat de coach: responde perguntas livres sobre nutrição e fitness
  async coachReply(history: Array<{ role: 'user' | 'assistant'; content: string }>, context?: { profile?: Record<string, unknown> }): Promise<{ success: boolean; answer?: string; error?: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    try {
      const system = this.createCoachSystemPrompt()
      const messages: ChatMessage[] = [{ role: 'system', content: system }]

      if (context?.profile) {
        messages.push({ role: 'system', content: `Contexto do usuário: ${JSON.stringify(context.profile)}` })
      }

      for (const m of history) {
        messages.push({ role: m.role, content: m.content })
      }

      const groq = await this.callEdgeFunction<GroqChatResponse>('nutricoach', { messages })
      const content = groq.choices?.[0]?.message?.content?.trim()

      if (!content) {
        return { success: false, error: 'Resposta vazia do modelo.' }
      }

      return {
        success: true,
        answer: content,
        usage: {
          promptTokens: groq.usage?.prompt_tokens ?? 0,
          completionTokens: groq.usage?.completion_tokens ?? 0,
          totalTokens: groq.usage?.total_tokens ?? 0,
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: message }
    }
  }

  // Mensagem de erro padrão para solicitações inválidas
  private getStandardErrorMessage(): string {
    return 'Por favor, descreva com mais detalhes suas necessidades alimentares. Exemplo: "Quero um plano para ganhar massa muscular" ou "Preciso de uma dieta para emagrecer".'
  }

  private validateMealPlanPrompt(prompt: string): { isValid: boolean; error?: string } {
    const cleanPrompt = prompt.toLowerCase().trim()
    
    // Palavras-chave relacionadas a alimentação e nutrição
    const foodKeywords = [
      'alimentação', 'alimentar', 'comida', 'refeição', 'refeições', 'plano', 'dieta',
      'nutrição', 'nutricional', 'calorias', 'proteína', 'proteínas', 'carboidrato', 'carboidratos',
      'gordura', 'gorduras', 'macro', 'macros', 'café', 'almoço', 'jantar', 'lanche',
      'emagrecer', 'engordar', 'ganhar peso', 'perder peso', 'massa muscular',
      'cardápio', 'menu', 'receita', 'receitas', 'ingrediente', 'ingredientes',
      'vitamina', 'vitaminas', 'mineral', 'minerais', 'fibra', 'fibras',
      'vegetariano', 'vegano', 'low carb', 'cetogênica', 'paleo', 'mediterrânea',
      'jejum', 'bulking', 'cutting', 'definição', 'hipertrofia'
    ]
    
    // Palavras que indicam solicitações não relacionadas
    const invalidKeywords = [
      'código', 'programação', 'javascript', 'python', 'html', 'css',
      'matemática', 'cálculo', 'física', 'química', 'história', 'geografia',
      'filme', 'música', 'jogo', 'esporte', 'futebol', 'basquete',
      'política', 'economia', 'filosofia', 'religião', 'piada', 'piadas',
      'clima', 'tempo', 'notícia', 'notícias', 'tradução', 'traduzir'
    ]

    // Palavras relacionadas a treino/exercícios que devem ser bloqueadas na criação de planos
    const trainingKeywords = [
      'treino', 'treinos', 'musculação', 'exercício', 'exercícios', 'corrida', 'cardio', 'hiit',
      'agachamento', 'supino', 'remada', 'bíceps', 'tríceps', 'perna', 'ombro', 'peito', 'costas', 'academia'
    ]
    
    // Verifica se contém palavras inválidas
    const hasInvalidKeywords = invalidKeywords.some(keyword => 
      cleanPrompt.includes(keyword)
    )

    // Verifica se contém palavras de treino/exercícios
    const hasTrainingKeywords = trainingKeywords.some(keyword =>
      cleanPrompt.includes(keyword)
    )
    
    if (hasInvalidKeywords || hasTrainingKeywords) {
      return {
        isValid: false,
        error: this.getStandardErrorMessage()
      }
    }
    
    // Verifica se contém pelo menos uma palavra-chave relacionada à alimentação
    const hasFoodKeywords = foodKeywords.some(keyword => 
      cleanPrompt.includes(keyword)
    )

    // Intenção explícita de plano alimentar (frases típicas aceitas)
    const intentKeywords = ['quero', 'preciso', 'criar', 'fazer', 'montar', 'elaborar']
    const planKeywords = ['plano', 'plano alimentar', 'plano de alimentação', 'dieta', 'cardápio', 'menu']
    const goalKeywords = ['emagrecer', 'perder peso', 'ganhar massa', 'massa muscular']

    const hasIntent = intentKeywords.some(k => cleanPrompt.includes(k))
    const hasPlan = planKeywords.some(k => cleanPrompt.includes(k))
    const hasGoal = goalKeywords.some(k => cleanPrompt.includes(k))
    const looksLikePlanRequest = (hasPlan && (hasIntent || hasGoal)) || (hasGoal && hasIntent)
    
    // Se o prompt é muito curto e não tem palavras-chave, considera inválido
    if (cleanPrompt.length < 10) {
      return {
        isValid: false,
        error: this.getStandardErrorMessage()
      }
    }
    
    // Se não tem palavras-chave de comida OU não demonstra intenção de plano, inválido
    if (!hasFoodKeywords || !looksLikePlanRequest) {
      return {
        isValid: false,
        error: this.getStandardErrorMessage()
      }
    }
    
    return { isValid: true }
  }

  // Resolve metas do usuário: usa metas explícitas se fornecidas ou busca do Supabase
  private async resolveUserGoals(explicit?: MealPlanRequest['userGoals']): Promise<{ calories: number; protein: number; carbs: number; fat: number } | null> {
    try {
      if (explicit && typeof explicit.calories === 'number' && typeof explicit.protein === 'number' && typeof explicit.carbs === 'number' && typeof explicit.fat === 'number') {
        return explicit
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('nutritional_goals')
        .select('daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) return null
      if (!data) return null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const goal = data as any
      const calories = Number(goal.daily_calories)
      const protein = Number(goal.daily_protein_g)
      const carbs = Number(goal.daily_carbs_g)
      const fat = Number(goal.daily_fat_g)

      if ([calories, protein, carbs, fat].some(v => !Number.isFinite(v))) {
        return null
      }

      return { calories, protein, carbs, fat }
    } catch {
      return null
    }
  }

  private extractCaloriesFromPrompt(prompt: string): number | null {
    const text = prompt.toLowerCase()
    const patterns = [
      /(\d{3,4})\s*(kcal|calorias|caloria)/,
      /calorias\s*(?:por\s*dia)?\s*[:=]?\s*(\d{3,4})/,
      /(\d{3,4})\s*(?:k?cal)\s*(?:por\s*dia)?/
    ]

    for (const regex of patterns) {
      const match = text.match(regex)
      if (match) {
        const value = parseInt(match[1], 10)
        if (Number.isFinite(value) && value >= 800 && value <= 6000) {
          return value
        }
      }
    }

    return null
  }

  async generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
    try {
      // Validate prompt first
      const validation = this.validateMealPlanPrompt(request.prompt)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Detectar se o usuário mencionou calorias explícitas no prompt
      const explicitCalories = this.extractCaloriesFromPrompt(request.prompt)

      // Resolve metas do usuário (explícitas ou do Supabase)
      const resolvedGoals = await this.resolveUserGoals(request.userGoals)
      if (!resolvedGoals) {
        return {
          success: false,
          error: 'Não encontramos metas nutricionais ativas no seu perfil. Defina suas metas na tela "Metas" para gerar um plano.'
        }
      }

      const finalGoals = {
        ...resolvedGoals,
        calories: explicitCalories ?? resolvedGoals.calories
      }

      // Use requisição efetiva com metas resolvidas (já com possível override de calorias) para cache e prompt
      const effectiveRequest: MealPlanRequest = { ...request, userGoals: finalGoals }

      const cached = await this.getCachedMealPlan(effectiveRequest)
      if (cached) {
        if (cached.mealPlan) {
          const ensuredCachedMealPlan = this.ensureMealMacros(cached.mealPlan, finalGoals)
          return { ...cached, mealPlan: ensuredCachedMealPlan }
        }
        return cached
      }

      const systemPrompt = this.createSystemPrompt()
      
      const userPrompt = `Crie um plano alimentar personalizado com base nas seguintes informações:

OBJETIVOS NUTRICIONAIS:
- Calorias: ${effectiveRequest.userGoals!.calories} kcal/dia${explicitCalories ? ' (valor explicitamente solicitado pelo usuário, deve ser priorizado)' : ''}
- Proteínas: ${effectiveRequest.userGoals!.protein}g/dia
- Carboidratos: ${effectiveRequest.userGoals!.carbs}g/dia
- Gorduras: ${effectiveRequest.userGoals!.fat}g/dia

PERFIL DO USUÁRIO:
${effectiveRequest.userProfile ? `
- Idade: ${effectiveRequest.userProfile.age || 'Não informada'}
- Peso: ${effectiveRequest.userProfile.weight || 'Não informado'} kg
- Altura: ${effectiveRequest.userProfile.height || 'Não informada'} cm
- Nível de atividade: ${effectiveRequest.userProfile.activityLevel || 'Não informado'}
- Restrições alimentares: ${effectiveRequest.userProfile.dietaryRestrictions?.join(', ') || 'Nenhuma'}
- Alergias: ${effectiveRequest.userProfile.allergies?.join(', ') || 'Nenhuma'}
` : 'Perfil não fornecido'}

SOLICITAÇÃO ESPECÍFICA:
${effectiveRequest.prompt}

INSTRUÇÕES DE FORMATAÇÃO POR REFEIÇÃO:
- Para cada refeição (café da manhã, lanche da manhã, almoço, lanche da tarde, jantar, ceia), escreva uma descrição no estilo "Café da manhã: descrição dos alimentos (quantidades em g/ml)" e, em seguida, na MESMA string e mesma linha final, acrescente obrigatoriamente: " Total: XXX kcal – Yg prot, Zg carb, Wg gord".
- Exemplo de uma única refeição em texto: "Café da manhã: Aveia integral (50 g) com leite sem lactose (200 ml) e banana (80 g). Total: 400 kcal – 15g prot, 60g carb, 8g gord".`

      const response = await this.callEdgeFunction<GroqChatResponse>('meal-plan', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })

      const content = response.choices?.[0]?.message?.content || ''

      let mealPlanData: MealPlanResponse['mealPlan']
      try {
        mealPlanData = JSON.parse(content) as MealPlanResponse['mealPlan']
      } catch (e) {
        mealPlanData = this.parseTextResponse(content)
      }

      mealPlanData = this.ensureMealMacros(mealPlanData, finalGoals)

      const result: MealPlanResponse = {
        success: true,
        mealPlan: mealPlanData,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      }

      // Cache the result
      await this.cacheMealPlan(effectiveRequest, result)
      
      return result

    } catch (error) {
      console.error('Error generating meal plan:', error)
      
      // If it's a quota/billing error, fallback to mock
      if (error instanceof Error && error.message.includes('quota')) {
        console.log('Quota exceeded, falling back to mock response')
        return await this.generateMockMealPlan(request)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar plano alimentar'
      }
    }
  }

  private parseTextResponse(content: string): MealPlanResponse['mealPlan'] {
    return {
      breakfast: "Aveia com banana e leite desnatado + 1 colher de mel",
      morning_snack: "1 maçã + 10 amêndoas",
      lunch: "Frango grelhado (150g) + arroz integral (100g) + salada verde",
      afternoon_snack: "Iogurte grego com morangos",
      dinner: "Salmão grelhado (120g) + batata doce + brócolis",
      evening_snack: "Chá de camomila + 1 quadrado de chocolate 70%",
      totalCalories: 2000,
      totalProtein: 150,
      totalCarbs: 250,
      totalFat: 70,
      recommendations: [
        "Beba pelo menos 2 litros de água por dia",
        "Faça refeições a cada 3-4 horas",
        "Inclua vegetais em todas as refeições principais"
      ],
      explanation: "Plano gerado com base nas suas necessidades específicas"
    }
  }

  private ensureMealMacros(
    mealPlan: MealPlanResponse['mealPlan'],
    goals?: { calories: number; protein: number; carbs: number; fat: number }
  ): MealPlanResponse['mealPlan'] {
    const totalCalories =
      typeof mealPlan.totalCalories === 'number' && !Number.isNaN(mealPlan.totalCalories)
        ? mealPlan.totalCalories
        : goals?.calories
    const totalProtein =
      typeof mealPlan.totalProtein === 'number' && !Number.isNaN(mealPlan.totalProtein)
        ? mealPlan.totalProtein
        : goals?.protein
    const totalCarbs =
      typeof mealPlan.totalCarbs === 'number' && !Number.isNaN(mealPlan.totalCarbs)
        ? mealPlan.totalCarbs
        : goals?.carbs
    const totalFat =
      typeof mealPlan.totalFat === 'number' && !Number.isNaN(mealPlan.totalFat)
        ? mealPlan.totalFat
        : goals?.fat

    if (
      totalCalories === undefined ||
      totalProtein === undefined ||
      totalCarbs === undefined ||
      totalFat === undefined
    ) {
      return mealPlan
    }

    const split: Record<MealKey, number> = {
      breakfast: 0.2,
      morning_snack: 0.1,
      lunch: 0.3,
      afternoon_snack: 0.1,
      dinner: 0.25,
      evening_snack: 0.05
    }

    const mealKeys: MealKey[] = [
      'breakfast',
      'morning_snack',
      'lunch',
      'afternoon_snack',
      'dinner',
      'evening_snack'
    ]

    const mealLabels: Record<MealKey, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche da Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da Tarde',
      dinner: 'Jantar',
      evening_snack: 'Ceia'
    }

    const updated: MealPlanResponse['mealPlan'] = {
      ...mealPlan,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    }

    for (const key of mealKeys) {
      const description = mealPlan[key]
      if (!description) continue

      const label = mealLabels[key]
      let text = description.trim()
      let lower = text.toLowerCase()
      const labelPrefix = `${label.toLowerCase()}:`
      if (lower.startsWith(labelPrefix)) {
        text = text.slice(labelPrefix.length).trim()
        lower = text.toLowerCase()
      }

      const macrosStartCandidates: number[] = []
      const idxCalories = lower.indexOf('calorias:')
      const idxTotalColon = lower.indexOf('total:')
      const idxTotalSpace = lower.indexOf('total ')
      if (idxCalories !== -1) macrosStartCandidates.push(idxCalories)
      if (idxTotalColon !== -1) macrosStartCandidates.push(idxTotalColon)
      if (idxTotalSpace !== -1) macrosStartCandidates.push(idxTotalSpace)
      const macrosStart =
        macrosStartCandidates.length > 0 ? Math.min(...macrosStartCandidates) : -1

      if (macrosStart !== -1) {
        text = text.slice(0, macrosStart).trim()
      }

      text = text.replace(/[.\s]+$/g, '')

      const ratio = split[key]
      const calories = Math.round(totalCalories * ratio)
      const protein = Math.round(totalProtein * ratio)
      const carbs = Math.round(totalCarbs * ratio)
      const fat = Math.round(totalFat * ratio)

      const summary = `Total: ${calories} kcal – ${protein}g prot, ${carbs}g carb, ${fat}g gord`
      updated[key] = text ? `${text}. ${summary}` : summary
    }

    return updated
  }

  // Mock method for development/testing when API key is not available
  async generateMockMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Enforce same domain validation in mock mode
    const validation = this.validateMealPlanPrompt(request.prompt)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Resolver metas para mock também
    const resolvedGoals = await this.resolveUserGoals(request.userGoals)
    if (!resolvedGoals) {
      return {
        success: false,
        error: 'Não encontramos metas nutricionais ativas no seu perfil. Defina suas metas na tela "Metas" para gerar um plano.'
      }
    }
    
    const mockMealPlan = {
      breakfast: "Aveia com banana e leite desnatado + 1 colher de mel",
      morning_snack: "1 maçã + 10 amêndoas",
      lunch: "Frango grelhado (150g) + arroz integral (100g) + salada verde",
      afternoon_snack: "Iogurte grego com morangos",
      dinner: "Salmão grelhado (120g) + batata doce + brócolis",
      evening_snack: "Chá de camomila + 1 quadrado de chocolate 70%",
      totalCalories: resolvedGoals.calories,
      totalProtein: resolvedGoals.protein,
      totalCarbs: resolvedGoals.carbs,
      totalFat: resolvedGoals.fat,
      recommendations: [
        "Beba pelo menos 2 litros de água por dia",
        "Faça refeições a cada 3-4 horas",
        "Inclua vegetais em todas as refeições principais",
        "Evite alimentos processados",
        "Mantenha-se hidratado durante os exercícios"
      ],
      explanation: `Plano personalizado criado com base em: ${request.prompt.substring(0, 100)}...`
    }

    const ensuredMockMealPlan = this.ensureMealMacros(mockMealPlan, resolvedGoals)

    return {
      success: true,
      mealPlan: ensuredMockMealPlan,
      usage: {
        promptTokens: 150,
        completionTokens: 300,
        totalTokens: 450
      }
    }
  }

  // ====== NOVO: requisição multimodal para visão ======
  private async makeVisionRequest(messages: VisionMessage[]): Promise<GroqChatResponse> {
    const response = await this.callEdgeFunction<GroqChatResponse>('nutrition-label', { messages })
    return response
  }

  // ====== Helper para redimensionamento de imagem ======
  private async resizeImage(base64Str: string, maxDimension: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Falha ao obter contexto 2d do canvas'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        // Manter qualidade alta no JPEG
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.onerror = (err) => reject(err)
    })
  }

  // ====== NOVO: extração de dados de rótulo nutricional ======
  async extractNutritionFromLabel(imageUrl: string): Promise<NutritionExtractResponse> {
    try {
      console.log('--- Iniciando análise de imagem SnapLog ---')
      
      // Passo 1: Redimensionar para 512x512 (padrão)
      console.log('Redimensionando para 512px (padrão)...')
      const image512 = await this.resizeImage(imageUrl, 512)
      
      const systemPrompt = `Você é um nutricionista experiente e assistente de visão computacional.
Seu objetivo é analisar imagens de alimentos OU rótulos nutricionais e extrair dados nutricionais precisos.
Se for um rótulo, extraia os dados exatos.
Se for um alimento (prato, fruta, etc.), você DEVE:
1. Identificar todos os itens presentes na imagem.
2. Contar a quantidade de itens (ex: 3 hambúrgueres, 10 nuggets).
3. Estimar o peso TOTAL combinado de todos os itens visíveis com precisão, considerando a profundidade do prato e densidade.
4. Definir o campo "serving_size_g" com esse peso TOTAL estimado.
5. Para alimentos densos como arroz, feijão e massas, considere que o peso visual pode enganar. Um prato "bem servido" de arroz e feijão pesa facilmente mais de 500g.
Sempre normalize valores por 100g (ou 100ml) e retorne JSON válido.`

      const userPrompt = `Analise a imagem fornecida (pode ser um alimento ou uma tabela nutricional).
Retorne APENAS um JSON com os dados nutricionais estimados ou extraídos.

Regras CRÍTICAS para QUANTIDADE e CALORIAS:
- Se houver MÚLTIPLOS itens (ex: 3 hambúrgueres), o "serving_size_g" deve ser a soma do peso de TODOS eles.
- Exemplo: Se 1 hambúrguer pesa 200g e há 3 na imagem, "serving_size_g" deve ser 600.
- NÃO retorne o peso de uma única unidade se houver várias.
- O objetivo é calcular as calorias totais da refeição fotografada.
- ATENÇÃO: Não subestime porções de carboidratos densos (arroz, macarrão, purê). Ajuste a estimativa de peso para cima se o prato parecer cheio.

DETECÇÃO DE INCERTEZA (Fallback):
- Se a imagem estiver borrada, escura, cortada ou você não conseguir identificar o alimento com certeza:
- Defina o campo "confidence" como "low".
- Inclua uma breve explicação no campo "description".
- Se você tiver certeza razoável, use "confidence": "high" ou "medium".

Outras regras:
- Responda exclusivamente com JSON válido (sem texto fora do JSON).
- Normalize os macros para "*_per_100g" (ou 100ml se for líquido).
- Inclua "serving_size_g" (peso TOTAL estimado de tudo na imagem) e "name" (nome do alimento/prato).
- Se for uma refeição composta, estime a soma dos macros ponderada pelos ingredientes.
- NUNCA inclua comentários.

Formato esperado:
{
  "name": string,
  "description": string | null,
  "confidence": "high" | "medium" | "low",
  "serving_size_g": number,
  "calories_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "fiber_per_100g": number | null,
  "sugar_per_100g": number | null,
  "sodium_per_100g": number | null,
  "ingredients": string | null,
  "allergens": [string] | null,
  "source": "ai_vision"
}`

      const messages: VisionMessage[] = [
        { role: 'system' as const, content: [{ type: 'text', text: systemPrompt }] },
        { role: 'user' as const, content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: image512 }
        ] }
      ]

      console.log('Enviando requisição (512px)...')
      const response = await this.makeVisionRequest(messages)
      const content = response.choices?.[0]?.message?.content || ''

      // Tentar extrair JSON do retorno
      let parsed: Partial<FoodInsert> & { confidence?: string } | undefined
      try {
        const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
        const rawJsonText = jsonBlockMatch ? jsonBlockMatch[1] : (content.match(/\{[\s\S]*\}/)?.[0] || '')
        if (!rawJsonText) {
          throw new Error('No JSON found in response')
        }
        let sanitized = rawJsonText.replace(/^\uFEFF/, '').trim()
        sanitized = sanitized.replace(/,\s*([}\]])/g, '$1')
        sanitized = sanitized.replace(/"(?:\\.|[^"\\])*"/g, (m) =>
          m.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
        )
        parsed = JSON.parse(sanitized)
      } catch (err) {
        console.error('Erro ao parsear resposta de visão (512px):', err)
      }

      // Lógica de Fallback
      if (parsed) {
        // Verificar sinais de incerteza
        const confidence = parsed.confidence?.toLowerCase()
        const description = (parsed.description || '').toLowerCase()
        const isUncertain = 
          confidence === 'low' || 
          description.includes('não tenho certeza') ||
          description.includes('difícil de estimar') ||
          description.includes('pouco clara') ||
          description.includes('unable to identify') ||
          description.includes('uncertain')

        if (isUncertain) {
          console.warn('⚠️ INCERTEZA DETECTADA na análise 512px. Iniciando Fallback...')
          console.log('Redimensionando para 768px (Fallback)...')
          
          const image768 = await this.resizeImage(imageUrl, 768)
          
          // Atualiza a imagem na mensagem
          // messages[1] é o user prompt
          if (Array.isArray(messages[1].content)) {
            const imgContent = messages[1].content.find(c => c.type === 'image_url') as VisionContentImage
            if (imgContent) {
              imgContent.image_url = image768
            }
          }

          console.log('Reenviando requisição (768px)...')
          const responseFallback = await this.makeVisionRequest(messages)
          const contentFallback = responseFallback.choices?.[0]?.message?.content || ''
          
          try {
             const jsonBlockMatch = contentFallback.match(/```json\s*([\s\S]*?)\s*```/)
             const rawJsonText = jsonBlockMatch ? jsonBlockMatch[1] : (contentFallback.match(/\{[\s\S]*\}/)?.[0] || '')
             if (rawJsonText) {
                let sanitized = rawJsonText.replace(/^\uFEFF/, '').trim()
                sanitized = sanitized.replace(/,\s*([}\]])/g, '$1')
                sanitized = sanitized.replace(/"(?:\\.|[^"\\])*"/g, (m) =>
                  m.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
                )
                parsed = JSON.parse(sanitized)
                console.log('✅ Fallback concluído com sucesso.')
             }
          } catch (errFallback) {
             console.error('Erro no parse do Fallback:', errFallback)
             // Mantém o resultado original (mesmo incerto) se o fallback falhar totalmente
          }
        } else {
          console.log('✅ Análise 512px aceita (Confiança adequada).')
        }
      }

      // Garantir mínimos obrigatórios e normalizar defaults
      if (parsed) {
        parsed.source = parsed.source || 'nutrition_label_ai'
        parsed.serving_size_g = Number(parsed.serving_size_g || 100)
        parsed.calories_per_100g = Number(parsed.calories_per_100g || 0)
        parsed.protein_per_100g = Number(parsed.protein_per_100g || 0)
        parsed.carbs_per_100g = Number(parsed.carbs_per_100g || 0)
        parsed.fat_per_100g = Number(parsed.fat_per_100g || 0)
      }

      return {
        success: true,
        food: parsed,
        raw: content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      console.error('Erro na extração de rótulo via IA:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na extração de rótulo'
      }
    }
  }

  // Check if AI service is properly configured
  isConfigured(): boolean {
    return true
  }

  async transcribeAudio(audioFile: Blob): Promise<{ success: boolean; text?: string; error?: string }> {
    const formData = new FormData()
    formData.append('file', audioFile, 'recording.webm') 
    formData.append('mode', 'transcribe')

    try {
      const data = await this.callEdgeFunction<{ text: string }>('voice-log', formData)
      return { success: true, text: data.text }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido na transcrição'
      console.error('Transcription error:', error)
      return { success: false, error: message }
    }
  }

  // Parse Voice Log
  async parseVoiceLog(text: string): Promise<{ success: boolean; data?: { item_name: string; quantity_g?: number; type: 'food' | 'meal' }; error?: string }> {
    try {
      const systemPrompt = `
        Você é um assistente nutricional. Analise o texto transcrito de um comando de voz para registro de alimentos.
        Identifique o alimento ou refeição e a quantidade (se aplicável).
        
        Regras:
        1. Se for um alimento (ex: "arroz", "banana", "frango"), tente identificar a quantidade em gramas.
           - Se o usuário disser unidades (ex: "1 banana"), estime o peso em gramas (ex: 1 banana média = 100g).
           - Se não houver quantidade, assuma 100g.
           - Defina "type" como "food".
        2. Se for uma refeição (ex: "café da manhã", "almoço de domingo", "minha vitamina"), defina "type" como "meal" e ignore quantidade.
        
        Retorne APENAS um JSON válido (sem markdown) com este formato:
        {
          "item_name": "nome identificado",
          "quantity_g": 100, // número (apenas para foods)
          "type": "food" // ou "meal"
        }
      `

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]

      const groqResponse = await this.callEdgeFunction<GroqChatResponse>('voice-log', {
        mode: 'parse',
        messages
      })
      const content = groqResponse.choices?.[0]?.message?.content?.trim()

      if (!content) {
        throw new Error('Resposta vazia do modelo')
      }

      // Try to parse JSON
      let parsedData
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0])
        } else {
          parsedData = JSON.parse(content)
        }
      } catch (e) {
        console.error('Failed to parse voice log JSON:', content)
        throw new Error('Falha ao interpretar os dados do voz')
      }

      return { success: true, data: parsedData }

    } catch (error) {
       const message = error instanceof Error ? error.message : 'Erro ao processar comando de voz'
       return { success: false, error: message }
    }
  }

  // Get available AI models
  async getAvailableModels(): Promise<string[]> {
    return [
      'gpt-4o-mini',
      'gpt-4o',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ]
  }
}

export const aiService = new AIService()
