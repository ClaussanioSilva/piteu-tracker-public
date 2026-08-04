import { Moon, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/providers/theme-provider"
import { useProfile } from "@/hooks/use-supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const getInitials = () => {
    if (!profile?.full_name) return "US"
    const names = profile.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">PiteuTracker</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Avatar 
            className="h-9 w-9 cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors"
            onClick={() => navigate('/profile')}
          >
            <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
