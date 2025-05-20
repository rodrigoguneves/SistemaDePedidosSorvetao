import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";
import styles from "@/styles/AdminPanel.module.css";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  // For demonstration, we'll use placeholder data
  const isAdmin = user?.role === 'admin' || true;

  const navigationItems = [
    {
      title: "Painel",
      href: "/admin",
      icon: <LayoutDashboard size={21} />,
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
      icon: <BarChart size={21} />,
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
    <div className={styles.adminPanel}>
      <header className={styles.headerAdmin}>
        <div className={styles.logoContainer}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-lg w-10 h-10 bg-primary flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-semibold text-lg">Sorvetão B2B</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          {navigationItems.map((item, index) => (
            <div key={index} className={styles.navMenuItem}>
              <Link href={item.href}>
                <a className="flex flex-col items-center justify-center">
                  <div
                    className={
                      location === item.href
                        ? styles.iconContainerActive
                        : styles.iconContainerInactive
                    }
                  >
                    <div
                      className={
                        location === item.href
                          ? styles.iconActive
                          : styles.iconInactive
                      }
                    >
                      {item.icon}
                    </div>
                  </div>
                  <span
                    className={
                      location === item.href
                        ? styles.navTitleActive
                        : styles.navTitleInactive
                    }
                  >
                    {item.title}
                  </span>
                </a>
              </Link>
            </div>
          ))}
        </nav>

        <div className={styles.userSection}>
          <ModeToggle />
          <UserNav
            user={{
              name: user?.name || "Administrador",
              email: user?.email || "admin@sorveteria.com",
              image: "https://github.com/shadcn.png",
            }}
          />
        </div>
      </header>

      {children}
    </div>
  );
}