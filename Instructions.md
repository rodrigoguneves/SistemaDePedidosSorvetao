# Customer Form Enhancement Plan

## Overview of Required Changes

Based on a thorough review of your codebase, we need to implement the following enhancements to the customer registration/editing form:

1. Add functionality to select product categories the customer can access
2. Implement selection of specific sale units (packaging options) per category
3. Modify delivery settings to store currency values in Brazilian Reais (R$) as decimals instead of cents (integers)

## Current Implementation Analysis

### Customer Data Model
The customer data model is defined in `shared/schema.ts`:

- The `customers` table includes fields for delivery settings (`delivery_fee` and `minimum_order_value`) currently stored as integers (cents)
- There's no direct UI implementation for selecting categories and sale units in the current form

### Customer-Category Access Model
From `shared/schema.ts`:
- `customerCategories` table links customers to product categories
- `customerCategoryAllowedSaleUnits` table specifies which sale units a customer can use per category

### Existing Form Implementation
The customer form is implemented in:
- `client/src/pages/admin/add-customer.tsx` (creation)
- `client/src/pages/admin/customers.tsx` (editing in modal)

### Backend Routes
The server has the following relevant endpoints:
- `/api/customers` (GET, POST, PATCH, DELETE)
- `/api/categories` (GET)
- `/api/sale-units` (GET)
- `/api/customers/:id/categories` (GET, POST, DELETE)
- `/api/customers/:id/categories/:categoryId` (POST, DELETE)

## Issues with Current Implementation

1. **Missing Category and Sale Unit Selection**:
   - No UI components for selecting product categories
   - No UI components for selecting allowed sale units per category
   - Backend routes exist but aren't utilized in the frontend

2. **Currency Handling**:
   - Delivery fee and minimum order value are stored as integers (cents) in the database
   - UI shows these values as integers but needs to display/accept them as decimal currency values

## Implementation Plan

### 1. Backend Adjustments

No major backend changes are needed as the API routes already support:
- Getting categories and sale units
- Adding/removing categories for a customer
- Adding/removing allowed sale units for a customer's category

However, we need to adjust how we handle currency values between frontend and backend:
- Keep database storage as integers (cents) for precision
- Convert to/from decimal values in the frontend

### 2. Frontend: Add Category Selection

Add a multi-select component to the customer form to select product categories:
- Fetch categories from `/api/categories`
- When editing a customer, also fetch their current categories from `/api/customers/:id/categories`
- Add UI to select multiple categories
- When submitting, save category associations to the customer

### 3. Frontend: Add Sale Unit Selection per Category

Add dynamic selection of sale units per chosen category:
- For each selected category, display available sale units from `/api/sale-units`
- Create a UI that allows selecting which sale units are allowed for each category
- When submitting, create customer-category-sale-unit associations

### 4. Currency Value Handling

Modify how delivery fee and minimum order value are handled:
- Display values in R$ with decimal places in the UI
- Convert from cents (integer) to reais (decimal) when displaying
- Convert from reais (decimal) to cents (integer) before sending to API

### 5. Integration with Existing Form Submission

Update the form submission logic to:
- Submit customer basic data (existing functionality)
- Submit category associations
- Submit sale unit permissions per category
- Handle currency conversions

## Detailed Implementation Steps

### Step 1: Add Category Selection Component

Update the customer form to include category selection:
- Add a new card section for "Product Categories Access"
- Use a multi-select component to choose categories
- Load and display available categories

### Step 2: Add Sale Unit Selection per Category

For each selected category:
- Display the category name
- Show available sale units with checkboxes
- Allow selecting which units this customer can access for this category

### Step 3: Modify Currency Handling

Update the delivery settings section:
- Change input fields to handle decimal values
- Apply formatting to show currency symbol (R$)
- Handle conversion between cents and reais

### Step 4: Update Form Submission Logic

Enhance the form submission process:
1. First submit basic customer data (use existing mutation)
2. After customer creation/update, submit category associations
3. Then submit sale unit permissions for each category
4. Handle conversion of delivery fee and minimum order from reais to cents

## Implementation Code Outline

The implementation will require changes to:

1. `client/src/pages/admin/add-customer.tsx`
2. `client/src/pages/admin/customers.tsx`

New API calls will be added to:
- Fetch categories
- Fetch sale units
- Manage customer-category associations
- Manage customer-category-sale-unit associations

## Technical Notes

### Currency Conversion Functions

```typescript
// Convert cents (integer) to reais (decimal)
const centsToReais = (cents: number): number => {
  return cents / 100;
};

// Convert reais (decimal) to cents (integer)
const reaisToCents = (reais: number): number => {
  return Math.round(reais * 100);
};
```

### Form Data Structure

The form will need to handle this extended data structure:

```typescript
interface CustomerFormData {
  // Basic customer fields
  company_name: string;
  contact_person: string;
  // ... other existing fields

  // New fields for category and sale unit access
  categories: number[]; // Array of category IDs
  categoryUnits: Record<number, number[]>; // Map of category ID to array of allowed sale unit IDs

  // Currency fields (displayed as decimal but converted to/from cents)
  delivery_fee_reais: number;
  minimum_order_value_reais: number;
}
```

## Testing Strategy

1. Test category selection
   - Verify categories load correctly
   - Check that selected categories are saved

2. Test sale unit selection
   - Verify sale units load per category
   - Ensure selections are saved correctly

3. Test currency handling
   - Verify display of values in R$
   - Check correct conversion between cents and reais

4. End-to-end tests
   - Create a customer with categories and sale units
   - Verify access is properly saved
   - Test editing a customer's categories and sale units

