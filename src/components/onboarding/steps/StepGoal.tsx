import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Target, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Goal = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'

interface StepGoalProps {
  goal: Goal | null
  onGoalChange: (value: Goal) => void
  onNext: () => void
  onBack: () => void
}

const goalOptions = [
  {
    value: 'lose_weight' as const,
    label: 'Perder Peso',
    description: 'Queimar gordura e emagrecer',
    emoji: '🔥',
    color: 'text-orange-500'
  },
  {
    value: 'maintain' as const,
    label: 'Manter Peso',
    description: 'Manter o peso atual',
    emoji: '⚖️',
    color: 'text-blue-500'
  },
  {
    value: 'gain_weight' as const,
    label: 'Ganhar Peso',
    description: 'Aumentar o peso de forma saudável',
    emoji: '📈',
    color: 'text-green-500'
  },
  {
    value: 'gain_muscle' as const,
    label: 'Ganhar Músculos',
    description: 'Foco em hipertrofia',
    emoji: '💪',
    color: 'text-purple-500'
  }
]

export function StepGoal({ goal, onGoalChange, onNext, onBack }: StepGoalProps) {
  const isValid = goal !== null

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Qual é o teu objetivo?</h2>
            <p className="text-muted-foreground">Vamos ajudar-te a alcançar o que desejas!</p>
          </div>

          <div className="space-y-3">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onGoalChange(option.value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left",
                  goal === option.value 
                    ? "border-primary bg-primary/10 shadow-md" 
                    : "border-border bg-muted/30 hover:border-primary/50"
                )}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                {goal === option.value && (
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

      {goal && (
        <MotivationalMessage 
          message={
            goal === 'lose_weight' 
              ? "Excelente escolha! Vamos criar um déficit calórico saudável para ti."
              : goal === 'maintain'
              ? "Manter o peso é tão importante quanto perder ou ganhar. Vamos equilibrar a tua alimentação!"
              : goal === 'gain_weight'
              ? "Vamos ajudar-te a ganhar peso de forma saudável, com os nutrientes certos!"
              : "Músculos exigem proteína e treino! Vamos otimizar a tua alimentação para hipertrofia."
          } 
        />
      )}
    </div>
  )
}
