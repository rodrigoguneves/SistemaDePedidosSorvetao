
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  BarChart as BarChartIcon
} from "lucide-react";

export default function AdminDashboard() {
  // Sample data for charts
  const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Fev', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Abr', value: 2780 },
    { name: 'Mai', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const categoryData = [
    { name: 'Sorvetes', value: 400 },
    { name: 'Picolés', value: 300 },
    { name: 'Coberturas', value: 200 },
    { name: 'Outros', value: 100 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Painel de Controle"
        description="Bem-vindo ao sistema de gestão do Sorvetão B2B."
      />

      {/* Metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900 mr-4">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produtos</p>
              <h3 className="text-2xl font-bold">254</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900 mr-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes</p>
              <h3 className="text-2xl font-bold">128</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900 mr-4">
              <FileText className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
              <h3 className="text-2xl font-bold">32</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900 mr-4">
              <BarChartIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
              <h3 className="text-2xl font-bold">R$ 52.350</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Vendas Mensais</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={salesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="value" fill="#3498db" name="Faturamento" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Distribuição por Categoria</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Atividades Recentes</h3>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start pb-4 border-b last:border-0">
                      <div className={`rounded-full p-2 mr-3 ${
                        i % 3 === 0 ? 'bg-blue-100 text-blue-600' : 
                        i % 3 === 1 ? 'bg-green-100 text-green-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {i % 3 === 0 ? <FileText className="h-4 w-4" /> : 
                         i % 3 === 1 ? <Users className="h-4 w-4" /> : 
                         <ShoppingCart className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {i % 3 === 0 ? 'Novo pedido #1043 foi criado' : 
                           i % 3 === 1 ? 'Cliente Sorveteria Gelato cadastrado' : 
                           'Produto Sorvete de Chocolate atualizado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Há {30 - i * 5} minutos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Relatório de Vendas</h3>
              <p className="text-muted-foreground">Conteúdo detalhado de vendas será exibido aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Status do Estoque</h3>
              <p className="text-muted-foreground">Informações de estoque serão exibidas aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
