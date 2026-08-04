import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Plus,
  MoreHorizontal,
  Calendar,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import LogMealModal from "@/components/LogMealModal"

const navItems = [
  {
    title: "Início",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Planos",
    href: "/meus-planos",
    icon: Calendar,
  },
  // FAB placeholder
  {
    title: "Log",
    href: "#log",
    icon: Plus,
    isFab: true,
  },
  {
    title: "NutriCoach",
    href: "/nutri-coach",
    icon: Bot,
  },
  {
    title: "Mais",
    href: "/more",
    icon: MoreHorizontal,
  },
]

export function BottomNavigation() {
  const location = useLocation()
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Ocultar a BottomNavigation na página NutriCoach
  if (location.pathname === '/nutri-coach' || location.pathname === '/goals') {
    return null
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom md:hidden">
        <div className="flex items-center justify-around h-16 px-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            
            // FAB central
            if (item.isFab) {
              return (
                <div key={item.href} className="relative w-12 h-full">
                  <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-[4.5rem] h-[4.5rem] rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    aria-label="Registar refeição"
                  >
                    <Plus className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
                  </button>
                </div>
              )
            }
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 touch-target",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.title}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <LogMealModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
      />
    </>
  )
}
