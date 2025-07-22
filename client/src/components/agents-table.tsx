import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { Link } from "wouter";

interface AgentApi {
  id: number;
  name: string;
  createdBy: string;
  userId: number;
  elevenlabsAgentId: string;
  createdAt: string;
}

interface AgentsTableProps {
  searchQuery: string;
}

export default function AgentsTable({ searchQuery }: AgentsTableProps) {
  const [agents, setAgents] = useState<AgentApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/agents", {
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
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.createdBy?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="p-6">Loading agents...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted border-b border-border hover:bg-muted">
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Created by
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>Created at</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAgents.map((agent: AgentApi) => (
            <TableRow key={agent.id} className="hover:bg-muted/50 transition-colors border-b border-border">
              <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                <Link href={`/agent/${agent.elevenlabsAgentId}`} className="hover:text-primary cursor-pointer">
                  {agent.name}
                </Link>
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                {agent.createdBy}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                {formatDate(agent.createdAt)}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
