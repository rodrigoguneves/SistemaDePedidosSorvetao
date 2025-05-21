/**
 * Script to inspect database schema
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize the connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

async function main() {
  console.log("Connecting to database and inspecting tables...");
  
  try {
    // Query database tables
    const tableQuery = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    
    console.log("\nAvailable tables in database:");
    for (const row of tableQuery) {
      console.log(`- ${row.table_name}`);
    }
    
    console.log("\nDatabase connection successful!");
    console.log("You can now run the migration script to update the schema.");
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await sql.end();
  }
}

main();