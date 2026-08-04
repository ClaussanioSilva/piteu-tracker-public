
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useProfile, useNutritionalGoals } from "@/hooks/use-supabase"
import { 
  Loader2, ChevronLeft, ChevronRight, CheckCircle, 
  User, Calendar, Users, Scale, Ruler, Percent, 
  Activity, Target, HelpCircle, Mail, Lock, Salad 
} from "lucide-react"
import type { Database } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
type GoalType = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
type Gender = 'male' | 'female'

export default function Onboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { updateProfile } = useProfile()
  const { saveGoals } = useNutritionalGoals()

  const [step, setStep] = useState(1)
  const totalSteps = 10
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step])

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState<string>("")
  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [weightKg, setWeightKg] = useState<number | "">("")
  const [heightCm, setHeightCm] = useState<number | "">("")
  const [bodyFat, setBodyFat] = useState<number | "">("")
  const [activity, setActivity] = useState<ActivityLevel | undefined>(undefined)
  const [goal, setGoal] = useState<GoalType | undefined>(undefined)
  const [triedBefore, setTriedBefore] = useState<string>("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // ... (rest of the logic remains similar, focusing on UI update)
  const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
    { value: 'sedentary', label: 'Sedentário', description: 'Pouca ou nenhuma atividade' },
    { value: 'light', label: 'Leve', description: 'Exercício leve 1-3 dias/semana' },
    { value: 'moderate', label: 'Moderado', description: 'Exercício moderado 3-5 dias/semana' },
    { value: 'active', label: 'Ativo', description: 'Exercício intenso 6-7 dias/semana' },
    { value: 'very_active', label: 'Muito Ativo', description: 'Trabalho físico ou treinos 2x/dia' },
  ]

  const goals: { value: GoalType; label: string }[] = [
    { value: 'lose_weight', label: 'Perder Peso' },
    { value: 'maintain', label: 'Manter Peso' },
    { value: 'gain_weight', label: 'Ganhar Peso' },
    { value: 'gain_muscle', label: 'Ganhar Músculos' },
  ]

  const [showTip, setShowTip] = useState(false)

  const calculateMinMaxDates = () => {
     const today = new Date()
     const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate())
     const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
     
     const formatDate = (date: Date) => {
       const y = date.getFullYear()
       const m = String(date.getMonth() + 1).padStart(2, '0')
       const d = String(date.getDate()).padStart(2, '0')
       return `${y}-${m}-${d}`
     }

     return {
       max: formatDate(maxDate),
       min: formatDate(minDate)
     }
   }

  const { max: maxDob, min: minDob } = calculateMinMaxDates()

  const next = () => {
    if (step < 10 && !showTip) {
      setShowTip(true)
    } else {
      setShowTip(false)
      setStep((s) => Math.min(s + 1, totalSteps))
    }
  }

  const back = () => {
    if (showTip) {
      setShowTip(false)
    } else {
      if (step > 1) {
        setStep((s) => s - 1)
        setShowTip(true)
      } else {
        navigate("/landing")
      }
    }
  }

  const ageFromDob = (dateString: string) => {
    if (!dateString) return 0
    const d = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return age
  }

  const calculateBMR = (g: Gender, w: number, h: number, age: number) => {
    if (g === 'male') return (10 * w) + (6.25 * h) - (5 * age) + 5
    return (10 * w) + (6.25 * h) - (5 * age) - 161
  }

  const tdeeMultiplier = (al: ActivityLevel) => {
    const map: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }
    return map[al]
  }

  const calculateGoals = (tdee: number, g: GoalType) => {
    let targetCalories = Math.round(tdee)
    if (g === 'lose_weight') targetCalories = Math.round(tdee - 500)
    if (g === 'gain_weight' || g === 'gain_muscle') targetCalories = Math.round(tdee + 300)
    let proteinRatio = 0.3
    let fatRatio = 0.3
    let carbsRatio = 0.4
    if (g === 'lose_weight') {
      proteinRatio = 0.35
      fatRatio = 0.35
      carbsRatio = 0.3
    }
    if (g === 'gain_weight' || g === 'gain_muscle') {
      proteinRatio = 0.25
      fatRatio = 0.25
      carbsRatio = 0.5
    }
    const protein = Math.round((targetCalories * proteinRatio) / 4)
    const carbs = Math.round((targetCalories * carbsRatio) / 4)
    const fat = Math.round((targetCalories * fatRatio) / 9)
    return { targetCalories, protein, carbs, fat }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) throw error
      const loginRes = await supabase.auth.signInWithPassword({ email, password })
      if (loginRes.error) throw loginRes.error
      const age = ageFromDob(dob)
      if (age < 14) {
        toast({ title: "Erro", description: "É necessário ter pelo menos 14 anos.", variant: "destructive" })
        setLoading(false)
        return
      }
      const profilePayload: Partial<Database['public']['Tables']['profiles']['Update']> = {
        full_name: fullName || null,
        email,
        height_cm: typeof heightCm === "number" ? heightCm : null,
        weight_kg: typeof weightKg === "number" ? weightKg : null,
        body_fat_percentage: typeof bodyFat === "number" ? bodyFat : null,
        age,
        dob: dob || null,
        gender,
        activity_level: activity,
        goal,
        updated_at: new Date().toISOString()
      }
      await updateProfile(profilePayload)
      const bmr = calculateBMR(gender as Gender, Number(weightKg), Number(heightCm), age)
      const tdee = bmr * tdeeMultiplier(activity as ActivityLevel)
      const gcalc = calculateGoals(tdee, goal as GoalType)
      const goalsPayload: {
        daily_calories: number
        daily_protein_g: number
        daily_carbs_g: number
        daily_fat_g: number
        daily_fiber_g?: number | null
        daily_sodium_mg?: number | null
        daily_sugar_g?: number | null
      } = {
        daily_calories: gcalc.targetCalories,
        daily_protein_g: gcalc.protein,
        daily_carbs_g: gcalc.carbs,
        daily_fat_g: gcalc.fat,
        daily_fiber_g: 25,
        daily_sodium_mg: 2300,
        daily_sugar_g: 50,
      }
      await saveGoals(goalsPayload as unknown as Omit<Database['public']['Tables']['nutritional_goals']['Row'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>)
      toast({ title: "Conta criada", description: "Perfil e metas configurados." })
      navigate("/")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Não foi possível concluir. Tente novamente."
      toast({ title: "Erro", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const stepsConfig = [
    {
      step: 1,
      icon: User,
      title: "Olá! Como te chamas?",
      subtitle: "Vamos começar por nos conhecermos melhor.",
      tip: `Prazer em conhecer-te, ${firstName || 'futuro membro'}! Vamos criar o teu perfil personalizado.`
    },
    {
      step: 2,
      icon: Calendar,
      title: "Quando nasceste?",
      subtitle: "A tua idade ajuda-nos a calcular as tuas necessidades.",
      tip: "A idade é fundamental para calcular o teu metabolismo basal."
    },
    {
      step: 3,
      icon: Users,
      title: "Qual é o teu sexo?",
      subtitle: "Para calcularmos o teu metabolismo basal.",
      tip: "Esta informação ajuda-nos a calcular com precisão as tuas necessidades calóricas."
    },
    {
      step: 4,
      icon: Scale,
      title: "Qual é o teu peso?",
      subtitle: "Não te preocupes, esta informação é privada.",
      tip: "O peso atual é o ponto de partida para a tua jornada."
    },
    {
      step: 5,
      icon: Ruler,
      title: "Qual é a tua altura?",
      subtitle: "Necessário para calcular o teu IMC.",
      tip: "A relação entre peso e altura ajuda-nos a definir as melhores metas."
    },
    {
      step: 6,
      icon: Percent,
      title: "Percentual de gordura?",
      subtitle: "Se não souberes, podes pular.",
      tip: "O percentual de gordura dá-nos uma visão mais precisa da tua composição corporal."
    },
    {
      step: 7,
      icon: Activity,
      title: "Nível de atividade?",
      subtitle: "Considera o teu dia-a-dia e treinos.",
      tip: "O nível de atividade é o fator que mais varia no gasto calórico."
    },
    {
      step: 8,
      icon: Target,
      title: "Objetivo principal?",
      subtitle: "O que queres alcançar com o Macro Mentor?",
      tip: "Definir um objetivo claro é o primeiro passo para o sucesso."
    },
    {
      step: 9,
      icon: HelpCircle,
      title: "Já tentou antes?",
      subtitle: "Queremos saber sua experiência.",
      tip: "Usuários que registram suas refeições diariamente têm mais chances de sucesso."
    },
    {
      step: 10,
      icon: CheckCircle,
      title: "Quase lá!",
      subtitle: "Cria a tua conta para guardar o progresso.",
      tip: "Ao criar uma conta, concordas com os nossos Termos de Serviço."
    }
  ]

  const currentConfig = stepsConfig[step - 1]
  const Icon = currentConfig.icon

  return (
    <div className="h-[100dvh] bg-white dark:bg-background text-foreground relative grid grid-rows-[auto,1fr,auto] font-sans selection:bg-primary/20 overflow-hidden">
      {/* Background decoration - only in dark mode for pure white in light */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Top Bar */}
      <div className="px-6 pt-2 pb-3 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full max-w-md mx-auto">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-6 max-w-md mx-auto w-full">
           <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/50 -ml-2"
            onClick={back}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo {step}/{totalSteps}</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content Area - scrollable if needed */}
      <div className="flex flex-col max-w-md mx-auto w-full px-6 relative z-10 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <AnimatePresence mode="wait">
          {showTip ? (
            <motion.div
              key="tip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sabias que?</h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xs">
                {currentConfig.tip}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="mt-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{currentConfig.title}</h1>
                <p className="text-lg text-muted-foreground">{currentConfig.subtitle}</p>
              </div>

              <div className="flex-1 py-2">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Primeiro Nome</Label>
                      <Input 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="João" 
                        className="h-16 text-xl px-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all" 
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Último Nome</Label>
                      <Input 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Silva" 
                        className="h-16 text-xl px-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all" 
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                     <Input 
                      type="date" 
                      value={dob} 
                      onChange={(e) => setDob(e.target.value)} 
                      max={maxDob}
                      min={minDob}
                      className="h-16 text-xl px-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all dark:[color-scheme:dark]" 
                    />
                    {dob && (
                      <div className={cn(
                        "text-center p-6 rounded-3xl transition-colors",
                        ageFromDob(dob) < 14 ? "bg-destructive/10" : "bg-primary/5"
                      )}>
                        <span className={cn(
                          "text-5xl font-bold block mb-1",
                          ageFromDob(dob) < 14 ? "text-destructive" : "text-primary"
                        )}>
                          {ageFromDob(dob)}
                        </span>
                        <span className="text-muted-foreground font-medium">anos</span>
                        {ageFromDob(dob) < 14 && (
                          <p className="text-destructive font-medium mt-2">
                            É necessário ter pelo menos 14 anos.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setGender('male')}
                      className={cn(
                        "h-24 rounded-3xl border-2 flex items-center px-6 gap-4 transition-all duration-300",
                        gender === 'male' 
                          ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" 
                          : "border-transparent bg-muted/50 dark:bg-muted/20 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-2xl">👨</div>
                      <span className="text-xl font-medium">Masculino</span>
                      {gender === 'male' && <CheckCircle className="ml-auto w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => setGender('female')}
                      className={cn(
                        "h-24 rounded-3xl border-2 flex items-center px-6 gap-4 transition-all duration-300",
                        gender === 'female' 
                          ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" 
                          : "border-transparent bg-muted/50 dark:bg-muted/20 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-2xl">👩</div>
                      <span className="text-xl font-medium">Feminino</span>
                      {gender === 'female' && <CheckCircle className="ml-auto w-6 h-6" />}
                    </button>
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center h-full pb-10">
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={weightKg} 
                        onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")} 
                        placeholder="0" 
                        className="w-48 h-32 text-7xl font-bold text-center bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 p-0" 
                        autoFocus
                      />
                      <span className="text-xl font-medium text-muted-foreground absolute bottom-6 -right-8">kg</span>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col items-center justify-center h-full pb-10">
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={heightCm} 
                        onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : "")} 
                        placeholder="0" 
                        className="w-48 h-32 text-7xl font-bold text-center bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 p-0" 
                        autoFocus
                      />
                      <span className="text-xl font-medium text-muted-foreground absolute bottom-6 -right-8">cm</span>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="flex flex-col items-center justify-center h-full pb-8">
                    <div className="relative mb-8">
                      <Input 
                        type="number" 
                        value={bodyFat} 
                        onChange={(e) => setBodyFat(e.target.value ? Number(e.target.value) : "")} 
                        placeholder="0" 
                        className="w-48 h-32 text-7xl font-bold text-center bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 p-0" 
                        autoFocus
                      />
                      <span className="text-xl font-medium text-muted-foreground absolute bottom-6 -right-8">%</span>
                    </div>
                    <Button variant="ghost" onClick={next} className="text-primary hover:bg-primary/10 rounded-full px-6">
                      Não sei, pular
                    </Button>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-3 pb-4">
                    {activityLevels.map((al) => (
                      <button
                        key={al.value}
                        onClick={() => setActivity(al.value)}
                        className={cn(
                          "w-full text-left p-5 rounded-3xl border-2 transition-all duration-300",
                          activity === al.value
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-transparent bg-muted/40 dark:bg-muted/20 hover:bg-muted/60"
                        )}
                      >
                        <div className={cn("font-bold text-lg mb-1", activity === al.value ? "text-primary" : "text-foreground")}>
                          {al.label}
                        </div>
                        <div className="text-sm text-muted-foreground">{al.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {step === 8 && (
                  <div className="space-y-3 pb-4">
                    {goals.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setGoal(g.value)}
                        className={cn(
                          "w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between",
                          goal === g.value
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-transparent bg-muted/40 dark:bg-muted/20 hover:bg-muted/60"
                        )}
                      >
                        <span className={cn("font-bold text-lg", goal === g.value ? "text-primary" : "text-foreground")}>
                          {g.label}
                        </span>
                        {goal === g.value && <CheckCircle className="w-6 h-6 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}

                {step === 9 && (
                  <div className="grid grid-cols-1 gap-4 pt-4">
                    <button
                      onClick={() => setTriedBefore("sim")}
                      className={cn(
                        "h-24 rounded-3xl border-2 flex items-center justify-center text-xl font-medium transition-all duration-300",
                        triedBefore === "sim"
                          ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                          : "border-transparent bg-muted/50 dark:bg-muted/20 hover:bg-muted"
                      )}
                    >
                      Sim, já tentei
                    </button>
                    <button
                      onClick={() => setTriedBefore("nao")}
                      className={cn(
                        "h-24 rounded-3xl border-2 flex items-center justify-center text-xl font-medium transition-all duration-300",
                        triedBefore === "nao"
                          ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                          : "border-transparent bg-muted/50 dark:bg-muted/20 hover:bg-muted"
                      )}
                    >
                      Não, é a primeira vez
                    </button>
                  </div>
                )}

                {step === 10 && (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Email</Label>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="seu@email.com" 
                        className="h-16 text-xl px-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Palavra-passe</Label>
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="h-16 text-xl px-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Area */}
      <div className="px-6 pt-3 pb-6 bg-background/80 backdrop-blur-lg border-t border-border/10 z-20" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="max-w-md mx-auto w-full">
          {step < 10 ? (
            <Button 
              onClick={next} 
              size="lg"
              className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-sm shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={
                (step === 1 && (!firstName || !lastName)) ||
                (step === 2 && (!dob || ageFromDob(dob) < 14)) ||
                (step === 3 && !gender) ||
                (step === 4 && weightKg === "") ||
                (step === 5 && heightCm === "") ||
                (step === 7 && !activity) ||
                (step === 8 && !goal) ||
                (step === 9 && !triedBefore)
              }
            >
              {showTip ? "Entendi, continuar" : "Continuar"}
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              disabled={loading || !email || !password}
              className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-sm shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Criar Conta"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
