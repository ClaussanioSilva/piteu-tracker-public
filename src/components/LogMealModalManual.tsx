import { useState, useRef, useEffect } from "react"
import { Star, Plus, Minus, ScanBarcode, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNutrition } from "@/providers/nutrition-context"
import { useFoods, useMeals } from '@/hooks/use-supabase'
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import type { Database } from '@/lib/supabase'

// Types from Supabase
type Food = Database['public']['Tables']['foods']['Row']
type Meal = Database['public']['Tables']['meals']['Row']
type MealFood = Database['public']['Tables']['meal_foods']['Row']

// Extended meal type with foods
type MealWithFoods = Meal & {
  meal_foods?: (MealFood & {
    foods?: {
      id: string
      name: string
      calories_per_100g: number
      protein_per_100g: number
      carbs_per_100g: number
      fat_per_100g: number
      fiber_per_100g: number
      sugar_per_100g: number
      sodium_per_100g: number
    }
  })[]
}

interface LogMealModalManualProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

export default function LogMealModalManual({ isOpen, onClose, onBack }: LogMealModalManualProps) {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { foods, loading: foodsLoading, addFood, getFoodFromBarcode } = useFoods()
  const { meals, loading: mealsLoading } = useMeals()
  const { addFoodLog } = useNutrition()

  // View state: 'select' (default), 'scan', 'create'
  const [view, setView] = useState<'select' | 'scan' | 'create'>('select')
  
  // Scanner state
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)
  const [isScanningInit, setIsScanningInit] = useState(false)
  
  // New Food Form state
  const [newFood, setNewFood] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: "",
    sodium: "",
    isLiquid: false,
    serving: "100"
  })

  // Manual Log State
  const [itemType, setItemType] = useState<'food' | 'meal'>('food')
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(100)
  const [selectedMealTime, setSelectedMealTime] = useState<'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'>('breakfast')

  const mealTimes: { value: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'; label: string; shortLabel: string }[] = [
    { value: 'breakfast', label: 'Café da Manhã', shortLabel: 'Café' },
    { value: 'morning_snack', label: 'Lanche da Manhã', shortLabel: 'Lanche M.' },
    { value: 'lunch', label: 'Almoço', shortLabel: 'Almoço' },
    { value: 'afternoon_snack', label: 'Lanche da Tarde', shortLabel: 'Lanche T.' },
    { value: 'dinner', label: 'Jantar', shortLabel: 'Jantar' },
    { value: 'evening_snack', label: 'Lanche da Noite', shortLabel: 'Ceia' }
  ]

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow animation to finish
      const timer = setTimeout(() => {
        setView('select')
        stopBarcodeScan()
        setNewFood({
          name: "",
          brand: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          sugar: "",
          sodium: "",
          isLiquid: false,
          serving: "100"
        })
        setSelectedItem('')
        setQuantity(100)
        setSelectedMealTime('breakfast')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopBarcodeScan()
    }
  }, [])

  const startBarcodeScan = async () => {
    try {
      setView('scan')
      setIsScanningInit(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      scanningRef.current = true

      // Wait for video element
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      
      if (videoRef.current) {
        const v = videoRef.current
        v.srcObject = stream
        v.muted = true
        v.setAttribute('playsinline', 'true')
        
        await new Promise<void>((resolve) => {
          const handler = () => {
            v.removeEventListener('loadedmetadata', handler)
            resolve()
          }
          v.addEventListener('loadedmetadata', handler)
        })
        await v.play().catch(() => {})
      }

      // Initialize detector
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const DetectorCtor = (window as any).BarcodeDetector
      if (!DetectorCtor) {
        toast({ 
          title: 'Erro', 
          description: 'Seu navegador não suporta leitura de código de barras.', 
          variant: 'destructive' 
        })
        stopBarcodeScan()
        setView('select')
        return
      }

      const detector = new DetectorCtor({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128'] })
      
      const scan = async () => {
        if (!scanningRef.current) return
        
        try {
          const v = videoRef.current
          if (v && v.readyState >= 2) {
            const codes = await detector.detect(v)
            if (codes && codes.length > 0) {
              const code = codes[0].rawValue
              handleBarcodeDetected(code)
              return
            }
          }
        } catch (err) {
          // Silent error
        }
        
        if (scanningRef.current) requestAnimationFrame(scan)
      }
      
      requestAnimationFrame(scan)
      setIsScanningInit(false)

    } catch (error) {
      console.error('Error starting scanner:', error)
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível acessar a câmera.', 
        variant: 'destructive' 
      })
      stopBarcodeScan()
      setView('select')
    }
  }

  const stopBarcodeScan = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleBarcodeDetected = async (barcode: string) => {
    stopBarcodeScan()
    toast({ title: 'Código detectado', description: barcode })
    
    // Fetch food data
    const data = await getFoodFromBarcode(barcode)
    
    if (data) {
      const { baseFood, brand } = data
      setNewFood({
        name: baseFood.name,
        brand: brand || "",
        calories: baseFood.calories_per_100g.toString(),
        protein: baseFood.protein_per_100g.toString(),
        carbs: baseFood.carbs_per_100g.toString(),
        fat: baseFood.fat_per_100g.toString(),
        fiber: baseFood.fiber_per_100g?.toString() || "",
        sugar: baseFood.sugar_per_100g?.toString() || "",
        sodium: baseFood.sodium_per_100g?.toString() || "",
        isLiquid: false, // Default
        serving: baseFood.serving_size_g.toString()
      })
    } else {
      // Empty form if not found
      setNewFood(prev => ({ ...prev, name: "Novo Alimento" }))
    }
    
    setView('create')
  }

  const handleCreateFood = async () => {
    try {
        if (!newFood.name || !newFood.calories) {
            toast({ title: "Erro", description: "Nome e calorias são obrigatórios", variant: "destructive" })
            return
        }

        const foodData = {
            name: newFood.name,
            calories_per_100g: Number(newFood.calories),
            protein_per_100g: Number(newFood.protein) || 0,
            carbs_per_100g: Number(newFood.carbs) || 0,
            fat_per_100g: Number(newFood.fat) || 0,
            fiber_per_100g: Number(newFood.fiber) || 0,
            sugar_per_100g: Number(newFood.sugar) || 0,
            sodium_per_100g: Number(newFood.sodium) || 0,
            description: newFood.brand || null,
            serving_size_g: Number(newFood.serving) || 100,
        }

        const created = await addFood(foodData) as Food | null
        if (created) {
            setItemType('food')
            setSelectedItem(created.id)
            setView('select')
        }
    } catch (e) {
        console.error(e)
    }
  }

  const getSelectedItem = () => {
    if (!selectedItem) return null
    
    if (itemType === 'food') {
      return foods.find(food => food.id === selectedItem) || null
    } else {
      return meals.find(meal => meal.id === selectedItem) || null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateNutrients = (item: any) => {
    if (!item) return null
    
    const qty = quantity
    
    if (itemType === 'food') {
      const food = item as Food
      const multiplier = qty / 100
      return {
        calories: Math.round((food.calories_per_100g || 0) * multiplier),
        protein: Math.round((food.protein_per_100g || 0) * multiplier * 100) / 100,
        carbs: Math.round((food.carbs_per_100g || 0) * multiplier * 100) / 100,
        fat: Math.round((food.fat_per_100g || 0) * multiplier * 100) / 100,
        fiber: Math.round((food.fiber_per_100g || 0) * multiplier * 100) / 100,
        sugar: Math.round((food.sugar_per_100g || 0) * multiplier * 100) / 100,
        sodium: Math.round((food.sodium_per_100g || 0) * multiplier * 100) / 100
      }
    } else {
      const meal = item as MealWithFoods
      if (!meal.meal_foods || meal.meal_foods.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totals = meal.meal_foods.reduce((acc: any, mf: any) => {
        const food = mf.foods
        if (food) {
          const multiplier = mf.quantity_g / 100
          acc.calories += (food.calories_per_100g || 0) * multiplier
          acc.protein += (food.protein_per_100g || 0) * multiplier
          acc.carbs += (food.carbs_per_100g || 0) * multiplier
          acc.fat += (food.fat_per_100g || 0) * multiplier
          acc.fiber += (food.fiber_per_100g || 0) * multiplier
          acc.sugar += (food.sugar_per_100g || 0) * multiplier
          acc.sodium += (food.sodium_per_100g || 0) * multiplier
        }
        return acc
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 })

      return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 100) / 100,
        carbs: Math.round(totals.carbs * 100) / 100,
        fat: Math.round(totals.fat * 100) / 100,
        fiber: Math.round(totals.fiber * 100) / 100,
        sugar: Math.round(totals.sugar * 100) / 100,
        sodium: Math.round(totals.sodium * 100) / 100
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItem || quantity <= 0) return
    
    const item = getSelectedItem()
    if (!item) return
    
    const nutrients = calculateNutrients(item)
    if (!nutrients) return
    
    try {
      const logData = {
        item_name: itemType === 'food' ? (item as Food).name : (item as Meal).name,
        log_type: itemType,
        quantity: itemType === 'food' ? quantity : 1,
        meal_time: selectedMealTime as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack',
        calories: nutrients.calories,
        protein_g: nutrients.protein,
        carbs_g: nutrients.carbs,
        fat_g: nutrients.fat,
        fiber_g: nutrients.fiber,
        sugar_g: nutrients.sugar,
        sodium_mg: nutrients.sodium,
        item_id: selectedItem,
        notes: '',
        image_url: null
      }
      
      const result = await addFoodLog(logData)
            if (result) {
              // Blur active element to reset viewport zoom on mobile
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              
              onClose()
              setSelectedItem('')
        setQuantity(100)
        setSelectedMealTime('breakfast')
      }
    } catch (error) {
      console.error('Error adding food log:', error)
    }
  }

  const nutrients = getSelectedItem() ? calculateNutrients(getSelectedItem()!) : null

  const content = (
    <div className={isMobile ? "mx-auto w-full max-w-sm flex flex-col h-full" : "grid gap-4 py-4"}>
      {isMobile && (
        <DrawerHeader>
            <div className="flex items-center w-full">
                <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <DrawerTitle className="mx-auto">
                    {view === 'scan' ? 'Escanear Código' : 
                    view === 'create' ? 'Novo Alimento' : 
                    'Adicionar Manualmente'}
                </DrawerTitle>
            </div>
        </DrawerHeader>
      )}

      {view === 'scan' ? (
        <div className="flex flex-col items-center p-4 space-y-4 h-[60vh]">
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                {isScanningInit && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
                <div className="absolute inset-0 border-2 border-white/50 rounded-lg m-8 pointer-events-none" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
                Aponte a câmera para o código de barras do alimento.
            </p>
            <Button variant="outline" onClick={() => { stopBarcodeScan(); setView('select'); }} className="w-full">
                Cancelar
            </Button>
        </div>
      ) : view === 'create' ? (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
                <Label>Nome do Alimento</Label>
                <Input 
                value={newFood.name} 
                onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                placeholder="Ex: Arroz Integral"
                />
            </div>
            <div className="space-y-2">
                <Label>Marca (Opcional)</Label>
                <Input 
                value={newFood.brand} 
                onChange={(e) => setNewFood({...newFood, brand: e.target.value})}
                placeholder="Ex: Tio João"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Calorias (kcal)</Label>
                    <Input type="number" value={newFood.calories} onChange={(e) => setNewFood({...newFood, calories: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Porção (g)</Label>
                    <Input type="number" value={newFood.serving} onChange={(e) => setNewFood({...newFood, serving: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                    <Label className="text-xs">Proteínas</Label>
                    <Input type="number" className="h-8" value={newFood.protein} onChange={(e) => setNewFood({...newFood, protein: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Carboidrato</Label>
                    <Input type="number" className="h-8" value={newFood.carbs} onChange={(e) => setNewFood({...newFood, carbs: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Gordura</Label>
                    <Input type="number" className="h-8" value={newFood.fat} onChange={(e) => setNewFood({...newFood, fat: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                    <Label className="text-xs">Fibra</Label>
                    <Input type="number" className="h-8" value={newFood.fiber} onChange={(e) => setNewFood({...newFood, fiber: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Sódio (mg)</Label>
                    <Input type="number" className="h-8" value={newFood.sodium} onChange={(e) => setNewFood({...newFood, sodium: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Açúcar</Label>
                    <Input type="number" className="h-8" value={newFood.sugar} onChange={(e) => setNewFood({...newFood, sugar: e.target.value})} />
                </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-b">
                <Label>Alimento Líquido?</Label>
                <Switch 
                    checked={newFood.isLiquid} 
                    onCheckedChange={(c) => setNewFood({...newFood, isLiquid: c})} 
                />
            </div>

            <div className="pt-2 flex gap-2 pb-4">
                <Button variant="outline" className="flex-1" onClick={() => setView('select')}>Cancelar</Button>
                <Button className="flex-1" onClick={handleCreateFood}>Salvar</Button>
            </div>
        </div>
      ) : (
        <>
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
            <Tabs value={itemType} onValueChange={(v) => setItemType(v as 'food' | 'meal')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="food">Alimento</TabsTrigger>
                    <TabsTrigger value="meal">Refeição</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>O que você comeu?</Label>
                    {itemType === 'food' && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary gap-1"
                        onClick={startBarcodeScan}
                    >
                        <ScanBarcode className="w-4 h-4" />
                        <span className="text-xs">Escanear</span>
                    </Button>
                    )}
                </div>
                <Select 
                  value={selectedItem} 
                  onValueChange={setSelectedItem}
                  onOpenChange={(open) => {
                    if (open) {
                      // Force blur on active element to close keyboard properly
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur()
                      }
                    }
                  }}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Selecionar ${itemType === 'food' ? 'alimento' : 'refeição'}`} />
                    </SelectTrigger>
                    <SelectContent>
                    {itemType === 'food' ? (
                        foods.map((food) => (
                        <SelectItem key={food.id} value={food.id}>
                            <div className="flex items-center gap-2">
                            {food.name}
                            {food.is_favorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            </div>
                        </SelectItem>
                        ))
                    ) : (
                        meals.map((meal) => (
                        <SelectItem key={meal.id} value={meal.id}>
                            {meal.name}
                        </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select>
            </div>

            {itemType === 'food' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                    <Label>Quantidade</Label>
                    <span className="text-sm text-muted-foreground">{quantity}g</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setQuantity(q => Math.max(0, q - 10))}
                        className="h-10 w-10 shrink-0"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="relative flex-1">
                        <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 300);
                        }}
                        className="text-center text-lg font-medium h-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">g</span>
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setQuantity(q => q + 10)}
                        className="h-10 w-10 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label>Quando?</Label>
                <div className="grid grid-cols-3 gap-2">
                    {mealTimes.map((time) => (
                    <Button
                        key={time.value}
                        variant={selectedMealTime === time.value ? "default" : "outline"}
                        className={`h-auto py-2 px-1 flex flex-col items-center justify-center text-xs ${selectedMealTime === time.value ? 'border-primary' : ''}`}
                        onClick={() => setSelectedMealTime(time.value)}
                    >
                        {time.shortLabel}
                    </Button>
                    ))}
                </div>
            </div>

            {nutrients && (
                <div className="rounded-lg border bg-muted/50 p-3">
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">Resumo</span>
                    <span className="font-bold text-primary">{nutrients.calories} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-col items-center bg-background rounded p-1">
                        <span className="font-semibold text-foreground">{nutrients.protein}g</span>
                        <span>Prot</span>
                    </div>
                    <div className="flex flex-col items-center bg-background rounded p-1">
                        <span className="font-semibold text-foreground">{nutrients.carbs}g</span>
                        <span>Carb</span>
                    </div>
                    <div className="flex flex-col items-center bg-background rounded p-1">
                        <span className="font-semibold text-foreground">{nutrients.fat}g</span>
                        <span>Gord</span>
                    </div>
                    </div>
                </div>
            )}
            
            {!isMobile && (
                <Button 
                    onClick={handleSubmit} 
                    className="w-full h-12 text-lg mt-4"
                    disabled={!selectedItem || quantity <= 0}
                >
                    Adicionar Log
                </Button>
            )}
        </div>

        {isMobile && (
            <DrawerFooter className="px-4 pb-8 pt-4 bg-background border-t mt-auto shrink-0">
                <Button 
                    onClick={handleSubmit} 
                    className="w-full h-12 text-lg"
                    disabled={!selectedItem || quantity <= 0}
                >
                    Adicionar Log
                </Button>
                <DrawerClose asChild>
                    <Button variant="ghost" className="w-full">Cancelar</Button>
                </DrawerClose>
            </DrawerFooter>
        )}
        </>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh] h-auto flex flex-col">
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div className="flex items-center gap-2 mb-4">
             <Button variant="ghost" size="icon" onClick={onBack}>
                 <ArrowLeft className="h-4 w-4" />
             </Button>
             <DialogTitle>
                {view === 'scan' ? 'Escanear Código' : 
                view === 'create' ? 'Novo Alimento' : 
                'Adicionar Manualmente'}
             </DialogTitle>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  )
}
