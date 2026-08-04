import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-3xl font-bold text-primary-foreground">404</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
          <p className="text-muted-foreground text-sm">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="rounded-xl"
          >
            Voltar
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
          >
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
