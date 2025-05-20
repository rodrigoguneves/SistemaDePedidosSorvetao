import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/layouts/admin-layout";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MoreHorizontal,
  ArrowRightCircle,
} from "lucide-react";
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
  Cell,
} from "recharts";
import styles from "@/styles/AdminPanel.module.css";
import { formatCurrency } from "@/lib/utils";

// Sample data for charts and stats - would be replaced with real data from API
const salesData = [
  { nome: "Jan", vendas: 4000 },
  { nome: "Fev", vendas: 3000 },
  { nome: "Mar", vendas: 2000 },
  { nome: "Abr", vendas: 2780 },
  { nome: "Mai", vendas: 1890 },
  { nome: "Jun", vendas: 2390 },
  { nome: "Jul", vendas: 3490 },
  { nome: "Ago", vendas: 4000 },
  { nome: "Set", vendas: 3200 },
  { nome: "Out", vendas: 2800 },
  { nome: "Nov", vendas: 5000 },
  { nome: "Dez", vendas: 6000 },
];

const productData = [
  { name: "Sorvete de Chocolate", value: 30 },
  { name: "Sorvete de Morango", value: 25 },
  { name: "Sorvete de Baunilha", value: 20 },
  { name: "Sorvete de Creme", value: 15 },
  { name: "Outros", value: 10 },
];

const COLORS = ['#e73664', '#36a2eb', '#4bc0c0', '#ffcd56', '#9966ff'];

const recentOrders = [
  {
    id: 1,
    cliente: "Sorveteria Doce Vida",
    data: "15/05/2023",
    valor: 1250.0,
    status: "pendente"
  },
  {
    id: 2,
    cliente: "Doceria Gelada",
    data: "14/05/2023",
    valor: 875.5,
    status: "entregue"
  },
  {
    id: 3,
    cliente: "Gelatos Premium",
    data: "13/05/2023",
    valor: 2150.75,
    status: "processando"
  },
  {
    id: 4,
    cliente: "Ice Cream Shop",
    data: "12/05/2023",
    valor: 950.0,
    status: "entregue"
  },
  {
    id: 5,
    cliente: "Sorveteria Tropical",
    data: "11/05/2023",
    valor: 1530.25,
    status: "pendente"
  }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Format current date in Portuguese
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString('pt-BR', options));
  }, []);

  // This would be replaced with actual API queries
  const { data: customerCount } = useQuery({
    queryKey: ['/api/admin/customers/count'],
    queryFn: () => Promise.resolve(54), // Placeholder
  });

  const { data: orderCount } = useQuery({
    queryKey: ['/api/admin/orders/count'],
    queryFn: () => Promise.resolve(128), // Placeholder
  });

  const { data: productCount } = useQuery({
    queryKey: ['/api/admin/products/count'],
    queryFn: () => Promise.resolve(38), // Placeholder
  });

  const { data: revenue } = useQuery({
    queryKey: ['/api/admin/revenue'],
    queryFn: () => Promise.resolve(25890.75), // Placeholder
  });

  // Map status to style class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return styles.statusPending;
      case 'processando':
        return styles.statusProcessing;
      case 'entregue':
        return styles.statusDelivered;
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1 className={styles.titleText}>Painel de Controle</h1>
          <span className={styles.dateText}>{currentDate}</span>
        </div>

        <div className={styles.statsGrid}>
          <Card>
            <CardContent className="p-6">
              <div className={styles.statHeader}>
                <div className={styles.statTitle}>Total de Clientes</div>
                <div className={styles.statIcon}>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className={styles.statValue}>{customerCount || 0}</div>
              <div className={styles.statDetail}>
                <TrendingUp className="h-4 w-4" />
                <span>8% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={styles.statHeader}>
                <div className={styles.statTitle}>Total de Pedidos</div>
                <div className={styles.statIcon}>
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className={styles.statValue}>{orderCount || 0}</div>
              <div className={styles.statDetail}>
                <TrendingUp className="h-4 w-4" />
                <span>12% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={styles.statHeader}>
                <div className={styles.statTitle}>Total de Produtos</div>
                <div className={styles.statIcon}>
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className={styles.statValue}>{productCount || 0}</div>
              <div className={styles.statDetail}>
                <TrendingUp className="h-4 w-4" />
                <span>5% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={styles.statHeader}>
                <div className={styles.statTitle}>Faturamento Total</div>
                <div className={styles.statIcon}>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className={styles.statValue}>{formatCurrency(revenue || 0)}</div>
              <div className={`${styles.statDetail} ${styles.statDetailNegative}`}>
                <TrendingDown className="h-4 w-4" />
                <span>3% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.chartsRow}>
          <Card>
            <CardContent className="p-6">
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>Vendas Mensais</h2>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vendas" name="Vendas (R$)" fill="#e73664" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>Produtos Mais Vendidos</h2>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className={styles.orderHeader}>
              <h2 className={styles.orderTitle}>Pedidos Recentes</h2>
              <a href="/admin/orders" className={styles.viewAllLink}>
                Ver Todos
                <ArrowRightCircle className="h-4 w-4 ml-2 inline" />
              </a>
            </div>
            <div className="overflow-auto">
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.cliente}</td>
                      <td>{order.data}</td>
                      <td>{formatCurrency(order.valor)}</td>
                      <td>
                        <span className={getStatusClass(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}