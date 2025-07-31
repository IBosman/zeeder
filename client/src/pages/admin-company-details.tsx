import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle, RefreshCw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Voice {
  voiceId: string;
  name: string;
  category: string;
  createdAt: string;
}

interface CompanyVoice {
  companyId: number;
  voiceId: string;
  voice: Voice;
}

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  updatedAt: string | null;
  companyId: number;
}

interface Agent {
  id: number;
  name: string;
  elevenlabsAgentId: string;
  companyId: number;
  createdAt: string;
  updatedAt: string | null;
}

interface CompanyUser {
  companyId: number;
  userId: number;
  user: User;
}

interface Company {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCompanyDetails() {
  const [matches, params] = useRoute("/admin/companies/:id");
  const [, setLocation] = useLocation();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [voices, setVoices] = useState<CompanyVoice[]>([]);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Agent state variables
  const [agents, setAgents] = useState<Agent[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const companyId = params?.id;

  useEffect(() => {
    if (companyId) {
      const companyIdNum = parseInt(companyId, 10);
      fetchCompany(companyIdNum);
      fetchCompanyVoices(companyIdNum);
      fetchAvailableVoices();
      fetchCompanyUsers(companyIdNum);
      fetchAvailableUsers();
      fetchCompanyAgents(companyIdNum);
      fetchAvailableAgents();
    }
  }, [companyId]);

  const fetchCompanyUsers = async (companyId: number) => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`/api/companies/${companyId}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company users");
      }

      const data = await response.json();
      if (data.success) {
        // Transform the users array into the expected CompanyUser format
        const companyUsers = data.users.map((user: User) => ({
          companyId: user.companyId,
          userId: user.id,
          user
        }));
        setUsers(companyUsers);
      }
    } catch (error) {
      console.error("Error fetching company users:", error);
      toast.error("Failed to load company users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available users");
      }

      const data = await response.json();
      // The API returns users directly without a success property
      if (data.users) {
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
      toast.error("Failed to load available users");
    }
  };
  
  // Helper function to get users that can be assigned to this company
  const getAssignableUsers = () => {
    return availableUsers.filter(user => 
      // User is not already assigned to this company
      !users.some(u => u.userId === user.id) && 
      // User is not assigned to any company (companyId === 0 or null)
      (user.companyId === 0 || user.companyId === null)
    );
  };

  const handleAddUser = async () => {
    if (!selectedUserId || !companyId) return;

    try {
      const response = await fetch(`/api/companies/${companyId}/users/${selectedUserId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user to company");
      }

      const data = await response.json();
      if (data.success && data.user) {
        // Add the new user to the users list in the expected format
        const newCompanyUser = {
          companyId: parseInt(companyId, 10),
          userId: data.user.id,
          user: data.user
        };
        setUsers([...users, newCompanyUser]);
      } else {
        // Refresh the company users list as fallback
        fetchCompanyUsers(parseInt(companyId, 10));
      }
      
      // Reset selection
      setSelectedUserId(null);
      
      toast.success("User added to company successfully");
    } catch (error: any) {
      console.error("Error adding user to company:", error);
      toast.error(error.message || "Failed to add user to company");
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!companyId) return;

    try {
      const response = await fetch(
        `/api/companies/${companyId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove user from company");
      }

      const data = await response.json();
      if (data.success) {
        // Remove the user from the local state
        setUsers(users.filter(u => u.userId !== userId));
        toast.success("User removed from company successfully");
      } else {
        // Fallback to fetching the updated list
        await fetchCompanyUsers(parseInt(companyId, 10));
      }
    } catch (error: any) {
      console.error("Error removing user from company:", error);
      toast.error(error.message || "Failed to remove user from company");
    }
  };

  const fetchCompany = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }

      const data = await response.json();
      if (data.success && data.company) {
        setCompany(data.company);
        setEditName(data.company.name);
        setEditActive(data.company.active);
      }
    } catch (error) {
      console.error("Error fetching company:", error);
      setError("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyVoices = async (companyId: number) => {
    try {
      setLoadingVoices(true);
      const response = await fetch(`/api/companies/${companyId}/voices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company voices");
      }

      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error("Error fetching company voices:", error);
      toast.error("Failed to load company voices");
    } finally {
      setLoadingVoices(false);
    }
  };

