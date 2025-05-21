/**
 * Script to launch Drizzle Studio - a UI for database management
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
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
  console.log("Starting Drizzle Studio...")
  console.log("You can use this UI to view and manage your database tables")
  
  // This will make Drizzle Studio available on a local port
  // In Replit, this should open in a new Webview
  const { createServer } = await import('drizzle-studio/server');
  await createServer({
    driver: 'pg',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL,
    },
    schema: './shared/schema.ts',
    port: 3333
  }).start();
}

main();