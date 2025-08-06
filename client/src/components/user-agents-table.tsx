import { useEffect, useState } from "react";
import AgentsTableUI, { Agent } from "./agents-table-ui";
import { AgentsTableSkeleton } from "./agents-table-skeleton";

export default function UserAgentsTable({ searchQuery }: { searchQuery: string }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingSkeleton, setShowingSkeleton] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      setLoading(true);
      setShowingSkeleton(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/agents", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) {
          let errorMsg = `Failed to fetch agents: ${res.status}`;
          try {
            const data = await res.json();
            if (data && data.message) errorMsg = data.message;
          } catch {}
          throw new Error(errorMsg);
        }
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        // Ensure skeleton shows for at least 500ms for better UX
        const loadingStartTime = Date.now();
        const minLoadingTime = 500; // milliseconds
        const remainingTime = Math.max(0, minLoadingTime - (Date.now() - loadingStartTime));
        
        setTimeout(() => {
          setLoading(false);
          setShowingSkeleton(false);
        }, remainingTime);
      }
    }
    fetchAgents();
  }, []);

  if (showingSkeleton) return <AgentsTableSkeleton />;
  if (error) {
    if (error.includes("No agents assigned. Please contact your administrator.")) {
      return (
        <div className="bg-card rounded-lg border border-border p-6 text-yellow-600">
          No agents assigned. Please contact your administrator.
        </div>
      );
    }
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-red-500">
        {error}
      </div>
    );
  }

  return <AgentsTableUI agents={agents} searchQuery={searchQuery} />;
} 