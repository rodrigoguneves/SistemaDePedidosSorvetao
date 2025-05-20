import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { HeaderNavItem } from "@/components/ui/header-nav-item";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingBag, 
  UserCircle, 
  LogOut,
  Menu,
  Sun,
  Moon
} from "lucide-react";

interface CustomerLayoutProps {
  children: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { 
      icon: <LayoutDashboard />, 
      label: "Painel", 
      to: "/",
      isActive: location === "/" 
    },
    { 
      icon: <PlusCircle />, 
      label: "Novo Pedido", 
      to: "/new-order",
      isActive: location === "/new-order" 
    },
    { 
      icon: <ShoppingBag />, 
      label: "Meus Pedidos", 
      to: "/my-orders",
      isActive: location === "/my-orders" 
    },
    { 
      icon: <UserCircle />, 
      label: "Minha Conta", 
      to: "/account",
      isActive: location === "/account" 
    }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navClassName = mobileMenuOpen
    ? "flex flex-col absolute top-[72px] left-0 right-0 bg-background z-40 shadow-md p-4 space-y-4 md:static md:flex-row md:shadow-none md:p-0 md:space-y-0 md:space-x-8"
    : "hidden md:flex md:items-center md:space-x-8";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center mr-4">
                <span className="text-gray-500 dark:text-gray-400 font-bold">Sorvetão Logo</span>
              </div>
              <button 
                className="md:hidden rounded-xl p-2 text-muted-foreground hover:bg-secondary"
                onClick={toggleMobileMenu}
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Navigation - Customer View */}
            <nav className={navClassName}>
              {navItems.map((item, index) => (
                <HeaderNavItem 
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={item.isActive}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>

            {/* User menu */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={toggleTheme}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <span className="text-sm font-medium text-foreground mr-3 hidden sm:inline">
                {user?.name}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                <span className="font-bold">
                  {user?.name
                    .split(' ')
                    .map(part => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
