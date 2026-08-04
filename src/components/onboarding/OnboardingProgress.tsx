import { cn } from "@/lib/utils"

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Passo {currentStep} de {totalSteps}</span>
        <span className="text-primary font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