  const fetchAvailableVoices = async () => {
    try {
      const response = await fetch("/api/admin/voices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available voices");
      }

      const data = await response.json();
      if (data.success) {
        setAvailableVoices(data.voices);
      }
    } catch (error) {
      console.error("Error fetching available voices:", error);
      toast.error("Failed to load available voices");
    }
  };

  const handleAddVoice = async () => {
    if (!selectedVoiceId || !companyId) return;

    try {
      const response = await fetch(
        `/api/companies/${companyId}/voices/${selectedVoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add voice to company");
      }

      const data = await response.json();
      if (data.success) {
        await fetchCompanyVoices(parseInt(companyId, 10));
        setSelectedVoiceId("");
        toast.success("Voice added to company successfully");
      }
    } catch (error) {
      console.error("Error adding voice to company:", error);
      toast.error("Failed to add voice to company");
    }
  };

  const handleRemoveVoice = async (voiceId: string) => {
    if (!companyId) return;

    try {
      const response = await fetch(
        `/api/companies/${companyId}/voices/${voiceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove voice from company");
      }

      const data = await response.json();
      if (data.success) {
        await fetchCompanyVoices(parseInt(companyId, 10));
        toast.success("Voice removed from company successfully");
      }
    } catch (error) {
      console.error("Error removing voice from company:", error);
      toast.error("Failed to remove voice from company");
    }
  };

  const fetchCompanyAgents = async (companyId: number) => {
    try {
      setLoadingAgents(true);
      const response = await fetch(`/api/companies/${companyId}/agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company agents");
      }

      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching company agents:", error);
      toast.error("Failed to load company agents");
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchAvailableAgents = async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/agents/unassigned/${companyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available agents");
      }

      const data = await response.json();
      if (data.success) {
        setAvailableAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching available agents:", error);
      toast.error("Failed to load available agents");
    }
  };

  const handleAddAgent = async () => {
    if (!selectedAgentId || !companyId) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/agents/${selectedAgentId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add agent");
      }
      
      const data = await response.json();
      if (data.success) {
        // Refresh the agents list
        fetchCompanyAgents(parseInt(companyId, 10));
        toast.success("Agent added successfully");
        setSelectedAgentId(null);
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      toast.error("Failed to add agent");
    }
  };

  const handleRemoveAgent = async (agentId: number) => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/agents/${agentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove agent");
      }
      
      const data = await response.json();
      if (data.success) {
        // Refresh the agents list
        fetchCompanyAgents(parseInt(companyId, 10));
        toast.success("Agent removed successfully");
      }
    } catch (error) {
      console.error("Error removing agent:", error);
      toast.error("Failed to remove agent");
    }
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          active: editActive,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCompany(data.company);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Company</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested company could not be found.</p>
          <Button onClick={() => setLocation("/admin/companies")}> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/admin/companies")}> 
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Company Details</h1>
            <p className="text-sm text-muted-foreground">
              Manage {company.name || "this company"}'s information
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Edit company details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-muted border-border mt-1"
                    autoComplete="off"
                  />
                </div>
                <Label htmlFor="id">ID</Label>
                <br></br>
                <Badge>{company.id}</Badge>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                {saveError && <span className="text-xs text-red-500">{saveError}</span>}
                {saveSuccess && <span className="text-xs text-green-600">Saved!</span>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Assigned Voices</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedVoiceId} 
                      onValueChange={setSelectedVoiceId}
                      disabled={loadingVoices || availableVoices.length === 0}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a voice to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVoices
  .filter(voice => {
    if (!voice || !voice.voiceId) return false;
    // Gather all assigned voice ids, robust to both direct and nested voice objects
    const assignedIds = voices.map(v => {
      if (!v) return null;
      if (v.voice && v.voice.voiceId) return v.voice.voiceId;
      if (v.voiceId) return v.voiceId;
      return null;
    }).filter(Boolean);
    const thisVoiceId = voice.voiceId;
    return !assignedIds.includes(thisVoiceId);
  })
  .map((voice) => (
    <SelectItem key={voice.voiceId || 'unknown'} value={voice.voiceId || 'unknown'}>
      {voice.name || 'Unknown Voice'} ({voice.category || 'No category'})
    </SelectItem>
  ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={handleAddVoice}
                      disabled={!selectedVoiceId || loadingVoices}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Voice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingVoices && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!loadingVoices && voices.length > 0 && (
                  <div className="border rounded-lg overflow-hidden mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Voice ID</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {voices.map((v) => {
                          // Support both CompanyVoice and Voice shapes
                          const voice = v.voice || v;
                          return (
                            <TableRow key={voice.voiceId || voice.voice_id}>
                              <TableCell>{voice.name || 'Unknown Voice'}</TableCell>
                              <TableCell>{voice.category || 'Custom'}</TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">{voice.voiceId || voice.voice_id}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveVoice(voice.voiceId || voice.voice_id)}
                                  title="Remove voice"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {!loadingVoices && voices.length === 0 && (
                  <div className="text-sm text-muted-foreground pt-2">
                    Use the dropdown above to add voices to this company
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assigned Users Section */}
          <div className="mt-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Assigned Users</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedUserId?.toString() || ""}
                      onValueChange={(value) => setSelectedUserId(parseInt(value, 10))}
                      disabled={loadingUsers}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a user to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers
                          .filter(user => !users.some(u => u.userId === user.id))
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username} ({user.email || 'No email'})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={handleAddUser}
                      disabled={!selectedUserId || loadingUsers}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users assigned to this company yet.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(({ user }) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveUser(user.id)}
                                disabled={loadingUsers}
                                title="Remove user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assigned Agents Section */}
          <div className="mt-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Assigned Agents</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedAgentId?.toString() || ""}
                      onValueChange={(value) => setSelectedAgentId(parseInt(value, 10))}
                      disabled={loadingAgents}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select an agent to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name} ({agent.elevenlabsAgentId || 'No ElevenLabs ID'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={handleAddAgent}
                      disabled={!selectedAgentId || loadingAgents}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Agent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAgents ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No agents assigned to this company yet.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ElevenLabs ID</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell className="font-medium">
                              {agent.name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {agent.elevenlabsAgentId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveAgent(agent.id)}
                                disabled={loadingAgents}
                                title="Remove agent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
