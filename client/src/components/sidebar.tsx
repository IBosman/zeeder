import { Home, Users, CreditCard, Settings, ArrowLeft, Headphones, Bell, ChevronDown, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen: isOpenProp, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled isOpen prop if provided, otherwise use internal state
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen;
  
  // Check if mobile on mount and on window resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const toggleSidebar = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };
  const [location, navigate] = useLocation();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'admin';
  return (
    <>
      {/* Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-card flex flex-col border-r border-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      {/* Logo/Brand Section - Hidden on mobile */}
      <div className="hidden md:block p-4 border-b border-border">
        <div className="flex items-center justify-center">
          <img 
            src="/zeeder-ai-logo.png" 
            alt="Zeeder AI Logo" 
            className="h-6 w-auto object-contain"
            onError={(e) => {
              // Fallback in case the image fails to load
              console.error('Failed to load logo:', e);
            }}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant={location === "/" || location === "/dashboard" ? "secondary" : "ghost"}
              className={`w-full justify-start ${location === "/" || location === "/dashboard" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Dashboard</span>
            </Button>
          </li>
          <li>
            <Button
              variant={
                isAdmin
                  ? location === "/admin/agents" ? "secondary" : "ghost"
                  : location === "/agents" ? "secondary" : "ghost"
              }
              className={
                isAdmin
                  ? `w-full justify-start ${location === "/admin/agents" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`
                  : `w-full justify-start ${location === "/agents" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`
              }
              onClick={() => navigate(isAdmin ? "/admin/agents" : "/agents")}
            >
              <Users className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Agents</span>
            </Button>
          </li>
          {isAdmin && (
            <li>
              <Button
                variant={location === "/admin/users" ? "secondary" : "ghost"}
                className={
                  `w-full justify-start ${location === "/admin/users" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`
                }
                onClick={() => navigate("/admin/users")}
              >
                <User className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">Users</span>
              </Button>
            </li>
          )}
          <li>
            <Button
              variant={location === "/billing" ? "secondary" : "ghost"}
              className={
                `w-full justify-start ${location === "/billing" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`
              }
              onClick={() => navigate("/billing")}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              <span className="text-sm">Billing</span>
            </Button>
          </li>
          <li>
            <Button
              variant={location === "/settings" ? "secondary" : "ghost"}
              className={`w-full justify-start ${location === "/settings" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4 mr-3" />
              <span className="text-sm">Settings</span>
            </Button>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm">Notifications</span>
          </Button>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-4 border-t border-border">
        <Popover>
          <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">My Account</div>
              <div className="text-xs text-muted-foreground">Workspace (5BAFCC8)</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 w-56">
            <div className="py-2">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm text-red-600" onClick={() => { localStorage.clear(); navigate("/login"); }}>Sign out</Button>
            </div>
          </PopoverContent>
        </Popover>
          </div>
        </div>
      </aside>
    </>
  );
}
