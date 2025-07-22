// drizzle.config.ts
import type { Config } from "drizzle-kit";
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
  }
} satisfies Config;