import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Loader2, Bot, Flame, Dumbbell, Leaf, Zap, ArrowRight, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"

type MealKey = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'

interface MyMealPlanRow {
  id: string
  user_id: string
  title: string | null
  plan_data: {
    days?: Record<string, {
      breakfast?: string
      morning_snack?: string
      lunch?: string
      afternoon_snack?: string
      dinner?: string
      evening_snack?: string
      macros_by_meal?: Partial<Record<MealKey, {
        calories?: number
        protein?: number
        carbs?: number
        fat?: number
      }>>
    }>
    breakfast?: string
    morning_snack?: string
    lunch?: string
    afternoon_snack?: string
    dinner?: string
    evening_snack?: string
    totalCalories?: number
    totalProtein?: number
    totalCarbs?: number
    totalFat?: number
    recommendations?: string[]
    explanation?: string
    macros_by_meal?: Partial<Record<MealKey, {
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
    }>>
  }
  source_prompt: string | null
  created_at: string
  updated_at: string
}

export default function MeusPlanos() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [plans, setPlans] = useState<MyMealPlanRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MyMealPlanRow | null>(null)

  const mealOrder: { key: MealKey; label: string; icon: string }[] = [
    { key: "breakfast", label: "Café da Manhã", icon: "🌅" },
    { key: "morning_snack", label: "Lanche", icon: "🍎" },
    { key: "lunch", label: "Almoço", icon: "☀️" },
    { key: "afternoon_snack", label: "Lanche", icon: "🥤" },
    { key: "dinner", label: "Jantar", icon: "🌙" },
    { key: "evening_snack", label: "Ceia", icon: "🌙" },
  ]

  const formatNum = (n: number | undefined) => (typeof n === "number" ? n : "—")

  const openDetails = (plan: MyMealPlanRow) => {
    setSelectedPlan(plan)
    setIsDetailsOpen(true)
  }

  const defaultMealSplit: Record<MealKey, number> = {
    breakfast: 0.2,
    morning_snack: 0.1,
    lunch: 0.3,
    afternoon_snack: 0.1,
    dinner: 0.25,
    evening_snack: 0.05,
  }

  const getFallbackMacros = (data: MyMealPlanRow['plan_data'], key: MealKey) => {
    const ratio = defaultMealSplit[key]
    return {
      calories: Math.round((data.totalCalories ?? 0) * ratio),
      protein: Math.round((data.totalProtein ?? 0) * ratio),
      carbs: Math.round((data.totalCarbs ?? 0) * ratio),
      fat: Math.round((data.totalFat ?? 0) * ratio),
    }
  }

  const fetchPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Faça login para ver seus planos.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('my_meal_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data as MyMealPlanRow[])
    } catch (err) {
      console.error('Erro ao carregar planos:', err)
      setError('Não foi possível carregar seus planos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // Helper function to determine visual theme based on plan title/content
  const getPlanTheme = (title: string | null) => {
    const t = (title || "").toLowerCase()
    if (t.includes('hipertrofia') || t.includes('ganho') || t.includes('massa')) {
      return {
        gradient: "from-blue-600 to-indigo-900",
        icon: Dumbbell,
        label: "Hipertrofia",
        bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
      }
    } else if (t.includes('emagrecer') || t.includes('perder') || t.includes('secar') || t.includes('gordura')) {
      return {
        gradient: "from-orange-500 to-red-900",
        icon: Flame,
        label: "Perda de Peso",
        bgImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop"
      }
    } else if (t.includes('saudável') || t.includes('manutenção') || t.includes('equilíbrio')) {
      return {
        gradient: "from-emerald-500 to-teal-900",
        icon: Leaf,
        label: "Vida Saudável",
        bgImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop"
      }
    } else {
      return {
        gradient: "from-slate-600 to-slate-900",
        icon: Zap,
        label: "Plano Personalizado",
        bgImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop"
      }
    }
  }

  const PlanDetailsContent = ({ plan }: { plan: MyMealPlanRow }) => (
    <div className="space-y-8 pb-8">
      {/* Macros Summary - Modern Circular/Card Style */}
      <div className="bg-muted/30 rounded-3xl p-4 border border-border/50">
        <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
           <Zap className="w-4 h-4 text-primary" /> Resumo Nutricional
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="relative overflow-hidden bg-background rounded-2xl p-4 shadow-sm border border-border/50 flex flex-col items-center justify-center group hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl font-black text-foreground">{plan.plan_data?.totalCalories ?? '-'}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Calorias</span>
          </div>
          <div className="relative overflow-hidden bg-background rounded-2xl p-4 shadow-sm border border-border/50 flex flex-col items-center justify-center group hover:border-blue-500/50 transition-colors">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl font-bold text-foreground">{plan.plan_data?.totalProtein ?? '-'}g</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Proteína</span>
          </div>
          <div className="relative overflow-hidden bg-background rounded-2xl p-4 shadow-sm border border-border/50 flex flex-col items-center justify-center group hover:border-amber-500/50 transition-colors">
             <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl font-bold text-foreground">{plan.plan_data?.totalCarbs ?? '-'}g</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Carboidrato</span>
          </div>
          <div className="relative overflow-hidden bg-background rounded-2xl p-4 shadow-sm border border-border/50 flex flex-col items-center justify-center group hover:border-rose-500/50 transition-colors">
             <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl font-bold text-foreground">{plan.plan_data?.totalFat ?? '-'}g</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gordura</span>
          </div>
        </div>
      </div>

      {/* Meals - Timeline Style */}
      <div className="relative space-y-0">
        <div className="absolute left-4 sm:left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
        
        {mealOrder.map(({ key, label, icon }, idx) => {
          // Support for weekly plans (future-proof)
          // @ts-ignore - dynamic access
          const dayData = plan.plan_data.days?.['seg'] || Object.values(plan.plan_data.days || {})[0]
          // @ts-ignore
          const description = dayData?.[key] || plan.plan_data?.[key]
          
          // @ts-ignore
          const dayMacros = dayData?.macros_by_meal?.[key]
          const globalMacros = plan.plan_data?.macros_by_meal?.[key]
          const mealMacros = dayMacros ?? globalMacros ?? getFallbackMacros(plan.plan_data, key)

          if (!description) return null
          return (
            <div key={key} className="relative pl-12 sm:pl-16 py-3 group">
              {/* Timeline Dot */}
              <div className="absolute left-1.5 sm:left-3 top-6 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-background border-2 border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)] z-10 flex items-center justify-center text-[10px]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
              </div>
              
              {/* Card */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group-hover:border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl bg-muted/50 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl">{icon}</span>
                    <span className="font-bold text-sm sm:text-base text-foreground">{label}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed break-words mb-4">
                  {description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                   <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 text-[10px] px-2 py-0.5 h-6">
                      {formatNum(mealMacros?.calories)} kcal
                   </Badge>
                   <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/80 bg-muted/50 px-2 rounded-md h-6">
                      <span>P: {formatNum(mealMacros?.protein)}g</span>
                      <span className="w-0.5 h-3 bg-border" />
                      <span>C: {formatNum(mealMacros?.carbs)}g</span>
                      <span className="w-0.5 h-3 bg-border" />
                      <span>G: {formatNum(mealMacros?.fat)}g</span>
                   </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      {plan.plan_data?.recommendations && plan.plan_data.recommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border border-primary/10">
          <p className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 text-primary">
            <Bot className="w-4 h-4" /> Dicas do NutriCoach
          </p>
          <ul className="space-y-3">
            {plan.plan_data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-3 bg-background/50 p-3 rounded-xl border border-primary/5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-md mx-auto md:max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Meus Planos
          </h1>
          <p className="text-sm text-muted-foreground">Seus objetivos nutricionais</p>
        </div>
        <Button 
          onClick={() => navigate('/ai-meal-plan')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/25 transition-all hover:scale-105"
        >
          <Bot className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Carregando seus planos...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nenhum plano encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                Use nossa IA para criar um plano alimentar personalizado para você.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/ai-meal-plan')}
              variant="outline"
              className="rounded-full mt-2"
            >
              Criar meu primeiro plano
            </Button>
        </div>
      )}

      {/* Plans List - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plans.map((plan) => {
          const theme = getPlanTheme(plan.title)
          const ThemeIcon = theme.icon
          
          return (
            <div 
              key={plan.id}
              onClick={() => openDetails(plan)}
              className="group relative h-56 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              {/* Background Image & Gradient */}
              <div className="absolute inset-0">
                <img 
                  src={theme.bgImage} 
                  alt="Background" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-90 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Content */}
              <div className="relative h-full p-6 flex flex-col justify-between text-white">
                {/* Top Badge & Icon */}
                <div className="flex justify-between items-start">
                  <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 text-white px-3 py-1 text-xs font-medium">
                    Plano Diário
                  </Badge>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <ThemeIcon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Main Info */}
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold leading-tight tracking-tight">
                    {plan.title || theme.label}
                  </h3>
                  <p className="text-white/80 text-sm font-medium line-clamp-1">
                    {plan.plan_data.totalCalories} kcal • {plan.plan_data.totalProtein}g Proteína
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                   <div className="flex items-center gap-2 text-xs font-medium text-white/90">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(plan.created_at).toLocaleDateString('pt-BR')}</span>
                   </div>
                   <div className="flex items-center gap-1 text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full shadow-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      Ver Detalhes <ArrowRight className="w-3 h-3" />
                   </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Plan Details - Drawer for Mobile, Dialog for Desktop */}
      {isMobile ? (
        <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DrawerContent className="max-h-[95vh] rounded-t-[2rem]">
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader className="pb-0">
                <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
                  {selectedPlan?.title || 'Detalhes do Plano'}
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground/60">
                  Visualize seu plano alimentar detalhado
                </DrawerDescription>
              </DrawerHeader>
              <ScrollArea className="h-[75vh] px-4 pt-4">
                 {selectedPlan && <PlanDetailsContent plan={selectedPlan} />}
              </ScrollArea>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedPlan?.title || 'Detalhes do Plano'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/60">
                Visualize seu plano alimentar detalhado
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4 -mr-4">
               {selectedPlan && <PlanDetailsContent plan={selectedPlan} />}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}