// shared/schema.mysql.ts
import { 
  mysqlTable, 
  serial, 
  varchar, 
  int, 
  timestamp  // Add this import
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const agents = mysqlTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  userId: int("user_id").notNull(),
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