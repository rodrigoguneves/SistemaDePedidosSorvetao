#!/bin/bash
set -e
echo "Running SQL migration to remove sku fields..."
DATABASE_URL=${DATABASE_URL} psql -f migrations/remove_sku_fields.sql
echo "Migration completed successfully!"
