import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Scale } from "lucide-react"

interface StepWeightProps {
  weight: number
  onWeightChange: (value: number) => void
  onNext: () => void
  onBack: () => void
}

export function StepWeight({ weight, onWeightChange, onNext, onBack }: StepWeightProps) {
  const isValid = weight >= 20 && weight <= 500

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Qual é o teu peso atual?</h2>
            <p className="text-muted-foreground">Não te preocupes, esta informação é privada e podes atualizá-la sempre que quiseres.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  placeholder="Ex: 70"
                  value={weight || ''}
                  onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
                  className="h-16 text-3xl font-bold text-center bg-muted/50 border-0 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">kg</span>
              </div>
            </div>
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
        message="O peso atual é o ponto de partida. O importante é a jornada e o progresso, não a perfeição!" 
      />
    </div>
  )
}
