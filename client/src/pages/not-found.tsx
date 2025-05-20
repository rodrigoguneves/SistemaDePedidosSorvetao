import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-xl md:text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-muted-foreground">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              Voltar para a página inicial
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth">
              Ir para página de login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}