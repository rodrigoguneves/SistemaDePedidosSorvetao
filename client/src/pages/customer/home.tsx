import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";

export default function CustomerHome() {
  const { user } = useAuth();

  if (!user) return null;

  const userInfo = {
    name: user.name,
    email: user.email,
    image: ""
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="font-semibold text-lg mr-4">Pedidos Sorveteria B2B</div>
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 hidden md:block">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Início
            </Link>
            <Link href="/pedidos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Meus Pedidos
            </Link>
            <Link href="/produtos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Produtos
            </Link>
            <Link href="/financeiro" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Financeiro
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
            <UserNav user={userInfo} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Olá, {user.name}!</h1>
            <p className="text-muted-foreground">
              Bem-vindo à sua área de cliente. Gerencie seus pedidos e acompanhe o status.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Aguardando Aprovação</h3>
                <p className="text-sm text-muted-foreground">Pedidos em análise</p>
                <p className="text-3xl font-bold pt-4">0</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Em Produção</h3>
                <p className="text-sm text-muted-foreground">Pedidos em fabricação</p>
                <p className="text-3xl font-bold pt-4">0</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Prontos para Entrega</h3>
                <p className="text-sm text-muted-foreground">Pedidos finalizados</p>
                <p className="text-3xl font-bold pt-4">0</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Entregas Realizadas</h3>
                <p className="text-sm text-muted-foreground">Pedidos entregues</p>
                <p className="text-3xl font-bold pt-4">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Pedidos Recentes</h3>
                <p className="text-sm text-muted-foreground">Seus últimos pedidos realizados</p>
              </div>
              <Button variant="outline" size="sm">Ver todos</Button>
            </div>
            <div className="p-6 pt-0">
              <div className="rounded-md border">
                <div className="flex justify-center items-center p-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-muted-foreground">Você ainda não possui pedidos cadastrados</p>
                    <Button>Fazer meu primeiro pedido</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pedidos Sorveteria B2B. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}