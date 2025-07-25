import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import FormData from 'form-data';
const upload = multer();

dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // DEMO MODE: If DEMO_MODE is true, override key endpoints
  if (process.env.DEMO_MODE === "true") {
    // Demo login endpoint
    app.post("/api/login", (req: Request, res: Response) => {
      const { username } = req.body;
      // Accept any username and password in demo mode
      return res.json({ token: "demo-token", role: "user", username: username || "demo" });
    });

    // Demo agents endpoint
    app.get("/api/agents", async (req: Request, res: Response) => {
      // Optionally check for a fake token in Authorization header
      const auth = req.headers.authorization;
      if (!auth || auth !== "Bearer demo-token") {
        return res.status(401).json({ message: "Missing or invalid Authorization header (demo mode)" });
      }
      // Fetch agents from ElevenLabs API
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      try {
        const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
          headers: {
            "xi-api-key": elevenlabsApiKey,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          return res.status(response.status).json({ message: "Failed to fetch agents from ElevenLabs" });
        }
        const data: unknown = await response.json();
        const voices = (Array.isArray(data) ? data : (data as any)?.voices || []) as Array<{
          voice_id: string;
          name: string;
          category: string;
          preview_url: string;
          labels: Record<string, string>;
        }>;
        return res.json(voices);
      } catch (err) {
        return res.status(500).json({ message: "Error fetching agents from ElevenLabs" });
      }
    });

    // Demo agent details endpoint
    app.get("/api/agents/:elevenlabsAgentId/details", async (req: Request, res: Response) => {
      const auth = req.headers.authorization;
      if (!auth || auth !== "Bearer demo-token") {
        return res.status(401).json({ message: "Missing or invalid Authorization header (demo mode)" });
      }
      const elevenlabsAgentId = req.params.elevenlabsAgentId;
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabsAgentId}`, {
          headers: {
            "xi-api-key": elevenlabsApiKey,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          return res.status(response.status).json({ message: "Failed to fetch agent details from ElevenLabs" });
        }
        const data = await response.json();
        // Extract the same fields as the production endpoint
        const prompt = data?.conversation_config?.agent?.prompt?.prompt;
        const firstMessage = data?.conversation_config?.agent?.first_message;
        const knowledgeBase = data?.conversation_config?.agent?.prompt?.knowledge_base;
        const tools = data?.conversation_config?.agent?.prompt?.tools;
        const agentId = (data && typeof data === 'object' && 'agent_id' in data) ? data.agent_id : elevenlabsAgentId;
        res.json({
          name: typeof data === 'object' && data && 'name' in data ? data.name : undefined,
          systemPrompt: prompt,
          firstMessage,
          knowledgeBase,
          tools,
          agentId
        });
      } catch (err) {
        return res.status(500).json({ message: "Error fetching agent details from ElevenLabs" });
      }
    });

    // Demo agent details update endpoint
    app.patch("/api/agents/:elevenlabsAgentId/details", async (req: Request, res: Response) => {
      const auth = req.headers.authorization;
      if (!auth || auth !== "Bearer demo-token") {
        return res.status(401).json({ message: "Missing or invalid Authorization header (demo mode)" });
      }
      const elevenlabsAgentId = req.params.elevenlabsAgentId;
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      // Only allow certain fields to be updated
      const { systemPrompt, firstMessage, knowledgeBase, tools } = req.body;
      // Build the PATCH payload for ElevenLabs (nested structure)
      const payload: any = { conversation_config: { agent: {} } };
      if (systemPrompt !== undefined) {
        if (!payload.conversation_config) payload.conversation_config = {};
        if (!payload.conversation_config.agent) payload.conversation_config.agent = {};
        if (!payload.conversation_config.agent.prompt) payload.conversation_config.agent.prompt = {};
        payload.conversation_config.agent.prompt.prompt = systemPrompt;
      }
      if (knowledgeBase !== undefined) {
        if (!payload.conversation_config) payload.conversation_config = {};
        if (!payload.conversation_config.agent) payload.conversation_config.agent = {};
        if (!payload.conversation_config.agent.prompt) payload.conversation_config.agent.prompt = {};
        payload.conversation_config.agent.prompt.knowledge_base = knowledgeBase;
      }
      if (tools !== undefined) {
        if (!payload.conversation_config) payload.conversation_config = {};
        if (!payload.conversation_config.agent) payload.conversation_config.agent = {};
        if (!payload.conversation_config.agent.prompt) payload.conversation_config.agent.prompt = {};
        payload.conversation_config.agent.prompt.tools = tools;
      }
      if (firstMessage !== undefined) {
        if (!payload.conversation_config) payload.conversation_config = {};
        if (!payload.conversation_config.agent) payload.conversation_config.agent = {};
        payload.conversation_config.agent.first_message = firstMessage;
      }
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabsAgentId}`, {
          method: "PATCH",
          headers: {
            "xi-api-key": elevenlabsApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          return res.status(response.status).json({ message: "Failed to update agent details on ElevenLabs" });
        }
        const data = await response.json();
        res.json(data);
      } catch (err) {
        return res.status(500).json({ message: "Error updating agent details on ElevenLabs" });
      }
    });

    // Demo knowledge base upload endpoint
    app.post("/api/agents/:elevenlabsAgentId/knowledge-base/upload", upload.single("file"), async (req: Request, res: Response) => {
      const auth = req.headers.authorization;
      if (!auth || auth !== "Bearer demo-token") {
        return res.status(401).json({ message: "Missing or invalid Authorization header (demo mode)" });
      }
      const elevenlabsAgentId = req.params.elevenlabsAgentId;
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      try {
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);
        // Proxy upload to ElevenLabs
        const response = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base", {
          method: "POST",
          headers: {
            "xi-api-key": elevenlabsApiKey,
            ...formData.getHeaders()
          },
          body: formData
        });
        if (!response.ok) {
          const errText = await response.text();
          return res.status(response.status).json({ message: "Failed to upload file to LeadsGPT: " + errText });
        }
        const data = await response.json();
        res.json(data);
      } catch (err) {
        res.status(500).json({ message: "Error uploading file to LeadsGPT" });
      }
    });

    // Demo knowledge base delete endpoint
    app.delete("/api/agents/:elevenlabsAgentId/knowledge-base/:fileId", async (req: Request, res: Response) => {
      const auth = req.headers.authorization;
      if (!auth || auth !== "Bearer demo-token") {
        return res.status(401).json({ message: "Missing or invalid Authorization header (demo mode)" });
      }
      const fileId = req.params.fileId;
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${fileId}`, {
          method: "DELETE",
          headers: {
            "xi-api-key": elevenlabsApiKey
          },
        });
        if (!response.ok) {
          return res.status(response.status).json({ message: "Failed to delete file from ElevenLabs" });
        }
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ message: "Error deleting file from ElevenLabs" });
      }
    });

    // All other API endpoints return 501 Not Implemented in demo mode
    app.all("/api/*", (req: Request, res: Response) => {
      return res.status(501).json({ message: "Not implemented in demo mode" });
    });

    // No need to register the rest of the routes
    const httpServer = createServer(app);
    return httpServer;
  }

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Middleware placeholder for authentication (assume req.user.id is set)
  function requireAuth(req: Request, res: Response, next: Function) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      (req as any).user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  // Middleware to check for admin role
  function isAdmin(req: Request, res: Response, next: Function) {
    if (!(req as any).user || (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }

  // Logging middleware
  app.use((req: Request, res: Response, next: Function) => {
    console.log(`[INCOMING] ${req.method} ${req.path}`);
    if (Object.keys(req.body || {}).length > 0) {
      console.log(`[BODY]`, req.body);
    }
    const oldJson = res.json;
    res.json = function (body: any) {
      console.log(`[OUTGOING] ${req.method} ${req.path} ${res.statusCode}`);
      console.log(`[RESPONSE BODY]`, body);
      return oldJson.call(this, body);
    };
    next();
  });

  // Update agent's voice
  app.patch("/api/agents/:id/voice", requireAuth, async (req: Request, res: Response) => {
    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }

      const { voice_id } = req.body;
      if (!voice_id) {
        return res.status(400).json({ message: "Voice ID is required" });
      }

      // First get the agent to ensure it exists and user has access
      const userId = (req as any).user.id;
      const agentId = req.params.id;
      
      // Try to find agent by elevenlabs_agent_id first
      let agent = await storage.getAgentByElevenlabsId(agentId);
      
      // If not found by elevenlabs_agent_id, try by numeric ID
      if (!agent) {
        agent = await storage.getAgentById(Number(agentId));
      }
      
      if (!agent || agent.userId !== userId) {
        return res.status(404).json({ message: "Agent not found or not authorized" });
      }

      // Update the voice in ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agent.elevenlabsAgentId}`, {
        method: "PATCH",
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversation_config: {
            tts: {
              voice_id: voice_id
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to update agent voice:', error);
        return res.status(response.status).json({ 
          message: "Failed to update agent voice",
          details: error 
        });
      }

      // Update the agent in our database
      const updatedAgent = await storage.updateAgent(agent.id, { 
        // @ts-ignore - voiceId is a valid field in the Agent type
        voiceId: voice_id 
      });

      res.json({ 
        success: true, 
        agent: updatedAgent 
      });
    } catch (err: unknown) {
      console.error('Error updating agent voice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      res.status(500).json({ 
        message: "Error updating agent voice",
        error: errorMessage
      });
    }
  });

  // Get available voices
  app.get("/api/voices", requireAuth, async (req: Request, res: Response) => {
    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('ElevenLabs API error:', error);
        return res.status(response.status).json({ message: "Failed to fetch voices from ElevenLabs" });
      }
      
      const data = await response.json();
      // Return the voices in the expected format
      res.json({
        voices: data.voices?.map((voice: any) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          category: voice.category,
          preview_url: voice.preview_url,
          labels: voice.labels
        })) || []
      });
    } catch (err) {
      console.error('Error fetching voices:', err);
      res.status(500).json({ message: "Error fetching voices" });
    }
  });

  // List agents for the authenticated user
  app.get("/api/agents", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const agents = await storage.getAgentsByUserId(userId);
    if (!agents || agents.length === 0) {
      return res.status(403).json({ message: "No agents assigned. Please contact your administrator." });
    }
    res.json({ agents });
  });

  // Get agent details if owned by user
  app.get("/api/agents/:id", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const agent = await storage.getAgentById(Number(req.params.id));
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  });


  // Update agent if owned by user
  app.patch("/api/agents/:id", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const agentId = Number(req.params.id);
    const agent = await storage.getAgentById(agentId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ message: "Agent not found" });
    }
    const updated = await storage.updateAgent(agentId, req.body);
    res.json(updated);
  });

  // User registration endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // In production, hash the password!
    const user = await storage.createUser({ username, password });
    // Don't return password in response
    const { password: _, ...userSafe } = user;
    return res.status(201).json(userSafe);
  });

  // User login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Don't return password in response
    const { password: _, ...userSafe } = user;
    // Issue JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return res.status(200).json({ ...userSafe, token });
  });

  // Admin: List all users
  app.get("/api/admin/users", requireAuth, isAdmin, async (_req: Request, res: Response) => {
    // You may want to add a storage.getAllUsers() method for this
    if (!storage.getAllUsers) {
      return res.status(501).json({ message: "Not implemented: getAllUsers" });
    }
    const users = await storage.getAllUsers();
    res.json({ users });
  });

  // Admin: Update a user
  app.patch("/api/admin/users/:id", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Missing or invalid user id" });
    }
    const { username, password, role } = req.body;
    if (!username && !password && !role) {
      return res.status(400).json({ message: "No fields to update" });
    }
    if (!storage.updateUser) {
      return res.status(501).json({ message: "Not implemented: updateUser" });
    }
    const updated = await storage.updateUser(userId, { username, password, role });
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    // Don't return password in response
    const { password: _, ...userSafe } = updated;
    return res.status(200).json(userSafe);
  });

  // Admin: Delete a user
  app.delete("/api/admin/users/:id", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Missing or invalid user id" });
    }
    if (!storage.deleteUser) {
      return res.status(501).json({ message: "Not implemented: deleteUser" });
    }
    const deleted = await storage.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true });
  });

  // Admin: Assign agent to user
  app.post("/api/admin/assign-agent", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const { userId, name, elevenlabsAgentId, createdBy } = req.body;
    if (!userId || !name || !elevenlabsAgentId || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!storage.createAgent) {
      return res.status(501).json({ message: "Not implemented: createAgent" });
    }
    // Enforce one agent per user: update if exists, insert if not
    const existing = await storage.getAgentByElevenlabsId(elevenlabsAgentId);
    let agent;
    if (existing) {
      agent = await storage.updateAgent(existing.id, { userId, name, createdBy });
    } else {
      agent = await storage.createAgent({ name, userId, elevenlabsAgentId, createdBy });
    }
    res.status(201).json(agent);
  });

  // Admin: List all ElevenLabs agents
  app.get("/api/admin/agents", requireAuth, isAdmin, async (_req: Request, res: Response) => {
    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch agents from ElevenLabs" });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error fetching ElevenLabs agents" });
    }
  });

  // Admin: List all agents assigned to a specific user
  app.get("/api/admin/user-agents/:userId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Missing or invalid userId" });
    }
    const agents = await storage.getAgentsByUserId(userId);
    res.json({ agents });
  });

  // Get details of a specific ElevenLabs agent for the authenticated user
  app.get("/api/agents/:elevenlabsAgentId/details", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // If not admin, check if this agent is assigned to the user
    if (userRole !== 'admin') {
      const agents = await storage.getAgentsByUserId(userId);
      const agent = agents.find(a => a.elevenlabsAgentId === elevenlabsAgentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found or not assigned to user" });
      }
    }

    // Fetch details from ElevenLabs API
    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabsAgentId}`, {
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch agent details from ElevenLabs" });
      }
      const data = await response.json();
      // Fetch agent metadata from the database
      const agentMeta = await storage.getAgentByElevenlabsId(elevenlabsAgentId);
      // Extract only the required fields
      const prompt = data?.conversation_config?.agent?.prompt?.prompt;
      const firstMessage = data?.conversation_config?.agent?.first_message;
      const knowledgeBase = data?.conversation_config?.agent?.prompt?.knowledge_base;
      const tools = data?.conversation_config?.agent?.prompt?.tools;
      const agentId = (data && typeof data === 'object' && 'agent_id' in data) ? (data as any).agent_id : elevenlabsAgentId;
      res.json({
        ...(agentMeta || {}),
        name: typeof data === 'object' && data && 'name' in data ? (data as any).name : undefined,
        systemPrompt: prompt,
        firstMessage,
        knowledgeBase,
        tools,
        agentId
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching agent details from ElevenLabs" });
    }
  });

  // Update details/settings of a specific ElevenLabs agent for the authenticated user
  app.patch("/api/agents/:elevenlabsAgentId/details", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // Check if this agent is assigned to the user
    const agents = await storage.getAgentsByUserId(userId);
    const agent = agents.find(a => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found or not assigned to user" });
    }

    // Only allow certain fields to be updated
    const { systemPrompt, firstMessage, knowledgeBase, tools } = req.body;

    // Build the PATCH payload for ElevenLabs (nested structure)
    interface AgentConfig {
      conversation_config?: {
        agent?: {
          prompt?: {
            prompt?: string;
            knowledge_base?: any;
            tools?: any[];
          };
          first_message?: string;
        };
      };
    }
    
    const payload: AgentConfig = { conversation_config: { agent: {} } };
    if (systemPrompt !== undefined || knowledgeBase !== undefined || tools !== undefined) {
      payload.conversation_config.agent.prompt = {};
      if (systemPrompt !== undefined) payload.conversation_config.agent.prompt.prompt = systemPrompt;
      if (knowledgeBase !== undefined) payload.conversation_config.agent.prompt.knowledge_base = knowledgeBase;
      if (tools !== undefined) payload.conversation_config.agent.prompt.tools = tools;
    }
    if (firstMessage !== undefined) payload.conversation_config.agent.first_message = firstMessage;

    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabsAgentId}`, {
        method: "PATCH",
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to update agent details on ElevenLabs" });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error updating agent details on ElevenLabs" });
    }
  });

  // Upload a file to ElevenLabs knowledge base for a specific agent (proxy upload)
  app.post("/api/agents/:elevenlabsAgentId/knowledge-base/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // Check if this agent is assigned to the user
    const agents = await storage.getAgentsByUserId(userId);
    const agent = agents.find(a => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      console.log('Agent not found or not assigned to user');
      return res.status(404).json({ message: "Agent not found or not assigned to user" });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        console.log('Missing ElevenLabs API key');
        return res.status(500).json({ message: "Missing LeadsGPT API key" });
      }
      // Prepare form data for ElevenLabs
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);
      // Use fetch with formData
      const response = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base", {
        method: "POST",
        headers: {
          "xi-api-key": elevenlabsApiKey,
          ...formData.getHeaders()
        },
        body: formData
      });
      if (!response.ok) {
        const errText = await response.text();
        console.log("LeadsGPT upload failed:", errText);
        return res.status(response.status).json({ message: "Failed to upload file to LeadsGPT: " + errText });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.log('Error uploading file to LeadsGPT:', err);
      res.status(500).json({ message: "Error uploading file to LeadsGPT" });
    }
  });

  // Delete a file from ElevenLabs knowledge base for a specific agent (proxy delete)
  app.delete("/api/agents/:elevenlabsAgentId/knowledge-base/:fileId", requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;
    const fileId = req.params.fileId;

    // Check if this agent is assigned to the user
    const agents = await storage.getAgentsByUserId(userId);
    const agent = agents.find(a => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found or not assigned to user" });
    }

    try {
      const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsApiKey) {
        return res.status(500).json({ message: "Missing ElevenLabs API key" });
      }
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${fileId}`, {
        method: "DELETE",
        headers: {
          "xi-api-key": elevenlabsApiKey
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to delete file from ElevenLabs" });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error deleting file from ElevenLabs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
