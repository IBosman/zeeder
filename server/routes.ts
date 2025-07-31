import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { syncVoices } from "./routes/voices/sync";
import { companyVoicesRouter } from "./routes/company-voices";
import { companyUsersRouter } from "./routes/company-users";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import FormData from 'form-data';
const upload = multer();

dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Test route
  app.get('/api/test', (req, res) => {
    console.log('Test route hit!');
    res.json({ success: true, message: 'Test route works!' });
  });

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
        const data = await response.json() as {
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
          agent_id?: string;
          name?: string;
        };
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

      // First get the agent to ensure it exists and company has access
      const companyId = (req as any).user.companyId;
      const agentId = req.params.id;
      
      // Try to find agent by elevenlabs_agent_id first
      let agent = await storage.getAgentByElevenlabsId(agentId);
      
      // If not found by elevenlabs_agent_id, try by numeric ID
      if (!agent) {
        agent = await storage.getAgentById(Number(agentId));
      }
      
      if (!agent || agent.companyId !== companyId) {
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
      
      const data = await response.json() as { voices?: Array<{ voice_id: string; name: string }> };
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

  // List agents for the authenticated user's company
  app.get("/api/agents", requireAuth, async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Check if user has a company assigned
    if (!user.companyId) {
      return res.status(403).json({ message: "No company assigned. Please contact your administrator." });
    }
    
    const agents = await storage.getAgentsByCompanyId(user.companyId);
    if (!agents || agents.length === 0) {
      return res.status(200).json({ agents: [] }); // Return empty array instead of error
    }
    res.json({ agents });
  });

  // Get agent details if in user's company
  app.get("/api/agents/:id", requireAuth, async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const agent = await storage.getAgentById(Number(req.params.id));
    if (!agent || agent.companyId !== companyId) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  });


  // Update agent if in user's company
  app.patch("/api/agents/:id", requireAuth, async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const agentId = Number(req.params.id);
    const agent = await storage.getAgentById(agentId);
    if (!agent || agent.companyId !== companyId) {
      return res.status(404).json({ message: "Agent not found" });
    }
    const updated = await storage.updateAgent(agentId, req.body);
    res.json(updated);
  });

  // User registration endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ 
        message: "Username, email, and password are required" 
      });
    }
    
    // Check if username exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Check if email exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }
    
    try {
      // In production, hash the password!
      const user = await storage.createUser({ 
        username, 
        password, 
        email,
        role: 'user' // Default role
      });
      
      // Don't return password in response
      const { password: _, ...userSafe } = user;
      return res.status(201).json(userSafe);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  });

  // User login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const loginId = username || email;
    
    if (!loginId || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }
    
    // Check if the login is an email (contains @) or username
    const isEmail = loginId.includes('@');
    const user = isEmail 
      ? await storage.getUserByEmail(loginId)
      : await storage.getUserByUsername(loginId);
      
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }
    // Don't return password in response
    const { password: _, ...userSafe } = user;
    // Issue JWT with companyId included
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, companyId: user.companyId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
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

  // Get user's company information
  app.get("/api/admin/user-company/:userId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: "No company found for this user" });
      }
      
      res.json({ company });
    } catch (error) {
      console.error('Error fetching user company:', error);
      res.status(500).json({ 
        message: "Error fetching user's company information",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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

  // Admin: Assign agent to user (legacy endpoint - deprecated)
  app.post("/api/admin/assign-agent", requireAuth, isAdmin, async (req: Request, res: Response) => {
    return res.status(410).json({ message: "This endpoint is deprecated. Please use /api/admin/assign-agent-to-company instead." });
  });

  // Admin: Assign agent to company
  app.post("/api/admin/assign-agent-to-company", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const { companyId, name, elevenlabsAgentId, createdBy } = req.body;
    if (!companyId || !name || !elevenlabsAgentId || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!storage.createAgent) {
      return res.status(501).json({ message: "Not implemented: createAgent" });
    }
    // Enforce one agent per company: update if exists, insert if not
    const existing = await storage.getAgentByElevenlabsId(elevenlabsAgentId);
    let agent;
    if (existing) {
      agent = await storage.updateAgent(existing.id, { companyId, name, createdBy });
    } else {
      agent = await storage.createAgent({ name, companyId, elevenlabsAgentId, createdBy });
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
  app.get("/api/admin/company-agents/:companyId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    const companyId = Number(req.params.companyId);
    if (!companyId) {
      return res.status(400).json({ message: "Missing or invalid companyId" });
    }
    const agents = await storage.getAgentsByCompanyId(companyId);
    res.json({ agents });
  });

  // Get details of a specific ElevenLabs agent for the authenticated user's company
  app.get("/api/agents/:elevenlabsAgentId/details", requireAuth, async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const userRole = (req as any).user.role;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // If not admin, check if this agent is assigned to the user's company
    if (userRole !== 'admin') {
      const agents = await storage.getAgentsByCompanyId(companyId);
      const agent = agents.find((a: any) => a.elevenlabsAgentId === elevenlabsAgentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found or not assigned to your company" });
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
      const data = await response.json() as {
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
        agent_id?: string;
        name?: string;
      };
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

  // Update details/settings of a specific ElevenLabs agent for the authenticated user's company
  app.patch("/api/agents/:elevenlabsAgentId/details", requireAuth, async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // Check if this agent is assigned to the user's company
    const agents = await storage.getAgentsByCompanyId(companyId);
    const agent = agents.find((a: any) => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found or not assigned to your company" });
    }

    // Only allow certain fields to be updated
    const { systemPrompt, firstMessage, knowledgeBase, tools } = req.body;

    // Build the PATCH payload for ElevenLabs (nested structure)
    interface AgentConfig {
      conversation_config: {
        agent: {
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
    const companyId = (req as any).user.companyId;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;

    // Check if this agent is assigned to the user's company
    const agents = await storage.getAgentsByCompanyId(companyId);
    const agent = agents.find((a: any) => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      console.log('Agent not found or not assigned to company');
      return res.status(404).json({ message: "Agent not found or not assigned to your company" });
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
    const companyId = (req as any).user.companyId;
    const elevenlabsAgentId = req.params.elevenlabsAgentId;
    const fileId = req.params.fileId;

    // Check if this agent is assigned to the user's company
    const agents = await storage.getAgentsByCompanyId(companyId);
    const agent = agents.find((a: any) => a.elevenlabsAgentId === elevenlabsAgentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found or not assigned to your company" });
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

  // Companies API Endpoints
  // Get company by ID
  app.get("/api/admin/companies/:id", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = parseInt(id, 10);
      
      if (isNaN(companyId)) {
        console.log('Invalid company ID:', id);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid company ID' 
        });
      }
      
      console.log('Fetching company with ID:', companyId);
      const companies = await storage.getCompanies();
      console.log('All companies:', companies);
      
      const company = companies.find(c => c.id === companyId);
      
      if (!company) {
        console.log('Company not found with ID:', companyId);
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      console.log('Found company:', company);
      return res.status(200).json({ 
        success: true,
        company 
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/admin/companies/:id:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching company'
      });
    }
  });

  // Get all companies
  app.get("/api/admin/companies", requireAuth, isAdmin, async (req: Request, res: Response) => {
    console.log('=== Companies Endpoint Hit ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request Headers:', req.headers);
    
    try {
      const companies = await storage.getCompanies();
      console.log('Fetched companies:', companies);
      
      return res.status(200).json({ 
        success: true,
        companies 
      });
    } catch (error) {
      console.error('Error in GET /api/admin/companies:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching companies' 
      });
    }
  });

  // Voice sync endpoint
  app.post("/api/admin/voices/sync", requireAuth, isAdmin, syncVoices);
  
  // Company voices routes
  // Company voices routes - must be before the company users router to avoid conflicts
  
  // Create a separate router for the GET voices endpoint that doesn't require admin
  // Get all agents
  app.get("/api/agents", requireAuth, async (req, res) => {
    try {
      const agents = await storage.getAgents();
      
      return res.status(200).json({
        success: true,
        agents
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in GET /api/agents:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching agents',
        error: err.message
      });
    }
  });
  
  // Get unassigned agents (agents not assigned to a specific company)
  app.get("/api/agents/unassigned/:companyId", requireAuth, async (req, res) => {
    try {
      const { companyId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      
      if (isNaN(companyIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID'
        });
      }
      
      // Get all agents
      const allAgents = await storage.getAgents();
      
      // Get agents assigned to this company
      const companyAgents = await storage.getAgentsByCompanyId(companyIdNum);
      
      // Filter out agents already assigned to this company
      const unassignedAgents = allAgents.filter(agent => 
        !companyAgents.some(companyAgent => companyAgent.id === agent.id)
      );
      
      return res.status(200).json({
        success: true,
        agents: unassignedAgents
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in GET /api/agents/unassigned/:companyId:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching unassigned agents',
        error: err.message
      });
    }
  });
  
  // Get agents for a specific company
  app.get("/api/companies/:companyId/agents", requireAuth, async (req, res) => {
    try {
      const { companyId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      
      if (isNaN(companyIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID'
        });
      }
      
      const agents = await storage.getAgentsByCompanyId(companyIdNum);
      
      return res.status(200).json({
        success: true,
        agents
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in GET /api/companies/:companyId/agents:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching company agents',
        error: err.message
      });
    }
  });
  
  // Assign agent to company
  app.post("/api/companies/:companyId/agents/:agentId", requireAuth, async (req, res) => {
    try {
      const { companyId, agentId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      const agentIdNum = parseInt(agentId, 10);
      
      if (isNaN(companyIdNum) || isNaN(agentIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID or agent ID'
        });
      }
      
      // Get the agent
      const agent = await storage.getAgentById(agentIdNum);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }
      
      // Update agent's company ID
      const updatedAgent = await storage.updateAgent(agentIdNum, { companyId: companyIdNum });
      
      return res.status(200).json({
        success: true,
        agent: updatedAgent
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in POST /api/companies/:companyId/agents/:agentId:', err);
      return res.status(500).json({
        success: false,
        message: 'Error assigning agent to company',
        error: err.message
      });
    }
  });
  
  // Remove an agent from a company
  app.delete('/api/companies/:companyId/agents/:agentId', requireAuth, async (req, res) => {
    try {
      const { companyId, agentId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      const agentIdNum = parseInt(agentId, 10);
      
      if (isNaN(companyIdNum) || isNaN(agentIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID or agent ID'
        });
      }
      
      // Get the agent
      const agent = await storage.getAgentById(agentIdNum);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }
      
      // Get all companies
      const companies = await storage.getCompanies();
      
      // Find a company to reassign the agent to (other than the current one)
      const otherCompany = companies.find(c => c.id !== companyIdNum);
      
      if (!otherCompany) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove agent - need at least one other company to reassign to'
        });
      }
      
      // Reassign the agent to the other company
      const updatedAgent = await storage.updateAgent(agentIdNum, { companyId: otherCompany.id });
      
      if (!updatedAgent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update agent'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Agent removed from company successfully',
        agent: updatedAgent
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in DELETE /api/companies/:companyId/agents/:agentId:', err);
      return res.status(500).json({
        success: false,
        message: 'Error removing agent from company',
        error: err.message
      });
    }
  });
  
  app.get("/api/companies/:companyId/voices", requireAuth, async (req, res) => {
    try {
      const { companyId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      
      if (isNaN(companyIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID'
        });
      }

      console.log(`Fetching voices for company ID: ${companyIdNum}`);
      const companyVoices = await storage.getCompanyVoices(companyIdNum);
      console.log(`Found ${companyVoices.length} company voices`);
      
      // Validate and transform the data to match the format expected by the frontend
      const validVoices = [];
      
      // First validate each company voice to ensure it has valid voice data
      for (const cv of companyVoices) {
        if (!cv) {
          console.warn('Found null or undefined company voice entry');
          continue;
        }
        
        if (!cv.voice) {
          console.warn(`Company voice with ID ${cv.voiceId} has no associated voice data`);
          continue;
        }
        
        if (!cv.voice.name) {
          console.warn(`Voice with ID ${cv.voiceId} has no name`);
          continue;
        }
        
        // Make sure we include all the original voice properties
        validVoices.push({
          voice_id: cv.voiceId,
          voiceId: cv.voiceId, // Include both formats for compatibility
          name: cv.voice.name,
          category: cv.voice.category || 'custom',
          // The preview_url is not stored in our database, we need to fetch it from ElevenLabs
          preview_url: '', // We'll update this later with the actual preview URL
          createdAt: cv.voice.createdAt || new Date().toISOString()
        });
      }
      
      // Log if we filtered out any invalid voices
      const filteredCount = companyVoices.length - validVoices.length;
      if (filteredCount > 0) {
        console.log(`Filtered out ${filteredCount} voices with missing data`);
      }
      
      console.log(`Returning ${validVoices.length} valid voices to frontend`);
      
      // Try to enrich the voice data with preview URLs from ElevenLabs
      try {
        // Fetch all voices from ElevenLabs to get preview URLs
        console.log('Fetching voice details from ElevenLabs to get preview URLs');
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          console.warn('ELEVENLABS_API_KEY not set, cannot fetch preview URLs');
        } else {
          const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (elevenLabsResponse.ok) {
            const elevenLabsData = await elevenLabsResponse.json() as { voices: Array<{ voice_id: string; preview_url: string }> };
            console.log(`Got ${elevenLabsData.voices?.length || 0} voices from ElevenLabs`);
            
            // Update our voices with preview URLs
            for (const voice of validVoices) {
              const elevenLabsVoice = elevenLabsData.voices?.find(
                (v) => v.voice_id === voice.voice_id || v.voice_id === voice.voiceId
              );
              
              if (elevenLabsVoice && elevenLabsVoice.preview_url) {
                voice.preview_url = elevenLabsVoice.preview_url;
                console.log(`Updated preview URL for voice ${voice.name}: ${voice.preview_url}`);
              }
            }
          } else {
            console.error('Failed to fetch voices from ElevenLabs:', await elevenLabsResponse.text());
          }
        }
      } catch (error) {
        console.error('Error fetching ElevenLabs voices:', error);
      }

      // If no valid voices found, return an empty array (do NOT fallback to all voices)
      if (validVoices.length === 0) {
        console.log('No valid company voices found, returning empty array');
        return res.status(200).json({
          success: true,
          voices: []
        });
      }
      
      return res.status(200).json({
        success: true,
        voices: validVoices
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/companies/:companyId/voices:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching company voices',
        error: error.message
      });
    }
  });
  
  // Admin-only company voice management routes
  app.use("/api/companies", requireAuth, isAdmin, companyVoicesRouter);
  app.use("/api/companies", requireAuth, isAdmin, companyUsersRouter);
  
  // Debug endpoint for company voices
  app.get("/api/debug/company/:companyId/voices", async (req, res) => {
    try {
      const { companyId } = req.params;
      const companyIdNum = parseInt(companyId, 10);
      
      if (isNaN(companyIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID'
        });
      }

      console.log(`[DEBUG] Fetching voices for company ID: ${companyIdNum}`);
      const companyVoices = await storage.getCompanyVoices(companyIdNum);
      console.log(`[DEBUG] Raw company voices data:`, JSON.stringify(companyVoices, null, 2));
      
      // Also get all voices for comparison
      const allVoices = await storage.getVoices();
      
      return res.status(200).json({
        success: true,
        companyVoices,
        allVoices,
        companyVoicesCount: companyVoices.length,
        allVoicesCount: allVoices.length
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[DEBUG] Error fetching company voices:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching company voices',
        error: error.message
      });
    }
  });


  // Voices API Endpoints
  app.get("/api/admin/voices", requireAuth, isAdmin, async (_req: Request, res: Response) => {
    try {
      const voices = await storage.getVoices();
      return res.status(200).json({ 
        success: true,
        voices 
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/admin/voices:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching voices',
        error: error.message 
      });
    }
  });

  app.get("/api/admin/voices/:voiceId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { voiceId } = req.params;
      const voice = await storage.getVoiceById(voiceId);
      
      if (!voice) {
        return res.status(404).json({
          success: false,
          message: 'Voice not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        voice
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/admin/voices/:voiceId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching voice',
        error: error.message
      });
    }
  });

  app.post("/api/admin/voices", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { voiceId, name, category } = req.body;
      
      if (!voiceId || !name) {
        return res.status(400).json({
          success: false,
          message: 'voiceId and name are required'
        });
      }

      // Check if voice already exists
      const existingVoice = await storage.getVoiceById(voiceId);
      if (existingVoice) {
        return res.status(409).json({
          success: false,
          message: 'A voice with this ID already exists'
        });
      }

      const voice = await storage.createVoice({
        voiceId,
        name,
        category: category || null
      });

      return res.status(201).json({
        success: true,
        voice
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in POST /api/admin/voices:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating voice',
        error: error.message
      });
    }
  });

  app.put("/api/admin/voices/:voiceId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { voiceId } = req.params;
      const { name, category } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'name is required'
        });
      }
      
      // Check if voice exists
      const existingVoice = await storage.getVoiceById(voiceId);
      if (!existingVoice) {
        return res.status(404).json({
          success: false,
          message: 'Voice not found'
        });
      }

      const updatedVoice = await storage.updateVoice(voiceId, {
        name,
        category: category || null
      });

      return res.status(200).json({
        success: true,
        voice: updatedVoice
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in PUT /api/admin/voices/:voiceId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating voice',
        error: error.message
      });
    }
  });

  app.delete("/api/admin/voices/:voiceId", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { voiceId } = req.params;
      
      // Check if voice exists
      const existingVoice = await storage.getVoiceById(voiceId);
      if (!existingVoice) {
        return res.status(404).json({
          success: false,
          message: 'Voice not found'
        });
      }
      
      await storage.deleteVoice(voiceId);
      
      return res.status(204).send();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in DELETE /api/admin/voices/:voiceId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting voice',
        error: error.message
      });
    }
  });

  app.patch("/api/admin/companies/:id", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = parseInt(id, 10);
      const { name } = req.body;
      
      if (isNaN(companyId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid company ID' 
        });
      }
      
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name is required' 
        });
      }
      
      // In a real implementation, you would update the company in the database
      // For now, we'll just return the updated data
      const companies = await storage.getCompanies();
      const companyIndex = companies.findIndex(c => c.id === companyId);
      
      if (companyIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      // Update the company
      const updatedCompany = {
        ...companies[companyIndex],
        name,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, you would save this to the database
      // await storage.updateCompany(companyId, { name });
      
      return res.status(200).json({ 
        success: true,
        company: updatedCompany
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in PATCH /api/admin/companies/:id:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error updating company',
        error: error.message 
      });
    }
  });

  app.post("/api/admin/companies", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Name is required' });
      
      const company = await storage.createCompany({ name });
      return res.status(201).json(company);
    } catch (err) {
      console.error('Error creating company:', err);
      return res.status(500).json({ message: 'Error creating company' });
    }
  });

  app.delete("/api/admin/companies/:id", requireAuth, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid company ID' });
      
      await storage.deleteCompany(id);
      return res.status(204).send();
    } catch (err) {
      console.error('Error deleting company:', err);
      return res.status(500).json({ message: 'Error deleting company' });
    }
  });

  // Get current user's company
  app.get('/api/user/company', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      // Get user with company information
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // If user has no company, return null
      if (!user.companyId) {
        return res.status(200).json({
          success: true,
          company: null
        });
      }
      
      // Get company details by filtering from all companies
      const companies = await storage.getCompanies();
      const company = companies.find(c => c.id === user.companyId);
      if (!company) {
        return res.status(200).json({
          success: true,
          company: null
        });
      }
      
      return res.status(200).json({
        success: true,
        company: {
          id: company.id,
          name: company.name
        }
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/user/company:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user company',
        error: error.message
      });
    }
  });
  
  // Get agent phone number
  app.get('/api/agents/:agentId/phone', async (req: Request, res: Response) => {
    try {
      const { agentId } = req.params;
      
      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID is required'
        });
      }
      
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: 'ElevenLabs API key not configured'
        });
      }
      
      // Fetch phone numbers from ElevenLabs API
      console.log('Fetching phone numbers from ElevenLabs for agent:', agentId);
      const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!elevenLabsResponse.ok) {
        console.error('Failed to fetch phone numbers from ElevenLabs:', await elevenLabsResponse.text());
        return res.status(502).json({
          success: false,
          message: 'Failed to fetch phone numbers from ElevenLabs'
        });
      }
      
      const phoneNumbersData = await elevenLabsResponse.json() as Array<{
        phone_number: string;
        label: string;
        phone_number_id: string;
        assigned_agent?: {
          agent_id: string;
          agent_name: string;
        };
      }>;
      
      console.log('Got phone numbers from ElevenLabs:', phoneNumbersData);
      
      // Find the phone number assigned to this agent
      const agentPhoneNumber = phoneNumbersData.find(pn => 
        pn.assigned_agent && pn.assigned_agent.agent_id === agentId
      );
      
      return res.status(200).json({
        success: true,
        phoneNumber: agentPhoneNumber ? agentPhoneNumber.phone_number : null,
        phoneNumberLabel: agentPhoneNumber ? agentPhoneNumber.label : null,
        phoneNumberId: agentPhoneNumber ? agentPhoneNumber.phone_number_id : null
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in GET /api/agents/:agentId/phone:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching agent phone number',
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
