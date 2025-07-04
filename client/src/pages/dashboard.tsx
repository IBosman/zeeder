import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import AgentsTable from "@/components/agents-table";
import AudioControls from "@/components/audio-controls";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Top Notification Bar */}
        {showNotification && (
          <div className="bg-yellow-600 text-black px-4 py-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium">⚠️ [Action Needed]</span>
              <span>Tools have migrated.</span>
              <button className="underline hover:no-underline">
                Look what's changing when creating agents via API
              </button>
              <button 
                className="ml-auto hover:text-gray-800 px-2 py-1 rounded"
                onClick={() => setShowNotification(false)}
              >
                Acknowledge
              </button>
              <button 
                className="hover:text-gray-800 p-1"
                onClick={() => setShowNotification(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Agents</h1>
              <p className="text-sm text-muted-foreground mt-1">Create and manage your AI agents</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" className="bg-muted hover:bg-muted/80">
                Playground
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New agent
              </Button>
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
          <AgentsTable searchQuery={searchQuery} />
        </div>
      </main>

      {/* Audio Controls */}
      <AudioControls />
    </div>
  );
}
