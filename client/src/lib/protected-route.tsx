import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: 'admin' | 'manager' | 'customer';
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    // For admins who try to access customer pages, redirect to admin dashboard
    if (user.role === 'admin' || user.role === 'manager') {
      return (
        <Route path={path}>
          <Redirect to="/admin" />
        </Route>
      );
    }
    
    // For customers who try to access admin pages, redirect to customer dashboard
    if (user.role === 'customer') {
      return (
        <Route path={path}>
          <Redirect to="/" />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
}
