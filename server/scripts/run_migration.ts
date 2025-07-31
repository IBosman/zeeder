import { db } from '../db';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Split the SQL file into individual statements
    const statements = sqlContent.split(';').filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() === '') continue;
      console.log(`Executing: ${statement.trim()}`);
      await db.execute(sql.raw(statement));
    }
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
