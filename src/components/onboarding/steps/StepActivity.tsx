import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Activity, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

interface StepActivityProps {
  activityLevel: ActivityLevel | null
  onActivityChange: (value: ActivityLevel) => void
  onNext: () => void
  onBack: () => void
}

const activityOptions = [
  {
    value: 'sedentary' as const,
    label: 'Sedentário',
    description: 'Pouco ou nenhum exercício',
    emoji: '🛋️'
  },
  {
    value: 'light' as const,
    label: 'Leve',
    description: 'Exercício 1-3 dias/semana',
    emoji: '🚶'
  },
  {
    value: 'moderate' as const,
    label: 'Moderado',
    description: 'Exercício 3-5 dias/semana',
    emoji: '🏃'
  },
  {
    value: 'active' as const,
    label: 'Ativo',
    description: 'Exercício 6-7 dias/semana',
    emoji: '🏋️'
  },
  {
    value: 'very_active' as const,
    label: 'Muito Ativo',
    description: 'Exercício intenso diário',
    emoji: '🔥'
  }
]

export function StepActivity({ activityLevel, onActivityChange, onNext, onBack }: StepActivityProps) {
  const isValid = activityLevel !== null

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Qual é o teu nível de atividade?</h2>
            <p className="text-muted-foreground">Sê honesto para obter resultados precisos.</p>
          </div>

          <div className="space-y-3">
            {activityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onActivityChange(option.value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left",
                  activityLevel === option.value 
                    ? "border-primary bg-primary/10 shadow-md" 
                    : "border-border bg-muted/30 hover:border-primary/50"
                )}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                {activityLevel === option.value && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="h-14 px-6 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
              className="flex-1 h-14 text-lg font-semibold rounded-xl"
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </OnboardingCard>

      <MotivationalMessage 
        message="O nível de atividade determina quantas calorias extras queimas por dia. Escolhe a opção mais próxima da tua rotina atual." 
      />
    </div>
  )
}
