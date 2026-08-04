import { useState, useRef, useEffect } from "react"
import { Search, Plus, Star, Edit, Trash2, Loader2, ScanBarcode, X, Check, Droplets, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { useToast } from "@/hooks/use-toast"
import { useFoods } from "@/hooks/use-supabase"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
  isLiquid?: boolean
  isFavorite?: boolean
  brand?: string
  fiber?: number
  sugar?: number
  sodium?: number
}

interface FoodFormData {
  name: string
  brand: string
  serving: string
  isLiquid: boolean
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  sugar: string
  sodium: string
}

interface FoodFormProps {
  initialData: FoodFormData;
  onSubmit: (data: FoodFormData) => void;
  onCancel: () => void;
  onScanBarcode: () => void;
  isEditing: boolean;
}

const FoodForm = ({ initialData, onSubmit, onCancel, onScanBarcode, isEditing }: FoodFormProps) => {
  const [formData, setFormData] = useState<FoodFormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2 px-1">
      {/* Scan Button */}
      {!isEditing && (
        <Button 
          type="button" 
          onClick={onScanBarcode}
          className="w-full h-12 mb-2 bg-primary text-white rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="font-medium">Escanear Código de Barras</span>
        </Button>
      )}

      {/* Name & Brand */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="name" className="text-sm font-medium ml-1">Nome do Alimento</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="h-11 rounded-xl bg-muted/30 mt-1"
            placeholder="Ex: Arroz Integral"
            required
          />
        </div>
        <div>
          <Label htmlFor="brand" className="text-sm font-medium ml-1">Marca (Opcional)</Label>
          <Input 
            id="brand" 
            value={formData.brand} 
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })} 
            className="h-11 rounded-xl bg-muted/30 mt-1"
            placeholder="Ex: Tio João"
          />
        </div>
      </div>

      {/* Portion & Type */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
           <Label htmlFor="serving" className="text-sm font-medium ml-1">Porção ({formData.isLiquid ? 'ml' : 'g'})</Label>
           <Input 
             id="serving" 
             type="number"
             value={formData.serving} 
             onChange={(e) => setFormData({ ...formData, serving: e.target.value })} 
             className="h-11 rounded-xl bg-muted/30 mt-1"
             placeholder="100"
           />
        </div>
        <div className="flex items-center h-11 bg-muted/30 rounded-xl px-1 p-1">
            <button
                type="button"
                onClick={() => setFormData({...formData, isLiquid: false})}
                className={cn(
                    "flex-1 h-full rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                    !formData.isLiquid ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                )}
            >
                <Cookie className="w-3.5 h-3.5" />
                Sólido
            </button>
            <button
                type="button"
                onClick={() => setFormData({...formData, isLiquid: true})}
                className={cn(
                    "flex-1 h-full rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                    formData.isLiquid ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                )}
            >
                <Droplets className="w-3.5 h-3.5" />
                Líquido
            </button>
        </div>
      </div>

      {/* Macros */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Macronutrientes (por 100{formData.isLiquid ? 'ml' : 'g'})</h4>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="calories" className="text-sm font-medium ml-1">Calorias (kcal)</Label>
                <Input 
                  id="calories" 
                  type="number" 
                  value={formData.calories} 
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })} 
                  className="h-11 rounded-xl bg-muted/30 mt-1"
                  placeholder="0"
                  required
                />
            </div>
            <div>
                <Label htmlFor="protein" className="text-sm font-medium ml-1">Proteínas (g)</Label>
                <Input 
                  id="protein" 
                  type="number" 
                  value={formData.protein} 
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })} 
                  className="h-11 rounded-xl bg-muted/30 mt-1"
                  placeholder="0"
                  required
                />
            </div>
            <div>
                <Label htmlFor="carbs" className="text-sm font-medium ml-1">Carboidratos (g)</Label>
                <Input 
                  id="carbs" 
                  type="number" 
                  value={formData.carbs} 
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })} 
                  className="h-11 rounded-xl bg-muted/30 mt-1"
                  placeholder="0"
                  required
                />
            </div>
            <div>
                <Label htmlFor="fat" className="text-sm font-medium ml-1">Gorduras (g)</Label>
                <Input 
                  id="fat" 
                  type="number" 
                  value={formData.fat} 
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })} 
                  className="h-11 rounded-xl bg-muted/30 mt-1"
                  placeholder="0"
                  required
                />
            </div>
        </div>
      </div>

      {/* Micros */}
      <div className="space-y-3 pt-2">
        <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs ml-1">Outros (Opcional)</h4>
        
        <div className="grid grid-cols-3 gap-3">
            <div>
                <Label htmlFor="fiber" className="text-xs font-medium ml-1">Fibra (g)</Label>
                <Input 
                  id="fiber" 
                  type="number" 
                  value={formData.fiber} 
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })} 
                  className="h-10 rounded-xl bg-muted/30 mt-1 text-sm"
                  placeholder="0"
                />
            </div>
            <div>
                <Label htmlFor="sugar" className="text-xs font-medium ml-1">Açúcar (g)</Label>
                <Input 
                  id="sugar" 
                  type="number" 
                  value={formData.sugar} 
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value })} 
                  className="h-10 rounded-xl bg-muted/30 mt-1 text-sm"
                  placeholder="0"
                />
            </div>
            <div>
                <Label htmlFor="sodium" className="text-xs font-medium ml-1">Sódio (mg)</Label>
                <Input 
                  id="sodium" 
                  type="number" 
                  value={formData.sodium} 
                  onChange={(e) => setFormData({ ...formData, sodium: e.target.value })} 
                  className="h-10 rounded-xl bg-muted/30 mt-1 text-sm"
                  placeholder="0"
                />
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 pb-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="rounded-xl h-12 flex-1 sm:flex-none border-muted-foreground/20"
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary shadow-md rounded-xl h-12 flex-1 sm:flex-none px-8">
          Salvar
        </Button>
      </div>
    </form>
  )
}

