#!/bin/bash

# Script to run the product catalog migration

echo "=== Starting Product Catalog Data Model Migration ==="

# 1. Push schema changes to the database
echo "Applying database schema changes..."
npx drizzle-kit push:pg

# 2. Run the data migration script
echo "Migrating existing data to new schema..."
npx tsx scripts/migrate-catalog.ts

echo "Migration process completed"