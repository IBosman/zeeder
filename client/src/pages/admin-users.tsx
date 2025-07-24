import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, Link } from "wouter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('role') !== 'admin') {
      setLocation('/login');
    }
  }, [setLocation]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/users", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDeleteUser(userId: number) {
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete user: ${res.status}`);
      }
      // Refresh users list
      setUsers(users => users.filter(u => u.id !== userId));
      setDeleteDialogOpen(null);
    } catch (err: any) {
      setDeleteError(err.message || "Unknown error");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* Page Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Users</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your users</p>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>
          {/* Users Table */}
          {loading ? (
            <div className="p-6">Loading users...</div>
          ) : error ? (
            <div className="p-6 text-red-500">{error}</div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted border-b border-border hover:bg-muted">
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      ID
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Username
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                      <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                        {user.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        <Link href={`/admin/users/${user.id}`} className="hover:text-primary cursor-pointer">
                          {user.username}
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                        {user.role}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/admin/users/${user.id}`)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id.toString())}>
                              Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteDialogOpen(user.id)}>
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialog open={deleteDialogOpen === user.id} onOpenChange={open => !open && setDeleteDialogOpen(null)}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                The user will be removed, and you will no longer be able to use the user ID,
                                <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">{user.id}</code>, via the API.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteDialogOpen(null)}>Back</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteUser(user.id)}>Delete user</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 