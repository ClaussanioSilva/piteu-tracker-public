import { useState } from "react"
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useFoods, useMeals } from "@/hooks/use-supabase"
import { Database } from "@/lib/supabase"

type Meal = Database['public']['Tables']['meals']['Row']
type MealFood = Database['public']['Tables']['meal_foods']['Row']

interface MealWithFoods extends Meal {
  meal_foods?: (MealFood & {
    foods?: {
      id: string
      name: string
      calories_per_100g: number
      protein_per_100g: number
      carbs_per_100g: number
      fat_per_100g: number
    }
  })[]
  foods: MealFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface NewMealFood {
  foodId: string
  name: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function Meals() {
  const { toast } = useToast()
  const { foods: supabaseFoods, loading: foodsLoading } = useFoods()
  const { meals: supabaseMeals, loading: mealsLoading, addMeal, updateMeal, deleteMeal: deleteMealHook } = useMeals()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealWithFoods | null>(null)
  
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
  const meals: MealWithFoods[] = supabaseMeals.map(meal => {
    const mealFoods = meal.meal_foods || []
    const foods = mealFoods.map(mf => ({
      id: mf.id,
      meal_id: mf.meal_id,
      food_id: mf.food_id,
      quantity_g: mf.quantity_g,
      created_at: mf.created_at
    }))

    const totals = mealFoods.reduce((acc, mf) => {
      const food = mf.foods
      if (food) {
        const multiplier = mf.quantity_g / 100
        acc.calories += (food.calories_per_100g || 0) * multiplier
        acc.protein += (food.protein_per_100g || 0) * multiplier
        acc.carbs += (food.carbs_per_100g || 0) * multiplier
        acc.fat += (food.fat_per_100g || 0) * multiplier
      }
      return acc
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return {
      ...meal,
      foods,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 100) / 100,
      totalCarbs: Math.round(totals.carbs * 100) / 100,
      totalFat: Math.round(totals.fat * 100) / 100
    }
  })

  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    foods: [] as NewMealFood[]
  })

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (foodsLoading || mealsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (availableFoods.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Refeições</h1>
          <p className="text-sm text-muted-foreground">Crie suas refeições</p>
        </div>
        
        <Card className="bg-card rounded-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-2">Sem alimentos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione alimentos primeiro.
            </p>
            <Button 
              onClick={() => window.location.href = '/foods'}
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
            >
              Ir para Alimentos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calculateMealTotals = (foods: NewMealFood[]) => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMeal.name) {
      toast({
        title: "Erro",
        description: "Adicione um nome para a refeição.",
        variant: "destructive"
      })
      return
    }

    const mealForSupabase = {
      name: newMeal.name,
      description: newMeal.description || null,
      category: 'lunch' as const,
      is_template: false
    }

    const foodsForSupabase = newMeal.foods
      .filter(food => food.foodId && food.quantity > 0)
      .map(food => ({
        foodId: food.foodId,
        quantity: food.quantity
      }))
    
    const result = await addMeal(mealForSupabase, foodsForSupabase)
    if (result) {
      toast({
        title: "Refeição criada!",
        description: `${newMeal.name} foi criada.`
      })
      setNewMeal({ name: "", description: "", foods: [] })
      setEditingMeal(null)
      setIsDialogOpen(false)
    }
  }

  const addFoodToMeal = () => {
    setNewMeal({
      ...newMeal,
      foods: [...newMeal.foods, {
        foodId: "",
        name: "",
        quantity: 100,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }]
    })
  }

  const updateMealFood = (index: number, field: string, value: string) => {
    const updatedFoods = [...newMeal.foods]
    const food = updatedFoods[index]
    
    if (field === 'foodId') {
      const foodData = availableFoods.find(f => f.id === value)
      if (foodData) {
        const multiplier = food.quantity / 100
        updatedFoods[index] = {
          ...food,
          foodId: value,
          name: foodData.name,
          calories: Math.round(foodData.calories * multiplier * 100) / 100,
          protein: Math.round(foodData.protein * multiplier * 100) / 100,
          carbs: Math.round(foodData.carbs * multiplier * 100) / 100,
          fat: Math.round(foodData.fat * multiplier * 100) / 100
        }
      }
    } else if (field === 'quantity') {
      const quantity = parseFloat(value) || 0
      const foodData = availableFoods.find(f => f.id === food.foodId)
      if (foodData) {
        const multiplier = quantity / 100
        updatedFoods[index] = {
          ...food,
          quantity,
          calories: Math.round(foodData.calories * multiplier * 100) / 100,
          protein: Math.round(foodData.protein * multiplier * 100) / 100,
          carbs: Math.round(foodData.carbs * multiplier * 100) / 100,
          fat: Math.round(foodData.fat * multiplier * 100) / 100
        }
      } else {
        updatedFoods[index] = { ...food, quantity }
      }
    }
    
    setNewMeal({ ...newMeal, foods: updatedFoods })
  }

  const removeFoodFromMeal = (index: number) => {
    setNewMeal({
      ...newMeal,
      foods: newMeal.foods.filter((_, i) => i !== index)
    })
  }

  const deleteMeal = (meal: Meal) => {
    deleteMealHook(meal.id)
    toast({
      title: "Removida",
      description: `${meal.name} foi removida.`,
      variant: "destructive"
    })
  }

  const currentTotals = calculateMealTotals(newMeal.foods)

  return (
    <div className="space-y-4 animate-fade-in pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refeições</h1>
          <p className="text-sm text-muted-foreground">Suas refeições personalizadas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-sm transition-all duration-300"
              onClick={() => {
                setEditingMeal(null)
                setNewMeal({ name: "", description: "", foods: [] })
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingMeal ? "Editar Refeição" : "Nova Refeição"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Almoço Saudável"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="h-11 rounded-xl bg-muted/30 border-muted"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Alimentos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFoodToMeal} className="rounded-xl h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {newMeal.foods.map((food, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-xl space-y-2 border border-muted/50">
                    <div className="flex items-center gap-2">
                      <Select
                        value={food.foodId}
                        onValueChange={(value) => updateMealFood(index, 'foodId', value)}
                      >
                        <SelectTrigger className="flex-1 h-10 rounded-xl bg-card border-muted/50">
                          <SelectValue placeholder="Selecionar alimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFoods.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={food.quantity || ""}
                          onChange={(e) => updateMealFood(index, 'quantity', e.target.value)}
                          className="w-16 h-10 rounded-xl text-center bg-card border-muted/50"
                          placeholder="100"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFoodFromMeal(index)}
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {newMeal.foods.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground">
                      Nenhum alimento adicionado
                    </p>
                    <Button type="button" variant="link" size="sm" onClick={addFoodToMeal} className="text-primary mt-1">
                      Adicionar primeiro alimento
                    </Button>
                  </div>
                )}
              </div>

              {newMeal.foods.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Totais da Refeição
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-background/80 p-2 rounded-lg shadow-sm">
                      <p className="text-lg font-bold text-primary">{Math.round(currentTotals.calories)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">kcal</p>
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg">
                      <p className="text-lg font-bold text-foreground">{Math.round(currentTotals.protein)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Prot</p>
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg">
                      <p className="text-lg font-bold text-foreground">{Math.round(currentTotals.carbs)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Carb</p>
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg">
                      <p className="text-lg font-bold text-foreground">{Math.round(currentTotals.fat)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Gord</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 rounded-xl h-11"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl h-11 font-medium shadow-md shadow-primary/20">
                  {editingMeal ? "Salvar Alterações" : "Criar Refeição"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          placeholder="Buscar refeições..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {filteredMeals.length === 0 ? (
          <Card className="bg-card rounded-2xl border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {searchTerm ? "Nenhuma refeição encontrada" : "Crie sua primeira refeição"}
              </p>
              {!searchTerm && (
                <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2 text-primary">
                  Começar agora
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMeals.map((meal, index) => (
            <Card 
              key={meal.id} 
              className="bg-card rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{meal.name}</h3>
                    {meal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{meal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingMeal(meal)
                        setNewMeal({
                          name: meal.name,
                          description: meal.description || "",
                          foods: meal.foods.map(f => {
                            const food = availableFoods.find(af => af.id === f.food_id)
                            const multiplier = f.quantity_g / 100
                            return {
                              foodId: f.food_id,
                              name: food?.name || "Unknown",
                              quantity: f.quantity_g,
                              calories: Math.round((food?.calories || 0) * multiplier),
                              protein: Math.round((food?.protein || 0) * multiplier),
                              carbs: Math.round((food?.carbs || 0) * multiplier),
                              fat: Math.round((food?.fat || 0) * multiplier)
                            }
                          })
                        })
                        setIsDialogOpen(true)
                      }}
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeal(meal)}
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-primary/5 rounded-xl p-2.5 flex flex-col justify-center">
                    <p className="text-sm font-bold text-primary">{meal.totalCalories}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">kcal</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2.5 flex flex-col justify-center">
                    <p className="text-sm font-bold text-foreground">{meal.totalProtein}g</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Prot</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2.5 flex flex-col justify-center">
                    <p className="text-sm font-bold text-foreground">{meal.totalCarbs}g</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Carb</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-2.5 flex flex-col justify-center">
                    <p className="text-sm font-bold text-foreground">{meal.totalFat}g</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Gord</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}