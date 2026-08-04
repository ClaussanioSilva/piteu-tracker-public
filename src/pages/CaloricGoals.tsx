import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Flame, 
  Activity, 
  Heart, 
  ChevronLeft,
  Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile, useNutritionalGoals } from "@/hooks/use-supabase"
import { Badge } from "@/components/ui/badge"

export default function CaloricGoals() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useProfile()
  const { goals: storedGoals, loading: goalsLoading } = useNutritionalGoals()
  
  // State for calculated values
  const [metrics, setMetrics] = useState<{
    bmr: number
    tdee: number
    targetCalories: number
    protein: number
    carbs: number
    fat: number
    goalLabel: string
  } | null>(null)

  // Goal descriptions mapping
  const goalMap = useMemo(() => ({
    'lose_weight': 'Perder Peso',
    'maintain': 'Manter Peso',
    'gain_weight': 'Ganhar Peso',
    'gain_muscle': 'Ganhar Músculos'
  }), [])

  useEffect(() => {
    if (profile && storedGoals) {
      // Calculate BMR and TDEE based on profile
      // Mifflin-St Jeor Equation
      let bmr = 0
      if (profile.gender === 'male') {
        bmr = (10 * (profile.weight_kg || 0)) + (6.25 * (profile.height_cm || 0)) - (5 * (profile.age || 0)) + 5
      } else {
        bmr = (10 * (profile.weight_kg || 0)) + (6.25 * (profile.height_cm || 0)) - (5 * (profile.age || 0)) - 161
      }

      // Activity Multiplier
      const activityMultipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
      }
      
      const multiplier = activityMultipliers[profile.activity_level || 'moderate'] || 1.55
      const tdee = bmr * multiplier

      setMetrics({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: storedGoals.daily_calories,
        protein: storedGoals.daily_protein_g,
        carbs: storedGoals.daily_carbs_g,
        fat: storedGoals.daily_fat_g,
        goalLabel: goalMap[profile.goal as keyof typeof goalMap] || 'Manter Peso'
      })
    }
  }, [profile, storedGoals, goalMap])

  if (profileLoading || goalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-muted-foreground">Nenhuma meta encontrada.</p>
        <Button onClick={() => navigate('/goals')}>Definir Metas</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10 animate-fade-in">
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
          <h1 className="text-lg font-bold">Metas Calóricas</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6 pb-10">
        {/* Main Target Card */}
        <Card className="rounded-3xl border-none shadow-lg bg-green-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Flame className="w-32 h-32 text-white fill-white" />
          </div>
          <CardContent className="p-6 text-center space-y-2 relative z-10">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 backdrop-blur-sm mb-2 hover:bg-white/30">
              {metrics.goalLabel}
            </Badge>
            <h2 className="text-sm font-medium text-white/90 uppercase tracking-wider">
              Meta Diária
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-extrabold text-white tracking-tight">
                {metrics.targetCalories}
              </span>
              <span className="text-lg font-medium text-white/90">kcal</span>
            </div>
            <p className="text-xs text-white/80 max-w-[200px] mx-auto pt-2">
              Calculado para atingir seu objetivo com saúde e consistência.
            </p>
          </CardContent>
        </Card>

        {/* Macros Grid */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground pl-1">Macronutrientes</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <Card className="rounded-3xl bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Proteínas
                </span>
                <span className="text-xl font-bold text-foreground">{metrics.protein}g</span>
                <span className="text-[10px] text-muted-foreground">4 kcal/g</span>
              </CardContent>
            </Card>

            {/* Carbs */}
            <Card className="rounded-3xl bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Carbos
                </span>
                <span className="text-xl font-bold text-foreground">{metrics.carbs}g</span>
                <span className="text-[10px] text-muted-foreground">4 kcal/g</span>
              </CardContent>
            </Card>

            {/* Fat */}
            <Card className="rounded-3xl bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Gorduras
                </span>
                <span className="text-xl font-bold text-foreground">{metrics.fat}g</span>
                <span className="text-[10px] text-muted-foreground">9 kcal/g</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Metabolic Stats (Subtle) */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-sm text-muted-foreground pl-1">Metabolismo</h3>
          
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="rounded-3xl bg-card border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Taxa Metabólica Basal</p>
                  <p className="text-lg font-bold text-foreground">{metrics.bmr} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-card border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Gasto Total (TDEE)</p>
                  <p className="text-lg font-bold text-foreground">{metrics.tdee} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium pt-2">
            BMR é o que você queima em repouso. TDEE inclui sua atividade física.
          </p>
        </div>
      </div>

      {/* Floating Edit Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => navigate('/manual-goals')}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-md text-white p-0 flex items-center justify-center"
        >
          <Pencil className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
