import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, ArrowUpDown, ExternalLink, PlusCircle, Search, Eye, Trash, Tag } from "lucide-react";

export default function AdminFinancial() {
  const [activeTab, setActiveTab] = useState("summary");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch financial summary
  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/financial/summary"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return {
        revenue: 42580000, // in cents
        expenses: 28340000, // in cents
        balance: 14240000, // in cents
        accounts: [
          { id: 1, name: "Conta Principal", balance: 10240000 },
          { id: 2, name: "Conta Reserva", balance: 4000000 },
        ],
        monthlySummary: [
          { month: "Jan", revenue: 3800000, expenses: 2700000 },
          { month: "Fev", revenue: 4100000, expenses: 2900000 },
          { month: "Mar", revenue: 3950000, expenses: 2800000 },
          { month: "Abr", revenue: 4300000, expenses: 3100000 },
          { month: "Mai", revenue: 4600000, expenses: 3200000 },
          { month: "Jun", revenue: 4750000, expenses: 3300000 },
          { month: "Jul", revenue: 4258000, expenses: 2834000 },
        ],
        revenueByCategory: [
          { name: "Vendas B2B", value: 36000000, color: "#3498db" },
          { name: "Eventos", value: 5200000, color: "#9b59b6" },
          { name: "Varejo", value: 1380000, color: "#2ecc71" },
        ],
        expensesByCategory: [
          { name: "Matéria Prima", value: 14500000, color: "#e74c3c" },
          { name: "Salários", value: 9200000, color: "#f39c12" },
          { name: "Logística", value: 2800000, color: "#1abc9c" },
          { name: "Outros", value: 1840000, color: "#34495e" },
        ],
      };
    },
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/financial/transactions"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        {
          id: 1,
          type: "revenue",
          amount: 250000,
          date: "2023-07-12",
          description: "Pagamento do pedido #8752 - Sorveteria Tropical",
          category: "Venda Atacado",
          account: "Conta Principal",
        },
        {
          id: 2,
          type: "expense",
          amount: 180000,
          date: "2023-07-11",
          description: "Compra de embalagens",
          category: "Matéria Prima",
          account: "Conta Principal",
        },
        {
          id: 3,
          type: "revenue",
          amount: 283000,
          date: "2023-07-10",
          description: "Pagamento do pedido #8749 - Gelateria Italiana",
          category: "Venda Atacado",
          account: "Conta Principal",
        },
        {
          id: 4,
          type: "transfer",
          amount: 500000,
          date: "2023-07-09",
          description: "Transferência para conta reserva",
          category: "Transferência",
          account: "Conta Principal",
          transferTo: "Conta Reserva",
        },
        {
          id: 5,
          type: "expense",
          amount: 95000,
          date: "2023-07-08",
          description: "Pagamento de energia",
          category: "Utilidades",
          account: "Conta Principal",
        },
      ];
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const COLORS = ["#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#e74c3c"];

  return (
    <AdminLayout>
      <PageHeader
        title="Financeiro"
        description="Gerencie receitas, despesas e acompanhe os resultados financeiros."
      />

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="revenues">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Resumo Mensal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary p-4 rounded-xl">
                    <p className="text-muted-foreground text-sm">Receita (Mês)</p>
                    <p className="text-xl font-bold text-foreground">
                      {summaryLoading
                        ? "..."
                        : formatCurrency(financialSummary?.revenue || 0)}
                    </p>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl">
                    <p className="text-muted-foreground text-sm">Despesas (Mês)</p>
                    <p className="text-xl font-bold text-foreground">
                      {summaryLoading
                        ? "..."
                        : formatCurrency(financialSummary?.expenses || 0)}
                    </p>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl">
                    <p className="text-muted-foreground text-sm">Saldo</p>
                    <p className="text-xl font-bold text-green-600">
                      {summaryLoading
                        ? "..."
                        : formatCurrency(financialSummary?.balance || 0)}
                    </p>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  {!summaryLoading && financialSummary && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financialSummary.monthlySummary}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `R$${value / 100000}k`} />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), ""]}
                          labelFormatter={(label) => `Mês: ${label}`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Bar
                          name="Receitas"
                          dataKey="revenue"
                          fill="hsl(var(--chart-3))"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          name="Despesas"
                          dataKey="expenses"
                          fill="hsl(var(--chart-1))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">Receitas por Categoria</h3>
                  <div className="h-[220px]">
                    {!summaryLoading && financialSummary && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialSummary.revenueByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {financialSummary.revenueByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">Despesas por Categoria</h3>
                  <div className="h-[220px]">
                    {!summaryLoading && financialSummary && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialSummary.expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {financialSummary.expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground">Transações Recentes</h3>
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                  onClick={() => setActiveTab("revenues")}
                >
                  <span>Ver todas</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Descrição</TableHead>
                      <TableHead className="text-left">Data</TableHead>
                      <TableHead className="text-left">Categoria</TableHead>
                      <TableHead className="text-left">Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Carregando transações...
                        </TableCell>
                      </TableRow>
                    ) : transactions && transactions.length > 0 ? (
                      transactions.map((transaction: any) => (
                        <TableRow key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium flex items-center gap-2">
                            {transaction.type === "revenue" ? (
                              <ArrowUpCircle className="h-4 w-4 text-green-500" />
                            ) : transaction.type === "expense" ? (
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-blue-500" />
                            )}
                            {transaction.description}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            {transaction.type === "transfer"
                              ? `${transaction.account} → ${transaction.transferTo}`
                              : transaction.account}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "revenue"
                                ? "text-green-600"
                                : transaction.type === "expense"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {transaction.type === "expense" ? "-" : ""}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma transação encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <h3 className="font-bold text-foreground">Contas Financeiras</h3>
                <Button className="rounded-xl flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nova Conta</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-left">Tipo</TableHead>
                      <TableHead className="text-right">Saldo Atual</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Carregando contas...
                        </TableCell>
                      </TableRow>
                    ) : financialSummary && financialSummary.accounts.length > 0 ? (
                      financialSummary.accounts.map((account: any) => (
                        <TableRow key={account.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>Conta Corrente</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(account.balance)}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhuma conta financeira encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenues">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar receitas..."
                    className="pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="rounded-xl flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nova Receita</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Descrição</TableHead>
                      <TableHead className="text-left">Data</TableHead>
                      <TableHead className="text-left">Categoria</TableHead>
                      <TableHead className="text-left">Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando receitas...
                        </TableCell>
                      </TableRow>
                    ) : transactions && transactions.length > 0 ? (
                      transactions
                        .filter((t: any) => t.type === "revenue")
                        .map((transaction: any) => (
                          <TableRow key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-green-500" />
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.account}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma receita encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar despesas..."
                    className="pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="rounded-xl flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nova Despesa</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Descrição</TableHead>
                      <TableHead className="text-left">Data</TableHead>
                      <TableHead className="text-left">Categoria</TableHead>
                      <TableHead className="text-left">Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando despesas...
                        </TableCell>
                      </TableRow>
                    ) : transactions && transactions.length > 0 ? (
                      transactions
                        .filter((t: any) => t.type === "expense")
                        .map((transaction: any) => (
                          <TableRow key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium flex items-center gap-2">
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.account}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              -{formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma despesa encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <h3 className="font-bold text-foreground">Transferências Entre Contas</h3>
                <Button className="rounded-xl flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nova Transferência</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Descrição</TableHead>
                      <TableHead className="text-left">Data</TableHead>
                      <TableHead className="text-left">De</TableHead>
                      <TableHead className="text-left">Para</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando transferências...
                        </TableCell>
                      </TableRow>
                    ) : transactions && transactions.length > 0 ? (
                      transactions
                        .filter((t: any) => t.type === "transfer")
                        .map((transaction: any) => (
                          <TableRow key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium flex items-center gap-2">
                              <ArrowUpDown className="h-4 w-4 text-blue-500" />
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{transaction.account}</TableCell>
                            <TableCell>{transaction.transferTo}</TableCell>
                            <TableCell className="text-right font-medium text-blue-600">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma transferência encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <h3 className="font-bold text-foreground">Categorias Financeiras</h3>
                <Button className="rounded-xl flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nova Categoria</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-left">Tipo</TableHead>
                      <TableHead className="text-left">Categoria Pai</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        Venda Atacado
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-800">
                          Receita
                        </span>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        Eventos
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-800">
                          Receita
                        </span>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-red-500" />
                        Matéria Prima
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-800">
                          Despesa
                        </span>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-red-500" />
                        Salários
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-800">
                          Despesa
                        </span>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
