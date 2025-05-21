# Product Catalog Data Model Refactoring Plan

## Current System Analysis

The ice cream factory platform currently has a product management system with the following characteristics:

1. Products are managed through a single `products` table with:
   - Basic fields (name, description, sku, etc.)
   - A direct relationship to a product category
   - A simple `unit_of_sale` text field with no standardization
   - A single price point per product

2. Customer access to products is managed through:
   - `customer_categories` table (allows access to entire categories)
   - `customer_products` table (allows access to specific products)

3. Order items reference products directly with:
   - Simple quantity
   - Unit price at time of purchase
   - Total price calculation

## Required Data Model Changes

### 1. Create New `sale_units` Table
This will replace the current free-text `unit_of_sale` field with standardized units.

```typescript
export const saleUnits = pgTable('sale_units', {
  sale_unit_id: serial('sale_unit_id').primaryKey(),
  unit_name: text('unit_name').notNull().unique(),
  short_description: text('short_description'),
  base_equivalent_quantity: integer('base_equivalent_quantity'),
  applicable_product_type_tags: text('applicable_product_type_tags').array(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
```

### 2. Rename and Modify `products` Table to `base_products`

```typescript
export const baseProducts = pgTable('base_products', {
  base_product_id: serial('base_product_id').primaryKey(),
  product_category_id: integer('product_category_id').references(() => productCategories.id),
  base_product_name: text('base_product_name').notNull(),
  internal_base_code: text('internal_base_code').unique(),
  long_description: text('long_description'),
  is_active: boolean('is_active').default(true),
  allows_decimal_quantity: boolean('allows_decimal_quantity').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
});
```

### 3. Create New `product_sale_versions` Table
This table will contain the combinations of base products with sale units and their respective prices.

```typescript
export const productSaleVersions = pgTable('product_sale_versions', {
  product_version_id: serial('product_version_id').primaryKey(),
  base_product_id: integer('base_product_id').notNull().references(() => baseProducts.base_product_id),
  sale_unit_id: integer('sale_unit_id').notNull().references(() => saleUnits.sale_unit_id),
  price: integer('price').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},
(table) => {
  return {
    // Each base product can only have one version per sale unit
    uniqueProductUnit: uniqueIndex('unique_product_unit_idx').on(table.base_product_id, table.sale_unit_id),
  };
});
```

### 4. Create New Customer Category Allowed Sale Units Table

```typescript
export const customerCategoryAllowedSaleUnits = pgTable('customer_category_allowed_sale_units', {
  customer_id: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  product_category_id: integer('product_category_id').notNull().references(() => productCategories.id, { onDelete: 'cascade' }),
  sale_unit_id: integer('sale_unit_id').notNull().references(() => saleUnits.sale_unit_id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
},
(table) => {
  return {
    pk: primaryKey({ columns: [table.customer_id, table.product_category_id, table.sale_unit_id] }),
  };
});
```

### 5. Update Order Items Table

```typescript
export const orderItems = pgTable('order_items', {
  order_item_id: serial('order_item_id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  product_version_id: integer('product_version_id').notNull().references(() => productSaleVersions.product_version_id),
  quantity: doublePrecision('quantity').notNull(),
  price_at_purchase: integer('price_at_purchase').notNull(),
  item_subtotal: integer('item_subtotal').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
```

## Implementation Phases

### Phase 1: Schema Updates

1. **Update shared/schema.ts** with the new table definitions
   - Create all new tables mentioned above
   - Update relations between tables
   - Create insert schemas for each new table

### Phase 2: Data Migration Strategy

1. **Create a migration script** to:
   - Pre-populate the `sale_units` table with standard units
   - Create records in `base_products` based on existing `products`
   - Create records in `product_sale_versions` linking each base product to its appropriate sale unit based on the existing `unit_of_sale` field
   - Convert customer access data to the new model
   - Update existing order items to reference the proper `product_version_id`

### Phase 3: Update Storage Interface and Implementation

1. **Update IStorage interface** in storage.ts to include:
   - CRUD operations for sale units
   - CRUD operations for base products
   - CRUD operations for product sale versions
   - CRUD operations for customer category allowed sale units
   - Updated order item operations

2. **Implement the updated methods** in the DatabaseStorage class

### Phase 4: Update API Routes

1. **Update routes.ts** to add endpoints for:
   - Sale unit management
   - Base product management
   - Product sale version management
   - Customer catalog assignment
   - Order processing with the new data model

### Phase 5: Testing Strategy

1. **Backend Testing**
   - Verify that all API endpoints work correctly with the new data model
   - Ensure that data migrations were successful
   - Test customer-specific catalog filtering

2. **Database Testing**
   - Verify that all database constraints work as expected
   - Check that the new relationships between tables are properly enforced

## Specific Implementation Details

### Customer Catalog Logic Update

