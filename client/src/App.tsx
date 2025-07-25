import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Agents from "@/pages/agents";
import AgentDetails from "@/pages/agent-details";
import NotFound from "@/pages/not-found";
import Billing from "@/pages/billing";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsersPage from "@/pages/admin-users";
import AdminUserDetailsPage from "./pages/admin-user-details";
import Signup from "@/pages/signup";
import Settings from "@/pages/settings";

// Mobile header component
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center justify-between px-4">
      <button 
        onClick={onMenuClick}
        className="p-2 rounded-md hover:bg-muted"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1 flex justify-center">
        <img 
          src="/zeeder-ai-logo.png" 
          alt="Zeeder AI" 
          className="h-4 w-auto"
        />
      </div>
      <div className="w-10"></div> {/* Spacer for alignment */}
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/agents" component={Agents} />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
  
  // Don't show sidebar on login/signup pages
  const showSidebar = !['/login', '/signup'].includes(location);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          {showSidebar && (
            <>
              <MobileHeader onMenuClick={toggleSidebar} />
              <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            </>
          )}
          <main className={`flex-1 transition-all duration-300 pt-16 md:pt-0 ${showSidebar ? 'md:ml-60' : ''} min-h-screen overflow-auto`}>
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
