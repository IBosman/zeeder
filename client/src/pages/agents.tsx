import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import UserAgentsTable from "@/components/user-agents-table";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Page Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Agents</h1>
              <p className="text-sm text-muted-foreground mt-1">Create and manage your AI agents</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
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

          {/* Agents Table */}
          <UserAgentsTable searchQuery={searchQuery} />
        </div>
      </main>

    </div>
  );
}
