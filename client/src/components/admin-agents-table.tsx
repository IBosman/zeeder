import { useEffect, useState } from "react";
import AgentsTableUI, { Agent } from "./agents-table-ui";

export default function AdminAgentsTable({ searchQuery }: { searchQuery: string }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAgents() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/agents", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch agents: ${res.status}`);
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAllAgents();
  }, []);

  if (loading) return <div className="p-6">Loading agents...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return <AgentsTableUI agents={agents} searchQuery={searchQuery} showAgentId />;
} 