import { useNavigate } from "react-router-dom"
import { 
  Target, 
  Apple, 
  ChevronRight, 
  LogOut,
  UtensilsCrossed,
  Ruler,
  Flame,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useProfile } from "@/hooks/use-supabase"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { usePWAInstall } from "@/hooks/use-pwa-install"

export default function More() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { toast } = useToast()
  const { isInstallable, promptInstall, isIOS } = usePWAInstall()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      })
      navigate("/landing")
    } catch (error) {
      console.error("Erro ao sair:", error)
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      })
    }
  }

  const handleInstallClick = () => {
    if (isIOS) {
      toast({
        title: "Instalar no iPhone",
        description: "Toque no botão Partilhar e selecione 'Adicionar ao Ecrã Principal'.",
        duration: 5000,
      })
    } else {
      promptInstall()
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

  const mainMenuItems = [
    {
      title: "Medidas Corporais",
      description: "Atualize seu peso e medidas corporais",
      icon: Ruler,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      path: "/goals"
    },
    {
      title: "Metas Calóricas",
      description: "Visualize suas metas de calorias e macros",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      path: "/caloric-goals"
    },
    {
      title: "Refeições",
      description: "Gerencie suas refeições diárias",
      icon: UtensilsCrossed,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      path: "/meals"
    },
    {
      title: "Alimentos",
      description: "Gerencie sua base de dados de alimentos",
      icon: Apple,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      path: "/foods"
    },
    {
      title: "Relatórios",
      description: "Veja como tem se alimentado ao longo do tempo",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      path: "/reports"
    }
  ]

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Menu</h1>
          <p className="text-sm text-muted-foreground">Acesso rápido a todas as funcionalidades</p>
        </div>
      </div>

      {/* User Profile Summary */}
      <Card 
        className="border-none shadow-sm bg-card cursor-pointer overflow-hidden"
        onClick={() => navigate('/profile')}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
            <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold overflow-hidden">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-bold text-foreground truncate">
              {profile?.full_name || "Carregando..."}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {profile?.email || "Aguarde..."}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>

      {/* Main Menu Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Principal</h3>
        <div className="grid gap-3">
          {mainMenuItems.map((item, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 border border-border/50 rounded-xl shadow-sm cursor-pointer transition-colors"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-foreground text-base">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* App Section */}
      <div className="space-y-4">
        <div className="grid gap-3">
          {isInstallable && (
            <div
              className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl shadow-sm cursor-pointer transition-colors"
              onClick={handleInstallClick}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Download className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-foreground text-base">Instalar Aplicação</span>
                  <span className="block text-xs text-muted-foreground">Adicionar ao ecrã principal</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
