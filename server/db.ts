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
  keepAliveInitialDelay: 0,
  // Connection timeouts
  connectTimeout: 10000 // 10 seconds
});

// Log pool connection status
pool.on('connection', () => {
  console.log('New connection established with the database');
});

// Handle pool events
pool.on('acquire', () => {});
pool.on('release', () => {});
pool.on('enqueue', () => {});

// Use global error handler for uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Database pool error (unhandled rejection):', err);
});

// Clean shutdown to properly close connections
process.on('SIGINT', async () => {
  console.log('Closing database pool connections...');
  await pool.end();
  console.log('Database pool connections closed');
  process.exit(0);
});

// Create a Drizzle instance with the pool
export const db = drizzle(pool, { schema, mode: "default" });

// Create a retry wrapper for database operations
export async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if this is a connection error we should retry
      const isConnectionError = isRetryableDbError(error);
      
      if (!isConnectionError || retryCount >= maxRetries) {
        // Either not a retryable error or we've exhausted retries
        break;
      }
      
      // Exponential backoff: 300ms, 600ms, 1200ms
      const delay = 300 * Math.pow(2, retryCount);
      console.log(`Database connection error, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      console.log(`Error details: ${error.code || 'unknown'} - ${error.message || 'No message'}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

// Helper to check if an error is retryable
function isRetryableDbError(error: any): boolean {
  if (!error) return false;
  
  // Common MySQL connection error codes
  const retryableCodes = [
    'ECONNRESET',
    'ETIMEDOUT', 
    'ECONNREFUSED',
    'PROTOCOL_CONNECTION_LOST',
    'PROTOCOL_SEQUENCE_TIMEOUT',
    'ER_LOCK_WAIT_TIMEOUT'
  ];
  
  // Check direct error code
  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }
  
  // Check for Drizzle wrapped errors
  if (error.cause) {
    return isRetryableDbError(error.cause);
  }
  
  return false;
}