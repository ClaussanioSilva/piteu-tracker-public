import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Mic, Camera, FileText, ArrowLeft, Loader2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { useNutrition } from "@/providers/nutrition-context"
import { useFoods, useMeals } from '@/hooks/use-supabase'
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { aiService } from "@/services/ai-service"
import type { Database } from '@/lib/supabase'
import LogMealModalManual from "./LogMealModalManual"

// Types from Supabase
type Food = Database['public']['Tables']['foods']['Row']
type Meal = Database['public']['Tables']['meals']['Row']

type VoiceData = {
  item_name: string
  type: 'food' | 'meal'
  quantity_g?: number
  candidates: (Food | Meal)[]
}

function normalizeString(value: string) {
  return value
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : ""
}

interface LogMealModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LogMealModal({ isOpen, onClose }: LogMealModalProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { foods } = useFoods()
  const { meals } = useMeals()
  const { addFoodLog } = useNutrition()

  // View state: 'menu' (default), 'voice'
  const [view, setView] = useState<'menu' | 'voice'>('menu')
  const [showManual, setShowManual] = useState(false)
  
  // Voice Log state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceProcessing, setVoiceProcessing] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [voiceData, setVoiceData] = useState<VoiceData | null>(null)
  const [selectedVoiceCandidate, setSelectedVoiceCandidate] = useState<Food | Meal | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView('menu')
        setShowManual(false)
        resetVoiceState()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Voice Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop()) // Stop mic
        handleVoiceProcess(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error('Error accessing microphone:', e)
      toast({ 
        title: "Erro", 
        description: "Não foi possível acessar o microfone. Verifique as permissões.", 
        variant: "destructive" 
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleVoiceProcess = async (audioBlob: Blob) => {
    setVoiceProcessing(true)
    setVoiceText('')
    setVoiceData(null)
    
    // 1. Transcribe
    const transResult = await aiService.transcribeAudio(audioBlob)
    if (!transResult.success || !transResult.text) {
       toast({ title: "Erro na transcrição", description: transResult.error, variant: "destructive" })
       setVoiceProcessing(false)
       return
    }
    setVoiceText(transResult.text)

    // 2. Parse
    const parseResult = await aiService.parseVoiceLog(transResult.text)
    if (!parseResult.success || !parseResult.data) {
       toast({ title: "Erro no processamento", description: parseResult.error, variant: "destructive" })
       setVoiceProcessing(false)
       return
    }
    
    const { item_name, type, quantity_g } = parseResult.data
    const normalizedItemName = normalizeString(item_name)

    const foodMatches = foods.filter((f) =>
      normalizeString(f.name).includes(normalizedItemName)
    )
    const mealMatches = meals.filter((m) =>
      normalizeString(m.name).includes(normalizedItemName)
    )

    let finalType: 'food' | 'meal' = type
    let candidates: (Food | Meal)[] = []

    if (type === 'food') {
      candidates = foodMatches
      if (candidates.length === 0 && mealMatches.length > 0) {
        finalType = 'meal'
        candidates = mealMatches
      }
    } else {
      candidates = mealMatches
      if (candidates.length === 0 && foodMatches.length > 0) {
        finalType = 'food'
        candidates = foodMatches
      }
    }

    setVoiceData({ item_name, type: finalType, quantity_g, candidates })
    if (candidates.length > 0) {
      setSelectedVoiceCandidate(candidates[0])
    }
    setVoiceProcessing(false)
  }

  const resetVoiceState = () => {
    setIsRecording(false)
    setVoiceProcessing(false)
    setVoiceText('')
    setVoiceData(null)
    setSelectedVoiceCandidate(null)
    audioChunksRef.current = []
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  // Helper to calculate nutrients for voice log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateNutrients = (item: any, type: 'food' | 'meal', qty: number) => {
    if (type === 'food') {
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
        // Simple mock for meal as we don't have full meal calc logic here easily without duplicating
        // Assuming user just wants to log the meal itself
        return {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
        }
    }
  }

  const handleVoiceSubmit = async () => {
    if (!selectedVoiceCandidate || !voiceData) return
    
    const type = voiceData.type === 'food' ? 'food' : 'meal'
    const qty = (type === 'food') ? (voiceData.quantity_g || 100) : 1
    
    const nutrients = calculateNutrients(selectedVoiceCandidate, type, qty)
    
    try {
      const logData = {
        item_name: selectedVoiceCandidate.name,
        log_type: type as 'food' | 'meal',
        quantity: qty,
        meal_time: 'breakfast' as const, // Default, maybe ask user?
        calories: nutrients.calories,
        protein_g: nutrients.protein,
        carbs_g: nutrients.carbs,
        fat_g: nutrients.fat,
        fiber_g: nutrients.fiber,
        sugar_g: nutrients.sugar,
        sodium_mg: nutrients.sodium,
        item_id: selectedVoiceCandidate.id,
        notes: 'Origin: Voice',
        image_url: null
      }
      
      const result = await addFoodLog(logData)
      if (result) {
        toast({ title: "Sucesso", description: "Log adicionado via voz." })
        onClose()
        resetVoiceState()
      }
    } catch (error) {
      console.error('Error adding voice log:', error)
      toast({ title: "Erro", description: "Falha ao adicionar log.", variant: "destructive" })
    }
  }

  const renderVoiceView = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 h-[60vh] min-h-[400px]">
       {isRecording ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in">
             <div className="relative">
               <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
               <div className="relative bg-red-500 rounded-full p-6 shadow-lg">
                  <Mic className="h-10 w-10 text-white" />
               </div>
             </div>
             <div className="text-center space-y-2">
               <p className="text-xl font-medium">Ouvindo...</p>
               <p className="text-sm text-muted-foreground">Fale o nome do alimento e a quantidade ou o nome de uma refeição previamente registrada</p>
             </div>
             <Button variant="destructive" size="lg" onClick={stopRecording} className="mt-4">
                <Square className="mr-2 h-5 w-5 fill-current" /> Parar Gravação
             </Button>
          </div>
       ) : voiceProcessing ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in">
             <Loader2 className="h-12 w-12 text-primary animate-spin" />
             <p className="text-lg">Processando...</p>
          </div>
       ) : voiceData ? (
          <div className="w-full space-y-4 animate-in slide-in-from-bottom-4">
             <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-lg italic">"{voiceText}"</p>
             </div>
             
             <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <p className="font-medium text-sm">Resultados encontrados</p>
                </div>
                {voiceData.candidates && voiceData.candidates.length > 0 ? (
                   <div className="divide-y max-h-[30vh] overflow-y-auto">
                      {voiceData.candidates.map((c: Food | Meal) => (
                         <Button 
                            key={c.id} 
                            variant={selectedVoiceCandidate?.id === c.id ? "secondary" : "ghost"} 
                            className={`w-full justify-start h-auto py-3 px-4 ${selectedVoiceCandidate?.id === c.id ? 'bg-secondary' : 'hover:bg-muted/50'}`} 
                            onClick={() => setSelectedVoiceCandidate(c)}
                         >
                            <div className="flex flex-col items-start gap-1">
                               <span className="font-medium">{c.name}</span>
                               {voiceData.type === 'food' && voiceData.quantity_g && (
                                  <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                                    {voiceData.quantity_g}g detectado
                                  </span>
                               )}
                            </div>
                         </Button>
                      ))}
                   </div>
                ) : (
                   <div className="p-4 text-center text-muted-foreground">
                      <p>Nenhum item correspondente encontrado.</p>
                   </div>
                )}
             </div>
             
             <Button 
                className="w-full h-12 text-lg" 
                onClick={handleVoiceSubmit}
                disabled={!selectedVoiceCandidate}
             >
                Adicionar ao Log
             </Button>

             <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => { setView('menu'); resetVoiceState(); }}>
                   <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => {
                   setShowManual(true)
                   // resetVoiceState() // Keep state? No, Manual modal resets on open
                }}>
                   <span className="truncate">Correção Manual</span>
                </Button>
             </div>
          </div>
       ) : (
          <div className="flex flex-col items-center gap-6">
             <Button 
                size="lg" 
                className="rounded-full h-24 w-24 shadow-xl transition-transform hover:scale-105" 
                onClick={startRecording}
             >
                <Mic className="h-10 w-10" />
             </Button>
             <div className="text-center space-y-1">
                <p className="font-medium text-lg">Toque para falar</p>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  "Arroz integral 100g" ou "Café da manhã"
                </p>
             </div>
             <Button variant="ghost" onClick={() => { setView('menu'); resetVoiceState(); }}>Voltar</Button>
          </div>
       )}
    </div>
  )

  const renderMenuButtons = () => (
    <div className="flex flex-col gap-4 p-4">
      <Button 
        variant="default" 
        className="h-32 flex flex-col gap-3 rounded-xl shadow-md relative overflow-hidden group transition-all hover:scale-[1.01]"
        onClick={() => {
          onClose()
          navigate('/snap-log')
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-3 bg-white/20 rounded-full">
          <Camera className="w-8 h-8" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">Snap Log</span>
          <span className="text-xs opacity-90 font-normal">Foto da refeição</span>
        </div>
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-24 flex flex-col gap-2 rounded-xl hover:bg-accent/50 border-2 transition-all hover:border-primary/50"
          onClick={() => setView('voice')}
        >
          <Mic className="w-6 h-6 text-primary" />
          <span className="font-medium text-lg">Voice Log</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-24 flex flex-col gap-2 rounded-xl hover:bg-accent/50 border-2 transition-all hover:border-primary/50"
          onClick={() => setShowManual(true)}
        >
          <FileText className="w-6 h-6 text-primary" />
          <span className="font-medium text-lg">Manual Log</span>
        </Button>
      </div>
    </div>
  )

  if (showManual) {
    return <LogMealModalManual isOpen={true} onClose={onClose} onBack={() => setShowManual(false)} />
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh] h-auto flex flex-col">
          <div className="mx-auto w-full max-w-sm flex-1 overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>
                {view === 'voice' ? 'Voice Log' : 'Novo Log'}
              </DrawerTitle>
            </DrawerHeader>

            {view === 'voice' ? renderVoiceView() : renderMenuButtons()}

            {view === 'menu' && (
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="ghost" className="w-full">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{view === 'voice' ? 'Voice Log' : 'Novo Log'}</DialogTitle>
        </DialogHeader>
        {view === 'voice' ? renderVoiceView() : renderMenuButtons()}
      </DialogContent>
    </Dialog>
  )
}
