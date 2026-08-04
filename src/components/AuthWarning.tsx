import { AlertCircle, Database } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthWarning() {
  return (
    <Card className="border-warning/20 bg-warning-light/10 shadow-soft mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-warning-light/20">
            <Database className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-foreground">
                Conecte ao Supabase para funcionalidades completas
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Para salvar seus dados de forma permanente, criar conta de usuário, e sincronizar entre dispositivos, 
              você precisa conectar este projeto ao Supabase usando nossa integração nativa.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}
                variant="outline" 
                size="sm"
                className="text-warning border-warning hover:bg-warning-light/20"
              >
                Ver Documentação
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}