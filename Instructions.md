1:# Product Catalog Data Model Refactoring Plan
2:
3:## Current System Analysis
4:
5:The ice cream factory platform currently has a product management system with the following characteristics:
6:
7:1. Products are managed through a single `products` table with:
8:   - Basic fields (name, description, sku, etc.)
9:   - A direct relationship to a product category
10:   - A simple `unit_of_sale` text field with no standardization
11:   - A single price point per product
12:
13:2. Customer access to products is managed through:
14:   - `customer_categories` table (allows access to entire categories)
15:   - `customer_products` table (allows access to specific products)
16:
17:3. Order items reference products directly with:
18:   - Simple quantity
19:   - Unit price at time of purchase
20:   - Total price calculation
21:
22:## Required Data Model Changes
23:
24:### 1. Create New `sale_units` Table
25:This will replace the current free-text `unit_of_sale` field with standardized units.
26:
27:```typescript
28:export const saleUnits = pgTable('sale_units', {
29:  sale_unit_id: serial('sale_unit_id').primaryKey(),
30:  unit_name: text('unit_name').notNull().unique(),
31:  short_description: text('short_description'),
32:  base_equivalent_quantity: integer('base_equivalent_quantity'),
33:  applicable_product_type_tags: text('applicable_product_type_tags').array(),
34:  created_at: timestamp('created_at').defaultNow(),
35:  updated_at: timestamp('updated_at').defaultNow(),
36:});
37:```
38:
39:### 2. Rename and Modify `products` Table to `base_products`
40:
41:```typescript
42:export const baseProducts = pgTable('base_products', {
43:  base_product_id: serial('base_product_id').primaryKey(),
44:  product_category_id: integer('product_category_id').references(() => productCategories.id),
45:  base_product_name: text('base_product_name').notNull(),
46:  internal_base_code: text('internal_base_code').unique(),
47:  long_description: text('long_description'),
48:  is_active: boolean('is_active').default(true),
49:  allows_decimal_quantity: boolean('allows_decimal_quantity').default(false),
50:  created_at: timestamp('created_at').defaultNow(),
51:  updated_at: timestamp('updated_at').defaultNow(),
52:  deleted_at: timestamp('deleted_at'),
53:});
54:```
55:
56:### 3. Create New `product_sale_versions` Table
57:This table will contain the combinations of base products with sale units and their respective prices.
58:
59:```typescript
60:export const productSaleVersions = pgTable('product_sale_versions', {
61:  product_version_id: serial('product_version_id').primaryKey(),
62:  base_product_id: integer('base_product_id').notNull().references(() => baseProducts.base_product_id),
63:  sale_unit_id: integer('sale_unit_id').notNull().references(() => saleUnits.sale_unit_id),
64:  price: integer('price').notNull(),
65:  is_active: boolean('is_active').default(true),
66:  created_at: timestamp('created_at').defaultNow(),
67:  updated_at: timestamp('updated_at').defaultNow(),
68:},
69:(table) => {
70:  return {
71:    // Each base product can only have one version per sale unit
72:    uniqueProductUnit: uniqueIndex('unique_product_unit_idx').on(table.base_product_id, table.sale_unit_id),
73:  };
74:});
75:```
76:
77:### 4. Create New Customer Category Allowed Sale Units Table
78:
79:```typescript
80:export const customerCategoryAllowedSaleUnits = pgTable('customer_category_allowed_sale_units', {
81:  customer_id: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
82:  product_category_id: integer('product_category_id').notNull().references(() => productCategories.id, { onDelete: 'cascade' }),
83:  sale_unit_id: integer('sale_unit_id').notNull().references(() => saleUnits.sale_unit_id, { onDelete: 'cascade' }),
84:  created_at: timestamp('created_at').defaultNow(),
85:},
86:(table) => {
87:  return {
88:    pk: primaryKey({ columns: [table.customer_id, table.product_category_id, table.sale_unit_id] }),
89:  };
90:});
91:```
92:
93:### 5. Update Order Items Table
94:
95:```typescript
96:export const orderItems = pgTable('order_items', {
97:  order_item_id: serial('order_item_id').primaryKey(),
98:  order_id: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
99:  product_version_id: integer('product_version_id').notNull().references(() => productSaleVersions.product_version_id),
100:  quantity: doublePrecision('quantity').notNull(),
101:  price_at_purchase: integer('price_at_purchase').notNull(),
102:  item_subtotal: integer('item_subtotal').notNull(),
103:  created_at: timestamp('created_at').defaultNow(),
104:});
105:```
106:
107:## Implementation Phases
108:
109:### Phase 1: Schema Updates
110:
111:1. **Update shared/schema.ts** with the new table definitions
112:   - Create all new tables mentioned above
113:   - Update relations between tables
114:   - Create insert schemas for each new table
115:
116:### Phase 2: Data Migration Strategy
117:
118:1. **Create a migration script** to:
119:   - Pre-populate the `sale_units` table with standard units
120:   - Create records in `base_products` based on existing `products`
121:   - Create records in `product_sale_versions` linking each base product to its appropriate sale unit based on the existing `unit_of_sale` field
122:   - Convert customer access data to the new model
123:   - Update existing order items to reference the proper `product_version_id`
124:
125:### Phase 3: Update Storage Interface and Implementation
126:
127:1. **Update IStorage interface** in storage.ts to include:
128:   - CRUD operations for sale units
129:   - CRUD operations for base products
130:   - CRUD operations for product sale versions
131:   - CRUD operations for customer category allowed sale units
132:   - Updated order item operations
133:
134:2. **Implement the updated methods** in the DatabaseStorage class
135:
136:### Phase 4: Update API Routes
137:
138:1. **Update routes.ts** to add endpoints for:
139:   - Sale unit management
140:   - Base product management
141:   - Product sale version management
142:   - Customer catalog assignment
143:   - Order processing with the new data model
144:
145:### Phase 5: Testing Strategy
146:
147:1. **Backend Testing**
148:   - Verify that all API endpoints work correctly with the new data model
149:   - Ensure that data migrations were successful
150:   - Test customer-specific catalog filtering
151:
152:2. **Database Testing**
153:   - Verify that all database constraints work as expected
154:   - Check that the new relationships between tables are properly enforced
155:
156:## Specific Implementation Details
157:
158:### Customer Catalog Logic Update
159:
160:```typescript
161:// Example implementation for getting products a customer can access
162:async getCustomerProductVersions(customerId: number): Promise<ProductSaleVersion[]> {
163:  // Get categories the customer has access to
164:  const customerCategories = await this.getCustomerCategories(customerId);
165:  
166:  // Get allowed sale units for each category
167:  const allowedSaleUnits = await db
168:    .select({ 
169:      category_id: customerCategoryAllowedSaleUnits.product_category_id,
170:      sale_unit_id: customerCategoryAllowedSaleUnits.sale_unit_id 
171:    })
172:    .from(customerCategoryAllowedSaleUnits)
173:    .where(eq(customerCategoryAllowedSaleUnits.customer_id, customerId));
174:  
175:  // Group allowed sale units by category
176:  const saleUnitsByCategory = allowedSaleUnits.reduce((acc, curr) => {
177:    if (!acc[curr.category_id]) {
178:      acc[curr.category_id] = [];
179:    }
180:    acc[curr.category_id].push(curr.sale_unit_id);
181:    return acc;
182:  }, {} as Record<number, number[]>);
183:  
184:  // Get all product versions for the allowed categories and sale units
185:  const productVersionsPromises = customerCategories.map(async (category) => {
186:    const allowedSaleUnitIds = saleUnitsByCategory[category.id] || [];
187:    if (allowedSaleUnitIds.length === 0) return [];
188:    
189:    return db
190:      .select({ 
191:        version: productSaleVersions 
192:      })
193:      .from(productSaleVersions)
194:      .innerJoin(
195:        baseProducts, 
196:        eq(productSaleVersions.base_product_id, baseProducts.base_product_id)
197:      )
198:      .where(and(
199:        eq(baseProducts.product_category_id, category.id),
200:        inArray(productSaleVersions.sale_unit_id, allowedSaleUnitIds),
201:        eq(productSaleVersions.is_active, true),
202:        eq(baseProducts.is_active, true),
203:        isNull(baseProducts.deleted_at)
204:      ));
205:  });
206:  
207:  const productVersionsResults = await Promise.all(productVersionsPromises);
208:  const allProductVersions = productVersionsResults.flat().map(result => result.version);
209:  
210:  // Remove duplicates if any
211:  return Array.from(new Map(allProductVersions.map(v => [v.product_version_id, v])).values());
212:}
213:```
214:
215:### Order Creation Logic Update
216:
217:```typescript
218:// Example implementation for creating an order with the new data model
219:async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
220:  return db.transaction(async (tx) => {
221:    // Insert the order
222:    const [newOrder] = await tx.insert(orders).values(order).returning();
223:    
224:    // Process each item
225:    const processedItems = await Promise.all(items.map(async (item) => {
226:      // Get the product version to have access to the current price
227:      const productVersion = await tx
228:        .select()
229:        .from(productSaleVersions)
230:        .where(eq(productSaleVersions.product_version_id, item.product_version_id))
231:        .limit(1);
232:      
233:      if (productVersion.length === 0) {
234:        throw new Error(`Product version with ID ${item.product_version_id} not found`);
235:      }
236:      
237:      // Use the current price from the product version
238:      const currentPrice = productVersion[0].price;
239:      const subtotal = Math.round(item.quantity * currentPrice);
240:      
241:      return {
242:        ...item,
243:        order_id: newOrder.id,
244:        price_at_purchase: currentPrice,
245:        item_subtotal: subtotal
246:      };
247:    }));
248:    
249:    // Insert all order items
250:    await tx.insert(orderItems).values(processedItems);
251:    
252:    // Calculate and update order totals
253:    const subtotal = processedItems.reduce((sum, item) => sum + item.item_subtotal, 0);
254:    const total = subtotal + (order.delivery_fee || 0) - (order.discount_amount || 0);
255:    
256:    const [updatedOrder] = await tx
257:      .update(orders)
258:      .set({ 
259:        subtotal, 
260:        total,
261:        updated_at: new Date()
262:      })
263:      .where(eq(orders.id, newOrder.id))
264:      .returning();
265:    
266:    return updatedOrder;
267:  });
268:}
269:```
270:
271:## Migration Approach
272:
273:We'll use the Drizzle ORM's built-in `npm run db:push` approach to update the database schema. This approach will:
274:
275:1. Create the new tables
276:2. Migrate data from the old structure to the new one
277:3. Update all relationships
278:
279:The critical challenge will be ensuring data integrity during the migration, especially for order items that currently directly reference products but need to reference product versions after the migration.
280:
281:## Recommended Testing Strategy
282:
283:1. First, create a backup of the database
284:2. Apply the schema changes and run migration scripts in a test environment
285:3. Validate that all operations (read/write) work correctly with the new data model
286:4. Perform a final migration on the production database
287:
288:This refactoring will significantly improve the flexibility of the product catalog system, allowing for different sale units and pricing for the same base product while providing fine-grained control over what customers can access.
289:
290:# Plan to Remove SKU from Products Table and Project
291:
292:## Overview
293:The project currently uses the `sku` field in the `products` table and the `internal_base_code` field (which serves the same purpose) in the `base_products` table. Based on your request to completely remove this field and all references to it, I've identified the key areas that need modification.
294:
295:## Analysis of Current Usage
296:
297:### Database Schema
298:- In `shared/schema.ts`, the `sku` field is defined in the `products` table
299:- In `baseProducts` table, there's a field called `internal_base_code` which serves the same purpose
300:
301:### User Interface
302:- In `client/src/pages/admin/produtos.tsx`, the UI includes form fields for SKU input and display
303:- In `client/src/pages/admin/products.tsx`, SKU is also referenced
304:- In `client/src/pages/admin/base-products.tsx`, the equivalent `internal_base_code` is used
305:
306:### API and Server Logic
307:- The schema validations in `shared/schema.ts` require SKU
308:- Server storage functions may be using this field for operations
309:
310:## Implementation Plan
311:
312:### 1. Update Database Schema
313:- Modify `shared/schema.ts` to remove the `sku` field from the `products` table
314:- Remove the `internal_base_code` from the `baseProducts` table
315:- Update related validation schemas
316:
317:### 2. Update UI Components
318:- Remove SKU field from product creation/editing forms in `produtos.tsx` and other related files
319:- Remove SKU from display tables and cards
320:
321:### 3. Update Server Logic
322:- Check and update any server-side functions that might be using the SKU field
323:- Update migration scripts if necessary
324:
325:### 4. Test Changes
326:After implementing these changes, make sure to test:
327:- Product creation without SKU
328:- Existing products still display correctly
329:- Search and filtering functionality works properly
330:- Any imports/exports that might have used SKU
331:
332:## Potential Issues
333:- Database migrations: If there are existing products, removing the column might require a separate migration
334:- Code relying on SKU: There might be logic that depends on SKU uniqueness that needs to be adjusted
335:- External integrations: If the system integrates with other systems using SKU, these integrations need updating
336:
337:## Execution Steps
338:1. Backup data if needed
339:2. Implement schema changes
340:3. Update UI components
341:4. Test thoroughly
342:5. Deploy changes
343:
344:## Files to Modify
345:1. `shared/schema.ts`
346:2. `client/src/pages/admin/produtos.tsx`
347:3. `client/src/pages/admin/products.tsx`
348:4. `client/src/pages/admin/base-products.tsx`
349:5. Any other files that might reference SKU or internal_base_code
350:# Backend to Frontend Integration Plan: Migrating to New Product Data Model
351:
352:## Problem Analysis
353:
354:The application is transitioning from a simple product model to a more flexible model with:
355:1. `base_products` - Core product information
356:2. `sale_units` - Standardized units of sale
357:3. `product_sale_versions` - Combinations of products and sale units with specific prices
358:
359:Currently, the product form in `produtos.tsx` is still using the old model and submitting to the old API endpoints. The "Unidade de Venda" field is a free-text input instead of being connected to the sale_units table.
360:
361:## Solution Steps
362:
363:### 1. Update Product Form in produtos.tsx
364:
365:- Modify the product form schema to align with the new data model
366:- Change the "Unidade de Venda" field to be a dropdown populated with sale_units from the API
367:- Update form submission logic to create both a base product and a product sale version
368:
369:### 2. Add API Query for Sale Units
370:
371:- Add a query to fetch sale units from the `/api/sale-units` endpoint
372:- Populate the dropdown with these units
373:
374:### 3. Update Form Submission Logic
375:
376:- When creating/editing a product, submit to both the base_products and product_sale_versions endpoints
377:- For editing, handle the relationship between the two tables properly
378:
379:### 4. Modify Product Display Logic
380:
381:- Update how products are displayed in the UI to reflect the new data model
382:- Show the associated sale unit information from the product_sale_versions table
383:
384:## Implementation
385:
386:The following files need to be modified:
387:
388:1. `client/src/pages/admin/produtos.tsx` - The main product management page
389:2. `server/routes.ts` - Ensure backend routes support the new model interactions
390:3. Additional API client functions as needed
391:
392:## Code Changes
393:
394:# Product Management System Integration Issues & Solutions
395:
396:## Problem Analysis
397:
398:After analyzing the codebase, I've identified two main issues with the product management system:
399:
400:1. **API Endpoint Function Missing**: The backend is missing implementation for some of the API endpoints required for the new database schema (`base_products` and `product_sale_versions`).
401:
402:2. **Error in Frontend-Backend Integration**: The frontend in `produtos.tsx` is attempting to use these missing functions when creating or fetching product data.
403:
404:## Specific Issues Found
405:
406:### Backend Issues:
407:1. In the error logs: `TypeError: storage.getProductVersions is not a function`
408:2. In the error logs: `TypeError: storage.createProductVersion is not a function`
409:
410:These errors indicate that while the API endpoints for `/api/product-versions` are defined in `routes.ts`, the corresponding functions in `storage.ts` are named differently.
411:
412:### Core Issue:
413:The function names in `storage.ts` do not match what's being called in `routes.ts`:
414:- `getProductVersions` should be `getProductSaleVersions` 
415:- `createProductVersion` should be `createProductSaleVersion`
416:
417:## Solution Plan
418:
419:### 1. Correct the Storage Methods in routes.ts
420:
421:Update the function calls in `routes.ts` to match the actual method names defined in `storage.ts`:
422:
423:- Replace `storage.getProductVersions()` with `storage.getProductSaleVersions()`
424:- Replace `storage.createProductVersion()` with `storage.createProductSaleVersion()`
425:
426:### 2. Ensure Type Consistency
427:
428:Make sure we're using the correct TypeScript types across the codebase, particularly in the frontend component `produtos.tsx`.
429:
430:## Implementation Steps
431:
432:1. Modify `server/routes.ts` to use the correct function names for product version operations
433:2. Verify the frontend is using the proper interfaces and types 
434:3. Test the product creation flow to ensure both the base product and its sale versions are correctly saved
435:
436:## Expected Results
437:
438:After these changes:
439:1. The product listing page will successfully load both base products and their associated sale versions
440:2. The product creation form will properly save new products to both the `base_products` and `product_sale_versions` tables
441:3. All CRUD operations will function correctly with the new database schema
442:
443:## Long-term Recommendations
444:
445:1. Consider standardizing naming conventions across the codebase (e.g., `productSaleVersions` vs `productVersions`)
446:2. Add more comprehensive error handling to provide clearer feedback when API failures occur
447:3. Consider adding integration tests to catch these types of mismatches earlier
448:
449:# Customer Management - Implementation Instructions
450:
451:## Overview
452:
453:This document provides instructions for implementing the customer management functionality in the application, connecting the frontend with the backend database. It focuses on:
454:
455:1. Listing customers from the database
456:2. Creating new customers
457:3. Reading customer details
458:4. Updating customer information
459:5. Deleting customers
460:
461:## Current State Analysis
462:
463:### Backend
464:- You have a PostgreSQL database with a `customers` table
465:- Server routes for customer CRUD operations exist in `/server/routes.ts`
466:- Storage functions for customer operations exist in `/server/storage.ts`
467:- Schema definition for customers exists in `/shared/schema.ts`
468:
469:### Frontend
470:- Customer listing page exists at `/client/src/pages/admin/customers.tsx`
471:- Add customer page exists at `/client/src/pages/admin/add-customer.tsx`
472:- Both pages have UI elements, but are not properly connected to the backend API
473:
474:## Issues & Solutions
475:
476:### Issue 1: Customers aren't loading from the database
477:- The `customers.tsx` page has a query to load customers but is displaying sample data
478:- The actual customers from the database aren't being displayed
479:
480:**Solution:**
481:- Modify the customers page to properly use the actual data from the API
482:- Replace the hard-coded sample table rows with dynamic rendering from the API data
483:- Add proper error handling and loading states
484:
485:### Issue 2: Add customer functionality is not working correctly
486:- The form in `add-customer.tsx` is set up but may not be sending data in the right format
487:- There might be a disconnect between the form fields and the expected backend schema
488:
489:**Solution:**
490:- Ensure form field names match the expected schema fields
491:- Validate the data transformation before sending to the API
492:- Implement proper error handling for form submission
493:
494:### Issue 3: Edit functionality is not fully implemented
495:- The edit modal in `customers.tsx` is not populating with existing customer data
496:- Saving edits may not be working correctly
497:
498:**Solution:**
499:- Implement the edit functionality completely
500:- Ensure the form populates with existing customer data
501:- Update the save functionality to properly update the database
502:
503:### Issue 4: Delete functionality needs implementation
504:- The delete functionality in `customers.tsx` needs to be connected to the API
505:
506:**Solution:**
507:- Implement confirmation dialog for delete actions
508:- Connect the delete buttons to the API endpoint
509:- Add proper error handling and success messages
510:
511:## Implementation Plan
512:
513:### Step 1: Update Customers Listing Page
514:
515:1. Update the query to properly fetch and display customers from the API
516:2. Replace hardcoded table rows with dynamic rendering of API data
517:3. Add loading states and error handling
518:4. Implement pagination for the customer table
519:
520:### Step 2: Fix Add Customer Functionality
521:
522:1. Update the form submission to match the expected API schema
523:2. Add proper validation and error handling
524:3. Ensure successful redirect after customer creation
525:
526:### Step 3: Implement Edit Customer Functionality
527:
528:1. Update the edit modal to populate with existing customer data
529:2. Ensure form field validation works correctly
530:3. Implement proper updating of customer data
531:4. Add success/error messages
532:
533:### Step 4: Implement Delete Customer Functionality
534:
535:1. Add confirmation dialog before deletion
536:2. Connect delete buttons to the API endpoint
537:3. Refresh the table after successful deletion
538:4. Add success/error messages
539:
540:## Code Changes
541:
542:### 1. Update Customers Listing Page
543:
544:The main file to modify is `/client/src/pages/admin/customers.tsx`:
545:
546:- Update the query to properly use data from the API
547:- Replace hardcoded table rows with `.map()` over the customers array
548:- Implement loading states and error handling
549:
550:### 2. Fix Add Customer Functionality
551:
552:The main file to modify is `/client/src/pages/admin/add-customer.tsx`:
553:
554:- Ensure the form fields match the expected schema
555:- Update the `onSubmitCustomer` function to correctly format and send data
556:
557:### 3. Additional Requirements
558:
559:- Add proper toast notifications for success/error states
560:- Implement confirmation dialogs for destructive actions
561:- Add loading indicators for asynchronous operations
562:
563:## Testing Strategy
564:
565:1. Test creating a new customer
566:2. Test editing an existing customer
567:3. Test deleting a customer
568:4. Test viewing the customer details
569:5. Test filtering and pagination of customers list
570:6. Test validation error handling in forms
571:
572:## Conclusion
573:
574:By implementing these changes, you will successfully connect the frontend customer management pages with the backend database, enabling full CRUD functionality for the customers table.