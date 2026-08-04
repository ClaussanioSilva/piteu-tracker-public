import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Apple, 
  UtensilsCrossed, 
  Target, 
  Calendar,
  Settings,
  Bot,
  BarChart3,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Alimentos",
    href: "/foods",
    icon: Apple,
  },
  {
    title: "Refeições",
    href: "/meals",
    icon: UtensilsCrossed,
  },
  {
    title: "Metas",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Plano IA",
    href: "/ai-meal-plan",
    icon: Bot,
  },
  {
    title: "NutriCoach",
    href: "/nutri-coach",
    icon: MessageSquare,
  },
  {
    title: "Meus Planos",
    href: "/meus-planos",
    icon: Calendar,
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: Settings,
  },
]

export function Navigation() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">PiteuTracker</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                    "hover:bg-muted",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )
}