## Timeline Estimate

1. Backend review and testing: 1 day
2. Category selection implementation: 1 day
3. Sale unit selection implementation: 2 days
4. Currency handling updates: 1 day
5. Integration and testing: 1 day

Total: Approximately 6 days for full implementation
1:# Product Catalog Data Model Refactoring Plan
2:# Plan to Remove SKU from Products Table and Project
3:# Backend to Frontend Integration Plan: Migrating to New Product Data Model
4:# Product Management System Integration Issues & Solutions
5:# Customer Management - Implementation Instructions
6:# Customer Form Enhancement Plan

## Overview of Required Changes

Based on a thorough review of your codebase, we need to implement the following enhancements to the customer registration/editing form:

1. Add functionality to select product categories the customer can access
2. Implement selection of specific sale units (packaging options) per category
3. Modify delivery settings to store currency values in Brazilian Reais (R$) as decimals instead of cents (integers)

## Current Implementation Analysis

### Customer Data Model
The customer data model is defined in `shared/schema.ts`:

- The `customers` table includes fields for delivery settings (`delivery_fee` and `minimum_order_value`) currently stored as integers (cents)
- There's no direct UI implementation for selecting categories and sale units in the current form

### Customer-Category Access Model
From `shared/schema.ts`:
- `customerCategories` table links customers to product categories
- `customerCategoryAllowedSaleUnits` table specifies which sale units a customer can use per category

### Existing Form Implementation
The customer form is implemented in:
- `client/src/pages/admin/add-customer.tsx` (creation)
- `client/src/pages/admin/customers.tsx` (editing in modal)

### Backend Routes
The server has the following relevant endpoints:
- `/api/customers` (GET, POST, PATCH, DELETE)
- `/api/categories` (GET)
- `/api/sale-units` (GET)
- `/api/customers/:id/categories` (GET, POST, DELETE)
- `/api/customers/:id/categories/:categoryId` (POST, DELETE)

## Issues with Current Implementation

1. **Missing Category and Sale Unit Selection**:
   - No UI components for selecting product categories
   - No UI components for selecting allowed sale units per category
   - Backend routes exist but aren't utilized in the frontend

2. **Currency Handling**:
   - Delivery fee and minimum order value are stored as integers (cents) in the database
   - UI shows these values as integers but needs to display/accept them as decimal currency values

## Implementation Plan

### 1. Backend Adjustments

No major backend changes are needed as the API routes already support:
- Getting categories and sale units
- Adding/removing categories for a customer
- Adding/removing allowed sale units for a customer's category

However, we need to adjust how we handle currency values between frontend and backend:
- Keep database storage as integers (cents) for precision
- Convert to/from decimal values in the frontend

### 2. Frontend: Add Category Selection

Add a multi-select component to the customer form to select product categories:
- Fetch categories from `/api/categories`
- When editing a customer, also fetch their current categories from `/api/customers/:id/categories`
- Add UI to select multiple categories
- When submitting, save category associations to the customer

### 3. Frontend: Add Sale Unit Selection per Category

Add dynamic selection of sale units per chosen category:
- For each selected category, display available sale units from `/api/sale-units`
- Create a UI that allows selecting which sale units are allowed for each category
- When submitting, create customer-category-sale-unit associations

### 4. Currency Value Handling

Modify how delivery fee and minimum order value are handled:
- Display values in R$ with decimal places in the UI
- Convert from cents (integer) to reais (decimal) when displaying
- Convert from reais (decimal) to cents (integer) before sending to API

### 5. Integration with Existing Form Submission

Update the form submission logic to:
- Submit customer basic data (existing functionality)
- Submit category associations
- Submit sale unit permissions per category
- Handle currency conversions

## Detailed Implementation Steps

### Step 1: Add Category Selection Component

Update the customer form to include category selection:
- Add a new card section for "Product Categories Access"
- Use a multi-select component to choose categories
- Load and display available categories

### Step 2: Add Sale Unit Selection per Category

For each selected category:
- Display the category name
- Show available sale units with checkboxes
- Allow selecting which units this customer can access for this category

### Step 3: Modify Currency Handling

Update the delivery settings section:
- Change input fields to handle decimal values
- Apply formatting to show currency symbol (R$)
- Handle conversion between cents and reais

### Step 4: Update Form Submission Logic

Enhance the form submission process:
1. First submit basic customer data (use existing mutation)
2. After customer creation/update, submit category associations
3. Then submit sale unit permissions for each category
4. Handle conversion of delivery fee and minimum order from reais to cents

## Implementation Code Outline

The implementation will require changes to:

1. `client/src/pages/admin/add-customer.tsx`
2. `client/src/pages/admin/customers.tsx`

New API calls will be added to:
- Fetch categories
- Fetch sale units
- Manage customer-category associations
- Manage customer-category-sale-unit associations

## Technical Notes

### Currency Conversion Functions

```typescript
// Convert cents (integer) to reais (decimal)
const centsToReais = (cents: number): number => {
  return cents / 100;
};

// Convert reais (decimal) to cents (integer)
const reaisToCents = (reais: number): number => {
  return Math.round(reais * 100);
};
```

### Form Data Structure

The form will need to handle this extended data structure:

```typescript
interface CustomerFormData {
  // Basic customer fields
  company_name: string;
  contact_person: string;
  // ... other existing fields

  // New fields for category and sale unit access
  categories: number[]; // Array of category IDs
  categoryUnits: Record<number, number[]>; // Map of category ID to array of allowed sale unit IDs

  // Currency fields (displayed as decimal but converted to/from cents)
  delivery_fee_reais: number;
  minimum_order_value_reais: number;
}