```typescript
// Example implementation for getting products a customer can access
async getCustomerProductVersions(customerId: number): Promise<ProductSaleVersion[]> {
  // Get categories the customer has access to
  const customerCategories = await this.getCustomerCategories(customerId);
  
  // Get allowed sale units for each category
  const allowedSaleUnits = await db
    .select({ 
      category_id: customerCategoryAllowedSaleUnits.product_category_id,
      sale_unit_id: customerCategoryAllowedSaleUnits.sale_unit_id 
    })
    .from(customerCategoryAllowedSaleUnits)
    .where(eq(customerCategoryAllowedSaleUnits.customer_id, customerId));
  
  // Group allowed sale units by category
  const saleUnitsByCategory = allowedSaleUnits.reduce((acc, curr) => {
    if (!acc[curr.category_id]) {
      acc[curr.category_id] = [];
    }
    acc[curr.category_id].push(curr.sale_unit_id);
    return acc;
  }, {} as Record<number, number[]>);
  
  // Get all product versions for the allowed categories and sale units
  const productVersionsPromises = customerCategories.map(async (category) => {
    const allowedSaleUnitIds = saleUnitsByCategory[category.id] || [];
    if (allowedSaleUnitIds.length === 0) return [];
    
    return db
      .select({ 
        version: productSaleVersions 
      })
      .from(productSaleVersions)
      .innerJoin(
        baseProducts, 
        eq(productSaleVersions.base_product_id, baseProducts.base_product_id)
      )
      .where(and(
        eq(baseProducts.product_category_id, category.id),
        inArray(productSaleVersions.sale_unit_id, allowedSaleUnitIds),
        eq(productSaleVersions.is_active, true),
        eq(baseProducts.is_active, true),
        isNull(baseProducts.deleted_at)
      ));
  });
  
  const productVersionsResults = await Promise.all(productVersionsPromises);
  const allProductVersions = productVersionsResults.flat().map(result => result.version);
  
  // Remove duplicates if any
  return Array.from(new Map(allProductVersions.map(v => [v.product_version_id, v])).values());
}
```

### Order Creation Logic Update

```typescript
// Example implementation for creating an order with the new data model
async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
  return db.transaction(async (tx) => {
    // Insert the order
    const [newOrder] = await tx.insert(orders).values(order).returning();
    
    // Process each item
    const processedItems = await Promise.all(items.map(async (item) => {
      // Get the product version to have access to the current price
      const productVersion = await tx
        .select()
        .from(productSaleVersions)
        .where(eq(productSaleVersions.product_version_id, item.product_version_id))
        .limit(1);
      
      if (productVersion.length === 0) {
        throw new Error(`Product version with ID ${item.product_version_id} not found`);
      }
      
      // Use the current price from the product version
      const currentPrice = productVersion[0].price;
      const subtotal = Math.round(item.quantity * currentPrice);
      
      return {
        ...item,
        order_id: newOrder.id,
        price_at_purchase: currentPrice,
        item_subtotal: subtotal
      };
    }));
    
    // Insert all order items
    await tx.insert(orderItems).values(processedItems);
    
    // Calculate and update order totals
    const subtotal = processedItems.reduce((sum, item) => sum + item.item_subtotal, 0);
    const total = subtotal + (order.delivery_fee || 0) - (order.discount_amount || 0);
    
    const [updatedOrder] = await tx
      .update(orders)
      .set({ 
        subtotal, 
        total,
        updated_at: new Date()
      })
      .where(eq(orders.id, newOrder.id))
      .returning();
    
    return updatedOrder;
  });
}
```

## Migration Approach

We'll use the Drizzle ORM's built-in `npm run db:push` approach to update the database schema. This approach will:

1. Create the new tables
2. Migrate data from the old structure to the new one
3. Update all relationships

The critical challenge will be ensuring data integrity during the migration, especially for order items that currently directly reference products but need to reference product versions after the migration.

## Recommended Testing Strategy

1. First, create a backup of the database
2. Apply the schema changes and run migration scripts in a test environment
3. Validate that all operations (read/write) work correctly with the new data model
4. Perform a final migration on the production database

This refactoring will significantly improve the flexibility of the product catalog system, allowing for different sale units and pricing for the same base product while providing fine-grained control over what customers can access.

# Plan to Remove SKU from Products Table and Project

## Overview
The project currently uses the `sku` field in the `products` table and the `internal_base_code` field (which serves the same purpose) in the `base_products` table. Based on your request to completely remove this field and all references to it, I've identified the key areas that need modification.

## Analysis of Current Usage

### Database Schema
- In `shared/schema.ts`, the `sku` field is defined in the `products` table
- In `baseProducts` table, there's a field called `internal_base_code` which serves the same purpose

### User Interface
- In `client/src/pages/admin/produtos.tsx`, the UI includes form fields for SKU input and display
- In `client/src/pages/admin/products.tsx`, SKU is also referenced
- In `client/src/pages/admin/base-products.tsx`, the equivalent `internal_base_code` is used

### API and Server Logic
- The schema validations in `shared/schema.ts` require SKU
- Server storage functions may be using this field for operations

## Implementation Plan

### 1. Update Database Schema
- Modify `shared/schema.ts` to remove the `sku` field from the `products` table
- Remove the `internal_base_code` from the `baseProducts` table
- Update related validation schemas

### 2. Update UI Components
- Remove SKU field from product creation/editing forms in `produtos.tsx` and other related files
- Remove SKU from display tables and cards

### 3. Update Server Logic
- Check and update any server-side functions that might be using the SKU field
- Update migration scripts if necessary

### 4. Test Changes
After implementing these changes, make sure to test:
- Product creation without SKU
- Existing products still display correctly
- Search and filtering functionality works properly
- Any imports/exports that might have used SKU

## Potential Issues
- Database migrations: If there are existing products, removing the column might require a separate migration
- Code relying on SKU: There might be logic that depends on SKU uniqueness that needs to be adjusted
- External integrations: If the system integrates with other systems using SKU, these integrations need updating

## Execution Steps
1. Backup data if needed
2. Implement schema changes
3. Update UI components
4. Test thoroughly
5. Deploy changes

## Files to Modify
1. `shared/schema.ts`
2. `client/src/pages/admin/produtos.tsx`
3. `client/src/pages/admin/products.tsx`
4. `client/src/pages/admin/base-products.tsx`
5. Any other files that might reference SKU or internal_base_code