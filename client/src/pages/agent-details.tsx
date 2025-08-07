import { useState, useEffect, useRef, JSX } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Copy, MoreHorizontal, Bot, ChevronLeft, FileText, Trash2, RefreshCw, X } from "lucide-react";
import { AgentDetailsSkeleton } from "@/components/agent-details-skeleton";
import { CustomToolSidebar } from "../components/custom-tool-sidebar";
import { Link } from "wouter";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AgentDetails() {
  const [match, params] = useRoute("/agent/:id");
  const [firstMessage, setFirstMessage] = useState("Hey there, I'm Alexis from ElevenLabs support. How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are interacting with a user who has initiated a spoken conversation directly from the ElevenLabs website.");
  const [useRAG, setUseRAG] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showingSkeleton, setShowingSkeleton] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneNumberLabel, setPhoneNumberLabel] = useState<string | null>(null);
  const [loadingPhoneNumber, setLoadingPhoneNumber] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  
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
  const [customTools, setCustomTools] = useState<any[]>([]);

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
  
  async function handleDeleteTool(toolName: string) {
    if (!confirm(`Are you sure you want to delete the "${toolName}" tool?`)) {
      return;
    }
    
    setSavingTools(true);
    setSaveErrorTools(null);
    try {
      const token = localStorage.getItem("token");
      
      // Get current agent details
      const detailsRes = await fetch(`/api/agents/${params?.id}/details`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      if (!detailsRes.ok) throw new Error(`Failed to fetch agent details: ${detailsRes.status}`);
      const agentData = await detailsRes.json();
      
      // Filter out the tool to delete
      const updatedTools = Array.isArray(agentData.tools) 
        ? agentData.tools.filter((t: any) => t.name !== toolName)
        : [];
      
      // Save the updated tools list
      const saveRes = await fetch(`/api/agents/${params?.id}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tools: updatedTools })
      });
      
      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(`Failed to save tools: ${saveRes.status}${errorData.elevenlabsError ? ' - ' + errorData.elevenlabsError : ''}${errorData.message ? ' - ' + errorData.message : ''}`);
      }
      
      // Update the custom tools list
      setCustomTools(customTools.filter(t => t.name !== toolName));
      
    } catch (err: any) {
      setSaveErrorTools(err.message || "Unknown error");
      alert("Error deleting tool: " + (err.message || "Unknown error"));
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
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [assignedCompanyId, setAssignedCompanyId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'admin';
  const [createdBy, setCreatedBy] = useState<string>("");

  const [voices, setVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [savingVoice, setSavingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCustomToolOpen, setIsCustomToolOpen] = useState(false);
  const [selectedCustomTool, setSelectedCustomTool] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all companies for assignment dropdown (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    setCompaniesLoading(true);
    setCompaniesError(null);
    fetch("/api/admin/companies", {
      headers: {
        "Authorization": localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        "Content-Type": "application/json"
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch companies: ${res.status}`);
        return res.json();
      })
      .then(data => setCompanies(data.companies || []))
      .catch(err => setCompaniesError(err.message || "Unknown error"))
      .finally(() => setCompaniesLoading(false));
  }, [isAdmin]);

  // Fetch available voices based on the assigned company
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        const token = localStorage.getItem("token");
        
        // If we have an assigned company, fetch only voices for that company
        if (assignedCompanyId) {
          try {
            const companyVoicesResponse = await fetch(`/api/companies/${assignedCompanyId}/voices`, {
              headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
              }
            });
            
            if (companyVoicesResponse.ok) {
              const data = await companyVoicesResponse.json();
              console.log('Company voices response:', data);
              
              if (data.success && Array.isArray(data.voices)) {
                const companyVoicesList = data.voices;
                
                if (companyVoicesList.length > 0) {
                  console.log('Using company-specific voices:', companyVoicesList);
                  setVoices(companyVoicesList);
                  
                  // Check if current selected voice is in the list
                  const voiceExists = companyVoicesList.some((v: any) => 
                    v.voice_id === selectedVoice
                  );
                  
                  if (!selectedVoice || !voiceExists) {
                    // Select the first available voice
                    setSelectedVoice(companyVoicesList[0].voice_id);
                  }
                  return;
                } else {
                  console.log('Company has no assigned voices');
                }
              } else {
                console.warn('Invalid response format from company voices API:', data);
              }
            } else {
              console.warn('Failed to fetch company voices:', await companyVoicesResponse.text());
            }
          } catch (err) {
            console.error('Error fetching company voices:', err);
          }
        }
        
        // If no company is assigned or the company has no voices, fall back to all voices
        // First check if the endpoint exists
        const response = await fetch("/api/voices", {
          method: 'HEAD',
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });

        // If endpoint doesn't exist, use a default voice
        if (response.status === 404) {
          console.log('Voices API endpoint not found, using default voice');
          const defaultVoice = {
            voice_id: 'default',
            name: 'Default Voice',
            preview_url: ''
          };
          setVoices([defaultVoice]);
          setSelectedVoice(defaultVoice.voice_id);
          return;
        }

        // If endpoint exists, fetch the actual data
        const dataResponse = await fetch("/api/voices", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });
        
        const responseText = await dataResponse.text();
        
        if (!dataResponse.ok) {
          console.error('Error response text:', responseText);
          // If we get HTML back, the endpoint might be misconfigured
          if (responseText.trim().startsWith('<!DOCTYPE html>')) {
            throw new Error('Voices API endpoint returned HTML instead of JSON. The endpoint might be misconfigured.');
          }
          throw new Error(`Failed to fetch voices (${dataResponse.status}): ${responseText}`);
        }
        
        // Parse the successful response
        try {
          const data = responseText ? JSON.parse(responseText) : {};
          console.log('Raw API response:', data);
          const voicesList = Array.isArray(data) ? data : (data.voices || []);
          console.log('Processed voices list:', voicesList);
          setVoices(voicesList);
          
          if (voicesList.length > 0 && !selectedVoice) {
            setSelectedVoice(voicesList[0].voice_id);
          }
        } catch (e) {
          console.error('Failed to parse response as JSON:', responseText);
          throw new Error('Invalid response format from server');
        }
      } catch (err: any) {
        console.error("Error fetching voices:", err);
        setVoiceError(err.message || "Failed to load voices");
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [assignedCompanyId, selectedVoice]);

  // Fetch assigned user from agent details (if present)
  useEffect(() => {
    if (!params?.id) return;
    async function fetchAssignment() {
      console.log('=== FETCH ASSIGNMENT STARTED ===');
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/agents/${params?.id}/details`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch agent details:', res.status);
          return;
        }
        const data = await res.json();
        const companyId = data.companyId || data.company_id || data.assignedCompanyId || "";
        console.log("Fetched company ID for agent:", companyId, "Raw data:", data);
        console.log('Setting assignedCompanyId state to:', companyId);
        setAssignedCompanyId(companyId);
      } catch (e) {
        console.error("Error in fetchAssignment:", e);
      }
      console.log('=== FETCH ASSIGNMENT COMPLETED ===');
    }
    fetchAssignment();
  }, [params?.id]);

  async function handleAssignCompany(newCompanyId: string) {
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const currentAdmin = localStorage.getItem("username") || "admin";
      const body = {
        companyId: newCompanyId,
        name: agentName,
        elevenlabsAgentId: agentId || params?.id,
        createdBy: createdBy || currentAdmin // fallback if missing
      };
      const res = await fetch("/api/admin/assign-agent-to-company", {
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
      setAssignedCompanyId(newCompanyId);
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

  // Implement the save functions directly
  const handleSaveFirstMessage = async () => {
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
  };

  const handleSaveSystemPrompt = async () => {
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
  };
  

  // Fetch available voices based on the assigned company
  const fetchVoices = async () => {
    console.log('=== FETCH VOICES STARTED ===');
    console.log('Current assignedCompanyId:', assignedCompanyId);
    console.log('Current selectedVoice:', selectedVoice);
    
    // Reset state at the beginning to ensure we're not showing stale data
    setVoices([]);
    setSelectedVoice("");
    setVoiceError("");
    setLoadingVoices(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Double check that we still have a valid company ID
      const currentCompanyId = assignedCompanyId;
      console.log('Double checking company ID before fetch:', currentCompanyId);
      
      // If we have an assigned company, fetch only voices for that company and DO NOT fall back to all voices
      if (
        currentCompanyId &&
        currentCompanyId !== "null" &&
        currentCompanyId !== "undefined" &&
        currentCompanyId !== ""
      ) {
        try {
          const apiUrl = `/api/companies/${currentCompanyId}/voices`;
          console.log('Fetching company voices from:', apiUrl);
          const companyVoicesResponse = await fetch(apiUrl, {
            headers: {
              "Authorization": token ? `Bearer ${token}` : "",
              "Content-Type": "application/json"
            }
          });
          
          if (companyVoicesResponse.ok) {
            const data = await companyVoicesResponse.json();
            console.log('Company voices response:', data);
            
            if (data.success && Array.isArray(data.voices)) {
              const companyVoicesList = data.voices;
              
              if (companyVoicesList.length > 0) {
                console.log('Using company-specific voices:', companyVoicesList);
                setVoices(companyVoicesList);
                
                // Check if current selected voice is in the list
                const voiceExists = companyVoicesList.some((v: any) => 
                  v.voice_id === selectedVoice
                );
                
                if (!selectedVoice || !voiceExists) {
                  // Select the first available voice
                  setSelectedVoice(companyVoicesList[0].voice_id);
                }
                setLoadingVoices(false);
                return;
              } else {
                console.log('Company has no assigned voices');
                setVoices([]);
                setSelectedVoice(""); // Clear selection when no voices
                setVoiceError("No voices assigned to this company");
                setLoadingVoices(false);
                return;
              }
            } else {
              console.warn('Invalid response format from company voices API:', data);
              setVoices([]);
              setSelectedVoice(""); // Clear selection when no voices
              return;
            }
          } else {
            console.warn('Failed to fetch company voices:', await companyVoicesResponse.text());
            setVoices([]);
            setSelectedVoice(""); // Clear selection when no voices
            return;
          }
        } catch (err) {
          console.error('Error fetching company voices:', err);
          setVoices([]);
          setSelectedVoice(""); // Clear selection when no voices
          return;
        }
      }
      
      // At this point, if we had a company ID but got here, something went wrong
      // We've already set voices to [] and selectedVoice to "" at the start of the function
      // So we just return and don't try to fetch all voices
      return;
      
      // IMPORTANT: We never want to fetch all voices when a company is assigned
      // If we got here, it means we either have no company assigned or something went wrong
      console.log('No company assigned or invalid company ID, not fetching any voices');
      setVoices([]);
      setSelectedVoice("");
      setVoiceError("Please assign a company to this agent first");
    } catch (err: any) {
      console.error("Error fetching voices:", err);
      setVoiceError(err.message || "Failed to load voices");
    } finally {
      setLoadingVoices(false);
      console.log('=== FETCH VOICES COMPLETED ===');
      console.log('Final voices state:', voices);
      console.log('Final selectedVoice state:', selectedVoice);
    }
  };

  // This effect runs whenever assignedCompanyId changes
  useEffect(() => {
    console.log('assignedCompanyId changed:', assignedCompanyId);
    
    // Clear previous state to avoid showing stale data
    setVoices([]);
    setSelectedVoice("");
    setVoiceError("");
    setLoadingVoices(true);
    
    if (
      assignedCompanyId &&
      assignedCompanyId !== "null" &&
      assignedCompanyId !== "undefined" &&
      assignedCompanyId !== ""
    ) {
      console.log('Valid company ID detected:', assignedCompanyId);
      console.log('Triggering fetchVoices with company ID');
      
      // Fetch voices immediately - we don't need a delay
      fetchVoices();
    } else {
      console.log('No valid assignedCompanyId, skipping fetchVoices. Current value:', assignedCompanyId);
      // Explicitly clear voices and selectedVoice when no company is assigned
      console.log('No company assigned, clearing voices and selectedVoice');
      setVoiceError("Please assign a company to this agent first");
      setLoadingVoices(false);
    }
  }, [assignedCompanyId]);

  useEffect(() => {
    async function fetchPhoneNumber(agentId: string) {
      if (!agentId) return;
      
      setLoadingPhoneNumber(true);
      setPhoneNumberError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/agents/${agentId}/phone`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        });
        
        if (!res.ok) throw new Error(`Failed to fetch phone number: ${res.status}`);
        
        const data = await res.json();
        setPhoneNumber(data.phoneNumber);
        setPhoneNumberLabel(data.phoneNumberLabel);
        
        console.log('Phone number data:', data);
      } catch (err: any) {
        console.error('Error fetching phone number:', err);
        setPhoneNumberError(err.message || "Unknown error");
      } finally {
        setLoadingPhoneNumber(false);
      }
    }
  
    async function fetchAgentDetails() {
      setLoading(true);
      setShowingSkeleton(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/agents/${params?.id}/details`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        });
        if (!res.ok) throw new Error(`Failed to fetch agent details: ${res.status}`);
        const data = await res.json();
        
        setAgentName(data.name || "Unnamed Agent");
        setFirstMessage(data.firstMessage || "");
        setSystemPrompt(data.systemPrompt || "");
        setAgentId(data.agentId || params?.id || "");
        
        // Fetch phone number after getting agent details
        fetchPhoneNumber(data.agentId || params?.id || "");
        
        setCreatedBy(data.createdBy || "");
        if (Array.isArray(data.tools)) {
          setEndCall(!!data.tools.find((t: any) => t.name === "end_call"));
          setDetectLanguage(!!data.tools.find((t: any) => t.name === "language_detection"));
          setSkipTurn(!!data.tools.find((t: any) => t.name === "skip_turn"));
          setPlayKeypedTone(!!data.tools.find((t: any) => t.name === "play_keypad_touch_tone"));
          
          // Extract custom webhook tools
          const webhookTools = data.tools.filter((t: any) => t.type === "webhook");
          setCustomTools(webhookTools);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        // Ensure skeleton shows for at least 500ms for better UX
        const loadingStartTime = Date.now();
        const minLoadingTime = 500; // milliseconds
        const remainingTime = Math.max(0, minLoadingTime - (Date.now() - loadingStartTime));
        
        setTimeout(() => {
          setLoading(false);
          setShowingSkeleton(false);
        }, remainingTime);
      }
    }
    if (params?.id) fetchAgentDetails();
  }, [params?.id, refreshTrigger]);

  // Functions moved to handleSaveFirstMessage and handleSaveSystemPrompt

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

          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Agent Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">{agentName || "Agent"}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-muted">
                    {agentId}
                  </Badge>
                  
                  {/* Phone number display */}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span role="img" aria-label="phone">📱</span>
                    {loadingPhoneNumber ? (
                      <span className="text-xs">Loading...</span>
                    ) : phoneNumberError ? (
                      <span className="text-xs text-red-500">Error loading phone</span>
                    ) : phoneNumber ? (
                      <span>{phoneNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">No phone number</span>
                    )}
                  </Badge>
                </div>
              </div>


            </div>
            {/* Admin Assignment Control */}
            {isAdmin && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span role="img" aria-label="assigned company">🏢</span> Assigned Company
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">This agent is assigned to:</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companiesLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-muted animate-pulse h-10 w-[220px] rounded-md"></div>
                      <div className="bg-muted animate-pulse h-10 w-24 rounded-md"></div>
                    </div>
                  ) : companiesError ? (
                    <div className="text-red-500 text-xs">{companiesError}</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={assignedCompanyId || ""}
                        onValueChange={setAssignedCompanyId}
                        disabled={assigning}
                      >
                        <SelectTrigger className="bg-muted border-border min-w-[220px]">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem
                              key={company.id}
                              value={String(company.id)}
                              disabled={company.id === assignedCompanyId}
                            >
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignedCompanyId && handleAssignCompany(assignedCompanyId)}
                        disabled={assigning || !assignedCompanyId}
                      >
                        {assigning ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Assigning...
                        </span>
                      ) : "Assign"}
                      </Button>
                      {assignError && <span className="text-xs text-red-500">{assignError}</span>}
                      {assignSuccess && <span className="text-xs text-green-600">Assigned!</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator className="bg-border" />

            {showingSkeleton ? (
              <AgentDetailsSkeleton isAdmin={isAdmin} />
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
            {/* Agent Section */}
              <h2 className="text-lg font-medium text-foreground">Agent</h2>
              
              {/* Voice Selection */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Voice</CardTitle>
                  <p className="text-xs text-muted-foreground">Choose the voice that will speak to your users.</p>
                </CardHeader>
                <CardContent>
                  {loadingVoices ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-muted animate-pulse h-10 w-[220px] rounded-md"></div>
                      <div className="bg-muted animate-pulse h-10 w-24 rounded-md"></div>
                      <div className="bg-muted animate-pulse h-10 w-24 rounded-md"></div>
                    </div>
                  ) : voiceError ? (
                    <div className="text-sm text-red-500">{voiceError}</div>
                  ) : voices.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2 border border-border rounded-md p-4 text-center">
                      {assignedCompanyId ? 
                        "No voices assigned to this company. Please assign voices in the company management page." : 
                        "No voices available. Please assign a company first."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedVoice} 
                        onValueChange={setSelectedVoice}
                      >
                        <SelectTrigger className="bg-muted border-border min-w-[220px]">
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.filter(voice => voice && (voice.voice_id || voice.voiceId) && voice.name).map((voice) => (
                            <SelectItem 
                              key={voice.voice_id || voice.voiceId} 
                              value={voice.voice_id || voice.voiceId}
                            >
                              {voice.name || 'Unknown Voice'} 
                              {voice.labels ? `(${voice.labels?.gender || 'unknown'}, ${voice.labels?.accent || 'en'})` : ''}
                              {voice.category ? `(${voice.category})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (!selectedVoice || !voices || voices.length === 0) {
                            console.warn('No voice selected or no voices available');
                            return;
                          }
                          
                          try {
                            const selected = voices.find(v => 
                              v && ((v.voice_id === selectedVoice) || (v.voiceId === selectedVoice))
                            );
                            
                            if (!selected) {
                              console.warn(`Selected voice ${selectedVoice} not found in voices list`);
                              return;
                            }
                            
                            // Check all possible preview URL locations in the voice object
                            const previewUrl = selected?.preview_url || 
                                              selected?.previewUrl || 
                                              (selected as any)?.samples?.[0]?.audio || 
                                              (selected as any)?.preview_audio;
                            
                            console.log('Voice object:', selected);
                            console.log('Preview URL found:', previewUrl);
                            
                            if (previewUrl) {
                              // Create an audio element and play it
                              const audio = new Audio(previewUrl);
                              
                              // Add event listeners for better user feedback
                              audio.addEventListener('playing', () => {
                                console.log('Audio playback started');
                              });
                              
                              audio.addEventListener('error', (e) => {
                                console.error('Audio playback error:', e);
                                alert('Failed to play voice preview. Please try again.');
                              });
                              
                              // Start playback
                              audio.play()
                                .catch(playError => {
                                  console.error('Error during audio playback:', playError);
                                  alert('Failed to play voice preview: ' + playError.message);
                                });
                            } else {
                              console.warn('No preview URL available for selected voice');
                              alert('This voice does not have a preview audio available.');
                            }
                          } catch (err) {
                            console.error('Error playing voice preview:', err);
                            alert('An error occurred while trying to play the voice preview.');
                          }
                        }}
                      >
                        Listen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          if (!selectedVoice) {
                            console.log('No voice selected, cannot save');
                            return;
                          }
                          
                          try {
                            setSavingVoice(true);
                            setVoiceError(null);
                            setSaveSuccess(false);
                            
                            const token = localStorage.getItem("token");
                            const response = await fetch(`/api/agents/${params?.id}/voice`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token ? `Bearer ${token}` : '',
                              },
                              body: JSON.stringify({ voice_id: selectedVoice })
                            });
                            
                            if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.message || 'Failed to save voice selection');
                            }
                            
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 3000);
                          } catch (error) {
                            console.error('Error saving voice:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Failed to save voice selection';
                            setVoiceError(errorMessage);
                          } finally {
                            setSavingVoice(false);
                          }
                        }}
                        disabled={savingVoice || !selectedVoice}
                      >
                        {savingVoice ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : 'Save'}
                      </Button>
                      {saveSuccess && <span className="text-xs text-green-600 ml-2">Voice saved!</span>}
                      {voiceError && <span className="text-xs text-red-500 ml-2">{voiceError}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
              
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
                        onClick={handleSaveFirstMessage}
                        disabled={savingFirstMessage}
                      >
                        {savingFirstMessage ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : "Save"}
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
                        onClick={handleSaveSystemPrompt}
                        disabled={savingPrompt}
                      >
                        {savingPrompt ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : "Save"}
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
                      {uploading ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Uploading...
                        </span>
                      ) : "Add document"}
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
                  
                  {/* Custom Tools */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Custom tools</h3>
                        <p className="text-xs text-muted-foreground">Provide the agent with custom tools it can use to help users.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsCustomToolOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add tool
                      </Button>
                    </div>
                    
                    {/* List of custom tools */}
                    <div className="space-y-3">
                      {customTools.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No custom tools added yet.</p>
                      ) : (
                        customTools.map((tool, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => {
                              setSelectedCustomTool(tool);
                              setIsCustomToolOpen(true);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">{tool.name}</h4>
                                <p className="text-xs text-muted-foreground">{tool.description || 'No description provided'}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteTool(tool.name);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete tool</span>
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Save tools button */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveTools}
                      disabled={savingTools}
                    >
                      {savingTools ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : "Save"}
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
      
      {/* Custom Tool Sidebar */}
      <CustomToolSidebar 
        isOpen={isCustomToolOpen} 
        onClose={() => {
          setIsCustomToolOpen(false);
          setSelectedCustomTool(null);
        }} 
        agentId={params?.id}
        onToolsUpdated={() => setRefreshTrigger(prev => prev + 1)}
        toolJson={selectedCustomTool ? JSON.stringify(selectedCustomTool, null, 2) : undefined}
        originalToolName={selectedCustomTool?.name}
      />
    </div>
  );
}