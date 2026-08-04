import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowRight, User } from "lucide-react"

interface StepNameProps {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onNext: () => void
}

export function StepName({ firstName, lastName, onFirstNameChange, onLastNameChange, onNext }: StepNameProps) {
  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Olá! Como te chamas?</h2>
            <p className="text-muted-foreground">Vamos começar por nos conhecermos melhor.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Primeiro Nome</Label>
              <Input
                id="firstName"
                placeholder="Ex: João"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="h-12 text-lg bg-muted/50 border-0"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Último Nome</Label>
              <Input
                id="lastName"
                placeholder="Ex: Silva"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="h-12 text-lg bg-muted/50 border-0"
              />
            </div>
          </div>

          <Button
            onClick={onNext}
            disabled={!isValid}
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </OnboardingCard>

      {firstName.trim().length >= 2 && (
        <MotivationalMessage 
          message={`Prazer em conhecer-te, ${firstName}! Vamos criar o teu perfil personalizado para te ajudar a alcançar os teus objetivos.`} 
        />
      )}
    </div>
  )
}
