import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Copy, MoreHorizontal, Bot, ChevronLeft, FileText, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AgentDetails() {
  const [match, params] = useRoute("/agent/:id");
  const [firstMessage, setFirstMessage] = useState("Hey there, I'm Alexis from ElevenLabs support. How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are interacting with a user who has initiated a spoken conversation directly from the ElevenLabs website.");
  const [useRAG, setUseRAG] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tool switches
  const [endCall, setEndCall] = useState(false);
  const [detectLanguage, setDetectLanguage] = useState(false);
  const [skipTurn, setSkipTurn] = useState(false);
  const [transferToAgent, setTransferToAgent] = useState(false);
  const [transferToNumber, setTransferToNumber] = useState(false);
  const [playKeypedTone, setPlayKeypedTone] = useState(false);

  // Add tool save state
  const [savingTools, setSavingTools] = useState(false);
  const [saveErrorTools, setSaveErrorTools] = useState<string | null>(null);

  // Tool definitions for toggling
  const TOOL_DEFS = [
    {
      name: "end_call",
      description: "",
      response_timeout_secs: 20,
      type: "system",
      params: { system_tool_type: "end_call" }
    },
    {
      name: "language_detection",
      description: "",
      response_timeout_secs: 20,
      type: "system",
      params: { system_tool_type: "language_detection" }
    },
    {
      name: "skip_turn",
      description: "",
      response_timeout_secs: 20,
      type: "system",
      params: { system_tool_type: "skip_turn" }
    },
    {
      name: "play_keypad_touch_tone",
      description: "",
      response_timeout_secs: 20,
      type: "system",
      params: { system_tool_type: "play_keypad_touch_tone" }
    }
  ];

  function getEnabledTools() {
    return TOOL_DEFS.filter((tool) => {
      if (tool.name === "end_call") return endCall;
      if (tool.name === "language_detection") return detectLanguage;
      if (tool.name === "skip_turn") return skipTurn;
      if (tool.name === "play_keypad_touch_tone") return playKeypedTone;
      return false;
    });
  }

  async function saveTools() {
    setSavingTools(true);
    setSaveErrorTools(null);
    try {
      const token = localStorage.getItem("token");
      const tools = getEnabledTools();
      const res = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tools })
      });
      if (!res.ok) throw new Error(`Failed to save tools: ${res.status}`);
    } catch (err: any) {
      setSaveErrorTools(err.message || "Unknown error");
    } finally {
      setSavingTools(false);
    }
  }

  const [savingFirstMessage, setSavingFirstMessage] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [saveErrorFirstMessage, setSaveErrorFirstMessage] = useState<string | null>(null);
  const [saveErrorPrompt, setSaveErrorPrompt] = useState<string | null>(null);
  const firstMessageInputRef = useRef<HTMLInputElement>(null);
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [agentName, setAgentName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState<{ id: string; name: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'admin';
  const [createdBy, setCreatedBy] = useState<string>("");

  // Fetch all users for assignment dropdown (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    setUsersLoading(true);
    setUsersError(null);
    fetch("/api/admin/users", {
      headers: {
        "Authorization": localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        "Content-Type": "application/json"
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        return res.json();
      })
      .then(data => setUsers(data.users || []))
      .catch(err => setUsersError(err.message || "Unknown error"))
      .finally(() => setUsersLoading(false));
  }, [isAdmin]);

  // Fetch assigned user from agent details (if present)
  useEffect(() => {
    if (!params?.id) return;
    async function fetchAssignment() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/agents/${params?.id}/details`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.userId || data.user_id || data.assignedUserId) {
          setAssignedUserId(String(data.userId || data.user_id || data.assignedUserId));
        }
      } catch {}
    }
    fetchAssignment();
  }, [params?.id]);

  async function handleAssignUser(newUserId: string) {
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const currentAdmin = localStorage.getItem("username") || "admin";
      const body = {
        userId: newUserId,
        name: agentName,
        elevenlabsAgentId: agentId || params?.id,
        createdBy: createdBy || currentAdmin // fallback if missing
      };
      const res = await fetch("/api/admin/assign-agent", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to assign: ${res.status}`);
      }
      setAssignedUserId(newUserId);
      setAssignSuccess(true);
      setTimeout(() => setAssignSuccess(false), 2000);
    } catch (err: any) {
      setAssignError(err.message || "Unknown error");
    } finally {
      setAssigning(false);
    }
  }

  function handleAddDocumentClick() {
    setUploadError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/epub+zip", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/html"];
    const allowedExts = ["pdf", "epub", "docx", "txt", "html"];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && (!ext || !allowedExts.includes(ext))) {
      setUploadError("File type not supported. Allowed: pdf, epub, docx, txt, html");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`/api/agents/${params?.id}/knowledge-base/file`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: formData,
      });
      if (!uploadRes.ok) {
        let msg = "Failed to upload file to LeadsGPT";
        try {
          const errData = await uploadRes.json();
          if (errData && errData.message) msg += ": " + errData.message;
        } catch {}
        throw new Error(msg);
      }
      const uploadData = await uploadRes.json();
      const newKnowledgeBase = [
        ...knowledgeBase,
        { type: "file", id: uploadData.id, name: uploadData.name, usage_mode: "prompt" },
      ];
      const patchRes = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ knowledgeBase: newKnowledgeBase })
      });
      if (!patchRes.ok) throw new Error("Failed to update agent knowledge base");
      setKnowledgeBase(newKnowledgeBase);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file to LeadsGPT");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(fileId: string) {
    setDeleteError(null);
    setDeletingId(fileId);
    try {
      const newKnowledgeBase = knowledgeBase.filter((file) => file.id !== fileId);
      const token = localStorage.getItem("token");
      const patchRes = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ knowledgeBase: newKnowledgeBase })
      });
      if (!patchRes.ok) throw new Error("Failed to update agent knowledge base");
      // Now delete the file from ElevenLabs knowledge base via backend
      const deleteRes = await fetch(`/api/agents/${params?.id}/knowledge-base/${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        },
      });
      if (!deleteRes.ok) throw new Error("File removed from agent, but failed to delete from storage");
      setKnowledgeBase(newKnowledgeBase);
    } catch (err: any) {
      setDeleteError(err.message || "Unknown error");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    async function fetchAgentDetails() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/agents/${params?.id}/details`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch agent: ${res.status}`);
        const data = await res.json();
        setFirstMessage(data.firstMessage || "");
        setSystemPrompt(data.systemPrompt || "");
        setKnowledgeBase(Array.isArray(data.knowledgeBase) ? data.knowledgeBase : []);
        setAgentName(data.name || "");
        setAgentId(data.elevenlabsAgentId || data.agentId || params?.id || "");
        setCreatedBy(data.createdBy || "");
        if (Array.isArray(data.tools)) {
          setEndCall(!!data.tools.find((t: any) => t.name === "end_call"));
          setDetectLanguage(!!data.tools.find((t: any) => t.name === "language_detection"));
          setSkipTurn(!!data.tools.find((t: any) => t.name === "skip_turn"));
          setPlayKeypedTone(!!data.tools.find((t: any) => t.name === "play_keypad_touch_tone"));
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (params?.id) fetchAgentDetails();
  }, [params?.id]);

  async function saveFirstMessage() {
    setSavingFirstMessage(true);
    setSaveErrorFirstMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstMessage })
      });
      if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
    } catch (err: any) {
      setSaveErrorFirstMessage(err.message || "Unknown error");
    } finally {
      setSavingFirstMessage(false);
    }
  }

  async function saveSystemPrompt() {
    setSavingPrompt(true);
    setSaveErrorPrompt(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ systemPrompt })
      });
      if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
    } catch (err: any) {
      setSaveErrorPrompt(err.message || "Unknown error");
    } finally {
      setSavingPrompt(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href={isAdmin ? "/admin/agents" : "/"} className="hover:text-foreground">Agents</Link>
                <span>&gt;</span>
                <span className="text-foreground">{agentName || "Agent"}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Agent Info */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">{agentName || "Agent"}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-muted">
                  {agentId}
                </Badge>
              </div>
            </div>

            {/* Admin Assignment Control */}
            {isAdmin && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span role="img" aria-label="assigned user">🧑‍🤝‍🧑</span> Assigned User
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">This agent is assigned to:</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {usersLoading ? (
                    <div>Loading users...</div>
                  ) : usersError ? (
                    <div className="text-red-500 text-xs">{usersError}</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={assignedUserId || ""}
                        onValueChange={setAssignedUserId}
                        disabled={assigning}
                      >
                        <SelectTrigger className="bg-muted border-border min-w-[220px]">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem
                              key={user.id}
                              value={String(user.id)}
                              disabled={user.id === assignedUserId}
                            >
                              {user.username} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignedUserId && handleAssignUser(assignedUserId)}
                        disabled={assigning || !assignedUserId}
                      >
                        {assigning ? "Assigning..." : "Assign"}
                      </Button>
                      {assignError && <span className="text-xs text-red-500">{assignError}</span>}
                      {assignSuccess && <span className="text-xs text-green-600">Assigned!</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator className="bg-border" />

            {loading ? (
              <div className="p-6">Loading agent details...</div>
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
            {/* Agent Section */}
              <h2 className="text-lg font-medium text-foreground">Agent</h2>
              
              {/* First Message */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">First message</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    The first message the agent will say. If empty, the agent will wait for the user to start the conversation.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                      ref={firstMessageInputRef}
                      value={firstMessage}
                      onChange={e => setFirstMessage(e.target.value)}
                      className="bg-muted border-border"
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveFirstMessage}
                        disabled={savingFirstMessage}
                      >
                        {savingFirstMessage ? "Saving..." : "Save"}
                      </Button>
                      {saveErrorFirstMessage && <span className="text-xs text-red-500">{saveErrorFirstMessage}</span>}
                  </div>
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">System prompt</CardTitle>
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-muted-foreground">
                      The system prompt is used to determine the persona of the agent and the context of the conversation.
                    </p>
                    <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto">
                      Learn more
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                      ref={systemPromptTextareaRef}
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      className="bg-muted border-border min-h-[120px]"
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveSystemPrompt}
                        disabled={savingPrompt}
                      >
                        {savingPrompt ? "Saving..." : "Save"}
                      </Button>
                      {saveErrorPrompt && <span className="text-xs text-red-500">{saveErrorPrompt}</span>}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Knowledge Base */}
              <Card className="bg-card border-border">
                  <CardHeader className="relative">
                  <CardTitle className="text-sm font-medium text-foreground">Agent knowledge base</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Provide the LLM with domain-specific information to help it answer questions more accurately.
                  </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-6 right-6"
                      onClick={handleAddDocumentClick}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Add document"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.epub,.docx,.txt,.html"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {uploadError && <div className="absolute right-6 top-16 text-xs text-red-500">{uploadError}</div>}
                </CardHeader>
                <CardContent>
                    {knowledgeBase.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No documents added yet.</div>
                    ) : (
                      <div className="bg-muted/10 border border-border rounded-xl p-3 flex flex-col gap-2">
                        {knowledgeBase.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FileText className="text-muted-foreground" />
                              <span className="text-sm text-foreground">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={deletingId === file.id}
                            >
                              {deletingId === file.id ? (
                                <span className="w-5 h-5 animate-spin border-2 border-t-transparent border-destructive rounded-full inline-block" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                  </Button>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Tools */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-foreground">Tools</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Let the agent perform specific actions.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* End call */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">End call</h4>
                      <p className="text-xs text-muted-foreground">Gives agent the ability to end the call with the user.</p>
                    </div>
                    <Switch
                      checked={endCall}
                      onCheckedChange={setEndCall}
                    />
                  </div>

                  {/* Detect language */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Detect language</h4>
                      <p className="text-xs text-muted-foreground">Gives agent the ability to change the language during conversation.</p>
                    </div>
                    <Switch
                      checked={detectLanguage}
                      onCheckedChange={setDetectLanguage}
                    />
                  </div>

                  {/* Skip turn */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Skip turn</h4>
                      <p className="text-xs text-muted-foreground">Agent will skip its turn if user explicitly indicates they need a moment.</p>
                    </div>
                    <Switch
                      checked={skipTurn}
                      onCheckedChange={setSkipTurn}
                    />
                  </div>

                  {/* Transfer to agent */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Transfer to agent</h4>
                      <p className="text-xs text-muted-foreground">Gives agent the ability to transfer the call to another AI agent.</p>
                    </div>
                    <Switch
                      checked={transferToAgent}
                      onCheckedChange={setTransferToAgent}
                    />
                  </div>

                  {/* Transfer to number */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Transfer to number</h4>
                      <p className="text-xs text-muted-foreground">Gives agent the ability to transfer the call to a human.</p>
                    </div>
                    <Switch
                      checked={transferToNumber}
                      onCheckedChange={setTransferToNumber}
                    />
                  </div>

                  {/* Play keypad touch tone */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Play keypad touch tone</h4>
                      <p className="text-xs text-muted-foreground">Gives agent the ability to play keypad touch tones during a phone call.</p>
                    </div>
                    <Switch
                      checked={playKeypedTone}
                      onCheckedChange={setPlayKeypedTone}
                    />
                  </div>
                  {/* Save tools button */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveTools}
                      disabled={savingTools}
                    >
                      {savingTools ? "Saving..." : "Save"}
                    </Button>
                    {saveErrorTools && <span className="text-xs text-red-500">{saveErrorTools}</span>}
                  </div>
                </CardContent>
              </Card>
                    </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}