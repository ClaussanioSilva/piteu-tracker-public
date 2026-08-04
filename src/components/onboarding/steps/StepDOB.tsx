import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react"
import { format, subYears } from "date-fns"

interface StepDOBProps {
  dob: Date | null
  onDOBChange: (value: Date) => void
  onNext: () => void
  onBack: () => void
}

export function StepDOB({ dob, onDOBChange, onNext, onBack }: StepDOBProps) {
  const calculateAge = (date: Date) => {
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const m = today.getMonth() - date.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--
    }
    return age
  }

  const isValid = dob !== null && calculateAge(dob) >= 14

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number)
      onDOBChange(new Date(year, month - 1, day))
    }
  }

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Quando nasceste?</h2>
            <p className="text-muted-foreground">A tua idade ajuda-nos a calcular as tuas necessidades calóricas.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Data de Nascimento</Label>
              <Input
                id="dob"
                type="date"
                value={dob ? format(dob, 'yyyy-MM-dd') : ''}
                onChange={handleDateChange}
                className="h-12 text-lg bg-muted/50 border-0"
                max={format(subYears(new Date(), 14), 'yyyy-MM-dd')}
                min={format(subYears(new Date(), 120), 'yyyy-MM-dd')}
              />
            </div>
            
            {dob && (
              <div className={`p-4 rounded-xl text-center ${calculateAge(dob) < 14 ? 'bg-destructive/10' : 'bg-muted/50'}`}>
                <span className={`text-3xl font-bold ${calculateAge(dob) < 14 ? 'text-destructive' : 'text-primary'}`}>
                  {calculateAge(dob)}
                </span>
                <span className="text-muted-foreground ml-2">anos</span>
                {calculateAge(dob) < 14 && (
                  <p className="text-destructive text-sm font-medium mt-1">
                    É necessário ter pelo menos 14 anos.
                  </p>
                )}
              </div>
            )}
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
        message="A idade é fundamental para calcular o teu metabolismo basal. Cada fase da vida tem necessidades nutricionais específicas!" 
      />
    </div>
  )
}
