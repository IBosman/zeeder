import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AgentsTableSkeletonProps {
  rowCount?: number;
  showAgentId?: boolean;
}

export function AgentsTableSkeleton({ rowCount = 5, showAgentId = false }: AgentsTableSkeletonProps) {
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
          {Array(rowCount).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="px-6 py-4">
                <Skeleton className="h-5 w-[180px]" />
              </TableCell>
              {showAgentId && (
                <TableCell className="px-6 py-4">
                  <Skeleton className="h-5 w-[120px]" />
                </TableCell>
              )}
              <TableCell className="px-6 py-4">
                <Skeleton className="h-5 w-[140px]" />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
