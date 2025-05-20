import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { OrderTable } from "@/components/orders/order-table";
import {
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUp,
  Clock,
  CircleAlert,
  PlusCircle,
  UserPlus,
  Package,
  CreditCard,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  // Fetch pending orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", { status: "pending" }],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=pending");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  // Mock data for sales chart
  const salesData = [
    { name: "Jan", value: 4200000 },
    { name: "Fev", value: 3800000 },
    { name: "Mar", value: 5000000 },
    { name: "Abr", value: 4700000 },
    { name: "Mai", value: 5200000 },
    { name: "Jun", value: 4800000 },
    { name: "Jul", value: 4258000 },
  ];

  // Quick action buttons
  const quickActions = [
    {
      icon: <PlusCircle className="h-4 w-4" />,
      label: "Novo Pedido",
      href: "/admin/orders?new=true",
      color: "primary" as const,
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      label: "Novo Cliente",
      href: "/admin/customers?new=true",
      color: "blue" as const,
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: "Novo Produto",
      href: "/admin/products?new=true",
      color: "green" as const,
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Registrar Pagamento",
      href: "/admin/financial?new=payment",
      color: "purple" as const,
    },
  ];

  // Recent activities
  const activities = [
    {
      id: "1",
      type: "order_completed" as const,
      message: "Pedido <span class='font-semibold'>#8735</span> finalizado e pronto para entrega",
      time: "Há 35 minutos",
    },
    {
      id: "2",
      type: "customer_update" as const,
      message: "Cliente <span class='font-semibold'>Sorveteria Glacial</span> atualizou seus dados",
      time: "Há 1 hora",
    },
    {
      id: "3",
      type: "payment" as const,
      message: "Pagamento de <span class='font-semibold'>R$ 1.850,00</span> registrado para o pedido <span class='font-semibold'>#8726</span>",
      time: "Há 2 horas",
    },
    {
      id: "4",
      type: "new_order" as const,
      message: "Novo pedido <span class='font-semibold'>#8752</span> recebido de <span class='font-semibold'>Sorveteria Tropical</span>",
      time: "Há 3 horas",
    },
  ];

  const financialData = {
    revenue: 4258000,
    expenses: 2834000,
    balance: 1424000,
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
        title="Painel Administrativo"
        description="Bem-vindo ao gerenciamento de pedidos da Sorvetão!"
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Vendas do Mês"
          value="R$ 42.580,00"
          icon={<DollarSign className="h-5 w-5" />}
          trendValue="12% vs. último mês"
          trendIcon={<ArrowUp className="h-4 w-4" />}
          trendColor="green"
        />

        <KpiCard
          title="Pedidos Ativos"
          value="28"
          icon={<ShoppingCart className="h-5 w-5" />}
          trendValue="8 pendentes hoje"
          trendIcon={<Clock className="h-4 w-4" />}
          trendColor="primary"
        />

        <KpiCard
          title="Clientes Ativos"
          value="152"
          icon={<Users className="h-5 w-5" />}
          trendValue="5 novos este mês"
          trendIcon={<ArrowUp className="h-4 w-4" />}
          trendColor="blue"
        />

        <KpiCard
          title="A Receber"
          value="R$ 15.320,00"
          icon={<DollarSign className="h-5 w-5" />}
          trendValue="3 pagamentos atrasados"
          trendIcon={<CircleAlert className="h-4 w-4" />}
          trendColor="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Sales Chart + Orders Table) - 2/3 width */}
        <div className="lg:col-span-2">
          <SalesChart data={salesData} className="mb-6" />

          {/* Pending Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground">Pedidos Pendentes</h3>
              <a href="/admin/orders" className="text-primary hover:underline text-sm font-medium">
                Ver todos
              </a>
            </div>

            <OrderTable
              orders={
                ordersLoading
                  ? []
                  : orders?.slice(0, 4).map((order: any) => ({
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
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions actions={quickActions} />
          <ActivityFeed activities={activities} />
          <FinancialSummary data={financialData} />
        </div>
      </div>
    </AdminLayout>
  );
}
