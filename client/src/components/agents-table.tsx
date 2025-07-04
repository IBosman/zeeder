import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { Agent } from "@shared/schema";

interface AgentsTableProps {
  searchQuery: string;
}

export default function AgentsTable({ searchQuery }: AgentsTableProps) {
  // Mock data to match the screenshot
  const [agents] = useState<Agent[]>([
    {
      id: 1,
      name: "TEST 2",
      createdBy: "adrianjohnbrown@gmail.com",
      createdAt: new Date("2025-07-03T15:14:00"),
    },
    {
      id: 2,
      name: "Support agent",
      createdBy: "adrianjohnbrown@gmail.com",
      createdAt: new Date("2025-05-07T16:49:00"),
    },
  ]);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
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
          {filteredAgents.map((agent) => (
            <TableRow key={agent.id} className="hover:bg-muted/50 transition-colors border-b border-border">
              <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                {agent.name}
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
