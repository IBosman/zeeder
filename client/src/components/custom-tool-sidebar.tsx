import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface Tool {
  name: string;
  [key: string]: any;
}

interface CustomToolSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  agentId?: string;
  onToolsUpdated?: () => void;
  toolJson?: string;
  originalToolName?: string;
}

export function CustomToolSidebar({ isOpen, onClose, agentId, onToolsUpdated, toolJson, originalToolName }: CustomToolSidebarProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [originalName, setOriginalName] = useState<string | undefined>(undefined);

  // Load toolJson when opening for edit
  React.useEffect(() => {
    if (isOpen && toolJson !== undefined) {
      setJsonInput(toolJson);
      setOriginalName(originalToolName);
    } else if (isOpen && !toolJson) {
      setJsonInput("");
      setOriginalName(undefined);
    }
  }, [isOpen, toolJson, originalToolName]);

  if (!isOpen) return null;

  const handleSaveTool = async () => {
    if (saving) return;
    setSaving(true);
    // Parse JSON
    if (!jsonInput.trim()) {
      alert("Please enter a JSON configuration for the tool.");
      setSaving(false);
      return;
    }
    
    let toolData;
    try {
      toolData = JSON.parse(jsonInput.trim());
      console.log("Parsed tool data:", toolData);
    } catch (parseError: any) {
      console.error("JSON parsing error:", parseError);
      alert("Invalid JSON format. Please check your JSON and try again. Error: " + parseError.message);
      setSaving(false);
      return;
    }
    
    try {
      // Get existing tools from the agent
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        setSaving(false);
        return;
      }
      
      const response = await fetch(`/api/agents/${agentId}/details`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error(`Failed to fetch agent details: ${response.status}`);
      
      const agentData = await response.json();
      console.log("Agent data received:", agentData);
      const existingTools = Array.isArray(agentData.tools) ? agentData.tools : [];
      console.log("Existing tools:", existingTools);
      
      // Add the new tool to the existing tools
      const updatedTools = [
        ...existingTools.filter((t: Tool) => t.name !== (originalName ?? toolData.name)),
        toolData
      ];
      console.log("Updated tools to save:", updatedTools);
      
      // Save the updated tools
      const saveResponse = await fetch(`/api/agents/${agentId}/details`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tools: updatedTools })
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        console.error('Error response from server:', errorData);
        throw new Error(`Failed to save tools: ${saveResponse.status}${errorData.elevenlabsError ? ' - ' + errorData.elevenlabsError : ''}${errorData.message ? ' - ' + errorData.message : ''}`);
      }
      
      // Notify parent component that tools were updated
      if (onToolsUpdated) onToolsUpdated();
      
      // Close the sidebar
      onClose();
    } catch (error: any) {
      console.error("Error saving tool:", error);
      alert("Error saving tool. Please try again. Error: " + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-200"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] h-full max-w-full bg-card border-l border-border z-50 flex flex-col shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Add Custom Tool</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Edit the tool configuration as JSON. Make sure to maintain the correct structure.</Label>
            <Textarea 
              placeholder="Paste your tool JSON configuration here..." 
              className="min-h-[calc(100vh-300px)] font-mono text-sm w-full" 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveTool} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Tool
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
