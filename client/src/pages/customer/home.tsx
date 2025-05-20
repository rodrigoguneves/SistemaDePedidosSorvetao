import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/layouts/customer-layout";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  Clock,
  ChevronRight,
  CalendarDays,
  Truck,
} from "lucide-react";

// Dados temporários para demonstração
const recentOrders = [
  {
    id: 1,
    data: "15/05/2023",
    status: "entregue",
    valor: 1250.0,
    itens: 8,
  },
  {
    id: 2,
    data: "28/04/2023",
    status: "entregue",
    valor: 875.5,
    itens: 5,
  },
  {
    id: 3,
    data: "10/04/2023",
    status: "entregue",
    valor: 2150.75,
    itens: 12,
  },
];

const featuredProducts = [
  {
    id: 1,
    nome: "Sorvete de Chocolate",
    descricao: "Sorvete premium de chocolate belga",
    preco: 45.9,
    imagem: "/assets/chocolate.jpg",
  },
  {
    id: 2,
    nome: "Sorvete de Morango",
    descricao: "Sorvete com morangos frescos",
    preco: 42.5,
    imagem: "/assets/morango.jpg",
  },
  {
    id: 3,
    nome: "Sorvete de Creme",
    descricao: "Tradicional sorvete de creme",
    preco: 38.9,
    imagem: "/assets/creme.jpg",
  },
  {
    id: 4,
    nome: "Picolé de Limão",
    descricao: "Picolé refrescante de limão",
    preco: 28.5,
    imagem: "/assets/limao.jpg",
  },
];

// Componente para exibir status do pedido
const OrderStatus = ({ status }: { status: string }) => {
  let color = "";
  let bgColor = "";
  
  switch(status) {
    case "pendente":
      color = "text-amber-700";
      bgColor = "bg-amber-100";
      break;
    case "processando":
      color = "text-blue-700";
      bgColor = "bg-blue-100";
      break;
    case "entregue":
      color = "text-green-700";
      bgColor = "bg-green-100";
      break;
    case "cancelado":
      color = "text-red-700";
      bgColor = "bg-red-100";
      break;
    default:
      color = "text-gray-700";
      bgColor = "bg-gray-100";
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function CustomerHome() {
  const { user } = useAuth();
  
  // Aqui seria substituído por dados reais vindo da API
  const { data: orderStats } = useQuery({
    queryKey: ['/api/customer/orders/stats'],
    queryFn: () => Promise.resolve({
      total: 32,
      pendingDelivery: 2,
      lastMonth: 8,
    }),
  });

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name || 'Cliente'}!</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle. Faça seus pedidos de forma rápida e acompanhe facilmente.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pedidos realizados até hoje
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Entregas Pendentes</CardTitle>
              <Truck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats?.pendingDelivery || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pedidos a caminho
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pedidos Recentes</CardTitle>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats?.lastMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                Realizados no último mês
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Veja seus últimos pedidos realizados</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/my-orders">
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-1 md:grid-cols-5 p-4 text-sm font-medium">
                    <div>Pedido</div>
                    <div>Data</div>
                    <div>Status</div>
                    <div>Itens</div>
                    <div>Total</div>
                  </div>
                  <div className="divide-y divide-border rounded-md border-t">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-1 md:grid-cols-5 p-4 text-sm">
                        <div className="font-medium">#{order.id}</div>
                        <div>{order.data}</div>
                        <div><OrderStatus status={order.status} /></div>
                        <div>{order.itens} itens</div>
                        <div>{formatCurrency(order.valor)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mb-2" />
                  <p>Você ainda não realizou nenhum pedido.</p>
                  <Button className="mt-4" asChild>
                    <a href="/new-order">Fazer Pedido</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos em Destaque</CardTitle>
            <CardDescription>
              Conheça os produtos mais populares para o seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video w-full bg-muted" />
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{product.nome}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.descricao}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-bold">{formatCurrency(product.preco)}</p>
                      <Button variant="outline" size="sm">
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precisa de ajuda?</CardTitle>
            <CardDescription>
              Nossa equipe está pronta para te ajudar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-center py-6">
            <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Contato via Whatsapp
            </Button>
            <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
              </svg>
              Enviar Email
            </Button>
            <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
              </svg>
              Ligar para Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}