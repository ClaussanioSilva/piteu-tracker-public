import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OnboardingCard } from "../OnboardingCard"
import { MotivationalMessage } from "../MotivationalMessage"
import { ArrowLeft, Loader2, CheckCircle, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface OnboardingData {
  firstName: string
  lastName: string
  dob: Date | null
  weight: number
  height: number
  bodyFat: number | null
  gender: 'male' | 'female' | null
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | null
}

interface StepCreateAccountProps {
  data: OnboardingData
  onBack: () => void
}

export function StepCreateAccount({ data, onBack }: StepCreateAccountProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPassword = password.length >= 6
  const isValid = isValidEmail && isValidPassword

  const calculateAge = (date: Date) => {
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const m = today.getMonth() - date.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--
    }
    return age
  }

  const calculateGoals = (userData: OnboardingData) => {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    const age = userData.dob ? calculateAge(userData.dob) : 25
    const weight = userData.weight
    const height = userData.height
    const gender = userData.gender || 'male'
    const activityLevel = userData.activityLevel || 'moderate'
    const goal = userData.goal || 'maintain'

    // BMR using Mifflin-St Jeor
    let bmr: number
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
    }

    // TDEE
    const tdee = bmr * activityMultipliers[activityLevel]

    // Target calories based on goal
    let targetCalories: number
    switch (goal) {
      case 'lose_weight':
        targetCalories = Math.round(tdee - 500)
        break
      case 'gain_weight':
      case 'gain_muscle':
        targetCalories = Math.round(tdee + 300)
        break
      default:
        targetCalories = Math.round(tdee)
    }

    // Macros
    let proteinRatio: number, fatRatio: number, carbsRatio: number
    if (goal === 'lose_weight') {
      proteinRatio = 0.35
      fatRatio = 0.35
      carbsRatio = 0.30
    } else if (goal === 'gain_muscle' || goal === 'gain_weight') {
      proteinRatio = 0.25
      fatRatio = 0.25
      carbsRatio = 0.50
    } else {
      proteinRatio = 0.30
      fatRatio = 0.30
      carbsRatio = 0.40
    }

    return {
      daily_calories: targetCalories,
      daily_protein_g: Math.round((targetCalories * proteinRatio) / 4),
      daily_carbs_g: Math.round((targetCalories * carbsRatio) / 4),
      daily_fat_g: Math.round((targetCalories * fatRatio) / 9),
      daily_fiber_g: 25,
      daily_sodium_mg: 2300,
      daily_sugar_g: 50
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    try {
      // 1. Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${data.firstName} ${data.lastName}`.trim()
          }
        }
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error("Erro ao criar conta")
      }

      // 2. Auto login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // If auto login fails, still consider signup successful
        toast({
          title: "Conta criada com sucesso!",
          description: "Por favor, faça login para continuar.",
        })
        navigate("/login")
        return
      }

      // 3. Update profile with onboarding data
      const age = data.dob ? calculateAge(data.dob) : null
      const profileData = {
        id: authData.user.id,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        email: email,
        height_cm: data.height,
        weight_kg: data.weight,
        body_fat_percentage: data.bodyFat,
        age: age,
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : null,
        gender: data.gender,
        activity_level: data.activityLevel,
        goal: data.goal,
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData as any)

      if (profileError) {
        console.error("Profile update error:", profileError)
      }

      // 4. Calculate and save nutritional goals
      const goals = calculateGoals(data)
      const { error: goalsError } = await supabase
        .from('nutritional_goals')
        .upsert({
          user_id: authData.user.id,
          ...goals,
          is_active: true,
          updated_at: new Date().toISOString()
        } as any)

      if (goalsError) {
        console.error("Goals save error:", goalsError)
      }

      toast({
        title: "Bem-vindo ao PiteuTracker! 🎉",
        description: "A tua conta foi criada e o perfil está configurado.",
      })

      navigate("/")
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tenta novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <OnboardingCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Quase lá, {data.firstName}!</h2>
            <p className="text-muted-foreground">Cria a tua conta para guardar o progresso e as metas.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="o.teu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-lg bg-muted/50 border-0 pl-12"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-lg bg-muted/50 border-0 pl-12 pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-sm text-destructive">A palavra-passe deve ter pelo menos 6 caracteres</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-14 text-lg font-semibold rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  A criar conta...
                </>
              ) : (
                <>
                  Criar Conta e Começar
                  <CheckCircle className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-12"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Ao criar uma conta, concordas com os nossos Termos de Serviço e Política de Privacidade.
          </p>
        </form>
      </OnboardingCard>

      <MotivationalMessage 
        message="A tua conta vai guardar todo o teu progresso, metas e histórico. Assim podes acompanhar a tua evolução ao longo do tempo!" 
      />
    </div>
  )
}
