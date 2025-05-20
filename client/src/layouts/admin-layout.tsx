import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      title: "Clientes",
      href: "/admin/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Produtos",
      href: "/admin/products",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Pedidos",
      href: "/admin/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Financeiro",
      href: "/admin/financial",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Configurações",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const LogoSection = () => (
    <div className="flex items-center gap-2 px-6 py-4">
      <div className="rounded-lg w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
        S
      </div>
      <span className="font-semibold text-lg">Sorvetão Admin</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out",
          isMobile && !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b">
            <LogoSection />
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 gap-1">
              {navigationItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                      location === item.href &&
                        "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          !isMobile && "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <UserNav 
              user={{
                name: user?.name || '',
                email: user?.email || '',
                image: 'https://github.com/shadcn.png'
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-8 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}