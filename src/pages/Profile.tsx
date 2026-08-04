import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Target, 
  Globe, 
  Ruler,
  Palette,
  Moon,
  Sun,
  Laptop,
  Check,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/hooks/use-supabase"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useTheme } from "@/providers/theme-provider"

export default function Profile() {
  const { profile, loading } = useProfile()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      })
      navigate("/auth")
    } catch (error) {
      console.error("Erro ao sair:", error)
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      })
    }
  }

  const getInitials = () => {
    if (!profile?.full_name) return "US"
    const names = profile.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  // Calculate generic goal weight (placeholder logic as actual target isn't in DB yet)
  // If goal is lose weight, target = weight - 5, else if gain, weight + 5.
  const getGoalWeight = () => {
    if (profile?.target_weight_kg) return profile.target_weight_kg.toFixed(1)
    
    if (!profile?.weight_kg) return "--"
    if (profile.goal === 'lose_weight') return (profile.weight_kg - 5).toFixed(1)
    if (profile.goal === 'gain_weight' || profile.goal === 'gain_muscle') return (profile.weight_kg + 5).toFixed(1)
    return profile.weight_kg.toFixed(1)
  }

  const getBMI = () => {
    if (!profile?.weight_kg || !profile?.height_cm) return null
    const heightM = profile.height_cm / 100
    const bmi = profile.weight_kg / (heightM * heightM)
    return bmi
  }

  const getBMIInfo = (bmi: number | null) => {
    if (!bmi) return null
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    if (bmi < 25) return { label: "Peso normal", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" }
    if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
    if (bmi < 35) return { label: "Obesidade grau I", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" }
    if (bmi < 40) return { label: "Obesidade grau II", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
    return { label: "Obesidade grau III", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" }
  }

  const bmi = getBMI()
  const bmiInfo = getBMIInfo(bmi)

  return (
    <div className="min-h-screen bg-background p-0 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">Suas informações e configurações</p>
      </div>

      {/* Profile Card */}
      <Card className="border-none shadow-sm bg-card overflow-hidden relative">
        <CardContent className="p-6 flex flex-col items-center">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg mb-4">
            <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-foreground mb-1">
            {profile?.full_name || "Usuário"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {profile?.email || "email@exemplo.com"}
          </p>

          {/* BMI Section */}
          {bmi && bmiInfo && (
            <div className="mb-4 flex flex-col items-center animate-in zoom-in-50">
               <div className="flex items-baseline gap-1.5">
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">IMC</span>
                 <span className={`text-2xl font-bold ${bmiInfo.color} tracking-tight`}>
                   {bmi.toFixed(1)}
                 </span>
               </div>
            </div>
          )}

          {/* BMI Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-6 px-2 w-full max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">&lt; 18.5: <span className="text-blue-500 font-medium">Abaixo do peso</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">18.5-24.9: <span className="text-green-500 font-medium">Peso normal</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">25-29.9: <span className="text-yellow-500 font-medium">Sobrepeso</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">30-34.9: <span className="text-orange-500 font-medium">Obesidade I</span></span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 w-full border-t border-border pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-xl font-bold text-emerald-500">
                {profile?.weight_kg ? `${profile.weight_kg}kg` : "--"}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Peso Atual
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center space-y-1 border-l border-r border-border">
              <span className="text-xl font-bold text-teal-500">
                {getGoalWeight()}kg
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Meta
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-xl font-bold text-foreground">
                {profile?.height_cm ? `${profile.height_cm}cm` : "--"}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Altura
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
          Configurações
        </h3>
        
        <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none border-b border-border/50"
            onClick={() => navigate('/profile-settings')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium text-foreground">Dados Pessoais</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-medium text-foreground">Notificações</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">Aparência</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize">
                    {theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Aparência</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-8 grid grid-cols-3 gap-4">
                <div 
                  className={`
                    flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${theme === 'light' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }
                  `}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="w-8 h-8" />
                  <span className="text-sm font-medium">Claro</span>
                </div>

                <div 
                  className={`
                    flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${theme === 'dark' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }
                  `}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="w-8 h-8" />
                  <span className="text-sm font-medium">Escuro</span>
                </div>

                <div 
                  className={`
                    flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${theme === 'system' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }
                  `}
                  onClick={() => setTheme("system")}
                >
                  <Laptop className="w-8 h-8" />
                  <span className="text-sm font-medium">Sistema</span>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-medium text-foreground">Idioma e Unidades</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Legal Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
          Legal
        </h3>
        
        <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none border-b border-border/50"
            onClick={() => navigate('/terms')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-medium text-foreground">Termos de Uso</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50 rounded-none"
            onClick={() => navigate('/privacy')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-medium text-foreground">Política de Privacidade</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Logout Button */}
      <Button 
        variant="destructive" 
        className="w-full h-12 rounded-xl font-medium shadow-sm"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>

      {/* Footer Version */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground/50 font-medium">
          MacroMentor v1.0.0 © 2025
        </p>
      </div>
    </div>
  )
}
