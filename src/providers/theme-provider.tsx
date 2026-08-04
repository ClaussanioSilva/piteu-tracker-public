import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "nutritrack-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      if (storedTheme) {
        return storedTheme
      }
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let effectiveTheme = theme

    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    root.classList.add(effectiveTheme)

    // Update meta theme-color to match the effective theme
    // This ensures the status bar matches the app background even if manually overridden
    const color = effectiveTheme === "dark" ? "#141619" : "#f9fafb"
    const metaTags = document.querySelectorAll('meta[name="theme-color"]')
    
    if (metaTags.length > 0) {
      metaTags.forEach((tag) => {
        tag.setAttribute("content", color)
        tag.removeAttribute("media")
      })
    } else {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.content = color
      document.head.appendChild(meta)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}