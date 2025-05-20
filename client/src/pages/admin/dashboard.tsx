import React from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  BarChart, 
  Users, 
  ShoppingBag, 
  CreditCard,
  FileText,
  UserPlus,
  BarChart2
} from 'lucide-react';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { FinancialSummary } from '@/components/dashboard/financial-summary';

const AdminDashboard = () => {
  // Dados simulados para os componentes
  const salesData = [
    { name: 'Jan', value: 32400 },
    { name: 'Fev', value: 27900 },
    { name: 'Mar', value: 35100 },
    { name: 'Abr', value: 29400 },
    { name: 'Mai', value: 38600 },
    { name: 'Jun', value: 42700 },
    { name: 'Jul', value: 47600 },
  ];

  const financialData = {
    revenue: 47600,
    expenses: 23150,
    balance: 24450
  };

  const recentActivities = [
    {
      id: '1',
      type: 'order_processing',
      message: 'Pedido <strong>#534</strong> - Delícias Doces em Processamento',
      time: 'Há 30 minutos'
    },
    {
      id: '2',
      type: 'order_completed',
      message: 'Pedido <strong>#533</strong> - Paraíso do Gelo foi Enviado',
      time: 'Há 1 hora'
    },
    {
      id: '3',
      type: 'order_completed',
      message: 'Pedido <strong>#532</strong> - Gelados Refrescantes foi Concluído',
      time: 'Há 2 horas'
    },
    {
      id: '4',
      type: 'payment_overdue',
      message: '<strong>3 Pedidos</strong> Aguardando Atendimento',
      time: 'Urgente'
    },
    {
      id: '5',
      type: 'customer_update',
      message: '<strong>2 Clientes</strong> Aguardando Configuração',
      time: 'Prioridade Média'
    }
  ];

  const quickActionItems = [
    {
      icon: <ShoppingBag size={18} />,
      label: 'Novo Pedido',
      href: '/admin/orders/new',
      color: 'primary'
    },
    {
      icon: <UserPlus size={18} />,
      label: 'Adicionar Cliente',
      href: '/admin/customers/new',
      color: 'blue'
    },
    {
      icon: <FileText size={18} />,
      label: 'Criar Fatura',
      href: '/admin/financial/invoice/new',
      color: 'green'
    },
    {
      icon: <BarChart2 size={18} />,
      label: 'Gerar Relatório',
      href: '/admin/reports',
      color: 'purple'
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Sistema</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Vendas Totais</h3>
              <BarChart className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">R$ 47.600</div>
            <p className="text-xs text-muted-foreground">Mês Atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Novos Pedidos</h3>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Hoje | Esta Semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Clientes Ativos</h3>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Mês Atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</h3>
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">R$ 12.850</div>
            <p className="text-xs text-muted-foreground">Vencimento 15 Dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <SalesChart 
          data={salesData} 
          className="lg:col-span-2" 
          title="Tendência de Receita de Vendas"
        />

        <ActivityFeed 
          activities={recentActivities} 
          title="Atividade Recente" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialSummary 
          data={financialData} 
          title="Resumo Financeiro" 
        />

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">Categorias Mais Vendidas</h3>
            <div className="h-[220px] bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Gráfico de Categorias</span>
            </div>
          </CardContent>
        </Card>

        <QuickActions 
          actions={quickActionItems} 
          title="Ações Rápidas" 
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;