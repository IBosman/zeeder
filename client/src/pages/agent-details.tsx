import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Copy, MoreHorizontal, Bot, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import Sidebar from "@/components/sidebar";

export default function AgentDetails() {
  const [match, params] = useRoute("/agent/:id");
  const [firstMessage, setFirstMessage] = useState("Hey there, I'm Alexis from ElevenLabs support. How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are interacting with a user who has initiated a spoken conversation directly from the ElevenLabs website.");
  const [useRAG, setUseRAG] = useState(false);
  
  // Tool switches
  const [endCall, setEndCall] = useState(false);
  const [detectLanguage, setDetectLanguage] = useState(false);
  const [skipTurn, setSkipTurn] = useState(false);
  const [transferToAgent, setTransferToAgent] = useState(false);
  const [transferToNumber, setTransferToNumber] = useState(false);
  const [playKeypedTone, setPlayKeypedTone] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Agents</Link>
                <span>&gt;</span>
                <span className="text-foreground">Support agent</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-border">
                <Bot className="h-4 w-4 mr-2" />
                Test AI agent
              </Button>
              <Button variant="outline" className="border-border">
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </Button>
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
              <h1 className="text-2xl font-semibold text-foreground">Support agent</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Public
                </Badge>
                <span className="text-sm text-muted-foreground">agent_UjJzmfqX0herqXviD46JJdm336b</span>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Agent Section */}
            <div className="space-y-4">
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
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-sm text-foreground">{firstMessage}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
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
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-sm text-foreground">{systemPrompt}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </CardContent>
              </Card>

              {/* Agent Knowledge Base */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-foreground">Agent knowledge base</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Provide the LLM with domain-specific information to help it answer questions more accurately.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="border-border">
                    Add document
                  </Button>
                </CardContent>
              </Card>

              {/* Use RAG */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Use RAG</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Retrieval-Augmented Generation (RAG) increases the agent's maximum Knowledge Base size.
                        The agent will have access to relevant pieces of attached Knowledge Base during answer generation.
                      </p>
                    </div>
                    <Switch
                      checked={useRAG}
                      onCheckedChange={setUseRAG}
                    />
                  </div>
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
                </CardContent>
              </Card>

              {/* Custom tools */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Custom tools</h3>
                      <p className="text-xs text-muted-foreground">
                        Provide the agent with custom tools it can use to help users.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="border-border">
                      Add tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}