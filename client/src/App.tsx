import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Pages
import LoginPage from "@/pages/login-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminDashboardFlowbite from "@/pages/admin/dashboard-flowbite";

// Customer pages
import CustomerHome from "@/pages/customer/home";

function Router() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth" component={LoginPage} />

      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/dashboard-flowbite" component={AdminDashboardFlowbite} />
      <ProtectedRoute path="/admin/products" component={React.lazy(() => import("@/pages/admin/products"))} />

      {/* Customer routes */}
      <ProtectedRoute path="/" component={CustomerHome} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="sorvetao-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;