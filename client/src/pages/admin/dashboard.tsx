
import React from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LucideBarChart, 
  LucideUsers, 
  LucideShoppingBag, 
  LucideCreditCard,
  LucideFileText,
  LucidePlus,
  LucideUserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Sistema</h1>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <LucidePlus className="mr-2 h-4 w-4" /> Criar Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Totais</CardTitle>
            <LucideBarChart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">R$ 47.600</div>
            <p className="text-xs text-muted-foreground">Mês Atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Pedidos</CardTitle>
            <LucideShoppingBag className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Hoje | Esta Semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <LucideUsers className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Mês Atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</CardTitle>
            <LucideCreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">R$ 12.850</div>
            <p className="text-xs text-muted-foreground">Vencimento 15 Dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendência de Receita de Vendas</CardTitle>
            <div className="text-xs text-muted-foreground">Últimos 30 Dias</div>
          </CardHeader>
          <CardContent>
            {/* Aqui entraria o gráfico de vendas */}
            <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
              {/* Placeholder para o gráfico */}
              <span className="text-muted-foreground">Gráfico de Vendas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <LucideShoppingBag className="h-4 w-4 text-rose-500" /> 
                Pedidos Recentes
              </h3>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-md">
                      <LucideShoppingBag className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pedido #534 - Delícias Doces</p>
                      <p className="text-xs text-muted-foreground">Em Processamento</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-md">
                      <LucideShoppingBag className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pedido #533 - Paraíso do Gelo</p>
                      <p className="text-xs text-muted-foreground">Enviado</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-md">
                      <LucideShoppingBag className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pedido #532 - Gelados Refrescantes</p>
                      <p className="text-xs text-muted-foreground">Concluído</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <LucideFileText className="h-4 w-4 text-amber-500" /> 
                Tarefas Pendentes
              </h3>
              <div className="bg-amber-50 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-md">
                    <LucideFileText className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">3 Pedidos Aguardando Atendimento</p>
                    <p className="text-xs text-muted-foreground">Urgente</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <LucideUsers className="h-4 w-4 text-blue-500" /> 
                Clientes
              </h3>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <LucideUsers className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">2 Clientes Aguardando Configuração</p>
                    <p className="text-xs text-muted-foreground">Prioridade Média</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Saldos de Contas Principais</h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-rose-100 p-2 rounded-md">
                    <LucideCreditCard className="h-4 w-4 text-rose-500" />
                  </div>
                  <span className="text-sm">Conta Bancária Principal</span>
                </div>
                <span className="font-medium">R$ 17.250</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-rose-100 p-2 rounded-md">
                    <LucideCreditCard className="h-4 w-4 text-rose-500" />
                  </div>
                  <span className="text-sm">Dinheiro em Caixa</span>
                </div>
                <span className="font-medium">R$ 3.450</span>
              </div>
              
              <h3 className="text-sm font-medium pt-2">Receita vs. Despesas (Mês Atual)</h3>
              <div className="h-[120px] bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Gráfico de Receitas/Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Categorias Mais Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Gráfico de Categorias</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <LucideShoppingBag className="h-6 w-6 text-rose-500" />
                <span>Novo Pedido</span>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <LucideUserPlus className="h-6 w-6 text-rose-500" />
                <span>Adicionar Cliente</span>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <LucideFileText className="h-6 w-6 text-rose-500" />
                <span>Criar Fatura</span>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <LucideBarChart className="h-6 w-6 text-rose-500" />
                <span>Gerar Relatório</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
