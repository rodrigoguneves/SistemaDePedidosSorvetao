/**
 * Script to execute the product catalog data model migration
 */

import { migrateProductCatalog } from "../server/migration";
import { db } from "../server/db";

async function main() {
  console.log("=== Starting Product Catalog Data Model Migration ===");
  
  try {
    // First, push the schema changes to the database
    console.log("Applying schema changes...");
    
    // The schema changes have already been defined in shared/schema.ts
    // Use drizzle-kit to push these changes
    
    // Then run the data migration
    console.log("Starting data migration...");
    const success = await migrateProductCatalog();
    
    if (success) {
      console.log("Migration completed successfully!");
    } else {
      console.error("Migration failed. See logs for details.");
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
}

main();