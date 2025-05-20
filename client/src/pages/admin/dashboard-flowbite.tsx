
import React from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Card, Button, Dropdown, Navbar, Avatar, Progress } from 'flowbite-react';
import { 
  HiPlus, 
  HiOutlineShoppingCart, 
  HiOutlineUsers, 
  HiOutlineCreditCard, 
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineDocumentText,
  HiOutlineChartBar
} from 'react-icons/hi';

const AdminDashboardFlowbite = () => {
  return (
    <AdminLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Painel do Sistema</h1>
          <Button color="failure" className="rounded-full px-4">
            <HiPlus className="mr-2 h-4 w-4" /> Criar Novo Pedido
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500">Vendas Totais</h3>
                <span className="text-pink-600 bg-pink-100 p-2 rounded-full">
                  <HiOutlineCurrencyDollar className="h-5 w-5" />
                </span>
              </div>
              <div className="text-2xl font-bold">R$ 47.600</div>
              <p className="text-xs text-gray-500">Mês Atual</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500">Novos Pedidos</h3>
                <span className="text-pink-600 bg-pink-100 p-2 rounded-full">
                  <HiOutlineShoppingCart className="h-5 w-5" />
                </span>
              </div>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-gray-500">Hoje / Esta Semana</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500">Clientes Ativos</h3>
                <span className="text-pink-600 bg-pink-100 p-2 rounded-full">
                  <HiOutlineUsers className="h-5 w-5" />
                </span>
              </div>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-gray-500">Mês Atual</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500">Pagamentos Pendentes</h3>
                <span className="text-pink-600 bg-pink-100 p-2 rounded-full">
                  <HiOutlineCreditCard className="h-5 w-5" />
                </span>
              </div>
              <div className="text-2xl font-bold">R$ 12.850</div>
              <p className="text-xs text-gray-500">De Pedidos B2B</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tendência de Receita de Vendas */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Tendência de Receita de Vendas</h3>
                <span className="text-xs text-gray-500">Últimos 30 Dias</span>
              </div>
              <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gráfico de Vendas</span>
              </div>
            </div>
          </Card>

          {/* Atividade Recente */}
          <Card className="overflow-hidden">
            <div className="p-5">
              <h3 className="font-semibold mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm font-medium text-pink-600">
                  <HiOutlineClock className="h-4 w-4 mr-2" />
                  <span>Pedidos Recentes</span>
                </div>
                
                {/* Pedidos */}
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiOutlineShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Pedido #534 - Delícias Doces
                    </div>
                    <div className="text-sm text-gray-500">Em Processamento</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiOutlineShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Pedido #533 - Paraíso do Gelo
                    </div>
                    <div className="text-sm text-gray-500">Enviado</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiOutlineShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Pedido #532 - Gelados Refrescantes
                    </div>
                    <div className="text-sm text-gray-500">Concluído</div>
                  </div>
                </div>

                <div className="flex items-center text-sm font-medium text-red-500 mt-5">
                  <HiOutlineExclamation className="h-4 w-4 mr-2" />
                  <span>Tarefas Pendentes</span>
                </div>
                
                {/* Tarefas */}
                <div className="bg-red-50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineExclamation className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      3 Pedidos Aguardando Atendimento
                    </div>
                    <div className="text-sm text-red-500">Urgente</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiOutlineUsers className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      2 Clientes Aguardando Configuração
                    </div>
                    <div className="text-sm text-gray-500">Prioridade Média</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resumo Financeiro */}
          <Card className="overflow-hidden">
            <div className="p-5">
              <h3 className="font-semibold mb-2">Resumo Financeiro</h3>
              <p className="text-xs text-gray-500 mb-4">Saldos de Contas Principais</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <HiOutlineCreditCard className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-sm">Conta Bancária Principal</span>
                  </div>
                  <span className="font-medium">R$ 17.250</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <HiOutlineCurrencyDollar className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-sm">Dinheiro em Caixa</span>
                  </div>
                  <span className="font-medium">R$ 3.450</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-2">Receita vs. Despesas (Mês Atual)</p>
              
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Receita Total</span>
                  <span className="font-medium">R$ 54.200</span>
                </div>
                <Progress progress={100} color="pink" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Despesas Totais</span>
                  <span className="font-medium">R$ 28.500</span>
                </div>
                <Progress progress={53} color="gray" />
              </div>
            </div>
          </Card>

          {/* Categorias Mais Vendidas */}
          <Card className="overflow-hidden">
            <div className="p-5">
              <h3 className="font-semibold mb-4">Categorias Mais Vendidas</h3>
              <div className="h-[220px] bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gráfico de Categorias</span>
              </div>
            </div>
          </Card>

          {/* Ações Rápidas */}
          <Card className="overflow-hidden">
            <div className="p-5">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="/admin/orders/new" className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HiOutlineShoppingCart className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium">Novo Pedido</span>
                </a>
                
                <a href="/admin/customers/new" className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HiOutlineUsers className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium">Adicionar Cliente</span>
                </a>
                
                <a href="/admin/financial/invoice/new" className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HiOutlineDocumentText className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium">Criar Fatura</span>
                </a>
                
                <a href="/admin/reports" className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HiOutlineChartBar className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium">Gerar Relatório</span>
                </a>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-8 pb-4">
          © 2023 Sorvetão. Todos os direitos reservados.
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardFlowbite;
