import { createRoot } from "react-dom/client";
import App from "./App";
import LoginPage from "./pages/login-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Router, Switch } from "wouter";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Switch>
            <Route path="/" component={LoginPage} />
            <Route path="/*" component={App} />
          </Switch>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
