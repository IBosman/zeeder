import { drizzle } from "drizzle-orm/mysql2";
import {createConnection} from "mysql2/promise";
import * as schema from "../shared/schema";
import dotenv from "dotenv";

dotenv.config();

const connection = await createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "leadsgpt",
});

export const db = drizzle(connection, { schema, mode: "default" }); 