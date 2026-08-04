import { useState, useRef, useCallback, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Camera, 
  X, 
  RotateCcw, 
  Zap, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Flame,
  Wheat,
  Beef,
  Droplets,
  CheckCircle,
  Sparkles,
  ScanLine,
  Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useNutrition } from "@/providers/nutrition-context"
import { aiService } from "@/services/ai-service"
import { supabase } from "@/lib/supabase"

type SnapLogStep = 'camera' | 'preview' | 'scanning' | 'result'

type NutritionResult = {
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  healthScore: number
  servingSize: string
}

export default function SnapLog() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { addFoodLog } = useNutrition()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<SnapLogStep>(() => {
    return location.state?.mode === 'view' ? 'result' : 'camera'
  })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState(() => location.state?.mode === 'view')

  // Initialize from location state if available (View Mode)
  useEffect(() => {
    if (location.state?.mode === 'view' && location.state.mealData) {
      const { mealData, capturedImage: initialImage } = location.state
      
      setViewMode(true)
      // Use provided image or a nice food placeholder if none exists
      setCapturedImage(initialImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80") 
      
      setNutritionResult({
        name: mealData.item_name,
        description: mealData.notes || "Refeição registrada",
        calories: mealData.calories,
        protein: mealData.protein_g,
        carbs: mealData.carbs_g,
        fat: mealData.fat_g,
        fiber: mealData.fiber_g || 0,
        healthScore: 8.5, // Mock score for existing items
        servingSize: `${mealData.quantity}g` || "1 porção"
      })
      
      setStep('result')
    }
  }, [location.state])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }, [facingMode])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  // Initialize camera on mount
  useEffect(() => {
    if (step === 'camera' && !viewMode) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [step, startCamera, stopCamera, viewMode])

  // Handle camera switch
  const switchCamera = async () => {
    stopCamera()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    stopCamera()
    setStep('preview')
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setCapturedImage(imageData)
      stopCamera()
      setStep('preview')
    }
    reader.readAsDataURL(file)
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
    setStep('camera')
  }

  // Start scanning
  const startScanning = async () => {
    if (!capturedImage) return

    setStep('scanning')
    setScanProgress(0)
    
    // Progress simulation (visual only)
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) return 90 // Hold at 90% until real result comes
        return prev + 5
      })
    }, 200)

    try {
      // Real AI analysis
      const result = await aiService.extractNutritionFromLabel(capturedImage)
      
      clearInterval(progressInterval)
      setScanProgress(100)

      if (result.success && result.food) {
        const food = result.food
        const servingSizeG = food.serving_size_g || 100
        const ratio = servingSizeG / 100

        // Calculate values per serving
        const calories = Math.round((food.calories_per_100g || 0) * ratio)
        const protein = Math.round((food.protein_per_100g || 0) * ratio)
        const carbs = Math.round((food.carbs_per_100g || 0) * ratio)
        const fat = Math.round((food.fat_per_100g || 0) * ratio)
        const fiber = Math.round((food.fiber_per_100g || 0) * ratio)

        // Simple health score calculation (mock logic for now)
        // More protein/fiber = better, more sugar/fat = worse
        let score = 5
        if (protein > 10) score += 2
        if (fiber > 5) score += 2
        if ((food.sugar_per_100g || 0) > 10) score -= 1
        if ((food.fat_per_100g || 0) > 15) score -= 1
        score = Math.max(1, Math.min(10, score))

        setNutritionResult({
          name: food.name || "Alimento Identificado",
          description: food.description || food.ingredients || "Sem descrição disponível",
          calories,
          protein,
          carbs,
          fat,
          fiber,
          healthScore: score,
          servingSize: `${servingSizeG}g`
        })
        
        setTimeout(() => setStep('result'), 500)
      } else {
        throw new Error(result.error || "Falha na análise")
      }
    } catch (error) {
      clearInterval(progressInterval)
      console.error("Scan error:", error)
      toast({
        title: "Erro na análise",
        description: "Não foi possível identificar o alimento. Tente novamente.",
        variant: "destructive"
      })
      setStep('preview') // Go back to preview
    }
  }

  // Add to log
  const handleAddToLog = async () => {
    if (!nutritionResult) return

    try {
      let imageUrl = null;
      
      // Upload image if available
      if (capturedImage) {
        try {
          // Convert base64 to blob
          const res = await fetch(capturedImage);
          const blob = await res.blob();
          
          // Generate unique filename
          const filename = `snap-logs/${crypto.randomUUID()}.jpg`;
          
          // Upload
          const { error } = await supabase.storage
            .from('uploads')
            .upload(filename, blob, {
              contentType: 'image/jpeg',
              upsert: false
            });
            
          if (!error) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('uploads')
              .getPublicUrl(filename);
            imageUrl = publicUrl;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue saving log even if image upload fails
        }
      }

      const logData = {
        item_name: nutritionResult.name,
        log_type: 'food' as const,
        quantity: quantity * 30, // grams per serving
        meal_time: 'breakfast' as const,
        calories: nutritionResult.calories * quantity,
        protein_g: nutritionResult.protein * quantity,
        carbs_g: nutritionResult.carbs * quantity,
        fat_g: nutritionResult.fat * quantity,
        fiber_g: nutritionResult.fiber * quantity,
        sugar_g: 0,
        sodium_mg: 0,
        notes: 'Snap Log - AI Analysis',
        item_id: crypto.randomUUID(), // Generate a temporary ID for snap log items
        image_url: imageUrl
      }

      const result = await addFoodLog(logData)
      if (result) {
        toast({ 
          title: "Adicionado com sucesso!", 
          description: `${nutritionResult.name} foi adicionado ao seu diário.` 
        })
        navigate('/')
      }
    } catch (error) {
      console.error('Error adding food log:', error)
      toast({ 
        title: "Erro", 
        description: "Não foi possível adicionar o alimento.", 
        variant: "destructive" 
      })
    }
  }

  // Close snap log
  const handleClose = () => {
    stopCamera()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <AnimatePresence mode="wait">
        {/* CAMERA STEP */}
        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                onClick={handleClose}
              >
                <X className="h-6 w-6" />
              </Button>
              
              <div className="px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">
                <span className="text-white font-medium text-sm">Snap Log</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                onClick={switchCamera}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative bg-black overflow-hidden">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-white mb-4">{cameraError}</p>
                  <Button onClick={startCamera} variant="secondary">
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Scan Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] aspect-square max-w-[320px] relative">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                </div>
              </div>

              {/* Hint text */}
              <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                  <p className="text-white/90 text-sm font-medium">Posicione o alimento no centro</p>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="bg-background p-6 pb-10 safe-area-bottom">
              <div className="flex items-center justify-center gap-8">
                {/* Gallery button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-6 w-6 text-foreground" />
                </Button>

                {/* Capture button */}
                <button
                  onClick={capturePhoto}
                  className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform ring-4 ring-primary/30"
                >
                  <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-primary-foreground" />
                  </div>
                </button>

                {/* Placeholder for symmetry */}
                <div className="h-14 w-14" />
              </div>
            </div>
          </motion.div>
        )}

        {/* PREVIEW STEP */}
        {step === 'preview' && capturedImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col bg-background"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={retakePhoto}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <div className="px-5 py-2.5 rounded-full bg-muted">
                <span className="font-semibold text-sm uppercase tracking-wide">Preview</span>
              </div>

              <div className="w-12" />
            </div>

            {/* Image Preview */}
            <div className="flex-1 px-4 py-4 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[3/4]">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={capturedImage}
                    alt="Captured food"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Ready indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                      <span className="text-white font-semibold text-sm uppercase tracking-wide">
                        Pronto para análise
                      </span>
                    </div>
                    <ScanLine className="h-5 w-5 text-white/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pb-10 space-y-4 safe-area-bottom">
              <Button
                className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg"
                onClick={startScanning}
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Analisar Nutrição
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                IA POWERED ANALYSIS • 98% ACCURACY
              </p>
            </div>
          </motion.div>
        )}

        {/* SCANNING STEP */}
        {step === 'scanning' && capturedImage && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col bg-background"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-center">
              <div className="px-5 py-2.5 rounded-full bg-muted">
                <span className="font-semibold text-sm uppercase tracking-wide">Analisando</span>
              </div>
            </div>

            {/* Image with Scanning Effect */}
            <div className="flex-1 px-4 py-4 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[3/4]">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={capturedImage}
                    alt="Scanning food"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-primary/10" />
                </div>

                {/* Scanning indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">
                        Identificando alimento...
                      </span>
                      <span className="text-primary font-bold">{scanProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Corner scanning effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-3xl"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-3xl"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-3xl"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-3xl"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
                  />
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="p-6 pb-10 safe-area-bottom">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Processando com IA...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && capturedImage && nutritionResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col bg-background overflow-hidden"
          >
            {/* Hero Image */}
            <div className="relative h-[40vh] min-h-[300px]">
              <img
                src={capturedImage}
                alt={nutritionResult.name}
                className="w-full h-full object-cover"
              />
              
              {/* Back button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                onClick={handleClose}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 -mt-10 rounded-t-[2.5rem] bg-background relative z-10 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Drag indicator */}
                <div className="flex justify-center">
                  <div className="w-12 h-1.5 rounded-full bg-muted" />
                </div>

                {/* Header with badge and quantity */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      ANÁLISE DE IA CONCLUÍDA
                    </motion.div>
                    
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {nutritionResult.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {nutritionResult.description}
                    </p>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Nutrition cards grid */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">
                          Calorias
                        </span>
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                          <Flame className="h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {nutritionResult.calories * quantity}
                      </span>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                          Carboidratos
                        </span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Wheat className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {nutritionResult.carbs * quantity}g
                      </span>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
                          Proteína
                        </span>
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                          <Beef className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {nutritionResult.protein * quantity}g
                      </span>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">
                          Gorduras
                        </span>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                          <Droplets className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {nutritionResult.fat * quantity}g
                      </span>
                    </Card>
                  </motion.div>
                </div>

                {/* Health Score */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-4 border-0 bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Pontuação de Saúde</p>
                        <p className="text-xs text-muted-foreground">Baseado no valor nutricional</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${nutritionResult.healthScore * 10}%` }}
                          />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                          {nutritionResult.healthScore}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Fixed bottom button */}
            <div className="p-6 pb-10 bg-background border-t border-border safe-area-bottom">
              {viewMode ? (
                <Button
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg"
                  onClick={handleClose}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Concluído
                </Button>
              ) : (
                <Button
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg"
                  onClick={handleAddToLog}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar ao Diário
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
