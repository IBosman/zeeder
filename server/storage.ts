import { users, type User, type InsertUser, agents, type Agent, type InsertAgent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  getAgentsByUserId(userId: number): Promise<Agent[]>;
  getAgentById(agentId: number): Promise<Agent | undefined>;
  getAgentByElevenlabsId(elevenlabsAgentId: string): Promise<Agent | undefined>;
  updateAgent(agentId: number, update: Partial<Agent>): Promise<Agent | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(userId: number, update: Partial<User>): Promise<User | undefined>;
  deleteUser?(userId: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Insert the user and get the inserted ID
      const [result] = await db.insert(users).values({
        ...insertUser,
        // Ensure required fields are set
        role: insertUser.role || 'user',
        createdAt: new Date(),
      });
      
      // Fetch the inserted user
      const user = await db.query.users.findFirst({ 
        where: eq(users.username, insertUser.username) 
      });
      
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    try {
      // Insert the agent
      await db.insert(agents).values({
        ...insertAgent,
        createdAt: new Date(),
      });
      
      // Get the inserted agent by elevenlabsAgentId since it's unique
      const agent = await db.query.agents.findFirst({ 
        where: eq(agents.elevenlabsAgentId, insertAgent.elevenlabsAgentId) 
      });
      
      if (!agent) {
        throw new Error('Failed to retrieve created agent');
      }
      
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent');
    }
  }

  async getAgentsByUserId(userId: number): Promise<Agent[]> {
    return db.query.agents.findMany({ where: eq(agents.userId, userId) });
  }

  async getAgentById(agentId: number): Promise<Agent | undefined> {
    return db.query.agents.findFirst({ where: eq(agents.id, agentId) });
  }

  async updateAgent(agentId: number, update: Partial<Agent>): Promise<Agent | undefined> {
    try {
      // Update the agent
      await db.update(agents)
        .set({
          ...update,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, agentId));
      
      // Fetch the updated agent
      const updatedAgent = await db.query.agents.findFirst({ 
        where: eq(agents.id, agentId) 
      });
      
      if (!updatedAgent) {
        throw new Error('Agent not found after update');
      }
      
      return updatedAgent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return db.query.users.findMany();
  }

  async updateUser(userId: number, update: Partial<User>): Promise<User | undefined> {
    try {
      // Update the user
      await db.update(users)
        .set({
          ...update,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      // Fetch the updated user
      const updatedUser = await db.query.users.findFirst({ 
        where: eq(users.id, userId) 
      });
      
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async getAgentByElevenlabsId(elevenlabsAgentId: string): Promise<Agent | undefined> {
    return db.query.agents.findFirst({ where: eq(agents.elevenlabsAgentId, elevenlabsAgentId) });
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        return false;
      }
      
      // Delete the user
      await db.delete(users).where(eq(users.id, userId));
      
      // Verify deletion
      const deletedUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
      return !deletedUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export const storage = new DbStorage();
