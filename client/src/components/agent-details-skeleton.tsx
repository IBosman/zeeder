import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface AgentDetailsSkeletonProps {
  isAdmin?: boolean;
}

export function AgentDetailsSkeleton({ isAdmin = false }: AgentDetailsSkeletonProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Agent Info Skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
          </div>
        </div>
      </div>

      {/* Company Assignment Skeleton - Only for admins */}
      {isAdmin && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <span role="img" aria-label="assigned company">🏢</span> Assigned Company
            </CardTitle>
            <Skeleton className="h-4 w-48" /> {/* Description text */}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[220px]" /> {/* Select dropdown */}
              <Skeleton className="h-10 w-24" /> {/* Button */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Selection Skeleton */}
      <h2 className="text-lg font-medium text-foreground mt-6">Agent</h2>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Voice</CardTitle>
          <Skeleton className="h-4 w-64" /> {/* Description text */}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[220px]" /> {/* Select dropdown */}
            <Skeleton className="h-10 w-24" /> {/* Listen button */}
            <Skeleton className="h-10 w-24" /> {/* Save button */}
          </div>
        </CardContent>
      </Card>

      {/* First Message Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">First message</CardTitle>
          <Skeleton className="h-4 w-3/4" /> {/* Description text */}
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" /> {/* Input field */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" /> {/* Save button */}
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">System prompt</CardTitle>
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-3/4" /> {/* Description text */}
            <Skeleton className="h-4 w-24" /> {/* Learn more link */}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-[120px] w-full" /> {/* Textarea */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" /> {/* Save button */}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium text-foreground">Agent knowledge base</CardTitle>
          <Skeleton className="h-4 w-3/4" /> {/* Description text */}
          <div className="absolute top-6 right-6">
            <Skeleton className="h-8 w-32" /> {/* Add document button */}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" /> {/* Empty state or document list */}
        </CardContent>
      </Card>

      {/* Tools Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Tools</CardTitle>
          <Skeleton className="h-4 w-64" /> {/* Description text */}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tool switches */}
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-1" /> {/* Tool name */}
                <Skeleton className="h-4 w-64" /> {/* Tool description */}
              </div>
              <Skeleton className="h-6 w-12" /> {/* Switch */}
            </div>
          ))}
          
          {/* Custom Tools Section */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-5 w-32 mb-1" /> {/* Section title */}
                <Skeleton className="h-4 w-64" /> {/* Section description */}
              </div>
              <Skeleton className="h-8 w-24" /> {/* Add tool button */}
            </div>
            <Skeleton className="h-16 w-full" /> {/* Custom tools list */}
          </div>
          
          {/* Save tools button */}
          <div className="flex items-center space-x-2 pt-2">
            <Skeleton className="h-8 w-20" /> {/* Save button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
