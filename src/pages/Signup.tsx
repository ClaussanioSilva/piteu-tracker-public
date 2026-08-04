import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function Signup() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) throw error
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        toast({ title: "Conta criada!", description: "Faça login para continuar." })
        navigate("/login")
        return
      }
      toast({ title: "Bem-vindo!", description: "Cadastro concluído com sucesso." })
      navigate("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tente novamente."
      toast({ title: "Erro ao cadastrar", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-8 relative z-10 max-w-md mx-auto w-full">
        {/* Back button */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link to="/login">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Criar conta.</h1>
          <p className="text-lg text-muted-foreground/80">Começa a tua jornada saudável hoje.</p>
        </motion.div>

        {/* Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          onSubmit={handleSubmit} 
          className="flex-1 flex flex-col gap-6"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Nome completo</label>
              <Input 
                type="text"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                required 
                className="h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/20 transition-all duration-300 text-lg placeholder:text-muted-foreground/40"
                placeholder="Teu nome"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/20 transition-all duration-300 text-lg placeholder:text-muted-foreground/40"
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
                  minLength={6}
                  className="h-14 px-5 pr-12 rounded-2xl bg-muted/30 border-2 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/20 transition-all duration-300 text-lg placeholder:text-muted-foreground/40"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-4">
            <Button 
              type="submit" 
              className="w-full h-16 rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  Criar conta <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
              Ao continuar, concordas com os{" "}
              <Link to="/terms" className="text-primary font-bold hover:underline">
                Termos
              </Link>
              {" "}e{" "}
              <Link to="/privacy" className="text-primary font-bold hover:underline">
                Privacidade
              </Link>
              .
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
