import { useState } from "react"
import { Bot, Send, Loader2, Sparkles, Target, Calendar, UtensilsCrossed, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNutrition } from "@/providers/nutrition-context"
import { aiService, MealPlanRequest, MealPlanResponse } from "@/services/ai-service"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Tipos auxiliares para ordenação de refeições
type MealKey = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
export default function AIMealPlan() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlanResponse['mealPlan'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { dailyGoals } = useNutrition()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleGenerateMealPlan = async () => {
    if (!prompt.trim()) {
      setError("Por favor, descreva suas necessidades alimentares")
      return
    }

    setIsGenerating(true)
    setError(null)
    setMealPlan(null)

    try {
      // Se metas do contexto existirem e estiverem completas, envie-as; caso contrário deixe indefinido
      const maybeTargets = dailyGoals ? [
        dailyGoals.calories?.target,
        dailyGoals.protein?.target,
        dailyGoals.carbs?.target,
        dailyGoals.fat?.target
      ] : []
      const hasAllTargets = Array.isArray(maybeTargets) && maybeTargets.length === 4 && maybeTargets.every(v => typeof v === 'number' && !Number.isNaN(v as number))

      const request: MealPlanRequest = {
        prompt: prompt.trim(),
        userGoals: hasAllTargets ? {
          calories: dailyGoals!.calories!.target!,
          protein: dailyGoals!.protein!.target!,
          carbs: dailyGoals!.carbs!.target!,
          fat: dailyGoals!.fat!.target!
        } : undefined
      }

      let response: MealPlanResponse
      
      // Use real AI service if configured, otherwise use mock
      if (aiService.isConfigured()) {
        response = await aiService.generateMealPlan(request)
      } else {
        console.log("AI service not configured, using mock response")
        response = await aiService.generateMockMealPlan(request)
      }

      if (response.success && response.mealPlan) {
        setMealPlan(response.mealPlan)
      } else {
        // Check if it's a quota error and show helpful message
        if (response.error?.includes('quota')) {
          setError("Limite de créditos da OpenAI excedido. Adicione créditos em https://platform.openai.com/account/billing ou aguarde o reset mensal.")
        } else {
          setError(response.error || "Erro ao gerar plano de alimentação")
        }
      }
    } catch (err) {
      setError("Erro ao gerar plano de alimentação. Tente novamente.")
      console.error("Error generating meal plan:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const getMealTimeLabel = (mealTime: string) => {
    const labels: Record<string, string> = {
      breakfast: "Café da Manhã",
      morning_snack: "Lanche da Manhã",
      lunch: "Almoço",
      afternoon_snack: "Lanche da Tarde",
      dinner: "Jantar",
      evening_snack: "Ceia"
    }
    return labels[mealTime] || mealTime
  }

  const getMealTimeIcon = (mealTime: string) => {
    const icons: Record<string, string> = {
      breakfast: "🌅",
      morning_snack: "🍎",
      lunch: "🍽️",
      afternoon_snack: "🥤",
      dinner: "🌙",
      evening_snack: "🌙"
    }
    return icons[mealTime] || "🍽️"
  }

  const handleSaveMealPlan = async () => {
    if (!mealPlan) return
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Faça login para salvar", description: "Entre para guardar seus planos." })
        setIsSaving(false)
        return
      }

      const title = `Plano IA - ${new Date().toLocaleString()}`

      const { error: insertError } = await supabase
        .from('my_meal_plans')
        .insert({
          user_id: user.id,
          title,
          plan_data: mealPlan,
          source_prompt: prompt.trim()
        })

      if (insertError) throw insertError

      toast({ title: "Plano salvo", description: "Seu plano foi guardado com sucesso." })
    } catch (err) {
      console.error('Erro ao salvar plano:', err)
      toast({ title: "Erro ao salvar", description: "Tente novamente mais tarde." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          Plano IA
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Crie um plano alimentar personalizado com inteligência artificial
        </p>
      </div>

      {/* Prompt Input Section */}
      <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Target className="w-4 h-4 text-primary" />
            Suas Necessidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Ex: Quero ganhar massa muscular, sou vegetariano, treino 4x por semana..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl border-border/50 focus:border-primary/50 bg-background/50"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground px-1">
              Seja específico sobre seus objetivos e restrições.
            </p>
          </div>

          <Button 
            onClick={handleGenerateMealPlan}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 rounded-xl h-12"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Plano...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Plano Personalizado
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Goals Reference */}
      {dailyGoals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-primary">{dailyGoals.calories?.target || 0}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Kcal</span>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-foreground">{dailyGoals.protein?.target || 0}g</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Prot</span>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-foreground">{dailyGoals.carbs?.target || 0}g</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Carb</span>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-foreground">{dailyGoals.fat?.target || 0}g</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Gord</span>
          </div>
        </div>
      )}

      {/* Generated Meal Plan */}
      {mealPlan && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          {/* Meal Plan Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 border border-primary/10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-primary">Plano Gerado</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background/60 backdrop-blur rounded-2xl">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {mealPlan.totalCalories}
                </div>
                <div className="text-xs text-muted-foreground">Calorias</div>
              </div>
              <div className="text-center p-3 bg-background/60 backdrop-blur rounded-2xl">
                <div className="text-lg md:text-xl font-bold text-green-600">
                  {mealPlan.totalProtein}g
                </div>
                <div className="text-xs text-muted-foreground">Proteínas</div>
              </div>
              <div className="text-center p-3 bg-background/60 backdrop-blur rounded-2xl">
                <div className="text-lg md:text-xl font-bold text-orange-600">
                  {mealPlan.totalCarbs}g
                </div>
                <div className="text-xs text-muted-foreground">Carboidratos</div>
              </div>
              <div className="text-center p-3 bg-background/60 backdrop-blur rounded-2xl">
                <div className="text-lg md:text-xl font-bold text-purple-600">
                  {mealPlan.totalFat}g
                </div>
                <div className="text-xs text-muted-foreground">Gorduras</div>
              </div>
            </div>
          </div>

          {/* Daily Meals */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 px-1">
              <Calendar className="w-5 h-5 text-primary" />
              Cronograma Diário
            </h3>
            
            <div className="space-y-3">
              {(['breakfast','morning_snack','lunch','afternoon_snack','dinner','evening_snack'] as MealKey[]).map((mealTime, index) => {
                const mealDescription = mealPlan![mealTime]
                if (!mealDescription) return null
                return (
                  <Card key={mealTime} className="border-none shadow-sm bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 w-12 rounded-2xl bg-muted/30 text-2xl">
                        {getMealTimeIcon(mealTime)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {getMealTimeLabel(mealTime)}
                          </h4>
                          <Badge variant="secondary" className="text-[10px] font-normal opacity-70">
                            {index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mealDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-300">
                <UtensilsCrossed className="w-4 h-4" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealPlan.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <p>{recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={() => setMealPlan(null)}
              variant="outline"
              className="w-full rounded-xl h-12 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Gerar Novo Plano
            </Button>
            <Button 
              onClick={handleSaveMealPlan}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 rounded-xl h-12"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>Salvar Plano</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <Card className="shadow-soft bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            Dicas para Melhores Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
            <p>• Seja específico sobre suas metas (perda de peso, ganho de massa, manutenção)</p>
            <p>• Mencione restrições alimentares, alergias ou preferências</p>
            <p>• Inclua informações sobre seu nível de atividade física</p>
            <p>• Especifique se tem alguma condição de saúde relevante</p>
            <p>• Mencione seu orçamento para alimentos se necessário</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Service Status */}
      <Card className={`shadow-soft ${aiService.isConfigured() 
        ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-base md:text-lg ${aiService.isConfigured() 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            <Bot className="w-4 h-4 md:w-5 md:h-5" />
            Status do Serviço de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-2 text-sm ${aiService.isConfigured() 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {aiService.isConfigured() ? (
              <>
                <p>✅ Serviço de IA configurado e funcionando</p>
                <p>• Usando Groq AI para gerar planos personalizados</p>
                <p>• Respostas em tempo real com inteligência artificial</p>
              </>
            ) : (
              <>
                <p>⚠️ Serviço de IA não configurado</p>
                <p>• Usando respostas simuladas para demonstração</p>
                <p>• Configure VITE_GROQ_API_KEY para usar IA real</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
