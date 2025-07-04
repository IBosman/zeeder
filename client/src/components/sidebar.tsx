import { Home, Users, CreditCard, Settings, ArrowLeft, Headphones, Bell, ChevronDown, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-card flex flex-col border-r border-border">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">AI Studio</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Home className="h-4 w-4 mr-3" />
              <span className="text-sm">Home</span>
            </Button>
          </li>
          <li>
            <Button variant="secondary" className="w-full justify-start bg-muted text-foreground">
              <Users className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Agents</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <CreditCard className="h-4 w-4 mr-3" />
              <span className="text-sm">Billing</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings className="h-4 w-4 mr-3" />
              <span className="text-sm">Settings</span>
            </Button>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back to ElevenLabs</span>
        </Button>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
            <div className="flex items-center space-x-2">
              <Headphones className="h-4 w-4" />
              <span className="text-sm">Audio Tools</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm">Notifications</span>
          </Button>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-4 border-t border-border">
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
      </div>
    </aside>
  );
}
