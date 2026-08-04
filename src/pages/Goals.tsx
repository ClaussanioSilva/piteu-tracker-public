import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Target, Save, Activity, Calculator, User, Heart, Ruler, Weight, Flame, ChevronRight, ChevronLeft, Check, Dumbbell, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useNutritionalGoals, useProfile } from "@/hooks/use-supabase"
import { useNutrition } from "@/providers/nutrition-context"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface UserData {
  age: number | string
  gender: 'male' | 'female' | 'other'
  weight: number | string // kg
  targetWeight: number | string // kg
  height: number | string // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
  bodyFat?: number | string // percentage
}

interface CalculatedGoals {
  bmr: number // Basal Metabolic Rate
  tdee: number // Total Daily Energy Expenditure
  targetCalories: number
  protein: number
  carbs: number
  fat: number
  deficit: number
  surplus: number
}

export default function Goals() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { goals: storedGoals, saveGoals } = useNutritionalGoals()
  const { refreshData } = useNutrition()
  const { profile, updateProfile } = useProfile()

  // Persist keys
  const LOCAL_STORAGE_USER_DATA_KEY = "goals:userData"
  const LOCAL_STORAGE_CALCULATED_GOALS_KEY = "goals:calculatedGoals"

  // User data state - start with empty state, load from Supabase
  const [userData, setUserData] = useState<UserData>({
    age: 25,
    gender: 'male',
    weight: 70,
    targetWeight: 70,
    height: 170,
    activityLevel: 'moderate',
    goal: 'maintain',
    bodyFat: 15
  })

  // Calculated goals state
  const [calculatedGoals, setCalculatedGoals] = useState<CalculatedGoals | null>(null)
  const [saving, setSaving] = useState(false)

  // Load profile data into local state when available
  useEffect(() => {
    if (profile) {
      setUserData(prev => {
        const newGender = (profile.gender === 'male' || profile.gender === 'female' || profile.gender === 'other') 
          ? profile.gender 
          : prev.gender;
        
        // Ensure activity_level is valid if present
        const validActivityLevels: UserData['activityLevel'][] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
        const newActivity = (profile.activity_level && validActivityLevels.includes(profile.activity_level as UserData['activityLevel']))
          ? profile.activity_level as UserData['activityLevel']
          : prev.activityLevel;

        // Ensure goal is valid if present
        const validGoals: UserData['goal'][] = ['lose_weight', 'maintain', 'gain_weight', 'gain_muscle'];
        const newGoal = (profile.goal && validGoals.includes(profile.goal as UserData['goal']))
          ? profile.goal as UserData['goal']
          : prev.goal;

        return {
          ...prev,
          age: profile.age || prev.age,
          weight: profile.weight_kg || prev.weight,
          targetWeight: profile.target_weight_kg || profile.weight_kg || prev.targetWeight,
          height: profile.height_cm || prev.height,
          gender: newGender,
          activityLevel: newActivity,
          goal: newGoal,
        }
      })
    }
  }, [profile])

  // Load from localStorage on mount (after state is available)
  useEffect(() => {
    try {
      const ud = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_USER_DATA_KEY) : null
      const cg = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_CALCULATED_GOALS_KEY) : null
      if (ud) {
        setUserData(JSON.parse(ud))
      }
      if (cg) {
        setCalculatedGoals(JSON.parse(cg))
        setShowStoredGoals(false)
      }
    } catch (e) {
      // Silent error
    }
  }, [])

  // Save to localStorage when userData changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
      }
    } catch (e) {
      // Silent error
    }
  }, [userData])

  // Save to localStorage when calculatedGoals changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && calculatedGoals) {
        localStorage.setItem(LOCAL_STORAGE_CALCULATED_GOALS_KEY, JSON.stringify(calculatedGoals))
      }
    } catch (e) {
      // Silent error
    }
  }, [calculatedGoals])
  
  // Activity level descriptions
  const activityLevels = useMemo(() => [
    { 
      value: 'sedentary', 
      label: 'Sedentário', 
      description: 'Pouco ou nenhum exercício',
      multiplier: 1.2,
      icon: <User className="w-5 h-5" />
    },
    { 
      value: 'light', 
      label: 'Levemente Ativo', 
      description: 'Exercício 1-3x por semana',
      multiplier: 1.375,
      icon: <Activity className="w-5 h-5" />
    },
    { 
      value: 'moderate', 
      label: 'Moderado', 
      description: 'Exercício 3-5x por semana',
      multiplier: 1.55,
      icon: <Dumbbell className="w-5 h-5" />
    },
    { 
      value: 'active', 
      label: 'Muito Ativo', 
      description: 'Exercício 6-7x por semana',
      multiplier: 1.725,
      icon: <Flame className="w-5 h-5" />
    },
    { 
      value: 'very_active', 
      label: 'Atleta', 
      description: 'Exercício intenso diário',
      multiplier: 1.9,
      icon: <Trophy className="w-5 h-5" />
    }
  ], [])

  // Goal descriptions
  const goals = [
    { 
      value: 'lose_weight', 
      label: 'Perder Peso', 
      description: 'Déficit calórico para queimar gordura',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    },
    { 
      value: 'maintain', 
      label: 'Manter Peso', 
      description: 'Manter sua composição atual',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
    },
    { 
      value: 'gain_weight', 
      label: 'Ganhar Peso', 
      description: 'Superávit calórico controlado',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
    },
    { 
      value: 'gain_muscle', 
      label: 'Ganhar Músculos', 
      description: 'Foco em hipertrofia muscular',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
    }
  ]

  // Calculate all goals
  const calculateGoals = useCallback(() => {
    // Calculate BMR using Mifflin-St Jeor Equation (industry standard)
    const calculateBMR = (data: UserData): number => {
      const weight = Number(data.weight) || 0
      const height = Number(data.height) || 0
      const age = Number(data.age) || 0

      if (data.gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
      } else if (data.gender === 'female') {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161
      } else {
        // Average for other/non-binary: (5 - 161) / 2 = -78
        return (10 * weight) + (6.25 * height) - (5 * age) - 78
      }
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const calculateTDEE = (bmr: number, activityLevel: string): number => {
      const activity = activityLevels.find(level => level.value === activityLevel)
      return bmr * (activity?.multiplier || 1.55)
    }

    // Calculate target calories based on goal
    const calculateTargetCalories = (tdee: number, goal: string): number => {
      switch (goal) {
        case 'lose_weight':
          return Math.round(tdee - 500) // 500 calorie deficit for weight loss
        case 'gain_weight':
        case 'gain_muscle':
          return Math.round(tdee + 300) // 300 calorie surplus for muscle gain
        default:
          return Math.round(tdee) // maintenance
      }
    }

    // Calculate macronutrients based on target calories
    const calculateMacros = (calories: number, goal: UserData['goal']) => {
      let proteinRatio: number
      let fatRatio: number
      let carbsRatio: number

      if (goal === 'lose_weight') {
        // Higher protein for fat loss, moderate fat, lower carbs
        proteinRatio = 0.35
        fatRatio = 0.35
        carbsRatio = 0.30
      } else if (goal === 'gain_muscle' || goal === 'gain_weight') {
        // Higher carbs for muscle gain, moderate protein, moderate fat
        proteinRatio = 0.25
        fatRatio = 0.25
        carbsRatio = 0.50
      } else {
        // Balanced for maintenance
        proteinRatio = 0.30
        fatRatio = 0.30
        carbsRatio = 0.40
      }

      return {
        protein: Math.round((calories * proteinRatio) / 4), // 4 calories per gram
        carbs: Math.round((calories * carbsRatio) / 4),     // 4 calories per gram
        fat: Math.round((calories * fatRatio) / 9)          // 9 calories per gram
      }
    }

    const bmr = calculateBMR(userData)
    const tdee = calculateTDEE(bmr, userData.activityLevel)
    const targetCalories = calculateTargetCalories(tdee, userData.goal)
    const macros = calculateMacros(targetCalories, userData.goal)

    setCalculatedGoals({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      ...macros,
      deficit: userData.goal === 'lose_weight' ? 500 : 0,
      surplus: (userData.goal === 'gain_weight' || userData.goal === 'gain_muscle') ? 300 : 0
    })
  }, [userData, activityLevels])

  // State to track if we should show stored goals or calculated goals
  const [showStoredGoals, setShowStoredGoals] = useState(false)

  // Load existing goals from Supabase when component mounts
  useEffect(() => {
    if (storedGoals && !calculatedGoals) {
      setShowStoredGoals(true)
      // Update the calculated goals with the stored values
      setCalculatedGoals({
        bmr: 0,
        tdee: 0,
        targetCalories: storedGoals.daily_calories,
        protein: Number(storedGoals.daily_protein_g),
        carbs: Number(storedGoals.daily_carbs_g),
        fat: Number(storedGoals.daily_fat_g),
        deficit: 0,
        surplus: 0
      })
    }
  }, [storedGoals, calculatedGoals])

  // Calculate goals whenever user data changes
  useEffect(() => {
    // Only recalculate when NOT showing stored goals
    if (!showStoredGoals) {
      calculateGoals()
    }
  }, [calculateGoals, showStoredGoals])

  const handleSave = async () => {
    if (!calculatedGoals) return

    // Validate profile completeness before saving goals
    if (Number(userData.age) < 14) {
      toast({
        title: "Idade inválida",
        description: "A idade mínima permitida é 14 anos.",
        variant: "destructive"
      })
      return
    }

    if (!profile || 
        profile.age == null || 
        profile.height_cm == null || 
        profile.weight_kg == null || 
        profile.activity_level == null || 
        profile.gender == null || 
        profile.goal == null) {
      toast({
        title: "Perfil incompleto",
        description: "Preencha o seu perfil primeiro.",
        variant: "destructive"
      })
      // return // Allow saving even if profile check fails (we are updating it now)
    }

    const payload = {
      daily_calories: calculatedGoals.targetCalories,
      daily_protein_g: calculatedGoals.protein,
      daily_carbs_g: calculatedGoals.carbs,
      daily_fat_g: calculatedGoals.fat,
      daily_fiber_g: 25,
      daily_sodium_mg: 2300,
      daily_sugar_g: 50,
      // optional fields left as defaults
    }

    try {
      setSaving(true)
      
      // Update profile with latest measurements
      await updateProfile({
        id: profile.id,
        weight_kg: Number(userData.weight),
        target_weight_kg: Number(userData.targetWeight),
        height_cm: Number(userData.height),
        age: Number(userData.age),
        gender: userData.gender,
        activity_level: userData.activityLevel,
        goal: userData.goal,
        body_fat_percentage: userData.bodyFat ? Number(userData.bodyFat) : null,
        updated_at: new Date().toISOString()
      })

      // Save goals to Supabase
      const result = await saveGoals(payload)
      
      if (result) {
        // Refresh data from nutrition context
        await refreshData()

        toast({
          title: "Alterações salvas",
          description: "Medidas atualizadas e novas metas calculadas."
        })
        
        // Navigate to Caloric Goals to show results
        setTimeout(() => navigate("/caloric-goals"), 500)
      } else {
        throw new Error('Falha ao salvar metas no Supabase')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as metas.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in pb-40 md:pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border -mx-4 px-4 mb-6">
        <div className="h-10 pb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold">Configurar Metas</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Gender Selection */}
        <section className="space-y-3">
          <Label className="px-2 text-base">Seu Gênero</Label>
          <div className="grid grid-cols-3 gap-4">
            {['male', 'female', 'other'].map((gender) => (
              <motion.button
                key={gender}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserData(prev => ({ ...prev, gender: gender as 'male' | 'female' | 'other' }))}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-200 min-h-[120px]",
                  userData.gender === gender
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent bg-card shadow-sm text-muted-foreground hover:bg-muted/50"
                )}
              >
                {userData.gender === gender && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <User className={cn("w-8 h-8 mb-2", userData.gender === gender ? "fill-current" : "")} />
                <span className="font-medium capitalize text-sm">
                  {gender === 'male' ? 'Masculino' : gender === 'female' ? 'Feminino' : 'Outro'}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Measurements Inputs */}
        <section className="space-y-3">
          <Label className="px-2 text-base">Suas Medidas</Label>
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Meta de Peso</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    value={userData.targetWeight || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, targetWeight: e.target.value }))}
                    className="border-0 p-0 h-auto text-2xl font-bold focus-visible:ring-0 w-full"
                    placeholder="0"
                  />
                  <span className="text-sm font-medium text-muted-foreground">kg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Altura</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    value={userData.height || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, height: e.target.value }))}
                    className="border-0 p-0 h-auto text-2xl font-bold focus-visible:ring-0 w-full"
                    placeholder="0"
                  />
                  <span className="text-sm font-medium text-muted-foreground">cm</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Weight className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Peso Atual</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    value={userData.weight || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, weight: e.target.value }))}
                    className="border-0 p-0 h-auto text-2xl font-bold focus-visible:ring-0 w-full"
                    placeholder="0"
                  />
                  <span className="text-sm font-medium text-muted-foreground">kg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Idade</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    value={userData.age || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, age: e.target.value }))}
                    className="border-0 p-0 h-auto text-2xl font-bold focus-visible:ring-0 w-full"
                    placeholder="0"
                    min={14}
                    max={120}
                  />
                  <span className="text-sm font-medium text-muted-foreground">anos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Gordura Corporal</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    value={userData.bodyFat || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, bodyFat: e.target.value }))}
                    className="border-0 p-0 h-auto text-2xl font-bold focus-visible:ring-0 w-full"
                    placeholder="--"
                  />
                  <span className="text-sm font-medium text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Activity Level */}
        <section className="space-y-3">
          <Label className="px-2 text-base">Nível de Atividade</Label>
          <div className="flex flex-col gap-2">
            {activityLevels.map((level) => (
              <motion.button
                key={level.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserData(prev => ({ ...prev, activityLevel: level.value as UserData['activityLevel'] }))}
                className={cn(
                  "flex items-center p-4 rounded-2xl border transition-all duration-200 text-left",
                  userData.activityLevel === level.value
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-card border-transparent hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full mr-4",
                  userData.activityLevel === level.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {level.icon}
                </div>
                <div className="flex-1">
                  <h3 className={cn("font-medium", userData.activityLevel === level.value ? "text-primary" : "text-foreground")}>
                    {level.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
                {userData.activityLevel === level.value && (
                  <Check className="w-5 h-5 text-primary ml-2" />
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Goal */}
        <section className="space-y-3">
          <Label className="px-2 text-base">Objetivo Principal</Label>
          <div className="grid grid-cols-1 gap-2">
            {goals.map((goal) => (
              <motion.button
                key={goal.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserData(prev => ({ ...prev, goal: goal.value as UserData['goal'] }))}
                className={cn(
                  "relative flex items-center p-4 rounded-2xl border transition-all duration-200 text-left overflow-hidden",
                  userData.goal === goal.value
                    ? "border-primary/50 shadow-md"
                    : "bg-card border-transparent hover:bg-muted/50"
                )}
              >
                {/* Background color subtle */}
                <div className={cn("absolute inset-0 opacity-10", goal.color)} />
                
                <div className="relative z-10 flex-1">
                  <h3 className="font-medium text-foreground">{goal.label}</h3>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
                
                {userData.goal === goal.value && (
                  <div className="relative z-10 bg-primary/10 p-1 rounded-full">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Live Results Preview */}
        <AnimatePresence>
          {calculatedGoals && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-[6rem] z-10"
            >
              <Card className="bg-green-500 text-white border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/80 font-medium uppercase tracking-wider mb-1">Meta Diária</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{calculatedGoals.targetCalories}</span>
                      <span className="text-sm font-medium opacity-80">kcal</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-3 text-xs opacity-90">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{calculatedGoals.protein}g</span>
                        <span className="text-[10px] opacity-80">Prot</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{calculatedGoals.carbs}g</span>
                        <span className="text-[10px] opacity-80">Carb</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{calculatedGoals.fat}g</span>
                        <span className="text-[10px] opacity-80">Gord</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-40 md:hidden">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Desktop Save Button (Hidden on Mobile) */}
        <div className="hidden md:flex justify-end pt-4">
           <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}