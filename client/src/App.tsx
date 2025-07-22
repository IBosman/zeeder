import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import AgentDetails from "@/pages/agent-details";
import NotFound from "@/pages/not-found";
import Billing from "@/pages/billing";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsersPage from "@/pages/admin-users";
import AdminUserDetailsPage from "./pages/admin-user-details";
import Signup from "@/pages/signup";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/agent/:id" component={AgentDetails} />
      <Route path="/billing" component={Billing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/agents" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/users/:id" component={AdminUserDetailsPage} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && location !== "/login" && location !== "/signup") {
      setLocation("/login");
    }
  }, [location, setLocation]);

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
