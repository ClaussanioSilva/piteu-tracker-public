import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Percent, SkipForward } from "lucide-react"

interface StepBodyFatProps {
  bodyFat: number | null
  onBodyFatChange: (value: number | null) => void
  onNext: () => void
  onBack: () => void
}

export function StepBodyFat({ bodyFat, onBodyFatChange, onNext, onBack }: StepBodyFatProps) {
  const handleSkip = () => {
    onBodyFatChange(null)
    onNext()
  }

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Sabes a tua % de gordura corporal?</h2>
            <p className="text-muted-foreground">Esta informação é opcional e ajuda a refinar os cálculos.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
              <div className="relative">
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  placeholder="Ex: 15"
                  value={bodyFat || ''}
                  onChange={(e) => onBodyFatChange(parseFloat(e.target.value) || null)}
                  className="h-16 text-3xl font-bold text-center bg-muted/50 border-0 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
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
                disabled={bodyFat !== null && (bodyFat < 3 || bodyFat > 60)}
                className="flex-1 h-14 text-lg font-semibold rounded-xl"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Pular e preencher depois
            </Button>
          </div>
        </div>
      </OnboardingCard>

      <MotivationalMessage 
        message="Não te preocupes se não souberes este valor. Podes sempre atualizar mais tarde no teu perfil!" 
      />
    </div>
  )
}
