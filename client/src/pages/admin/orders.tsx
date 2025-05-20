import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderTable } from "@/components/orders/order-table";
import { Plus, Search, FilterX } from "lucide-react";

type OrderStatus = "all" | "pending" | "processing" | "ready" | "delivered" | "cancelled";
type PaymentStatus = "all" | "pending" | "partial" | "paid";

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const filteredOrders = orders
    ? orders.filter((order: any) => {
        // Search query filter
        const searchMatch =
          searchQuery === "" ||
          order.id.toString().includes(searchQuery) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status filter
        const statusMatch = statusFilter === "all" || order.status === statusFilter;

        // Payment filter
        const paymentMatch = paymentFilter === "all" || order.payment_status === paymentFilter;

        // Date filter
        let dateMatch = true;
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          const orderDate = new Date(order.order_date);
          dateMatch = filterDate.toDateString() === orderDate.toDateString();
        }

        return searchMatch && statusMatch && paymentMatch && dateMatch;
      })
    : [];

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("");
  };

  const viewOrder = (orderId: number) => {
    // Navigate to order details page
    window.location.href = `/admin/orders/${orderId}`;
  };

  const editOrder = (orderId: number) => {
    // Navigate to edit order page
    window.location.href = `/admin/orders/${orderId}/edit`;
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Gerenciamento de Pedidos"
        description="Visualize e gerencie todos os pedidos dos clientes."
        actions={
          <Button className="rounded-xl flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Pedido</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nº ou cliente..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus)}
              >
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="processing">Em Processamento</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentFilter}
                onValueChange={(value) => setPaymentFilter(value as PaymentStatus)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pagamentos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                className="w-[170px] rounded-xl"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              {(searchQuery || statusFilter !== "all" || paymentFilter !== "all" || dateFilter) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-xl"
                >
                  <FilterX className="h-4 w-4" />
                  <span>Limpar</span>
                </Button>
              )}
            </div>
          </div>

          <OrderTable
            orders={
              isLoading
                ? []
                : filteredOrders.map((order: any) => ({
                    id: order.id,
                    customer_name: order.customer_name || "Cliente",
                    date: new Date(order.order_date).toLocaleDateString("pt-BR"),
                    total: order.total,
                    status: order.status,
                    payment_status: order.payment_status,
                  })) || []
            }
            isAdmin={true}
            showCustomer={true}
            onView={viewOrder}
            onEdit={editOrder}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
