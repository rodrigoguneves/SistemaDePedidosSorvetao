import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { formatCurrency } from "@/lib/utils";
import { 
  BarChart, 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign, 
  CalendarClock,
  Truck
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const userInfo = {
    name: user.name,
    email: user.email,
    image: ""
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar */}
      <div className="grid lg:grid-cols-[280px_1fr] h-screen">
        <aside className="hidden lg:flex border-r bg-background flex-col">
          <div className="h-16 flex items-center border-b px-6">
            <h2 className="font-semibold text-lg">Painel Administrativo</h2>
          </div>
          <nav className="flex-1 overflow-auto py-6 px-4">
            <div className="grid gap-2 px-2">
              <Link href="/admin" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all">
                <BarChart className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/admin/clientes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Users className="h-5 w-5" />
                <span className="font-medium">Clientes</span>
              </Link>
              <Link href="/admin/pedidos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Pedidos</span>
              </Link>
              <Link href="/admin/produtos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Package className="h-5 w-5" />
                <span className="font-medium">Produtos</span>
              </Link>
              <Link href="/admin/producao" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Truck className="h-5 w-5" />
                <span className="font-medium">Produção</span>
              </Link>
              <Link href="/admin/vendas" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Vendas</span>
              </Link>
              <Link href="/admin/financeiro" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Financeiro</span>
              </Link>
              <Link href="/admin/calendario" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <CalendarClock className="h-5 w-5" />
                <span className="font-medium">Calendário</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex flex-col">
          <header className="border-b sticky top-0 bg-background z-10">
            <div className="flex h-16 items-center px-6">
              <div className="lg:hidden font-semibold text-lg mr-4">Painel Administrativo</div>
              <div className="ml-auto flex items-center gap-4">
                <ModeToggle />
                <UserNav user={userInfo} />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Visão geral e métricas do sistema
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Clientes</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Produtos</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Receita Mensal</p>
                      <p className="text-3xl font-bold">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Pedidos Recentes</h3>
                      <p className="text-sm text-muted-foreground">Últimos pedidos recebidos</p>
                    </div>
                    <Button variant="outline" size="sm">Ver todos</Button>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="rounded-md border">
                      <div className="flex justify-center items-center p-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <p className="text-muted-foreground">Nenhum pedido recente para exibir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Clientes Principais</h3>
                      <p className="text-sm text-muted-foreground">Clientes com maior volume de pedidos</p>
                    </div>
                    <Button variant="outline" size="sm">Ver todos</Button>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="rounded-md border">
                      <div className="flex justify-center items-center p-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <p className="text-muted-foreground">Nenhum cliente para exibir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Produtos Mais Vendidos</h3>
                    <p className="text-sm text-muted-foreground">Produtos com maior volume de vendas</p>
                  </div>
                  <Button variant="outline" size="sm">Ver todos</Button>
                </div>
                <div className="p-6 pt-0">
                  <div className="rounded-md border">
                    <div className="flex justify-center items-center p-8">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-muted-foreground">Nenhum produto para exibir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}