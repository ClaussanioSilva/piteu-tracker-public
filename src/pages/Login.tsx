import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." })
      navigate("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tente novamente."
      toast({ title: "Erro ao entrar", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] overflow-y-auto overflow-x-hidden bg-white dark:bg-background relative flex flex-col font-sans selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute -top-[25%] -right-[15%] w-[80vw] h-[80vw] rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
        <div className="absolute top-[25%] -left-[20%] w-[60vw] h-[60vw] rounded-full bg-secondary/20 dark:bg-secondary/15 blur-3xl" />
      </div>

      <div
        className="relative z-10 grid h-full grid-rows-[auto,1fr,auto] max-w-sm w-full mx-auto px-6"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pt-10"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-sm shadow-primary/25">
            <span className="text-3xl font-black text-primary-foreground">P</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Bem-vindo</h1>
          <p className="text-base text-muted-foreground/80">Continua a tua jornada saudável.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 px-5 rounded-2xl bg-muted/50 dark:bg-muted/30 border-2 border-transparent hover:bg-muted/70 dark:hover:bg-muted/40 focus:bg-background focus:border-primary/25 transition-all duration-300 text-lg placeholder:text-muted-foreground/60"
                placeholder="exemplo@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Palavra-passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 px-5 pr-12 rounded-2xl bg-muted/50 dark:bg-muted/30 border-2 border-transparent hover:bg-muted/70 dark:hover:bg-muted/40 focus:bg-background focus:border-primary/25 transition-all duration-300 text-lg placeholder:text-muted-foreground/60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
          className="pb-6 space-y-4"
        >
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full h-16 rounded-[22px] bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-sm shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Entrar <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          <div className="text-center">
            <span className="text-muted-foreground">Não tem conta? </span>
            <Link to="/onboarding" className="font-bold text-primary hover:underline">
              Criar conta
            </Link>
          </div>

          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-medium text-center">
            PiteuTracker © 2026
          </p>
        </motion.div>
      </div>
    </div>
  )
}
