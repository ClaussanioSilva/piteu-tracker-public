import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Ruler } from "lucide-react"

interface StepHeightProps {
  height: number
  onHeightChange: (value: number) => void
  onNext: () => void
  onBack: () => void
}

export function StepHeight({ height, onHeightChange, onNext, onBack }: StepHeightProps) {
  const isValid = height >= 50 && height <= 300

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Qual é a tua altura?</h2>
            <p className="text-muted-foreground">A altura é essencial para calcular o teu IMC e necessidades calóricas.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  min="50"
                  max="300"
                  placeholder="Ex: 175"
                  value={height || ''}
                  onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
                  className="h-16 text-3xl font-bold text-center bg-muted/50 border-0 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">cm</span>
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
        message="Com o peso e a altura, conseguimos calcular o teu IMC e criar um plano nutricional personalizado para ti!" 
      />
    </div>
  )
}
