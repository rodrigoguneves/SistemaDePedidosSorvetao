import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerLayout } from "@/layouts/customer-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Package, Search, Eye, FileText, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CustomerMyOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        {
          id: 1,
          order_number: "PED8752",
          date: "2023-07-12",
          delivery_date: "2023-07-15",
          status: "delivered",
          total: 2500.00,
          items: 8,
          payment_status: "paid"
        },
        {
          id: 2,
          order_number: "PED8749",
          date: "2023-07-05",
          delivery_date: "2023-07-08",
          status: "delivered",
          total: 2830.00,
          items: 10,
          payment_status: "paid"
        },
        {
          id: 3,
          order_number: "PED8742",
          date: "2023-06-28",
          delivery_date: "2023-07-01",
          status: "delivered",
          total: 1950.00,
          items: 6,
          payment_status: "paid"
        },
        {
          id: 4,
          order_number: "PED8761",
          date: "2023-07-18",
          delivery_date: "2023-07-21",
          status: "processing",
          total: 2100.00,
          items: 7,
          payment_status: "pending"
        },
        {
          id: 5,
          order_number: "PED8766",
          date: "2023-07-19",
          delivery_date: "2023-07-22",
          status: "pending",
          total: 1850.00,
          items: 5,
          payment_status: "pending"
        }
      ];
    },
  });

  // Filter orders based on search and active tab
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === "all" || order.status === activeTab;
    return matchesSearch && matchesStatus;
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Pago</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pendente</span>;
      case "partial":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Parcial</span>;
      default:
        return null;
    }
  };

  return (
    <CustomerLayout>
      <PageHeader
        title="Meus Pedidos"
        description="Acompanhe o status e histórico de todos os seus pedidos."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Buscar pedidos por número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="processing">Em Produção</TabsTrigger>
                  <TabsTrigger value="delivered">Entregues</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Número</TableHead>
                  <TableHead className="text-left">Data do Pedido</TableHead>
                  <TableHead className="text-left">Entrega Prevista</TableHead>
                  <TableHead className="text-left">Status</TableHead>
                  <TableHead className="text-left">Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Itens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando pedidos...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(order.delivery_date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.payment_status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-right">{order.items}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <Button className="rounded-xl" asChild>
              <a href="/customer/new-order">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Fazer Novo Pedido
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </CustomerLayout>
  );
}