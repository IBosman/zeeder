import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Link } from "wouter";

export interface Agent {
  name: string;
  agent_id?: string; // ElevenLabs (admin)
  elevenlabsAgentId?: string; // User-assigned
  id?: number; // Local DB
  createdBy?: string;
  createdAt?: string;
  metadata?: { created_at_unix_secs?: number };
}

export default function AgentsTableUI({
  agents,
  searchQuery,
  showAgentId = false,
}: {
  agents: Agent[];
  searchQuery: string;
  showAgentId?: boolean;
}) {
  const filteredAgents = agents.filter(agent =>
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string | number | undefined) => {
    if (!date) return "-";
    const d = typeof date === "number" ? new Date(date) : new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted border-b border-border hover:bg-muted">
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Name
            </TableHead>
            {showAgentId && (
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                Agent ID
              </TableHead>
            )}
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Created at
            </TableHead>
            <TableHead className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAgents.map((agent) => (
            <TableRow key={agent.agent_id || agent.id}>
              <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                {agent.elevenlabsAgentId || agent.agent_id || agent.id ? (
                  <Link href={`/agent/${agent.elevenlabsAgentId || agent.agent_id || agent.id}`} className="hover:text-primary cursor-pointer">
                    {agent.name}
                  </Link>
                ) : (
                  agent.name
                )}
              </TableCell>
              {showAgentId && (
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {agent.agent_id}
                </TableCell>
              )}
              <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                {agent.metadata?.created_at_unix_secs
                  ? formatDate(agent.metadata.created_at_unix_secs * 1000)
                  : agent.createdAt
                  ? formatDate(agent.createdAt)
                  : "-"}
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