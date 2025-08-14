import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { LanguageProvider } from "@/contexts/language-context";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Cases from "@/pages/cases";
import Clients from "@/pages/clients";
import Documents from "@/pages/documents";
import Tasks from "@/pages/tasks";
import Users from "@/pages/users";
import Audit from "@/pages/audit";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/cases" component={Cases} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/tasks" component={Tasks} />
      <ProtectedRoute path="/users" component={Users} />
      <ProtectedRoute path="/audit" component={Audit} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
