import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import AuthPage from "@/pages/auth-page";
import LoginPage from "@/pages/login-page";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCustomers from "@/pages/admin/customers";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminFinancial from "@/pages/admin/financial";
import AdminSettings from "@/pages/admin/settings";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerNewOrder from "@/pages/customer/new-order";
import CustomerMyOrders from "@/pages/customer/my-orders";
import CustomerAccount from "@/pages/customer/account";

import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user } = useAuth();
  
  // Routes based on user role
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin routes */}
      <Route path="/admin">
        {user && user.role === 'admin' || user?.role === 'manager' ? (
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/customers" component={AdminCustomers} />
            <Route path="/admin/products" component={AdminProducts} />
            <Route path="/admin/orders" component={AdminOrders} />
            <Route path="/admin/financial" component={AdminFinancial} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <NotFound />
        )}
      </Route>
      
      {/* Customer routes */}
      <Route path="/">
        {user && user.role === 'customer' ? (
          <Switch>
            <Route path="/" component={CustomerDashboard} />
            <Route path="/new-order" component={CustomerNewOrder} />
            <Route path="/my-orders" component={CustomerMyOrders} />
            <Route path="/account" component={CustomerAccount} />
            <Route component={NotFound} />
          </Switch>
        ) : user?.role === 'admin' || user?.role === 'manager' ? (
          <Switch>
            <Route path="/">
              <AdminDashboard />
            </Route>
            <Route component={NotFound} />
          </Switch>
        ) : (
          <LoginPage />
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
