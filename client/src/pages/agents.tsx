import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import UserAgentsTable from "@/components/user-agents-table";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-4 md:pl-8 md:pr-8 py-4 md:py-6 border-b border-border sticky top-0 z-30 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your AI agents and their configurations</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <UserAgentsTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
