import { 
  users, type User, type InsertUser, 
  agents, type Agent, type InsertAgent, 
  companies, type Company, type InsertCompany, 
  voices, type Voice, type InsertVoice,
  companyVoices, type CompanyVoice, type CompanyVoiceWithDetails, type InsertCompanyVoice
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(userId: number, update: Partial<User>): Promise<User | undefined>;
  deleteUser?(userId: number): Promise<boolean>;
  
  // Agent methods
  createAgent(agent: InsertAgent): Promise<Agent>;
  getAgents(): Promise<Agent[]>;
  getAgentsByCompanyId(companyId: number): Promise<Agent[]>;
  getAgentById(agentId: number): Promise<Agent | undefined>;
  getAgentByElevenlabsId(elevenlabsAgentId: string): Promise<Agent | undefined>;
  updateAgent(agentId: number, update: Partial<Agent>): Promise<Agent | undefined>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompanyByUserId(userId: number): Promise<Company | null>;
  createCompany(company: InsertCompany): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Company Voices methods
  getCompanyVoices(companyId: number): Promise<CompanyVoiceWithDetails[]>;
  assignVoiceToCompany(companyId: number, voiceId: string): Promise<CompanyVoice>;
  removeVoiceFromCompany(companyId: number, voiceId: string): Promise<boolean>;
  
  // Company Users methods
  getUsersByCompanyId(companyId: number): Promise<User[]>;
  assignUserToCompany(companyId: number, userId: number): Promise<User>;
  removeUserFromCompany(userId: number): Promise<boolean>;
  
  // Voice methods
  getVoices(): Promise<Voice[]>;
  getVoiceById(id: string): Promise<Voice | null>;
  createVoice(voice: InsertVoice): Promise<Voice>;
  updateVoice(id: string, voice: Partial<InsertVoice>): Promise<Voice>;
  deleteVoice(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // Company methods
  async getCompanies(): Promise<Company[]> {
    return db.query.companies.findMany({
      orderBy: (companies, { desc }) => [desc(companies.createdAt)]
    });
  }

  async getCompanyByUserId(userId: number): Promise<Company | null> {
    try {
      // First get the user to get their companyId
      const user = await this.getUser(userId);
      if (!user || !user.companyId) {
        return null;
      }
      
      // Then get the company
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, user.companyId)
      });
      
      return company || null;
    } catch (error) {
      console.error('Error getting company by user ID:', error);
      return null;
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const { name } = company;
    
    const [result] = await db.insert(companies).values({
      name,
      createdAt: new Date()
    });
    
    const created = await db.query.companies.findFirst({
      where: eq(companies.id, result.insertId)
    });
    
    if (!created) {
      throw new Error('Failed to retrieve created company');
    }
    
    return created;
  }

  async deleteCompany(id: number): Promise<void> {
    try {
      // First delete any company-voice associations
      await db.delete(companyVoices).where(eq(companyVoices.companyId, id));
      
      // Delete any agents associated with this company
      await db.delete(agents).where(eq(agents.companyId, id));
      
      // Check if there are any users associated with this company
      const usersWithCompany = await db.select().from(users).where(eq(users.companyId, id));
      
      // Update users to remove the company association
      // Based on the database state, companyId can be NULL
      if (usersWithCompany.length > 0) {
        for (const user of usersWithCompany) {
          // Use a raw SQL update to set companyId to NULL
          // This bypasses TypeScript's type checking for this specific operation
          await db.execute(sql`UPDATE users SET company_id = NULL WHERE id = ${user.id}`);
        }
      }
      
      // Finally delete the company
      await db.delete(companies).where(eq(companies.id, id));
    } catch (error) {
      console.error('Error in deleteCompany:', error);
      throw error;
    }
  }

  // Company Users methods
  async getUsersByCompanyId(companyId: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.companyId, companyId));

    return result;
  }

  async assignUserToCompany(companyId: number, userId: number): Promise<User> {
    // Update the user's companyId
    await db
      .update(users)
      .set({ companyId })
      .where(eq(users.id, userId));
    
    // Return the updated user
    const updatedUser = await this.getUser(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async removeUserFromCompany(userId: number): Promise<boolean> {
    // Set the user's companyId to 0 (representing no company)
    await db
      .update(users)
      .set({ companyId: 0 })
      .where(eq(users.id, userId));

    // Check if the update was successful
    const updatedUser = await this.getUser(userId);
    if (!updatedUser) {
      return false;
    }

    return updatedUser.companyId === 0;
  }

  // Company Voices methods
  async getCompanyVoices(companyId: number): Promise<CompanyVoiceWithDetails[]> {
    try {
      console.log(`Fetching company voices for companyId: ${companyId}`);
      
      // First get the company voice associations
      const companyVoiceAssociations = await db
        .select()
        .from(companyVoices)
        .where(eq(companyVoices.companyId, companyId));
      
      console.log(`Found ${companyVoiceAssociations.length} company voice associations`);
      
      // Then for each association, get the voice details
      const result: CompanyVoiceWithDetails[] = [];
      
      for (const association of companyVoiceAssociations) {
        const voiceDetails = await db
          .select()
          .from(voices)
          .where(eq(voices.voiceId, association.voiceId))
          .limit(1);
        
        if (voiceDetails.length > 0) {
          result.push({
            companyId: association.companyId,
            voiceId: association.voiceId,
            voice: voiceDetails[0]
          });
        } else {
          console.warn(`Voice with ID ${association.voiceId} not found in voices table`);
        }
      }
      
      console.log(`Returning ${result.length} company voices with details`);
      return result;
    } catch (error) {
      console.error('Error in getCompanyVoices:', error);
      return [];
    }
  }

  async assignVoiceToCompany(companyId: number, voiceId: string): Promise<CompanyVoice> {
    const newCompanyVoice: InsertCompanyVoice = {
      companyId,
      voiceId
    };

    await db.insert(companyVoices).values(newCompanyVoice);
    
    // Return the created association
    const [created] = await db
      .select()
      .from(companyVoices)
      .where(
        and(
          eq(companyVoices.companyId, companyId),
          eq(companyVoices.voiceId, voiceId)
        )
      )
      .limit(1);

    if (!created) {
      throw new Error('Failed to retrieve created company-voice association');
    }

    return created;
  }

  async removeVoiceFromCompany(companyId: number, voiceId: string): Promise<boolean> {
    const result = await db
      .delete(companyVoices)
      .where(
        and(
          eq(companyVoices.companyId, companyId),
          eq(companyVoices.voiceId, voiceId)
        )
      );

    // Check if any rows were affected
    const deleted = await db
      .select()
      .from(companyVoices)
      .where(
        and(
          eq(companyVoices.companyId, companyId),
          eq(companyVoices.voiceId, voiceId)
        )
      )
      .limit(1);

    return deleted.length === 0;
  }

  // Voice methods
  async getVoices(): Promise<Voice[]> {
    return db.select({
      voiceId: voices.voiceId,
      name: voices.name,
      category: voices.category,
      createdAt: voices.createdAt
    }).from(voices).orderBy(voices.voiceId);
  }

  async getVoiceById(id: string): Promise<Voice | null> {
    const result = await db.select({
      voiceId: voices.voiceId,
      name: voices.name,
      category: voices.category,
      createdAt: voices.createdAt
    })
      .from(voices)
      .where(eq(voices.voiceId, id))
      .limit(1);
    return result[0] || null;
  }

  async createVoice(voice: InsertVoice): Promise<Voice> {
    await db.insert(voices).values(voice);
    const [created] = await db.select({
      voiceId: voices.voiceId,
      name: voices.name,
      category: voices.category,
      createdAt: voices.createdAt
    })
      .from(voices)
      .where(eq(voices.voiceId, voice.voiceId));
    
    if (!created) {
      throw new Error('Failed to retrieve created voice');
    }
    
    return created;
  }

  async updateVoice(voiceId: string, updates: Partial<Omit<InsertVoice, 'voiceId'>>): Promise<Voice> {
    await db.update(voices)
      .set(updates)
      .where(eq(voices.voiceId, voiceId));
    
    const [updated] = await db.select({
      voiceId: voices.voiceId,
      name: voices.name,
      category: voices.category,
      createdAt: voices.createdAt
    })
      .from(voices)
      .where(eq(voices.voiceId, voiceId));
      
    if (!updated) {
      throw new Error(`Voice with ID ${voiceId} not found`);
    }
    
    return updated;
  }

  async deleteVoice(voiceId: string): Promise<void> {
    await db.delete(voices).where(eq(voices.voiceId, voiceId));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.email, email) });
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

  async getAgents(): Promise<Agent[]> {
    return db.query.agents.findMany();
  }

  async getAgentsByCompanyId(companyId: number): Promise<Agent[]> {
    return db.query.agents.findMany({ where: eq(agents.companyId, companyId) });
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