export default function Foods() {
  const { toast } = useToast()
  const { foods: supabaseFoods, loading, addFood, getFoodFromBarcode, updateFood, deleteFood } = useFoods()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)

  const [newFood, setNewFood] = useState({
    name: "",
    brand: "",
    serving: "100",
    isLiquid: false,
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: "",
    sodium: ""
  })
  
  const [isSearching, setIsSearching] = useState(false)
  // Barcode
  const [barcode, setBarcode] = useState("")
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef<boolean>(false)

  // Convert Supabase foods to local format
  const foods: Food[] = supabaseFoods.map(food => ({
    id: food.id,
    name: food.name,
    calories: Number(food.calories_per_100g),
    protein: Number(food.protein_per_100g),
    carbs: Number(food.carbs_per_100g),
    fat: Number(food.fat_per_100g),
    serving: "100g", // Default serving size
    isLiquid: false, // Default to solid
    isFavorite: food.is_favorite || false,
    brand: food.description || "", // Mapping description to brand as per previous logic
    fiber: Number(food.fiber_per_100g) || 0,
    sugar: Number(food.sugar_per_100g) || 0,
    sodium: Number(food.sodium_per_100g) || 0
  }))

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const favoriteFood = (food: Food) => {
    // This function will need to be updated to use the Supabase hook
    // For now, it will just toast a placeholder message
    toast({
      title: "Favoritar Alimento",
      description: "A funcionalidade de favoritar ainda não está implementada."
    })
  }

  const searchNutritionalData = async (foodName: string) => {
    setIsSearching(true)
    try {
      // Aqui será implementada a integração com API nutricional
      // Por enquanto, simulando dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados simulados baseados no nome do alimento
      const mockData = {
        calories: Math.floor(Math.random() * 300) + 50,
        protein: Math.floor(Math.random() * 30) + 1,
        carbs: Math.floor(Math.random() * 50) + 1,
        fat: Math.floor(Math.random() * 20) + 1
      }
      
      return mockData
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar informações nutricionais.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsSearching(false)
    }
  }


  const handleBarcodeDetected = async (code: string) => {
    setBarcode(code)
    stopBarcodeScan()
    setIsDialogOpen(true)
    setIsFetchingBarcode(true)
    
    try {
      toast({ title: 'Buscando informações...', description: `Código: ${code}` })
      const data = await getFoodFromBarcode(code)
      
      if (data && data.baseFood) {
        const { baseFood, brand } = data
        setNewFood(prev => ({
          ...prev,
          name: baseFood.name,
          brand: brand || "",
          calories: String(baseFood.calories_per_100g),
          protein: String(baseFood.protein_per_100g),
          carbs: String(baseFood.carbs_per_100g),
          fat: String(baseFood.fat_per_100g),
          fiber: String(baseFood.fiber_per_100g || ""),
          sugar: String(baseFood.sugar_per_100g || ""),
          sodium: String(baseFood.sodium_per_100g || ""),
          serving: String(baseFood.serving_size_g || 100),
          isLiquid: false 
        }))
        toast({ title: 'Sucesso', description: 'Dados preenchidos automaticamente.' })
      } else {
        toast({ title: 'Não encontrado', description: 'Preencha os dados manualmente.', variant: "destructive" })
      }
    } catch (error) {
      console.error("Erro ao buscar dados do código de barras:", error)
      toast({ title: 'Erro', description: 'Falha ao buscar dados do produto.', variant: "destructive" })
    } finally {
      setIsFetchingBarcode(false)
    }
  }

  // Código de barras: iniciar leitura pela câmera
  const startBarcodeScan = async () => {
    try {
      // Evita solicitar áudio e dá preferência à câmera traseira
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream

      // Sinaliza varredura ativa via ref para evitar fechamento por estado obsoleto
      scanningRef.current = true
      // Primeiro ativa a UI do scanner para montar o <video>
      setIsScanningBarcode(true)
      // Aguarda o próximo frame para garantir que o <video> foi montado
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      const video = videoRef.current
      if (!video) {
        // Pequeno retry caso o elemento ainda não esteja disponível
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))
      }

      if (videoRef.current) {
        const v = videoRef.current
        v.srcObject = stream
        // Necessário para autoplay em mobile/iOS
        v.muted = true
        v.setAttribute('playsinline', 'true')
        // Aguarda metadados para garantir que temos dimensões antes do play
        await new Promise<void>((resolve) => {
          const handler = () => {
            v.removeEventListener('loadedmetadata', handler)
            resolve()
          }
          v.addEventListener('loadedmetadata', handler)
        })
        await v.play().catch(() => {})
        // Aguarda evento 'playing' para garantir primeiro frame disponível
        if (v.readyState < 2) {
          await new Promise<void>((resolve) => {
            const onPlaying = () => {
              v.removeEventListener('playing', onPlaying)
              resolve()
            }
            v.addEventListener('playing', onPlaying)
          })
        }
      }

      const DetectorCtor = (window as unknown as { BarcodeDetector?: new (options: { formats?: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector
      if (!DetectorCtor) {
        toast({ title: 'Leitura indisponível', description: 'Seu navegador não suporta leitura de código de barras. Use o campo manual.', variant: 'destructive' })
        return
      }

      const detector = new DetectorCtor({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128'] })
      const scan = async () => {
        try {
          const v = videoRef.current
          if (v) {
            // Em alguns navegadores, aguarde até termos dados no vídeo
            if (v.readyState < 2) {
              if (scanningRef.current) requestAnimationFrame(scan)
              return
            }
            const codes = await detector.detect(v)
            if (codes && codes.length) {
              const value = codes[0].rawValue
              handleBarcodeDetected(value)
              return
            }
          }
        } catch (err) {
          // silencioso
        }
        if (scanningRef.current) requestAnimationFrame(scan)
      }
      requestAnimationFrame(scan)
    } catch (error) {
      console.error('Erro ao iniciar câmera para barcode:', error)
      toast({ title: 'Erro', description: 'Não foi possível acessar a câmera.', variant: 'destructive' })
    }
  }

  // Código de barras: parar leitura e fechar câmera
  const stopBarcodeScan = () => {
    try {
      scanningRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setIsScanningBarcode(false)
    } catch (error) {
      console.error('Erro ao parar câmera:', error)
    }
  }

  const handleSubmit = async (data: FoodFormData) => {
    // Validar campos obrigatórios
    if (!data.name || !data.calories || !data.protein || !data.carbs || !data.fat) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e os macronutrientes principais.",
        variant: "destructive"
      })
      return
    }

    try {
      const foodData = {
          name: data.name,
          calories_per_100g: Number(data.calories),
          protein_per_100g: Number(data.protein),
          carbs_per_100g: Number(data.carbs),
          fat_per_100g: Number(data.fat),
          fiber_per_100g: Number(data.fiber) || 0,
          sugar_per_100g: Number(data.sugar) || 0,
          sodium_per_100g: Number(data.sodium) || 0,
          description: data.brand || null,
          serving_size_g: Number(data.serving),
          barcode: barcode || null
      }

      if (editingFood) {
        await updateFood(editingFood.id, foodData)
        toast({ title: "Alimento atualizado", description: `${data.name} foi atualizado com sucesso.` })
      } else {
        await addFood(foodData)
        toast({ title: "Alimento criado", description: `${data.name} foi adicionado à sua biblioteca.` })
      }

      // Reset form and close dialog
      setNewFood({
        name: "",
        brand: "",
        serving: "100",
        isLiquid: false,
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sugar: "",
        sodium: ""
      })
      setEditingFood(null)
      setBarcode("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving food:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o alimento. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFood(id)
      toast({
        title: "Alimento removido",
        description: "O alimento foi removido da sua biblioteca."
      })
    } catch (error) {
      console.error("Error deleting food:", error)
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o alimento.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (food: Food) => {
    setEditingFood(food)
    setNewFood({
      name: food.name,
      brand: food.brand || "",
      serving: food.serving.replace('g', '').replace('ml', ''),
      isLiquid: food.isLiquid || false,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      fiber: food.fiber?.toString() || "",
      sugar: food.sugar?.toString() || "",
      sodium: food.sodium?.toString() || ""
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Meus Alimentos</h1>
            <p className="text-muted-foreground">Gerencie sua biblioteca de alimentos</p>
          </div>
          
          {isMobile ? (
            <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DrawerTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary-hover shadow-md rounded-xl h-12 w-12 p-0 sm:w-auto sm:px-6 transition-transform active:scale-95"
                  onClick={() => {
                    setEditingFood(null)
                    setNewFood({
                      name: "",
                      brand: "",
                      serving: "100",
                      isLiquid: false,
                      calories: "",
                      protein: "",
                      carbs: "",
                      fat: "",
                      fiber: "",
                      sugar: "",
                      sodium: ""
                    })
                  }}
                >
                  <Plus className="w-6 h-6 sm:mr-2 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline font-medium">Novo Alimento</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-xl font-bold">
                    {editingFood ? "Editar Alimento" : "Adicionar Novo Alimento"}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 overflow-y-auto pb-8">
                  <FoodForm 
                    initialData={newFood}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                    onScanBarcode={() => {
                      setIsDialogOpen(false)
                      startBarcodeScan()
                    }}
                    isEditing={!!editingFood}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary-hover shadow-lg rounded-xl h-12 w-12 p-0 sm:w-auto sm:px-6 transition-transform active:scale-95"
                  onClick={() => {
                    setEditingFood(null)
                    setNewFood({
                      name: "",
                      brand: "",
                      serving: "100",
                      isLiquid: false,
                      calories: "",
                      protein: "",
                      carbs: "",
                      fat: "",
                      fiber: "",
                      sugar: "",
                      sodium: ""
                    })
                  }}
                >
                  <Plus className="w-6 h-6 sm:mr-2 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline font-medium">Novo Alimento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingFood ? "Editar Alimento" : "Adicionar Novo Alimento"}
                  </DialogTitle>
                </DialogHeader>
                <FoodForm 
                  initialData={newFood}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                  onScanBarcode={() => {
                    setIsDialogOpen(false)
                    startBarcodeScan()
                  }}
                  isEditing={!!editingFood}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            className="pl-12 h-14 rounded-2xl bg-card shadow-sm border-0 ring-1 ring-border/50 focus-visible:ring-primary/50 text-base" 
            placeholder="Buscar alimentos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Food List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Carregando seus alimentos...</p>
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food) => (
                <Card key={food.id} className="shadow-md rounded-3xl border-0 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-1">{food.name}</h3>
                        <p className="text-sm text-muted-foreground">Porção de {food.serving}</p>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(food)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(food.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0">
                        {Math.round(food.calories)} kcal
                      </Badge>
                      <Badge variant="outline" className="rounded-lg border-muted-foreground/20 text-muted-foreground">
                        P: {Math.round(food.protein)}g
                      </Badge>
                      <Badge variant="outline" className="rounded-lg border-muted-foreground/20 text-muted-foreground">
                        C: {Math.round(food.carbs)}g
                      </Badge>
                      <Badge variant="outline" className="rounded-lg border-muted-foreground/20 text-muted-foreground">
                        G: {Math.round(food.fat)}g
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg rounded-3xl border-0 border-dashed border-2 border-muted bg-transparent mt-8">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum alimento encontrado</h3>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                  {searchTerm ? `Não encontramos nada para "${searchTerm}"` : "Sua biblioteca está vazia."}
                </p>
                <Button 
                  onClick={() => {
                    setEditingFood(null)
                    setNewFood({
                      name: "",
                      brand: "",
                      serving: "100",
                      isLiquid: false,
                      calories: "",
                      protein: "",
                      carbs: "",
                      fat: "",
                      fiber: "",
                      sugar: "",
                      sodium: ""
                    })
                    setIsDialogOpen(true)
                  }}
                  className="bg-gradient-primary hover:bg-primary-hover shadow-md rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Alimento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Scanner Overlay */}
      {isScanningBarcode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Overlay visual para mirar */}
            <div className="absolute inset-0 border-[50px] border-black/50 pointer-events-none flex items-center justify-center">
              <div className="w-full h-64 border-2 border-red-500/80 animate-pulse relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500"></div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full h-12 w-12 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={stopBarcodeScan}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="absolute bottom-10 left-0 w-full text-center text-white/90 font-medium px-4">
              Aponte a câmera para o código de barras
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
