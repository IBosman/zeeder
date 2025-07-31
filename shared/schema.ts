// shared/schema.mysql.ts
import { 
  mysqlTable, 
  serial, 
  varchar, 
  int, 
  timestamp,
  text,
  json,
  primaryKey,
  foreignKey
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  companyId: serial("company_id"),
});

export const agents = mysqlTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  companyId: int("company_id").notNull(),
  elevenlabsAgentId: varchar("elevenlabs_agent_id", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Foreign key relationship
// Note: In MySQL, you'll need to add these as table options or use migrations

export const insertUserSchema = createInsertSchema(users);

export const insertAgentSchema = createInsertSchema(agents);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = Omit<typeof agents.$inferSelect, 'createdBy'> & { createdBy?: string };

export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const insertCompanySchema = createInsertSchema(companies);

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const voices = mysqlTable("voices", {
  voiceId: varchar("voice_id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertVoiceSchema = createInsertSchema(voices);

export type InsertVoice = z.infer<typeof insertVoiceSchema>;
export type Voice = typeof voices.$inferSelect;

export const companyVoices = mysqlTable("company_voices", {
  companyId: int("company_id").notNull(),
  voiceId: varchar("voice_id", { length: 255 }).notNull(),
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.companyId, table.voiceId] }),
  // Foreign key constraints
  companyFk: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
    name: "fk_company_voices_company"
  }),
  voiceFk: foreignKey({
    columns: [table.voiceId],
    foreignColumns: [voices.voiceId],
    name: "fk_company_voices_voice"
  })
}));

export const insertCompanyVoiceSchema = createInsertSchema(companyVoices);

export type InsertCompanyVoice = z.infer<typeof insertCompanyVoiceSchema>;
export type CompanyVoice = typeof companyVoices.$inferSelect;

// Type for joined company voice with voice details
export type CompanyVoiceWithDetails = CompanyVoice & {
  voice: Voice;
};
