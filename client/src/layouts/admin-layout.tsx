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
      bgColor: "bg-primary",
    },
    {
      title: "Produtos",
      href: "/admin/products",
      icon: <ShoppingCart size={21} />,
      bgColor: "bg-gray-200",
    },
    {
      title: "Clientes",
      href: "/admin/customers",
      icon: <Users size={21} />,
      bgColor: "bg-gray-200",
    },
    {
      title: "Pedidos",
      href: "/admin/orders",
      icon: <FileText size={21} />,
      bgColor: "bg-gray-200",
    },
    {
      title: "Financeiro",
      href: "/admin/finance",
      icon: <BarChart size={21} />,
      bgColor: "bg-gray-200",
    },
    {
      title: "Opções",
      href: "/admin/settings",
      icon: <Settings size={21} />,
      bgColor: "bg-gray-200",
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#EDF4FB]">
      <header className="bg-white px-6 py-2 flex items-center justify-between shadow-sm">
        {/* Logo e seção esquerda */}
        <div className="flex items-center">
          <div>
            <img src="/assets/logo.png" alt="Sorvetão" className="h-10" />
          </div>
        </div>
        
        {/* Navigation centralizada */}
        <nav className="flex items-center space-x-4 justify-center flex-1">
          {navigationItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="flex flex-col items-center p-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  location === item.href ? "bg-primary text-white" : item.bgColor + " text-gray-600"
                }`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  location === item.href ? "text-primary" : "text-gray-600"
                }`}>
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="text-sm font-medium">João Administrador</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img src="https://github.com/shadcn.png" alt="User" className="w-8 h-8 object-cover" />
          </div>
        </div>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}