import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronLeft, Camera, Loader2, CalendarIcon, Save } from "lucide-react"
import { format, subYears } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const profileFormSchema = z.object({
  full_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  // height_cm: z.coerce.number().min(50, "Altura mínima 50cm").max(300, "Altura máxima 300cm"),
  // weight_kg: z.coerce.number().min(20, "Peso mínimo 20kg").max(500, "Peso máximo 500kg"),
  age: z.coerce.number().min(14, "É necessário ter pelo menos 14 anos").max(120, "Idade máxima 120 anos"),
  dob: z.date({ required_error: "Data de nascimento é obrigatória" })
    .max(subYears(new Date(), 14), "É necessário ter pelo menos 14 anos")
    .min(subYears(new Date(), 120), "Data de nascimento inválida"),
  gender: z.enum(["male", "female"], { required_error: "Selecione o sexo" }),
  // activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], { required_error: "Selecione o nível de atividade" }),
  // goal: z.enum(['lose_weight', 'maintain', 'gain_weight', 'gain_muscle'], { required_error: "Selecione o objetivo" }),
  // body_fat_percentage: z.coerce.number().min(0, "Mínimo 0%").max(100, "Máximo 100%").optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      age: 0,
    },
  })

  // Load profile data
  useEffect(() => {
    if (profile) {
      // Cast profile to allow access to potentially missing fields in the type definition
      const p = profile as unknown as {
        dob?: string
        gender?: ProfileFormValues['gender']
      }
      form.reset({
        full_name: profile.full_name || "",
        email: profile.email || "",
        age: profile.age || 0,
        dob: p.dob ? new Date(p.dob) : undefined,
        gender: p.gender,
      })
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url)
      }
    }
  }, [profile, form])

  const calculateAge = (date: Date) => {
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const m = today.getMonth() - date.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--
    }
    return age
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatar')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from('avatar').getPublicUrl(filePath)
    // Append timestamp to bust cache
    return `${data.publicUrl}?t=${new Date().getTime()}`
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile?.id) return

    setIsSaving(true)
    try {
      let avatarUrl = profile.avatar_url

      if (avatarFile) {
        avatarUrl = await uploadAvatar(profile.id, avatarFile)
      }

      const updates = {
        id: profile.id,
        full_name: data.full_name,
        // email: data.email, // Email updates usually require auth verification
        age: data.age,
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : null,
        gender: data.gender,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      await updateProfile(updates)

      // Log weight change if changed
      // NOTE: This is now handled by a database trigger (sync_weight_to_logs)
      /* 
      const p = profile as unknown as { body_fat_percentage?: number }
      const hasWeightChanged = profile.weight_kg !== data.weight_kg
      const hasBodyFatChanged = p.body_fat_percentage !== data.body_fat_percentage
      
      if (hasWeightChanged || hasBodyFatChanged) {
          const { error: logError } = await supabase.from('weight_logs').insert({
              user_id: profile.id,
              weight_kg: data.weight_kg,
              body_fat_percentage: data.body_fat_percentage || null,
              log_date: new Date().toISOString().split('T')[0]
          })
          if (logError) console.error("Error logging weight:", logError)
      }
      */

      toast({
        title: "Perfil atualizado!",
        description: "Seus dados foram salvos com sucesso.",
      })
      
      // Navigate back to profile page
      setTimeout(() => navigate("/profile"), 500)
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border -mx-4 px-4 mb-6">
        <div className="max-w-4xl mx-auto h-10 pb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold">Editar Perfil</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="relative group cursor-pointer">
            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
              <AvatarImage src={avatarPreview || ""} className="object-cover" />
              <AvatarFallback className="text-4xl bg-muted">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">Toque para alterar a foto</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <Card className="bg-card border border-border/50 rounded-xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Informações Pessoais
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Mantenha seus dados atualizados para melhores resultados.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} className="bg-muted/50 border-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} className="bg-muted/50 border-0" disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-muted/50 border-0 block" 
                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                            max={format(subYears(new Date(), 14), 'yyyy-MM-dd')}
                            min={format(subYears(new Date(), 120), 'yyyy-MM-dd')}
                            onChange={(e) => {
                              const dateString = e.target.value
                              if (!dateString) return
                              
                              // Create date object in local time to avoid timezone shifts
                              const [year, month, day] = dateString.split('-').map(Number)
                              const date = new Date(year, month - 1, day)
                              
                              field.onChange(date)
                              form.setValue("age", calculateAge(date))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade (anos)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-muted/50 border-0" readOnly disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/50 border-0">
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>


            {/* Removed "Medidas Corporais e Objetivos" card as requested */}


            <Button 
              type="submit" 
              className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
