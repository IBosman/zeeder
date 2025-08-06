import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";
import dotenv from "dotenv";

dotenv.config();

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "leadsgpt",
  waitForConnections: true,
  connectionLimit: 3,  // Maximum number of connections in the pool
  queueLimit: 0,        // Unlimited queue size
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Log pool connection status
pool.on('connection', () => {
  console.log('New connection established with the database');
});

// Handle pool errors
pool.on('acquire', () => {});
pool.on('release', () => {});
pool.on('enqueue', () => {});

// Use global error handler for uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Database pool error (unhandled rejection):', err);
});

// Use the pool with Drizzle ORM
export const db = drizzle(pool, { schema, mode: "default" });