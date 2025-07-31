import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Building2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, Link } from "wouter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Add Company Dialog State
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [createCompanyError, setCreateCompanyError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('role') !== 'admin') {
      setLocation('/login');
    }
  }, [setLocation]);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/companies", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        
        // First, check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON but got:', text);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error response:', data);
          throw new Error(data.message || `Failed to fetch companies: ${response.status}`);
        }
        
        if (!data || !Array.isArray(data.companies)) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }
        
        setCompanies(data.companies);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError(err.message || "An unknown error occurred while fetching companies");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleCreateCompany() {
    if (!newCompanyName.trim()) return;
    
    setIsCreatingCompany(true);
    setCreateCompanyError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newCompanyName.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to create company: ${response.status}`);
      }
      
      // Add the new company to the list
      setCompanies([...companies, data]);
      
      // Close the dialog and reset form
      setAddCompanyDialogOpen(false);
      setNewCompanyName("");
      
      // Show success message
      toast.success(`Company "${newCompanyName}" created successfully`);
    } catch (err: any) {
      console.error('Error creating company:', err);
      setCreateCompanyError(err.message || "An unknown error occurred while creating the company");
    } finally {
      setIsCreatingCompany(false);
    }
  }

  async function handleDeleteCompany(companyId: number) {
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });
      
      // For 204 No Content responses, we don't need to parse JSON
      if (response.status === 204) {
        // Deletion successful
        setCompanies(companies => companies.filter(c => c.id !== companyId));
        setDeleteDialogOpen(null);
        toast.success("Company deleted successfully");
        return;
      }
      
      // For other responses, try to parse JSON if available
      let errorMessage = `Failed to delete company: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (!response.ok) {
            errorMessage = data.message || errorMessage;
            throw new Error(errorMessage);
          }
        } else if (!response.ok) {
          const text = await response.text();
          console.error('Expected JSON but got:', text);
          throw new Error('Server returned unexpected response');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error(errorMessage);
      }
      
      // If we get here and the response was ok, the deletion was successful
      if (response.ok) {
        setCompanies(companies => companies.filter(c => c.id !== companyId));
        setDeleteDialogOpen(null);
        toast.success("Company deleted successfully");
      }
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setDeleteError(err.message || "An unknown error occurred while deleting the company");
      toast.error(err.message || "Failed to delete company");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* Page Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Companies</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your companies</p>
            </div>
            <Dialog open={addCompanyDialogOpen} onOpenChange={setAddCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Company</DialogTitle>
                  <DialogDescription>
                    Enter the name for the new company.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="company-name" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="company-name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    className="mt-1"
                    autoFocus
                  />
                  {createCompanyError && (
                    <p className="text-sm text-destructive mt-2">{createCompanyError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddCompanyDialogOpen(false);
                      setNewCompanyName("");
                      setCreateCompanyError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCompany} 
                    disabled={!newCompanyName.trim() || isCreatingCompany}
                  >
                    {isCreatingCompany ? "Creating..." : "Create Company"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companies..."
                className="pl-10 w-full max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {/* Companies Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/admin/companies/${company.id}`}
                          className="flex items-center hover:text-primary hover:underline"
                        >
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(company.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/companies/${company.id}`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <AlertDialog
                              open={deleteDialogOpen === company.id}
                              onOpenChange={(open) => setDeleteDialogOpen(open ? company.id : null)}
                            >
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the company "{company.name}" and all associated data.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                {deleteError && (
                                  <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">
                                    {deleteError}
                                  </div>
                                )}
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCompany(company.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Company
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
