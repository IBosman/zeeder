import { 
  users, type User, type InsertUser, 
  agents, type Agent, type InsertAgent, 
  companies, type Company, type InsertCompany, 
  voices, type Voice, type InsertVoice,
  companyVoices, type CompanyVoice, type CompanyVoiceWithDetails, type InsertCompanyVoice
} from "@shared/schema";
import { db, withDbRetry } from "./db";
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
    // Add retry logic for retrieving all companies
    return withDbRetry(async () => {
      return db.query.companies.findMany({
        orderBy: (companies, { desc }) => [desc(companies.createdAt)]
      });
    });
  }

  async getCompanyByUserId(userId: number): Promise<Company | null> {
    try {
      // First get the user to get their companyId
      const user = await this.getUser(userId);
      if (!user || !user.companyId) {
        return null;
      }
      
      // Then get the company with retry logic
      const company = await withDbRetry(async () => {
        return db.query.companies.findFirst({
          where: eq(companies.id, user.companyId)
        });
      });
      
      return company || null;
    } catch (error) {
      console.error('Error getting company by user ID:', error);
      return null;
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const { name } = company;
    
    // Insert company with retry logic
    const [result] = await withDbRetry(async () => {
      return db.insert(companies).values({
        name,
        createdAt: new Date()
      });
    });
    
    // Retrieve created company with retry logic
    const created = await withDbRetry(async () => {
      return db.query.companies.findFirst({
        where: eq(companies.id, result.insertId)
      });
    });
    
    if (!created) {
      throw new Error('Failed to retrieve created company');
    }
    
    return created;
  }

  async deleteCompany(id: number): Promise<void> {
    try {
      // First delete any company-voice associations with retry logic
      await withDbRetry(async () => {
        return db.delete(companyVoices).where(eq(companyVoices.companyId, id));
      });
      
      // Delete any agents associated with this company with retry logic
      await withDbRetry(async () => {
        return db.delete(agents).where(eq(agents.companyId, id));
      });
      
      // Check if there are any users associated with this company with retry logic
      const usersWithCompany = await withDbRetry(async () => {
        return db.select().from(users).where(eq(users.companyId, id));
      });
      
      // Update users to remove the company association with retry logic
      // Use SQL directly to set companyId to NULL to avoid TypeScript type issues
      if (usersWithCompany.length > 0) {
        await withDbRetry(async () => {
          return db.execute(sql`UPDATE users SET company_id = NULL WHERE company_id = ${id}`);
        });
      }
      
      // Finally delete the company with retry logic
      await withDbRetry(async () => {
        return db.delete(companies).where(eq(companies.id, id));
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      throw new Error('Failed to delete company');
    }
  }

  // Company Users methods
  async getUsersByCompanyId(companyId: number): Promise<User[]> {
    // Add retry logic for retrieving users by company ID
    return withDbRetry(async () => {
      return db.select()
        .from(users)
        .where(eq(users.companyId, companyId));
    });
  }

  async assignUserToCompany(companyId: number, userId: number): Promise<User> {
    try {
      // Update the user's companyId with retry logic
      await withDbRetry(async () => {
        return db.update(users)
          .set({ companyId })
          .where(eq(users.id, userId));
      });
      
      // Get the updated user with retry logic
      const updatedUser = await withDbRetry(async () => {
        return db.query.users.findFirst({ where: eq(users.id, userId) });
      });
      
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error assigning user to company:', error);
      throw new Error('Failed to assign user to company');
    }
  }

  async removeUserFromCompany(userId: number): Promise<boolean> {
    try {
      // Get the user to verify it exists with retry logic
      const user = await withDbRetry(async () => {
        return db.query.users.findFirst({ where: eq(users.id, userId) });
      });
      
      if (!user) {
        return false;
      }
      
      // Update the user to remove company association with retry logic
      // Use SQL directly to set companyId to NULL to avoid TypeScript type issues
      await withDbRetry(async () => {
        return db.execute(sql`UPDATE users SET company_id = NULL WHERE id = ${userId}`);
      });
      
      return true;
    } catch (error) {
      console.error('Error removing user from company:', error);
      throw new Error('Failed to remove user from company');
    }
  }

  // Company Voices methods
  async getCompanyVoices(companyId: number): Promise<CompanyVoiceWithDetails[]> {
    try {
      console.log(`Fetching company voices for companyId: ${companyId}`);
      
      // First get the company voice associations with retry logic
      const companyVoiceAssociations = await withDbRetry(async () => {
        return db
          .select()
          .from(companyVoices)
          .where(eq(companyVoices.companyId, companyId));
      });
      
      console.log(`Found ${companyVoiceAssociations.length} company voice associations`);
      
      // Then for each association, get the voice details
      const result: CompanyVoiceWithDetails[] = [];
      
      for (const association of companyVoiceAssociations) {
        // Get voice details with retry logic
        const voiceDetails = await withDbRetry(async () => {
          return db
            .select()
            .from(voices)
            .where(eq(voices.voiceId, association.voiceId))
            .limit(1);
        });
        
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

    // Insert company-voice association with retry logic
    await withDbRetry(async () => {
      return db.insert(companyVoices).values(newCompanyVoice);
    });
    
    // Return the created association with retry logic
    const [created] = await withDbRetry(async () => {
      return db
        .select()
        .from(companyVoices)
        .where(
          and(
            eq(companyVoices.companyId, companyId),
            eq(companyVoices.voiceId, voiceId)
          )
        )
        .limit(1);
    });

    if (!created) {
      throw new Error('Failed to retrieve created company-voice association');
    }

    return created;
  }

  async removeVoiceFromCompany(companyId: number, voiceId: string): Promise<boolean> {
    // Delete company-voice association with retry logic
    await withDbRetry(async () => {
      return db
        .delete(companyVoices)
        .where(
          and(
            eq(companyVoices.companyId, companyId),
            eq(companyVoices.voiceId, voiceId)
          )
        );
    });

    // Check if any rows were affected with retry logic
    const deleted = await withDbRetry(async () => {
      return db
        .select()
        .from(companyVoices)
        .where(
          and(
            eq(companyVoices.companyId, companyId),
            eq(companyVoices.voiceId, voiceId)
          )
        )
        .limit(1);
    });

    return deleted.length === 0;
  }

  // Voice methods
  async getVoices(): Promise<Voice[]> {
    // Add retry logic for retrieving all voices
    return withDbRetry(async () => {
      return db.query.voices.findMany();
    });
  }

  async getVoiceById(id: string): Promise<Voice | null> {
    // Add retry logic for retrieving voice by ID
    const voice = await withDbRetry(async () => {
      return db.query.voices.findFirst({
        where: eq(voices.voiceId, id)
      });
    });
    return voice || null;
  }

  async createVoice(voice: InsertVoice): Promise<Voice> {
    // Add retry logic for voice creation
    await withDbRetry(async () => {
      return db.insert(voices).values(voice);
    });
    
    // Add retry logic for retrieving created voice
    const [created] = await withDbRetry(async () => {
      return db.select({
        voiceId: voices.voiceId,
        name: voices.name,
        category: voices.category,
        createdAt: voices.createdAt
      })
        .from(voices)
        .where(eq(voices.voiceId, voice.voiceId));
    });
    
    if (!created) {
      throw new Error('Failed to retrieve created voice');
    }
    
    return created;
  }

  async updateVoice(voiceId: string, updates: Partial<Omit<InsertVoice, 'voiceId'>>): Promise<Voice> {
    // Add retry logic for voice update
    await withDbRetry(async () => {
      return db.update(voices)
        .set(updates)
        .where(eq(voices.voiceId, voiceId));
    });
    
    // Add retry logic for retrieving updated voice
    const [updated] = await withDbRetry(async () => {
      return db.select({
        voiceId: voices.voiceId,
        name: voices.name,
        category: voices.category,
        createdAt: voices.createdAt
      })
        .from(voices)
        .where(eq(voices.voiceId, voiceId));
    });
      
    if (!updated) {
      throw new Error(`Voice with ID ${voiceId} not found`);
    }
    
    return updated;
  }

  async deleteVoice(voiceId: string): Promise<void> {
    // Add retry logic for voice deletion
    await withDbRetry(async () => {
      return db.delete(voices).where(eq(voices.voiceId, voiceId));
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    // Add retry logic for user retrieval
    return withDbRetry(async () => {
      return db.query.users.findFirst({ where: eq(users.id, id) });
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Add retry logic to this critical authentication function
    return withDbRetry(async () => {
      return db.query.users.findFirst({ where: eq(users.username, username) });
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Add retry logic for email-based user lookup
    return withDbRetry(async () => {
      return db.query.users.findFirst({ where: eq(users.email, email) });
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Insert the user and get the inserted ID with retry logic
      const [result] = await withDbRetry(async () => {
        return db.insert(users).values({
          ...insertUser,
          // Ensure required fields are set
          role: insertUser.role || 'user',
          createdAt: new Date(),
        });
      });
      
      // Fetch the inserted user with retry logic
      const user = await withDbRetry(async () => {
        return db.query.users.findFirst({ 
          where: eq(users.username, insertUser.username) 
        });
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
      // Insert the agent with retry logic
      await withDbRetry(async () => {
        return db.insert(agents).values({
          ...insertAgent,
          createdAt: new Date(),
        });
      });
      
      // Get the inserted agent by elevenlabsAgentId since it's unique with retry logic
      const agent = await withDbRetry(async () => {
        return db.query.agents.findFirst({ 
          where: eq(agents.elevenlabsAgentId, insertAgent.elevenlabsAgentId) 
        });
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
    // Add retry logic for retrieving all agents
    return withDbRetry(async () => {
      return db.query.agents.findMany();
    });
  }

  async getAgentsByCompanyId(companyId: number): Promise<Agent[]> {
    // Add retry logic for retrieving agents by company ID
    return withDbRetry(async () => {
      return db.query.agents.findMany({ where: eq(agents.companyId, companyId) });
    });
  }

  async getAgentById(agentId: number): Promise<Agent | undefined> {
    // Add retry logic for retrieving agent by ID
    return withDbRetry(async () => {
      return db.query.agents.findFirst({ where: eq(agents.id, agentId) });
    });
  }

  async updateAgent(agentId: number, update: Partial<Agent>): Promise<Agent | undefined> {
    try {
      // Update the agent with retry logic
      await withDbRetry(async () => {
        return db.update(agents)
          .set({
            ...update,
            updatedAt: new Date(),
          })
          .where(eq(agents.id, agentId));
      });
      
      // Fetch the updated agent with retry logic
      const updatedAgent = await withDbRetry(async () => {
        return db.query.agents.findFirst({ 
          where: eq(agents.id, agentId) 
        });
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
    // Add retry logic for retrieving all users
    return withDbRetry(async () => {
      return db.query.users.findMany();
    });
  }

  async updateUser(userId: number, update: Partial<User>): Promise<User | undefined> {
    try {
      // Update the user with retry logic
      await withDbRetry(async () => {
        return db.update(users)
          .set({
            ...update,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      });
      
      // Fetch the updated user with retry logic
      const updatedUser = await withDbRetry(async () => {
        return db.query.users.findFirst({ 
          where: eq(users.id, userId) 
        });
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
    // Add retry logic for agent lookup by ElevenLabs ID
    return withDbRetry(async () => {
      return db.query.agents.findFirst({ where: eq(agents.elevenlabsAgentId, elevenlabsAgentId) });
    });
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      // Check if user exists with retry logic
      const user = await withDbRetry(async () => {
        return db.query.users.findFirst({ where: eq(users.id, userId) });
      });
      
      if (!user) {
        return false;
      }
      
      // Delete the user with retry logic
      await withDbRetry(async () => {
        return db.delete(users).where(eq(users.id, userId));
      });
      
      // Verify deletion with retry logic
      const deletedUser = await withDbRetry(async () => {
        return db.query.users.findFirst({ where: eq(users.id, userId) });
      });
      
      return !deletedUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export const storage = new DbStorage();
