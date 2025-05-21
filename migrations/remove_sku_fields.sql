
-- Remove sku and internal_base_code columns from tables

-- First, remove any constraints that might reference these columns
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_sku_key;
ALTER TABLE IF EXISTS base_products DROP CONSTRAINT IF EXISTS base_products_internal_base_code_key;

-- Then drop the columns
ALTER TABLE IF EXISTS products DROP COLUMN IF EXISTS sku;
ALTER TABLE IF EXISTS base_products DROP COLUMN IF EXISTS internal_base_code;
