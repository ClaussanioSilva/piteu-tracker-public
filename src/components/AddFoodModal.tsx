import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFoods } from '@/hooks/use-supabase'
import { useToast } from "@/hooks/use-toast"

interface AddFoodModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddFoodModal({ isOpen, onClose }: AddFoodModalProps) {
  const { addFood } = useFoods()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    calories_per_100g: '',
    protein_per_100g: '',
    carbs_per_100g: '',
    fat_per_100g: '',
    fiber_per_100g: '',
    sugar_per_100g: '',
    sodium_per_100g: '',
    saturated_fat_per_100g: '',
    serving_size_g: '100'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.calories_per_100g) {
      toast({
        title: "Erro",
        description: "Nome e calorias são obrigatórios.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const foodData = {
        name: formData.name,
        display_name: formData.display_name || formData.name,
        description: formData.description || null,
        brand_id: null,
        api_id: null,
        api_source: null,
        api_last_updated: null,
        barcode: null,
        calories_per_100g: parseFloat(formData.calories_per_100g),
        protein_per_100g: parseFloat(formData.protein_per_100g) || 0,
        carbs_per_100g: parseFloat(formData.carbs_per_100g) || 0,
        fat_per_100g: parseFloat(formData.fat_per_100g) || 0,
        fiber_per_100g: parseFloat(formData.fiber_per_100g) || 0,
        sugar_per_100g: parseFloat(formData.sugar_per_100g) || 0,
        sodium_per_100g: parseFloat(formData.sodium_per_100g) || 0,
        saturated_fat_per_100g: parseFloat(formData.saturated_fat_per_100g) || 0,
        serving_size_g: parseFloat(formData.serving_size_g) || 100,
        source: 'user_created',
        is_verified: false,
        category: 'lunch' as const,
        is_favorite: false,
        tags: [],
        allergens: [],
        ingredients: null,
        preparation_method: null,
        subcategory: null,
        // Set all optional nutritional fields to 0
        trans_fat_per_100g: 0,
        cholesterol_per_100g: 0,
        potassium_per_100g: 0,
        vitamin_a_per_100g: 0,
        vitamin_c_per_100g: 0,
        vitamin_d_per_100g: 0,
        vitamin_e_per_100g: 0,
        vitamin_k_per_100g: 0,
        vitamin_b1_per_100g: 0,
        vitamin_b2_per_100g: 0,
        vitamin_b3_per_100g: 0,
        vitamin_b6_per_100g: 0,
        vitamin_b12_per_100g: 0,
        folate_per_100g: 0,
        calcium_per_100g: 0,
        iron_per_100g: 0,
        magnesium_per_100g: 0,
        phosphorus_per_100g: 0,
        zinc_per_100g: 0
      }
      
      console.log('Adding food:', foodData)
      
      const result = await addFood(foodData)
      if (result) {
        toast({
          title: "Sucesso",
          description: "Alimento adicionado com sucesso!"
        })
        
        // Reset form
        setFormData({
          name: '',
          display_name: '',
          description: '',
          calories_per_100g: '',
          protein_per_100g: '',
          carbs_per_100g: '',
          fat_per_100g: '',
          fiber_per_100g: '',
          sugar_per_100g: '',
          sodium_per_100g: '',
          saturated_fat_per_100g: '',
          serving_size_g: '100'
        })
        onClose()
      }
    } catch (error) {
      console.error('Error adding food:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o alimento.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-2xl lg:max-h-[90vh] lg:overflow-y-auto w-[95vw] h-[95vh] sm:w-auto sm:h-auto sm:max-w-[600px] md:max-w-[700px] rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Alimento
          </DialogTitle>
        </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Alimento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Frango Grelhado"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name">Nome para Exibição</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Ex: Peito de Frango Grelhado (sem pele)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ingredientes, observações, modo de preparo..."
              />
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Nutricionais por 100g</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories_per_100g">Calorias (kcal) *</Label>
                <Input
                  id="calories_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.calories_per_100g}
                  onChange={(e) => handleInputChange('calories_per_100g', e.target.value)}
                  placeholder="Ex: 165"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protein_per_100g">Proteínas (g)</Label>
                <Input
                  id="protein_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.protein_per_100g}
                  onChange={(e) => handleInputChange('protein_per_100g', e.target.value)}
                  placeholder="Ex: 31"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serving_size_g">Porção Padrão (g/ml)</Label>
                <Input
                  id="serving_size_g"
                  type="number"
                  step="1"
                  value={formData.serving_size_g}
                  onChange={(e) => handleInputChange('serving_size_g', e.target.value)}
                  placeholder="Ex: 100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carbs_per_100g">Carboidratos (g)</Label>
                <Input
                  id="carbs_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.carbs_per_100g}
                  onChange={(e) => handleInputChange('carbs_per_100g', e.target.value)}
                  placeholder="Ex: 0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fat_per_100g">Gorduras (g)</Label>
                <Input
                  id="fat_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.fat_per_100g}
                  onChange={(e) => handleInputChange('fat_per_100g', e.target.value)}
                  placeholder="Ex: 3.6"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiber_per_100g">Fibras (g)</Label>
                <Input
                  id="fiber_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.fiber_per_100g}
                  onChange={(e) => handleInputChange('fiber_per_100g', e.target.value)}
                  placeholder="Ex: 0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sugar_per_100g">Açúcar (g)</Label>
                <Input
                  id="sugar_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.sugar_per_100g}
                  onChange={(e) => handleInputChange('sugar_per_100g', e.target.value)}
                  placeholder="Ex: 0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sodium_per_100g">Sódio (mg)</Label>
                <Input
                  id="sodium_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.sodium_per_100g}
                  onChange={(e) => handleInputChange('sodium_per_100g', e.target.value)}
                  placeholder="Ex: 74"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="saturated_fat_per_100g">Gordura Saturada (g)</Label>
                <Input
                  id="saturated_fat_per_100g"
                  type="number"
                  step="0.1"
                  value={formData.saturated_fat_per_100g}
                  onChange={(e) => handleInputChange('saturated_fat_per_100g', e.target.value)}
                  placeholder="Ex: 1"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" type="button">
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.calories_per_100g}
              className="flex-1"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Alimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
