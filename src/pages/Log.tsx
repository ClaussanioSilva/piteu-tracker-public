import { useState } from "react"
import { Plus, Trash2, Calendar, Loader2, ChevronLeft, ChevronRight, Apple, Utensils, Flame, Droplets, Wheat, Beef } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useFoods, useMeals, useFoodLogs } from "@/hooks/use-supabase"
import { useNutrition } from "@/providers/nutrition-context"
import { Progress } from "@/components/ui/progress"

interface LogEntry {
  id: string
  type: 'food' | 'meal'
  itemId: string
  itemName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  mealTime: string
  timestamp: Date
}

export default function Log() {
  const { toast } = useToast()
  const { foods: supabaseFoods, loading: foodsLoading } = useFoods()
  const { meals: supabaseMeals, loading: mealsLoading } = useMeals()
  const { foodLogs, loading: logsLoading, addFoodLog, deleteFoodLog } = useFoodLogs()
  const { 
    addFoodLog: addFoodLogContext, 
    getEntriesByDate, 
    getNutritionByDate,
    dailyGoals: todayGoals 
  } = useNutrition()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMealTime, setSelectedMealTime] = useState("")

  // Convert Supabase foods to local format
  const availableFoods = supabaseFoods.map(food => ({
    id: food.id,
    name: food.name,
    calories: Number(food.calories_per_100g),
    protein: Number(food.protein_per_100g),
    carbs: Number(food.carbs_per_100g),
    fat: Number(food.fat_per_100g)
  }))

  // Convert Supabase meals to local format
  const availableMeals = supabaseMeals.map(meal => ({
    id: meal.id,
    name: meal.name,
    calories: 0, // This will need to be calculated from meal_foods
    protein: 0,
    carbs: 0,
    fat: 0
  }))

  const mealTimes = [
    { value: "breakfast", label: "Café da Manhã" },
    { value: "morning_snack", label: "Lanche da Manhã" },
    { value: "lunch", label: "Almoço" },
    { value: "afternoon_snack", label: "Lanche da Tarde" },
    { value: "dinner", label: "Jantar" },
    { value: "evening_snack", label: "Ceia" }
  ]

  const [newEntry, setNewEntry] = useState({
    type: 'food' as 'food' | 'meal',
    itemId: "",
    quantity: 100,
    mealTime: "breakfast" as "breakfast" | "lunch" | "dinner" | "morning_snack" | "afternoon_snack" | "evening_snack"
  })

  // Get selected date as string for API calls
  const selectedDateString = selectedDate.toISOString().split('T')[0]
  
  // Get entries for selected date using the new context function
  const dailyEntries = getEntriesByDate(selectedDateString)
  
  // Get nutrition data for selected date using the new context function
  const dailyNutrition = getNutritionByDate(selectedDateString)
  
  // Convert to LogEntry format for display
  const logEntries: LogEntry[] = dailyEntries.map(log => ({
    id: log.id,
    type: log.log_type as 'food' | 'meal',
    itemId: log.item_id || '',
    itemName: log.item_name || 'Unknown Food',
    quantity: Number(log.quantity),
    calories: log.calories || 0,
    protein: log.protein_g || 0,
    carbs: log.carbs_g || 0,
    fat: log.fat_g || 0,
    mealTime: log.meal_time,
    timestamp: new Date(log.log_date)
  }))

  // Group entries by meal time
  const entriesByMealTime = logEntries.reduce((acc, entry) => {
    if (!acc[entry.mealTime]) acc[entry.mealTime] = []
    acc[entry.mealTime].push(entry)
    return acc
  }, {} as Record<string, LogEntry[]>)

  // Use nutrition data from context instead of calculating manually
  const dailyTotals = {
    calories: dailyNutrition.calories.current,
    protein: dailyNutrition.protein.current,
    carbs: dailyNutrition.carbs.current,
    fat: dailyNutrition.fat.current
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const getMealTimeLabel = (mealTime: string) => {
    const meal = mealTimes.find(m => m.value === mealTime)
    return meal?.label || mealTime
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEntry.itemId || !newEntry.mealTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um alimento/refeição e horário.",
        variant: "destructive"
      })
      return
    }

    const itemData = newEntry.type === 'food' 
      ? availableFoods.find(f => f.id === newEntry.itemId)
      : availableMeals.find(m => m.id === newEntry.itemId)

    if (!itemData) {
      toast({
        title: "Erro",
        description: "Item não encontrado.",
        variant: "destructive"
      })
      return
    }

    const multiplier = newEntry.quantity / 100
    const entryData = {
      id: Date.now().toString(),
      type: newEntry.type,
      itemId: newEntry.itemId,
      itemName: itemData.name,
      quantity: newEntry.quantity,
      calories: Math.round(itemData.calories * multiplier * 100) / 100,
      protein: Math.round(itemData.protein * multiplier * 100) / 100,
      carbs: Math.round(itemData.carbs * multiplier * 100) / 100,
      fat: Math.round(itemData.fat * multiplier * 100) / 100,
      mealTime: newEntry.mealTime,
      timestamp: selectedDate
    }

    // Use the nutrition context to add the food log
    await addFoodLogContext({
      item_id: newEntry.itemId,
      item_name: itemData.name,
      quantity: newEntry.quantity,
      calories: entryData.calories,
      protein_g: entryData.protein,
      carbs_g: entryData.carbs,
      fat_g: entryData.fat,
      meal_time: newEntry.mealTime as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack',
      log_type: newEntry.type,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      notes: '',
      image_url: null
    })

    setNewEntry({ type: 'food', itemId: "", quantity: 100, mealTime: "breakfast" })
    setSelectedMealTime("")

    toast({
      title: "Adicionado ao registro",
      description: `${entryData.itemName} foi adicionado ao seu registro.`
    })
  }

  const deleteEntry = (entryId: string) => {
    const entry = logEntries.find(e => e.id === entryId)
    if (entry) {
      deleteFoodLog(entry.id)
      toast({
        title: "Removido do registro",
        description: `${entry.itemName} foi removido do seu registro.`,
        variant: "destructive"
      })
    }
  }

  const openAddDialog = (mealTime: string = "") => {
    setSelectedMealTime(mealTime)
    setNewEntry({ ...newEntry, mealTime: mealTime as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack' })
  }

  // Show loading state
  if (foodsLoading || mealsLoading || logsLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  // Show message when no foods exist
  if (availableFoods.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in p-4 sm:p-6 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Registro de Alimentos</h1>
            <p className="text-muted-foreground">Acompanhe sua alimentação diária</p>
          </div>
        </div>
        
        <Card className="shadow-lg rounded-3xl border-0 overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Nenhum alimento disponível</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Para registrar alimentos, você precisa primeiro adicionar alimentos à sua biblioteca.
            </p>
            <Button 
              onClick={() => window.location.href = '/foods'}
              className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/25 rounded-xl h-12 px-8 text-base"
            >
              Ir para Alimentos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6 pb-24 max-w-5xl mx-auto">
      {/* Header with Date Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Registro Diário</h1>
            <p className="text-muted-foreground">O que você comeu hoje?</p>
          </div>
          
          <Dialog open={!!newEntry.itemId} onOpenChange={() => setNewEntry({ ...newEntry, itemId: "" })}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-primary hover:bg-primary-hover transition-spring shadow-lg shadow-primary/25 rounded-xl h-12 w-12 p-0 sm:w-auto sm:px-6"
                onClick={() => openAddDialog()}
              >
                <Plus className="w-6 h-6 sm:mr-2 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline font-medium">Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Adicionar ao Registro</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium ml-1">Tipo de Item</Label>
                  <Select 
                    value={newEntry.type} 
                    onValueChange={(value) => setNewEntry({ ...newEntry, type: value as 'food' | 'meal', itemId: "" })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="food">
                        <div className="flex items-center gap-2">
                          Alimento Individual
                        </div>
                      </SelectItem>
                      <SelectItem value="meal">
                        <div className="flex items-center gap-2">
                          Refeição Completa
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium ml-1">
                    {newEntry.type === 'food' ? 'Selecionar Alimento' : 'Selecionar Refeição'}
                  </Label>
                  <Select value={newEntry.itemId} onValueChange={(value) => setNewEntry({ ...newEntry, itemId: value })}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/20">
                      <SelectValue placeholder={`Selecione um ${newEntry.type === 'food' ? 'alimento' : 'refeição'}`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] rounded-xl">
                      {(newEntry.type === 'food' ? availableFoods : availableMeals).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center justify-between w-full min-w-[200px]">
                            <span>{item.name}</span>
                            <Badge variant="secondary" className="ml-2 rounded-lg text-xs">
                              {Math.round(item.calories)} kcal
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium ml-1">Horário da Refeição</Label>
                  <Select 
                    value={newEntry.mealTime} 
                    onValueChange={(value) => setNewEntry({ ...newEntry, mealTime: value as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack' })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/20">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {mealTimes.map((mealTime) => (
                        <SelectItem key={mealTime.value} value={mealTime.value}>
                          {mealTime.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium ml-1">
                    {newEntry.type === 'food' ? 'Quantidade (gramas)' : 'Porções'}
                  </Label>
                  <Input
                    type="number"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry({ ...newEntry, quantity: parseFloat(e.target.value) || 0 })}
                    min={1}
                    step={newEntry.type === 'meal' ? 0.5 : 1}
                    className="h-11 rounded-xl bg-muted/30 border-muted-foreground/20"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setNewEntry({ ...newEntry, itemId: "" })}
                    className="rounded-xl h-11 border-muted-foreground/20"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-md rounded-xl h-11 px-6">
                    Adicionar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Navigation */}
        <Card className="shadow-lg rounded-3xl border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => changeDate('prev')}
                className="rounded-xl hover:bg-muted"
              >
                <ChevronLeft className="w-6 h-6 text-muted-foreground" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground capitalize">
                  {formatDate(selectedDate)}
                </h2>
                {selectedDate.toDateString() !== new Date().toDateString() && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={goToToday}
                    className="text-primary h-auto p-0 text-xs font-medium"
                  >
                    Voltar para hoje
                  </Button>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => changeDate('next')}
                className="rounded-xl hover:bg-muted"
              >
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      <Card className="shadow-lg rounded-3xl border-0 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-muted/50 to-muted/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            Resumo Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <div className="relative flex items-center justify-center w-16 h-16 mb-2">
                <Flame className="w-8 h-8 text-orange-500 absolute" />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-orange-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-orange-500 transition-all duration-500"
                    strokeDasharray={`${Math.min((dailyTotals.calories / dailyNutrition.calories.target) * 100, 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.round(dailyTotals.calories)}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Kcal</p>
            </div>

            {/* Protein */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Beef className="w-6 h-6 text-blue-500 mb-2" />
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round(dailyTotals.protein)}g</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Proteínas</p>
              <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min((dailyTotals.protein / dailyNutrition.protein.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <Wheat className="w-6 h-6 text-green-500 mb-2" />
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{Math.round(dailyTotals.carbs)}g</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Carboidratos</p>
              <div className="w-full h-1.5 bg-green-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min((dailyTotals.carbs / dailyNutrition.carbs.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <Droplets className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{Math.round(dailyTotals.fat)}g</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Gorduras</p>
              <div className="w-full h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${Math.min((dailyTotals.fat / dailyNutrition.fat.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Time Sections */}
      <div className="space-y-4">
        {mealTimes.map((mealTime) => (
          <Card key={mealTime.value} className="shadow-md rounded-3xl border-0 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="py-4 px-6 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className={`w-2 h-6 rounded-full ${
                    mealTime.value.includes('breakfast') || mealTime.value.includes('morning') ? 'bg-orange-400' :
                    mealTime.value.includes('lunch') ? 'bg-red-500' :
                    'bg-indigo-500'
                  }`} />
                  {mealTime.label}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openAddDialog(mealTime.value)}
                  className="text-primary hover:bg-primary/10 hover:text-primary rounded-xl h-8 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {entriesByMealTime[mealTime.value]?.length > 0 ? (
                <div className="space-y-1">
                  {entriesByMealTime[mealTime.value].map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-smooth group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          {entry.type === 'food' ? (
                            <Apple className="w-5 h-5 text-primary" />
                          ) : (
                            <Utensils className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{entry.itemName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground/80">{Math.round(entry.calories)} kcal</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>
                              {entry.type === 'food' 
                                ? `${entry.quantity}g` 
                                : `${entry.quantity} un`
                              }
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                          className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all h-9 w-9"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground/50">
                  <p className="text-sm">Nenhum item registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {dailyEntries.length === 0 && (
        <Card className="shadow-lg rounded-3xl border-0 border-dashed border-2 border-muted bg-transparent">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dia vazio</h3>
            <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
              Comece adicionando alimentos ou refeições ao seu registro diário!
            </p>
            <Button 
              onClick={() => openAddDialog()}
              className="bg-gradient-primary hover:bg-primary-hover shadow-md rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Fazer Primeiro Registro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
