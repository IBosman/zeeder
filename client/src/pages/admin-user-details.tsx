import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Mail, Phone, Globe } from "lucide-react";

export default function AdminUserDetailsPage() {
  const [match, params] = useRoute("/admin/users/:id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('role') !== 'admin') {
      setLocation('/login');
    }
  }, [setLocation]);

  useEffect(() => {
    async function fetchUser() {
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
        const found = (data.users || []).find((u: any) => String(u.id) === params?.id);
        if (!found) throw new Error("User not found");
        setUser(found);
        setEditUsername(found.username || "");
        setEditEmail(found.email || "");
        setEditRole(found.role || "user");
        setEditPassword("");
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (params?.id) fetchUser();
  }, [params?.id]);

  useEffect(() => {
    async function fetchUserCompany() {
      if (!params?.id) return;
      setCompanyLoading(true);
      setCompanyError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/admin/user-company/${params.id}`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch company: ${res.status}`);
        const data = await res.json();
        setCompany(data.company || null);
      } catch (err: any) {
        setCompanyError(err.message || "Unknown error");
      } finally {
        setCompanyLoading(false);
      }
    }
    fetchUserCompany();
  }, [params?.id]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const body: any = {};
      if (editUsername !== user.username) body.username = editUsername;
      if (editEmail !== user.email) body.email = editEmail;
      if (editRole !== user.role) body.role = editRole;
      if (editPassword) body.password = editPassword;
      if (Object.keys(body).length === 0) {
        setSaveError("No changes to save.");
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to save: ${res.status}`);
      }
      setSaveSuccess(true);
      setUser({ ...user, ...body });
      setEditPassword("");
    } catch (err: any) {
      setSaveError(err.message || "Unknown error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/admin/users" className="hover:text-foreground">Users</Link>
              <span>&gt;</span>
              <span className="text-foreground">{user?.username || "User"}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* User Info */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">{user?.username || "User"}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-muted">
                  {user?.id}
                </Badge>
              </div>
            </div>
            <Separator className="bg-border" />
            {loading ? (
              <div className="p-6">Loading user details...</div>
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-foreground">Edit user details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editUsername}
                          onChange={e => setEditUsername(e.target.value)}
                          className="bg-muted border-border mt-1"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="bg-muted border-border mt-1"
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={editPassword}
                          onChange={e => setEditPassword(e.target.value)}
                          className="bg-muted border-border mt-1"
                          placeholder="Set new password"
                          autoComplete="new-password"
                        />
                        <div className="text-xs text-muted-foreground mt-1">Leave blank to keep current password.</div>
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={editRole} onValueChange={setEditRole}>
                          <SelectTrigger className="bg-muted border-border mt-1">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      {saveError && <span className="text-xs text-red-500">{saveError}</span>}
                      {saveSuccess && <span className="text-xs text-green-600">Saved!</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Company Information */}
            <div className="mt-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {companyLoading ? (
                    <div className="p-4">Loading company information...</div>
                  ) : companyError ? (
                    <div className="p-4 text-red-500">{companyError}</div>
                  ) : !company ? (
                    <div className="p-4 text-muted-foreground">No company assigned to this user.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{company.name}</h3>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 