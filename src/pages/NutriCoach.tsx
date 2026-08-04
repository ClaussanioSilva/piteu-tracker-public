import { useEffect, useRef, useState } from 'react'
import { aiService } from '@/services/ai-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Send, Bot, ArrowLeft, User } from 'lucide-react'
import { useProfile, useNutritionalGoals } from '@/hooks/use-supabase'
import { useNavigate } from 'react-router-dom'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function NutriCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Mensagem inicial do coach (igual ao screenshot)
    setMessages([
      {
        role: 'assistant',
        content:
          'Olá! Eu sou o NutriCoach, seu assistente de nutrição. Como posso ajudá-lo hoje?'
      }
    ])
  }, [])

  useEffect(() => {
    // Auto-scroll para última mensagem
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const { profile } = useProfile()
  const { goals } = useNutritionalGoals()

  function renderAssistantContent(text: string) {
    // Parser simples para parágrafos e listas com bullets
    const lines = text.split('\n').map(l => l.trimEnd())
    const blocks: JSX.Element[] = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (!line) { i++; continue }
      // Bloco de lista
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const items: string[] = []
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          items.push(lines[i].replace(/^[-*]\s+/, ''))
          i++
        }
        blocks.push(
          <ul key={`list-${i}`} className="list-disc pl-5 space-y-1">
            {items.map((it, idx) => <li key={idx}>{it}</li>)}
          </ul>
        )
        continue
      }
      // Parágrafo (continua até linha vazia ou início de lista)
      const para: string[] = []
      while (i < lines.length && lines[i] && !lines[i].startsWith('- ') && !lines[i].startsWith('* ')) {
        para.push(lines[i])
        i++
      }
      blocks.push(<p key={`para-${i}`} className="mb-2">{para.join(' ')}</p>)
    }
    return <div>{blocks}</div>
  }

  function isMealPlanRequest(text: string) {
    const patterns = [
      /plano\s+alimentar/i,
      /plano\s+de\s+alimentação/i,
      /montar\s+(uma\s+)?dieta/i,
      /crie\s+(uma\s+)?dieta/i,
      /meal\s*plan/i,
      /diet\s*plan/i,
      /card[áa]pio/i,
      /plano\s+de\s+refeições/i,
      /simular\s+(um\s+)?plano\s+(alimentar|de\s+alimentação|de\s+refeições)/i,
      /simule\s+(uma\s+)?dieta/i,
    ]
    return patterns.some((p) => p.test(text))
  }

  function isTrainingRequest(text: string) {
    const patterns = [
      /plano\s+de\s+treino/i,
      /plano\s+de\s+treinamento/i,
      /montar\s+(um\s+)?treino/i,
      /crie\s+(um\s+)?treino/i,
      /rotina\s+de\s+musculação/i,
      /treino\s+completo/i,
      /exercícios\s+de\s+musculação/i,
      /lista\s+de\s+exercícios/i,
    ]
    return patterns.some((p) => p.test(text))
  }

  const SUGGESTED_QUESTIONS = [
    "Como posso melhorar minha ingestão de proteínas?",
    "Quais são boas fontes de carboidratos complexos?",
    "Dicas para reduzir o consumo de açúcar?",
    "Qual a importância da hidratação?",
    "Sugestões de lanches saudáveis?"
  ]

  async function handleSend(textOverride?: string | unknown) {
    const text = typeof textOverride === 'string' ? textOverride : input.trim()
    if (!text || sending) return

    if (!aiService.isConfigured()) {
      toast({
        title: 'Configuração ausente',
        description: 'A chave da API não está configurada. Configure VITE_GROQ_API_KEY para usar o NutriCoach.',
        variant: 'destructive'
      })
      return
    }

    setSending(true)
    const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextHistory)
    setInput('')

    // Guarda de intenção: planos e treino
    if (isMealPlanRequest(text)) {
      // Redireciona diretamente para a tela de Plano IA
      toast({
        title: 'Criação de Plano Alimentar',
        description: 'Você será redirecionado para a tela dedicada de plano alimentar.',
      })
      navigate('/ai-meal-plan')
      setSending(false)
      return
    }

    if (isTrainingRequest(text)) {
      setMessages([
        ...nextHistory,
        {
          role: 'assistant',
          content:
            'No momento, o NutriCoach não cria planos de treino nem responde dúvidas específicas de exercícios de musculação. Aqui focamos em nutrição e hábitos alimentares.'
        }
      ])
      setSending(false)
      return
    }

    try {
      const result = await aiService.coachReply(nextHistory, {
        profile: {
          // Perfil básico
          full_name: profile?.full_name ?? undefined,
          email: profile?.email ?? undefined,
          age: profile?.age ?? undefined,
          gender: profile?.gender ?? undefined,
          height_cm: profile?.height_cm ?? undefined,
          weight_kg: profile?.weight_kg ?? undefined,
          activity_level: profile?.activity_level ?? undefined,
          goal: profile?.goal ?? undefined,
          // Metas nutricionais ativas
          goals: goals ? {
            daily_calories: goals.daily_calories,
            daily_protein_g: goals.daily_protein_g,
            daily_carbs_g: goals.daily_carbs_g,
            daily_fat_g: goals.daily_fat_g,
            daily_fiber_g: goals.daily_fiber_g,
            daily_sodium_mg: goals.daily_sodium_mg,
            daily_sugar_g: goals.daily_sugar_g
          } : undefined
        }
      })
      if (!result.success) {
        throw new Error(result.error || 'Falha ao obter resposta')
      }

      setMessages([...nextHistory, { role: 'assistant', content: result.answer || '' }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({ title: 'Erro no NutriCoach', description: message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] sm:h-[85vh] w-full max-w-3xl mx-auto bg-background">
      {/* Cabeçalho da página */}
      <div className="flex h-10 pb-6 items-center py-3 sticky top-0 z-20 sm:px-0 flex-shrink-0 bg-background/95 backdrop-blur border-b sm:border-none">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="mr-2 -ml-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-primary leading-tight">NutriCoach</h1>
        </div>
      </div>

      {/* Área do chat */}
      <Card className="flex-1 flex flex-col border-0 sm:border rounded-none sm:rounded-2xl shadow-none sm:shadow-sm overflow-hidden bg-transparent sm:bg-card relative">
        <CardContent className="flex-1 flex flex-col p-0 sm:p-4 h-full relative">
          <ScrollArea className="flex-1 pr-4 pb-32" ref={scrollRef}>
            <div className="space-y-4 pb-4 sm:px-0 pt-4">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex items-end gap-2 sm:gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-primary/20 shadow-sm flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      m.role === 'assistant' 
                        ? 'max-w-[85%] sm:max-w-[80%] bg-card border border-border rounded-bl-none' 
                        : 'max-w-[75%] sm:max-w-[70%] bg-primary text-primary-foreground rounded-br-none'
                    }`}>
                      {m.role === 'assistant' ? (
                        <div className="break-words text-foreground">{renderAssistantContent(m.content)}</div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed break-words">{m.content}</div>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-primary/20 shadow-sm flex-shrink-0">
                        {/* @ts-ignore */}
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Sugestões de perguntas */}
                {!messages.some(m => m.role === 'user') && (
                  <div className="grid gap-2 sm:px-0 mt-4 animate-fade-in">
                    <p className="text-xs font-medium text-muted-foreground mb-1 px-1 uppercase tracking-wider">Sugestões</p>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left whitespace-normal text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                        onClick={() => handleSend(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Indicador de digitando */}
                {sending && (
                  <div className="flex items-end gap-3 justify-start">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-primary/20 shadow-sm">
                       <AvatarFallback className="bg-primary/10 text-primary">
                         <Bot className="h-4 w-4" />
                       </AvatarFallback>
                     </Avatar>
                    <div className="rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm bg-card border border-border">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Digitando...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Barra de entrada */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-background border-t">
              <div className="w-full max-w-3xl mx-auto relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua pergunta..."
                  className="h-14 rounded-full pl-6 pr-14 bg-background border-2 border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 text-base shadow-sm"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={sending || !input.trim()} 
                  size="icon" 
                  className="absolute right-2 top-2 h-10 w-10 rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}