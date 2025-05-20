import { useQuery } from "@tanstack/react-query";
import { CustomerLayout } from "@/layouts/customer-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Clock, CheckCircle, Package, ArrowRight, PlusCircle, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Recent Orders 
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/orders/recent"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        {
          id: 1,
          order_number: "PED8752",
          date: "2023-07-12",
          status: "delivered",
          total: 2500.00,
          items: 8
        },
        {
          id: 2,
          order_number: "PED8749",
          date: "2023-07-05",
          status: "delivered",
          total: 2830.00,
          items: 10
        },
        {
          id: 3,
          order_number: "PED8742",
          date: "2023-06-28",
          status: "delivered",
          total: 1950.00,
          items: 6
        }
      ];
    },
  });

  // Suggested Products
  const { data: suggestedProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products/suggested"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        {
          id: 1,
          name: "Sorvete de Chocolate",
          price: 180.00,
          image: "/images/products/chocolate.jpg",
          category: "Tradicionais"
        },
        {
          id: 2,
          name: "Sorvete de Morango",
          price: 180.00,
          image: "/images/products/strawberry.jpg",
          category: "Tradicionais"
        },
        {
          id: 3,
          name: "Sorvete de Pistache",
          price: 220.00,
          image: "/images/products/pistachio.jpg",
          category: "Premium"
        },
        {
          id: 4,
          name: "Sorvete de Cookies",
          price: 200.00,
          image: "/images/products/cookies.jpg",
          category: "Especiais"
        }
      ];
    },
  });

  // Order Status Stats
  const { data: orderStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/orders/stats"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return {
        pending: 1,
        processing: 2,
        ready: 0,
        delivered: 28
      };
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "processing":
        return "Em Produção";
      case "ready":
        return "Pronto";
      case "delivered":
        return "Entregue";
      default:
        return status;
    }
  };

  return (
    <CustomerLayout>
      <PageHeader
        title={`Bem-vindo, ${user?.name || 'Cliente'}!`}
        description="Gerencie seus pedidos e confira os produtos disponíveis."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                <h3 className="text-2xl font-bold mt-2">{isLoadingStats ? "..." : orderStats?.pending || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Produção</p>
                <h3 className="text-2xl font-bold mt-2">{isLoadingStats ? "..." : orderStats?.processing || 0}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prontos para Retirada</p>
                <h3 className="text-2xl font-bold mt-2">{isLoadingStats ? "..." : orderStats?.ready || 0}</h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <h3 className="text-2xl font-bold mt-2">
                  {isLoadingStats
                    ? "..."
                    : (orderStats?.pending || 0) +
                      (orderStats?.processing || 0) +
                      (orderStats?.ready || 0) +
                      (orderStats?.delivered || 0)}
                </h3>
              </div>
              <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded-full">
                <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Pedidos Recentes</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80 flex items-center gap-1" asChild>
                <a href="/customer/my-orders">
                  <span>Ver todos</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Pedido</TableHead>
                    <TableHead className="text-left">Data</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Itens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Carregando pedidos...
                      </TableCell>
                    </TableRow>
                  ) : recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span>{getStatusText(order.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="text-right">{order.items}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Produtos Sugeridos</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80 flex items-center gap-1" asChild>
                <a href="/customer/new-order">
                  <span>Fazer Pedido</span>
                  <ShoppingCart className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>

            <div className="space-y-4">
              {isLoadingProducts ? (
                <p className="text-center py-8">Carregando produtos...</p>
              ) : suggestedProducts && suggestedProducts.length > 0 ? (
                suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between group hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {/* Placeholder for product image */}
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/10"></div>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-muted-foreground">por kg</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum produto sugerido
                </p>
              )}

              <Button className="w-full mt-4" asChild>
                <a href="/customer/new-order">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Pedido
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}