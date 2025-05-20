
import React from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  DollarSign,
  Users, 
  ShoppingBag, 
  CreditCard,
  Clock,
  CheckCircle,
  UserPlus,
  FileText,
  BarChart2,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  // Dados para os cards
  const cardData = [
    {
      title: 'Vendas Totais',
      value: 'R$ 47.600',
      subtitle: 'Mês Atual',
      icon: <DollarSign className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Novos Pedidos',
      value: '14',
      subtitle: 'Hoje / Esta Semana',
      icon: <ShoppingBag className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Clientes Ativos',
      value: '28',
      subtitle: 'Mês Atual',
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Pagamentos Pendentes',
      value: 'R$ 12.850',
      subtitle: 'De Pedidos B2B',
      icon: <CreditCard className="h-5 w-5 text-primary" />,
    },
  ];

  // Dados para atividades recentes
  const recentActivities = [
    {
      id: '1',
      type: 'order',
      number: '534',
      title: 'Delícias Doces',
      status: 'Em Processamento',
      icon: <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="h-4 w-4 text-blue-500" />
      </div>
    },
    {
      id: '2',
      type: 'order',
      number: '533',
      title: 'Paraíso do Gelo',
      status: 'Enviado',
      icon: <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="h-4 w-4 text-blue-500" />
      </div>
    },
    {
      id: '3',
      type: 'order',
      number: '532',
      title: 'Gelados Refrescantes',
      status: 'Concluído',
      icon: <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="h-4 w-4 text-blue-500" />
      </div>
    },
    {
      id: '4',
      type: 'task',
      count: '3',
      title: 'Pedidos Aguardando Atendimento',
      priority: 'Urgente',
      icon: <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="h-4 w-4 text-red-500" />
      </div>
    },
    {
      id: '5',
      type: 'client',
      count: '2',
      title: 'Clientes Aguardando Configuração',
      priority: 'Prioridade Média',
      icon: <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="h-4 w-4 text-blue-500" />
      </div>
    },
  ];

  // Dados do resumo financeiro
  const financialData = [
    {
      title: 'Conta Bancária Principal',
      value: 'R$ 17.250',
      icon: <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <CreditCard className="h-4 w-4 text-primary" />
      </div>
    },
    {
      title: 'Dinheiro em Caixa',
      value: 'R$ 3.450',
      icon: <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <DollarSign className="h-4 w-4 text-primary" />
      </div>
    },
  ];

  // Dados para ações rápidas
  const quickActions = [
    {
      title: 'Novo Pedido',
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      link: '/admin/orders/new'
    },
    {
      title: 'Adicionar Cliente',
      icon: <UserPlus className="h-6 w-6 text-primary" />,
      link: '/admin/customers/new'
    },
    {
      title: 'Criar Fatura',
      icon: <FileText className="h-6 w-6 text-primary" />,
      link: '/admin/financial/invoice/new'
    },
    {
      title: 'Gerar Relatório',
      icon: <BarChart2 className="h-6 w-6 text-primary" />,
      link: '/admin/reports'
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Sistema</h1>
        <Button className="bg-primary hover:bg-primary/90 rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Pedido
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cardData.map((card, index) => (
          <Card key={index} className="rounded-xl border-0 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                {card.icon}
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tendência de Receita de Vendas */}
        <Card className="lg:col-span-2 rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Tendência de Receita de Vendas</h3>
              <span className="text-xs text-muted-foreground">Últimos 30 Dias</span>
            </div>
            <div className="h-[300px] bg-gray-50 rounded-xl flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Gráfico de Vendas</span>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm font-medium text-primary">
                <Clock className="h-4 w-4 mr-2" />
                <span>Pedidos Recentes</span>
              </div>
              
              {recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="bg-blue-50 p-3 rounded-xl flex items-start gap-3">
                  {activity.icon}
                  <div>
                    <div className="font-medium">
                      Pedido #{activity.number} - {activity.title}
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.status}</div>
                  </div>
                </div>
              ))}

              <div className="flex items-center text-sm font-medium text-red-500 mt-5">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Tarefas Pendentes</span>
              </div>
              
              {recentActivities.slice(3, 4).map((activity) => (
                <div key={activity.id} className="bg-red-50 p-3 rounded-xl flex items-start gap-3">
                  {activity.icon}
                  <div>
                    <div className="font-medium">
                      {activity.count} {activity.title}
                    </div>
                    <div className="text-sm text-red-500">{activity.priority}</div>
                  </div>
                </div>
              ))}
              
              {recentActivities.slice(4).map((activity) => (
                <div key={activity.id} className="bg-blue-50 p-3 rounded-xl flex items-start gap-3">
                  {activity.icon}
                  <div>
                    <div className="font-medium">
                      {activity.count} {activity.title}
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">Resumo Financeiro</h3>
            <p className="text-xs text-muted-foreground mb-4">Saldos de Contas Principais</p>
            
            <div className="space-y-3 mb-6">
              {financialData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">Receita vs. Despesas (Mês Atual)</p>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Receita Total</span>
                <span className="font-medium">R$ 54.200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Despesas Totais</span>
                <span className="font-medium">R$ 28.500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full w-[53%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorias Mais Vendidas */}
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Categorias Mais Vendidas</h3>
            <div className="h-[220px] bg-gray-50 rounded-xl flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Gráfico de Categorias</span>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <a 
                  key={index} 
                  href={action.link} 
                  className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-8 pb-4">
        © 2023 Sorvetão. Todos os direitos reservados.
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
