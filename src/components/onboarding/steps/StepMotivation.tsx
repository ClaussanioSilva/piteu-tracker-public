import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Heart, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepMotivationProps {
  triedBefore: boolean | null
  onTriedBeforeChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function StepMotivation({ triedBefore, onTriedBeforeChange, onNext, onBack }: StepMotivationProps) {
  const isValid = triedBefore !== null

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Já tentaste mudar os teus hábitos antes?</h2>
            <p className="text-muted-foreground">Queremos entender melhor a tua jornada.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onTriedBeforeChange(true)}
              className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-200",
                triedBefore === true 
                  ? "border-primary bg-primary/10 shadow-md" 
                  : "border-border bg-muted/30 hover:border-primary/50"
              )}
            >
              <div className="text-3xl mb-2">✋</div>
              <div className="font-semibold text-foreground">Sim, já tentei</div>
            </button>
            
            <button
              type="button"
              onClick={() => onTriedBeforeChange(false)}
              className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-200",
                triedBefore === false 
                  ? "border-primary bg-primary/10 shadow-md" 
                  : "border-border bg-muted/30 hover:border-primary/50"
              )}
            >
              <div className="text-3xl mb-2">🌟</div>
              <div className="font-semibold text-foreground">É a primeira vez</div>
            </button>
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

      {triedBefore !== null && (
        <MotivationalMessage 
          message={
            triedBefore 
              ? "Sabemos que pode ser difícil, mas desta vez vai ser diferente! Utilizadores do PiteuTracker relatam que conseguiram atingir os seus objetivos com mais facilidade usando a app. 💪"
              : "Que ótimo começar esta jornada! O PiteuTracker vai ser o teu aliado para construir hábitos saudáveis de forma simples e eficaz. 🚀"
          } 
        />
      )}
    </div>
  )
}
