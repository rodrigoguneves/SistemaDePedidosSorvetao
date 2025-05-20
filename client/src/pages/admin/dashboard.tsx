import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import React from "react";
import styles from "@/styles/AdminPanel.module.css";
import { Logo } from "@/components/ui/logo";
import { 
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  BarChart as BarChartIcon,
  LogOut,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { logoutMutation } = useAuth();

  const navigationItems = [
    {
      title: "Painel",
      href: "/admin",
      icon: <LayoutDashboard size={21} />,
      active: true
    },
    {
      title: "Produtos",
      href: "/admin/products",
      icon: <ShoppingCart size={21} />,
    },
    {
      title: "Clientes",
      href: "/admin/customers",
      icon: <Users size={21} />,
    },
    {
      title: "Pedidos",
      href: "/admin/orders",
      icon: <FileText size={21} />,
    },
    {
      title: "Financeiro",
      href: "/admin/finance",
      icon: <BarChartIcon size={21} />,
    },
    {
      title: "Opções",
      href: "/admin/settings",
      icon: <Settings size={21} />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={styles.AdminPanel_1_2646}>
      <header className={styles.HeaderAdmin_1_2647}>
        <div className={styles.Div_1_4407}>
          <div className={styles.LogoSorvetao_2_1_4408}>
            <div className={styles.Vector_1_4409}>
              <Logo />
            </div>
            <div className={styles.Group_1_4410}></div>
          </div>
        </div>

        <div className={styles.Div_1_4422}>
          {navigationItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className={styles.NavMenuItem_1_4423}>
                <div className={`${styles.iconContainer} ${item.active ? styles.active : ""}`}>
                  {item.icon}
                </div>
                <span className={item.active ? styles.activeText : ""}>{item.title}</span>
              </div>
            </Link>
          ))}

          <div className={styles.NavMenuItem_1_4423} onClick={handleLogout}>
            <div className={styles.iconContainer}>
              <LogOut size={21} />
            </div>
            <span>Sair</span>
          </div>
        </div>
      </header>

      <main className={styles.MainContent}>
        <div className={styles.DashboardContent}>
          <h1 className={styles.pageTitle}>Painel de Controle</h1>
          <p className={styles.pageDescription}>Bem-vindo ao sistema de gestão do Sorvetão B2B.</p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <ShoppingCart className={styles.icon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Produtos</span>
                <span className={styles.statValue}>254</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users className={styles.icon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Clientes</span>
                <span className={styles.statValue}>128</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FileText className={styles.icon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pedidos</span>
                <span className={styles.statValue}>32</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BarChartIcon className={styles.icon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Faturamento</span>
                <span className={styles.statValue}>R$ 52.350</span>
              </div>
            </div>
          </div>

          <div className={styles.chartsContainer}>
            <div className={styles.mainChart}>
              <h3 className={styles.chartTitle}>Vendas Mensais</h3>
              <div className={styles.chartPlaceholder}>
                Gráfico de barras
              </div>
            </div>

            <div className={styles.pieChart}>
              <h3 className={styles.chartTitle}>Distribuição por Categoria</h3>
              <div className={styles.chartPlaceholder}>
                Gráfico de pizza
              </div>
            </div>
          </div>

          <div className={styles.recentActivity}>
            <h3 className={styles.sectionTitle}>Atividades Recentes</h3>
            <div className={styles.activityList}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {index % 3 === 0 ? <FileText className={styles.icon} /> : 
                     index % 3 === 1 ? <Users className={styles.icon} /> : 
                     <ShoppingCart className={styles.icon} />}
                  </div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityText}>
                      {index % 3 === 0 ? 'Novo pedido #1043 foi criado' : 
                       index % 3 === 1 ? 'Cliente Sorveteria Gelato cadastrado' : 
                       'Produto Sorvete de Chocolate atualizado'}
                    </p>
                    <p className={styles.activityTime}>
                      Há {30 - index * 5} minutos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}