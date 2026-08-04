import { useState, useEffect, useRef, type TouchEvent } from "react"
import { Plus, TrendingUp, Target, Zap, LogOut, Trash2, Calendar, Flame, Utensils, Droplet, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AuthWarning } from "@/components/AuthWarning"
import { useNutrition } from "@/providers/nutrition-context"
import LogMealModal from "@/components/LogMealModal"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-supabase"

export default function Dashboard() {
  console.log("Dashboard component rendering...") // Debug log
  
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile } = useProfile()
  
  const { 
    dailyGoals, 
    getTodayEntries, 
    getEntriesByDate, 
    getNutritionByDate,
    removeFoodLog, 
    loading,
    forceDailyReset,
    clearDateCache,
    debugFoodLogs,
    fixDateFormats,
    forceRecreateLogs
  } = useNutrition()
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  console.log("Nutrition context values:", { dailyGoals, loading }) // Debug log
  console.log("Dashboard dailyGoals structure:", dailyGoals)
  console.log("Dashboard dailyGoals.calories:", dailyGoals?.calories)
  console.log("Dashboard dailyGoals.calories.target:", dailyGoals?.calories?.target)

  const parseDateParam = (value: string | null) => {
    if (!value) return new Date()

    const [year, month, day] = value.split("-").map(Number)
    if (!year || !month || !day) return new Date()

    return new Date(year, month - 1, day)
  }

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

  const selectedDate = parseDateParam(searchParams.get("date"))
  const todayDateString = formatDateParam(new Date())
  
  // Get selected date as string for API calls - use local timezone to match nutrition context
  const selectedDateString = formatDateParam(selectedDate)
  
  console.log("Dashboard date debugging:")
  console.log("  selectedDate:", selectedDate)
  console.log("  selectedDateString:", selectedDateString)
  console.log("  today (local):", todayDateString)
  console.log("  today (UTC):", new Date().toISOString().split('T')[0])
  
  // Get entries and nutrition for selected date
  const selectedDateEntries = getEntriesByDate(selectedDateString)
  const selectedDateNutrition = getNutritionByDate(selectedDateString)
  
  // Use today's data if selected date is today, otherwise use selected date data
  const isToday = selectedDateString === todayDateString
  const displayEntries = isToday ? getTodayEntries() : selectedDateEntries
  const displayNutrition = isToday ? dailyGoals : selectedDateNutrition
  
  console.log("Dashboard selectedDateEntries:", selectedDateEntries)
  console.log("Dashboard displayNutrition:", displayNutrition)

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log('Dashboard: Loading timeout reached, setting timeout to true')
        setLoadingTimeout(true)
      }, 10000) // 10 seconds timeout (increased from 5)
      
      return () => clearTimeout(timer)
    } else {
      console.log('Dashboard: Loading completed, setting timeout to false')
      setLoadingTimeout(false)
    }
  }, [loading])

  const goToToday = () => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete("date")
    setSearchParams(nextSearchParams, { replace: true })
  }

  const setSelectedDateParam = (date: Date) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    const nextDateString = formatDateParam(date)

    if (nextDateString === todayDateString) {
      nextSearchParams.delete("date")
    } else {
      nextSearchParams.set("date", nextDateString)
    }

    setSearchParams(nextSearchParams, { replace: true })
  }

  const goToPrevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDateParam(prev)
  }

  const goToNextDay = () => {
    if (selectedDateString >= todayDateString) return
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    if (formatDateParam(next) > todayDateString) return
    setSelectedDateParam(next)
  }

  const swipeRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start) return
    if (e.changedTouches.length !== 1) return

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = endX - start.x
    const dy = endY - start.y

    if (Math.abs(dx) < 60) return
    if (Math.abs(dx) <= Math.abs(dy) + 20) return

    if (dx > 0) {
      goToPrevDay()
    } else {
      goToNextDay()
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCompactDate = (date: Date) => {
    const weekday = date.toLocaleDateString("pt-PT", { weekday: "long" })
    const shortDate = date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit"
    })

    return `${capitalize(weekday)}, ${shortDate}`
  }

  const openCalendarPage = () => {
    const query = isToday ? "" : `?date=${selectedDateString}`
    navigate(`/calendar${query}`)
  }

  // Safety check - if no displayNutrition, show empty state
  if (!displayNutrition || !displayNutrition.calories || !displayNutrition.calories.target) {
    // If still loading, show loading state
    if (loading && !loadingTimeout) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando metas...</p>
          </div>
        </div>
      )
    }
    
    // If timeout reached, show error
    if (loadingTimeout) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar metas</h2>
            <p className="text-muted-foreground mb-4">
              Houve um problema ao carregar suas metas. Tente configurá-las novamente.
            </p>
            <Button onClick={() => navigate('/goals')} className="bg-gradient-primary hover:bg-primary-hover">
              Configurar Metas
            </Button>
          </div>
        </div>
      )
    }
    
    // If not loading and no goals, show no goals state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Configuração Inicial Necessária</h2>
          <p className="text-muted-foreground mb-6">
            Para definir suas metas nutricionais, primeiro precisamos conhecer você. 
            Configure seu perfil com seus dados corporais e objetivos, e então suas metas serão calculadas automaticamente.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button onClick={() => navigate('/profile-settings')} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              1. Configurar Perfil
            </Button>
            <Button onClick={() => navigate('/goals')} className="bg-primary hover:bg-primary-hover">
              2. Ver Metas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getSafePct = (current: number, target: number) => {
    if (!target || target <= 0) return 0
    const pct = (current / target) * 100
    // Limitar o progresso a 100% máximo para evitar barras que ultrapassem visualmente
    return isFinite(pct) && !isNaN(pct) ? Math.min(pct, 100) : 0
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = getSafePct(current, target)
    if (percentage >= 90) return "text-success"
    if (percentage >= 70) return "text-warning"
    return "text-primary"
  }

  const getMotivationalMessage = () => {
    const calorieProgress = getSafePct(displayNutrition.calories.current, displayNutrition.calories.target)
    if (calorieProgress == 90) return "Excelente! Conseguiste atingir a meta diária! 🎯"
    if (calorieProgress >= 90) return "Estás quase a atingir a meta diária! 🎯"
    if (calorieProgress >= 70) return "Estás a comer bem! Continue assim! 💪"
    if (calorieProgress >= 50) return "Continue firme, falta mais 50% para atingir a meta! 🚀"
    return "Vamos começar o dia com energia! 🌟"
  }

  const getMealTimeLabel = (mealTime: string) => {
    const labels: Record<string, string> = {
      breakfast: "Café da Manhã",
      morning_snack: "Lanche da Manhã",
      lunch: "Almoço",
      afternoon_snack: "Lanche da Tarde",
      dinner: "Jantar",
      evening_snack: "Ceia"
    }
    return labels[mealTime] || mealTime
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleRemoveLog = async (id: string) => {
    await removeFoodLog(id)
  }

  // Test function for daily reset (only in development)
  const handleTestReset = () => {
    if (process.env.NODE_ENV === 'development') {
      forceDailyReset()
    }
  }

  // Clear date cache function
  const handleClearCache = () => {
    clearDateCache()
  }

  // Debug food logs function
  const handleDebugLogs = () => {
    debugFoodLogs()
  }

  // Fix date formats function
  const handleFixDates = async () => {
    await fixDateFormats()
  }

  // Force recreate logs function
  const handleForceRecreate = async () => {
    await forceRecreateLogs()
  }



  console.log("Rendering main dashboard content...") // Debug log

  // Helper para verificar se um horário de refeição tem registos
  const hasMealLogged = (mealTime: string) => {
    return displayEntries.some((e) => e.meal_time === mealTime)
  }

  const remainingCalories = Math.max(
    (displayNutrition.calories.target || 0) - (displayNutrition.calories.current || 0),
    0
  )

  const getInitials = () => {
    if (!profile?.full_name) return "US"
    const names = profile.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  const consumedPct = getSafePct(displayNutrition.calories.current, displayNutrition.calories.target);
  const isDanger = consumedPct >= 70;
  const badgeBgClass = isDanger ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20";
  const badgeTextClass = isDanger ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";

  return (
    <div
      className="animate-fade-in w-full overflow-x-hidden"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Versão Mobile/Tablet (até md) */}
      <div className="md:hidden space-y-6 pb-20">
        {/* Header Mobile - PiteuTracker Custom Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">PiteuTracker AI</h1>
            <p className="text-xs text-muted-foreground">Acompanha a tua jornada de saúde</p>
          </div>
        </div>

        {/* Cartão de Calorias sem animação de hover em mobile para estabilidade */}
        <Card className="bg-card rounded-3xl border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-base font-medium text-muted-foreground mb-1">
                  {isToday ? 'Calorias Hoje' : 'Calorias'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{displayNutrition.calories.current}</span>
                  <span className="text-sm text-muted-foreground">/ {displayNutrition.calories.target} kcal</span>
                </div>
              </div>
              
              <div className={`flex flex-col items-center justify-center p-2 rounded-2xl shadow-md min-w-[80px] ${badgeBgClass}`}>
                <div className={`flex items-center gap-1 mb-0.5 ${badgeTextClass}`}>
                  <Flame className="h-4 w-4 fill-current" />
                  <span className="text-md font-bold">{remainingCalories}</span>
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wide ${badgeTextClass} opacity-80`}>restantes</span>
              </div>
            </div>
            
            <Progress value={consumedPct} className="h-4 rounded-full bg-muted [&>div]:bg-primary" />
          </CardContent>
        </Card>

        {/* Macros Grid sem animação de hover */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-card rounded-2xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Proteína</p>
              <p className="text-lg font-bold text-foreground">{displayNutrition.protein.current}g</p>
              <Progress value={getSafePct(displayNutrition.protein.current, displayNutrition.protein.target)} className="h-1.5 mt-2 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1">de {displayNutrition.protein.target}g</p>
            </CardContent>
          </Card>
          <Card className="bg-card rounded-2xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Carbos</p>
              <p className="text-lg font-bold text-foreground">{displayNutrition.carbs.current}g</p>
              <Progress value={getSafePct(displayNutrition.carbs.current, displayNutrition.carbs.target)} className="h-1.5 mt-2 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1">de {displayNutrition.carbs.target}g</p>
            </CardContent>
          </Card>
          <Card className="bg-card rounded-2xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Gordura</p>
              <p className="text-lg font-bold text-foreground">{displayNutrition.fat.current}g</p>
              <Progress value={getSafePct(displayNutrition.fat.current, displayNutrition.fat.target)} className="h-1.5 mt-2 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1">de {displayNutrition.fat.target}g</p>
            </CardContent>
          </Card>
        </div>

        {/* Refeições do Dia */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {isToday ? 'Refeições de hoje' : 'Refeições'}
            </h3>
            
            <button
              type="button"
              onClick={openCalendarPage}
              className="flex items-center gap-2 rounded-2xl transition-colors hover:bg-accent/60 active:scale-[0.98]"
              aria-label="Abrir calendário"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 shadow-sm">
                <Calendar className="h-4 w-4 text-primary" />
              </span>

              <span className="text-xs font-semibold text-muted-foreground text-right capitalize">
                {formatCompactDate(selectedDate)}
              </span>
            </button>
          </div>

          {/* Meals List */}
          {displayEntries.length > 0 ? (
            <div className="space-y-4">
              {displayEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="relative w-full overflow-hidden bg-card rounded-2xl shadow-sm border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => navigate('/snap-log', {
                    state: {
                      mode: 'view',
                      mealData: entry,
                      capturedImage: entry.image_url
                    }
                  })}
                >
                  <div className="flex items-center p-3 gap-3 h-24">
                    {/* Left: Photo - Strictly Constrained & Scaled for Mobile */}
                    <div className="relative h-16 w-16 min-w-[4rem] min-h-[4rem] shrink-0 rounded-xl bg-muted overflow-hidden">
                      {entry.image_url ? (
                        <img 
                          src={entry.image_url} 
                          alt={entry.item_name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Utensils className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Right: Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 overflow-hidden">
                      {/* Top: Name + Time */}
                      <div className="flex justify-between items-start w-full gap-2">
                        <h4 className="font-semibold text-sm truncate text-foreground leading-tight flex-1">{entry.item_name}</h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full shrink-0">
                          {new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      {/* Middle: Calories */}
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 shrink-0" />
                        <span className="font-bold text-sm text-foreground">{Math.round(entry.calories || 0)} kcal</span>
                      </div>

                      {/* Bottom: Macros */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground w-full">
                        <div className="flex items-center gap-1 shrink-0">
                          <Zap className="w-3 h-3 text-red-500 fill-red-500" />
                          <span>{Math.round(entry.protein_g || 0)}g</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Wheat className="w-3 h-3 text-amber-500" />
                          <span>{Math.round(entry.carbs_g || 0)}g</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Droplet className="w-3 h-3 text-blue-500 fill-blue-500" />
                          <span>{Math.round(entry.fat_g || 0)}g</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button - Absolute positioning */}
                    {isToday && (
                      <div className="absolute right-2 bottom-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveLog(entry.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border-dashed border-2 border-muted shadow-sm">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhuma refeição registada</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isToday ? "Começa o dia registando a tua primeira refeição!" : "Não há registos para este dia."}
              </p>
            </div>
          )}
        </div>

        {/* Histórico de Refeições (Removido pois agora é unificado acima) */}

        {/* Log Modal */}
        <LogMealModal 
          isOpen={isLogModalOpen} 
          onClose={() => setIsLogModalOpen(false)} 
        />
      </div>

      {/* Versão Desktop */}
      <div className="hidden md:block space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pagina Inicial</h1>
            <p className="text-muted-foreground text-sm md:text-base">Acompanhe seu progresso diário</p>
          </div>

          {/* Motivational Message */}
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary-light">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <p className="text-sm md:text-lg font-medium text-foreground">
                  {getMotivationalMessage()}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setIsLogModalOpen(true)}
              className="bg-blue-800 hover:bg-blue-800 transition-all shadow-soft w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Log Refeição</span>
              <span className="sm:hidden">Registe a sua refeição</span>
            </Button>
            
            {/* Test Buttons - Only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleTestReset}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  🔄 Test Reset
                </Button>
                <Button 
                  onClick={handleClearCache}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  🧹 Clear Cache
                </Button>
                <Button 
                  onClick={handleDebugLogs}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  🔍 Debug Logs
                </Button>
                <Button 
                  onClick={handleFixDates}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  🔧 Fix Dates
                </Button>
                <Button 
                  onClick={handleForceRecreate}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  🔄 Force Recreate
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Cards - Reorganized for better UX */}

        
        
        {/* Calories - Main Focus */}
        <Card className="shadow-soft hover:shadow-glow transition-spring border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-primary flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              Calorias Diárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {/* Main Calorie Display */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1 md:gap-2 mb-2">
                  <span className="text-3xl md:text-5xl font-bold text-primary">
                    {displayNutrition.calories.current}
                  </span>
                  <span className="text-lg md:text-xl text-muted-foreground">
                    / {displayNutrition.calories.target} kcal
                  </span>
                </div>
                <Progress 
                  value={getSafePct(displayNutrition.calories.current, displayNutrition.calories.target)} 
                  className="h-2 md:h-3 bg-primary/20"
                />
              </div>
              
              {/* Progress Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={`text-xs md:text-sm font-medium text-center sm:text-left ${getProgressColor(displayNutrition.calories.current, displayNutrition.calories.target)}`}>
                  {Math.round(getSafePct(displayNutrition.calories.current, displayNutrition.calories.target))}% do objetivo
                </span>
                <span className="text-xs md:text-sm text-muted-foreground text-center sm:text-right">                
                  {displayNutrition.calories.current >= displayNutrition.calories.target 
                    ? "Meta atingida!" 
                    : `Restam ${displayNutrition.calories.target - displayNutrition.calories.current} kcal`}
                </span>
              </div>

              {/* Quick Status */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    displayNutrition.calories.current >= displayNutrition.calories.target * 0.9 ? 'bg-success' :
                    displayNutrition.calories.current >= displayNutrition.calories.target * 0.7 ? 'bg-warning' :
                    'bg-primary'
                  }`}></div>
                  <span className="text-xs text-muted-foreground">
                    {displayNutrition.calories.current >= displayNutrition.calories.target * 0.9 ? 'Excelente!' :
                     displayNutrition.calories.current >= displayNutrition.calories.target * 0.7 ? 'Bom trabalho!' :
                     'Continue assim!'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Macronutrients - Secondary Focus */}
        <div className="space-y-3 md:space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground">Macronutrientes</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          {/* Macronutrient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {/* Protein */}
            <Card className="shadow-soft hover:shadow-glow transition-spring bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Proteínas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 md:space-y-3">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">
                        {displayNutrition.protein.current}
                      </span>
                      <span className="text-xs md:text-sm text-green-600 dark:text-green-400">
                        / {displayNutrition.protein.target}g
                      </span>
                    </div>
                    <Progress 
                      value={getSafePct(displayNutrition.protein.current, displayNutrition.protein.target)} 
                      className="h-2 bg-green-200 dark:bg-green-800"
                    />
                  </div>
                  <p className={`text-xs font-medium text-center ${getProgressColor(displayNutrition.protein.current, displayNutrition.protein.target)}`}>
                    {Math.round(getSafePct(displayNutrition.protein.current, displayNutrition.protein.target))}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Carbs */}
            <Card className="shadow-soft hover:shadow-glow transition-spring bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Carboidratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 md:space-y-3">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-300">
                        {displayNutrition.carbs.current}
                      </span>
                      <span className="text-xs md:text-sm text-orange-600 dark:text-orange-400">
                        / {displayNutrition.carbs.target}g
                      </span>
                    </div>
                    <Progress 
                      value={getSafePct(displayNutrition.carbs.current, displayNutrition.carbs.target)} 
                      className="h-2 bg-orange-200 dark:bg-orange-800"
                    />
                  </div>
                  <p className={`text-xs font-medium text-center ${getProgressColor(displayNutrition.carbs.current, displayNutrition.carbs.target)}`}>
                    {Math.round(getSafePct(displayNutrition.carbs.current, displayNutrition.carbs.target))}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fat */}
            <Card className="shadow-soft hover:shadow-glow transition-spring bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Gorduras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 md:space-y-3">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                        {displayNutrition.fat.current}
                      </span>
                      <span className="text-xs md:text-sm text-purple-600 dark:text-purple-400">
                        / {displayNutrition.fat.target}g
                      </span>
                    </div>
                    <Progress 
                      value={getSafePct(displayNutrition.fat.current, displayNutrition.fat.target)} 
                      className="h-2 bg-purple-200 dark:bg-purple-800"
                    />
                  </div>
                  <p className={`text-xs font-medium text-center ${getProgressColor(displayNutrition.fat.current, displayNutrition.fat.target)}`}>
                    {Math.round(getSafePct(displayNutrition.fat.current, displayNutrition.fat.target))}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Macro Summary */}
          <div className="flex items-center justify-center gap-3 md:gap-6 p-3 md:p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
            <div className="text-lg md:text-2xl font-bold text-green-600">{Math.round(getSafePct(displayNutrition.protein.current, displayNutrition.protein.target))}%</div>
            <div className="text-xs text-muted-foreground">Proteínas</div>
          </div>
          <div className="w-px h-6 md:h-8 bg-border"></div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold text-orange-600">{Math.round(getSafePct(displayNutrition.carbs.current, displayNutrition.carbs.target))}%</div>
            <div className="text-xs text-muted-foreground">Carboidratos</div>
          </div>
          <div className="w-px h-6 md:h-8 bg-border"></div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold text-purple-600">{Math.round(getSafePct(displayNutrition.fat.current, displayNutrition.fat.target))}%</div>
            <div className="text-xs text-muted-foreground">Gorduras</div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            {isToday ? 'Hoje' : 'Data Selecionada'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 md:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={openCalendarPage}
                className="border-primary/20 text-primary hover:bg-primary/10"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Abrir calendário
              </Button>

              <div className="text-center">
                <p className="text-sm md:text-lg font-semibold text-foreground">
                  {formatDate(selectedDate)}
                </p>
                {!isToday && (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Dados históricos
                  </p>
                )}
              </div>
            </div>
            
            {!isToday && (
              <Button
                variant="default"
                size="sm"
                onClick={goToToday}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                Ir para Hoje
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Log */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            {isToday ? 'Log de Hoje' : `Log de ${formatDate(selectedDate)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayEntries.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-muted-foreground">
              <p className="text-sm md:text-base">{isToday ? 'Nenhuma refeição registrada hoje' : 'Nenhuma refeição registrada neste dia'}</p>
              <p className="text-xs md:text-sm mt-1">{isToday ? 'Clique em "Log Refeição" para começar' : 'Este dia não possui registros de alimentação'}</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {displayEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => navigate('/snap-log', {
                    state: {
                      mode: 'view',
                      mealData: entry,
                      capturedImage: entry.image_url
                    }
                  })}
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      entry.log_type === 'meal' ? 'bg-primary' : 'bg-success'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs md:text-sm font-medium truncate">{entry.item_name}</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.log_type === 'meal' ? 'Refeição' : 'Alimento'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {entry.quantity}{entry.log_type === 'food' ? 'g' : ' porção'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground mt-1">
                        <span>{getMealTimeLabel(entry.meal_time)}</span>
                        <span>{formatTime(entry.created_at)}</span>
                        <span>{entry.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveLog(entry.id)
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-3">
            {displayEntries.length > 0 ? (
              displayEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      entry.log_type === 'meal' ? 'bg-primary animate-pulse-glow' : 'bg-success'
                    }`}></div>
                    <span className="text-xs md:text-sm font-medium truncate">
                      {entry.log_type === 'meal' ? 'Registrou refeição:' : 'Adicionou:'} {entry.item_name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(entry.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm md:text-base">Nenhuma atividade registrada hoje</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Meal Modal */}
      <LogMealModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
      />
      {/* Fecha container de Desktop */}
      </div>
    {/* Fecha wrapper principal */}
    </div>
  )
}
