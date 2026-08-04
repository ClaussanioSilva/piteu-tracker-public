import { Navigation } from "./Navigation"
import { BottomNavigation } from "./BottomNavigation"
import { useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { ToastAction } from "@/components/ui/toast"
import { Download } from "lucide-react"

import { Header } from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isDashboard = location.pathname === "/"
  const { isInstallable, promptInstall, isIOS } = usePWAInstall()
  const { toast } = useToast()
  const hasShownInstallToast = useRef(false)

  useEffect(() => {
    if (isInstallable && !hasShownInstallToast.current) {
      hasShownInstallToast.current = true
      
      // Pequeno delay para garantir que a UI carregou e não atrapalha o login
      setTimeout(() => {
        if (isIOS) {
          toast({
            title: "Instalar no iPhone",
            description: "Para instalar: toque no botão Partilhar e selecione 'Adicionar ao Ecrã Principal'.",
            duration: 10000,
          })
        } else {
          toast({
            title: "Instalar Aplicação",
            description: "Instale o PiteuTracker para acesso rápido e melhor experiência!",
            action: (
              <ToastAction altText="Instalar" onClick={promptInstall} className="bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </ToastAction>
            ),
            duration: 10000, // Duração maior para dar tempo de ver
          })
        }
      }, 2000)
    }
  }, [isInstallable, toast, promptInstall, isIOS])

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* Global Header - Removed as requested */}
      {/* {!isDashboard && <Header />} */}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Navigation - Only shown on desktop */}
        <aside className="hidden md:block w-64 h-full border-r bg-card overflow-y-auto">
          <Navigation />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
          <div className="container mx-auto px-4 pt-4 max-w-7xl pb-24 md:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Only shown on mobile/tablet */}
      <BottomNavigation />
    </div>
  )
}