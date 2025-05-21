-- Product Catalog Data Model Migration SQL

-- Create enums first
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'customer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'processing', 'ready', 'delivered', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_fulfillment') THEN
        CREATE TYPE order_fulfillment AS ENUM ('pickup', 'delivery');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('revenue', 'expense', 'transfer');
    END IF;
END $$;

-- Create new tables for catalog refactoring

-- 1. Sale Units table
CREATE TABLE IF NOT EXISTS sale_units (
    sale_unit_id SERIAL PRIMARY KEY,
    unit_name TEXT NOT NULL UNIQUE,
    short_description TEXT,
    base_equivalent_quantity INTEGER,
    applicable_product_type_tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Base Products table
CREATE TABLE IF NOT EXISTS base_products (
    base_product_id SERIAL PRIMARY KEY,
    product_category_id INTEGER REFERENCES product_categories(id),
    base_product_name TEXT NOT NULL,
    internal_base_code TEXT UNIQUE,
    long_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    allows_decimal_quantity BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 3. Product Sale Versions table
CREATE TABLE IF NOT EXISTS product_sale_versions (
    product_version_id SERIAL PRIMARY KEY,
    base_product_id INTEGER NOT NULL REFERENCES base_products(base_product_id),
    sale_unit_id INTEGER NOT NULL REFERENCES sale_units(sale_unit_id),
    price INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_product_unit_idx UNIQUE (base_product_id, sale_unit_id)
);

-- 4. Customer-Category-SaleUnit access model
CREATE TABLE IF NOT EXISTS customer_category_allowed_sale_units (
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    sale_unit_id INTEGER NOT NULL REFERENCES sale_units(sale_unit_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (customer_id, product_category_id, sale_unit_id)
);

-- 5. Update order_items table to work with new product versions
CREATE TABLE IF NOT EXISTS order_items_new (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_version_id INTEGER NOT NULL REFERENCES product_sale_versions(product_version_id),
    quantity DOUBLE PRECISION NOT NULL,
    price_at_purchase INTEGER NOT NULL,
    item_subtotal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Note: We'll keep the old order_items table for backward compatibility
-- After migration, we'll need to manually migrate order_items data to order_items_new