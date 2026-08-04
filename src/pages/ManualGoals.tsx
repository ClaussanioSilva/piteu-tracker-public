import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useNutritionalGoals } from "@/hooks/use-supabase"
import { useNutrition } from "@/providers/nutrition-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ManualGoals() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { goals, saveGoals, loading } = useNutritionalGoals()
  const { refreshData } = useNutrition()
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })

  useEffect(() => {
    if (goals) {
      setFormData({
        calories: goals.daily_calories,
        protein: goals.daily_protein_g,
        carbs: goals.daily_carbs_g,
        fat: goals.daily_fat_g
      })
    }
  }, [goals])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(value)
    }))
  }

  const totalMacroCalories = (formData.protein * 4) + (formData.carbs * 4) + (formData.fat * 9)
  const calorieDiff = Math.abs(formData.calories - totalMacroCalories)
  const isConsistent = calorieDiff < 50 // Allow some margin

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveGoals({
        daily_calories: formData.calories,
        daily_protein_g: formData.protein,
        daily_carbs_g: formData.carbs,
        daily_fat_g: formData.fat,
        daily_fiber_g: goals?.daily_fiber_g || 25,
        daily_sodium_mg: goals?.daily_sodium_mg || 2300,
        daily_sugar_g: goals?.daily_sugar_g || 50,
      })
      
      await refreshData()
      
      toast({
        title: "Metas atualizadas",
        description: "Suas metas personalizadas foram salvas."
      })
      
      navigate("/caloric-goals")
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as metas.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-4 bg-background/80 backdrop-blur-md border-b border-border -mx-4 px-4 mb-6">
        <div className="h-10 pb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold">Editar Metas Manualmente</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6 pb-10">
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 rounded-3xl">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            Aqui você pode definir suas metas exatamente como desejar, ignorando os cálculos automáticos baseados no perfil.
          </AlertDescription>
        </Alert>

        <Card className="shadow-sm border-border/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Calorias e Macros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Meta de Calorias (kcal)</Label>
              <Input 
                id="calories" 
                type="number" 
                value={formData.calories || ''} 
                onChange={(e) => handleChange('calories', e.target.value)}
                placeholder="Ex: 2000"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-xs">Proteína (g)</Label>
                <Input 
                  id="protein" 
                  type="number" 
                  value={formData.protein || ''} 
                  onChange={(e) => handleChange('protein', e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-xs">Carbos (g)</Label>
                <Input 
                  id="carbs" 
                  type="number" 
                  value={formData.carbs || ''} 
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-xs">Gordura (g)</Label>
                <Input 
                  id="fat" 
                  type="number" 
                  value={formData.fat || ''} 
                  onChange={(e) => handleChange('fat', e.target.value)}
                  className="text-center"
                />
              </div>
            </div>

            {!isConsistent && formData.calories > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Nota: A soma dos macros ({totalMacroCalories} kcal) não corresponde exatamente à meta calórica ({formData.calories} kcal).
              </p>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave} 
          disabled={isSaving || loading}
          className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-sm shadow-primary/20"
        >
          {isSaving ? "Salvando..." : "Salvar Metas Personalizadas"}
        </Button>
      </div>
    </div>
  )
}
