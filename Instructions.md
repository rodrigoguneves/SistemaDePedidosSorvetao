
# Edit Customer Form Data Loading Issues - Analysis and Fix Plan

## Problem Summary
When editing an existing customer, the form doesn't fully populate with all customer data:
1. CNPJ (Tax ID) field is not pre-filled
2. Customer Email field is not pre-filled
3. Product category access settings and their sale units are not loading correctly

## Root Cause Analysis

After examining the codebase, I've identified several issues:

### 1. CNPJ Field Issue
- The code in `edit-customer.tsx` attempts to set the CNPJ value during form initialization, but:
  - The value might be missing from the API response
  - There's no fallback handling for null/undefined values
  - The form might be clearing this field during initialization

### 2. Email Field Issue
- Email is fetched separately from a different API endpoint (`/api/users/${customer.user_id}`)
- Error handling in this fetch is incomplete
- The console logs show consistent errors when fetching user email

### 3. Product Catalog Access Issues
- The data mapping between categories and sale units is inconsistent
- API responses aren't properly processed
- There are issues with the data structure interpretation (property names may be `id` in some places and `category_id` in others)
- The effect dependencies in useEffect hooks aren't properly set up to respond to data changes

## Detailed Fix Plan

### 1. Fix CNPJ Field Loading

```javascript
// Safe handling for CNPJ value
const cnpjValue = customer.cnpj || "";
console.log("Setting CNPJ value:", cnpjValue);

// Set form values with explicit CNPJ value
customerForm.reset({
  // ... other fields
  cnpj: cnpjValue,
  // ... remaining fields
});

// Add a redundant direct setValue for CNPJ to ensure it's properly set
setTimeout(() => {
  customerForm.setValue("cnpj", cnpjValue);
}, 100);
```

### 2. Fix Email Field Loading

```javascript
// Improve error handling for email fetch
if (customer.user_id) {
  (async () => {
    try {
      console.log("Fetching user email for user_id:", customer.user_id);
      const res = await fetch(`/api/users/${customer.user_id}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      
      const userData = await res.json();
      console.log("User data loaded successfully:", userData);
      
      if (userData && userData.email) {
        console.log("Setting email to:", userData.email);
        customerForm.setValue("email", userData.email);
      } else {
        console.log("No email found in user data");
        customerForm.setValue("email", "Email não encontrado");
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
      customerForm.setValue("email", "Email não disponível");
    }
  })();
} else {
  console.log("No user_id available for this customer");
  customerForm.setValue("email", "Cliente sem usuário associado");
}
```

### 3. Fix Product Categories and Sale Units Loading

```javascript
// Enhanced data fetching on component mount
useEffect(() => {
  if (customerId) {
    console.log("Refreshing customer data on mount for ID:", customerId);

    // Enhanced fetch function with direct fetch instead of query client
    const fetchCustomerData = async () => {
      try {
        // Fetch categories directly
        console.log("Fetching categories directly for customer:", customerId);
        const catResponse = await fetch(`/api/customers/${customerId}/categories`);
        if (!catResponse.ok) {
          throw new Error(`Failed to fetch categories: ${catResponse.status}`);
        }

        const categoriesData = await catResponse.json();
        console.log("Direct fetch categories result:", categoriesData);

        // Update query client with fresh data
        queryClient.setQueryData([`/api/customers/${customerId}/categories`], categoriesData);

        // Fetch sale units directly
        console.log("Fetching sale units directly for customer:", customerId);
        const unitsResponse = await fetch(`/api/customers/${customerId}/allowed-sale-units`);
        if (!unitsResponse.ok) {
          throw new Error(`Failed to fetch sale units: ${unitsResponse.status}`);
        }

        const unitsData = await unitsResponse.json();
        console.log("Direct fetch sale units result:", unitsData);

        // Manually process the data for immediate UI update
        if (Array.isArray(categoriesData)) {
          const categoryIds = categoriesData.map((cat) => {
            if (cat.category_id !== undefined) return Number(cat.category_id);
            if (cat.id !== undefined) return Number(cat.id);
            if (cat.product_category_id !== undefined) return Number(cat.product_category_id);
            return null;
          }).filter(id => id !== null && !isNaN(id));

          console.log("Directly setting selected categories:", categoryIds);
          setSelectedCategories(categoryIds);
        }

        if (Array.isArray(unitsData) && unitsData.length > 0) {
          const unitsByCat = {};
          unitsData.forEach((item) => {
            const categoryId = Number(item.product_category_id || item.category_id);
            const unitId = Number(item.sale_unit_id);

            if (!isNaN(categoryId) && !isNaN(unitId)) {
              if (!unitsByCat[categoryId]) {
                unitsByCat[categoryId] = [];
              }
              if (!unitsByCat[categoryId].includes(unitId)) {
                unitsByCat[categoryId].push(unitId);
              }
            }
          });

          console.log("Directly setting category units:", unitsByCat);
          setCategoryUnits(unitsByCat);
        }
      } catch (error) {
        console.error("Error during direct data fetch:", error);
      }
    };

    fetchCustomerData();
    
    // Also invalidate the queries to ensure the UI refreshes
    queryClient.invalidateQueries([`/api/customers/${customerId}/categories`]);
    queryClient.invalidateQueries([`/api/customers/${customerId}/allowed-sale-units`]);
  }
}, [customerId, queryClient, setSelectedCategories, setCategoryUnits]);
```

## Implementation Strategy

1. Update the customer form reset function to properly handle the CNPJ field
2. Improve the email fetching logic with better error handling
3. Enhance the product categories and sale units loading with direct data fetching
4. Add explicit logging at key points to help diagnose any remaining issues
5. Test the form with multiple customer records to ensure consistent behavior

## Expected Outcome

After implementing these fixes:
- The CNPJ field will properly display the customer's tax ID
- The email field will show the correct customer email with appropriate fallbacks
- Product categories and their sale units will be correctly displayed and editable
- The form will provide a complete view of all customer data

## Validation Steps

1. After implementation, navigate to the customer list
2. Select customers with varying data completeness
3. Verify that all fields, including CNPJ, email, and product settings are correctly pre-filled
4. Check the browser console for any remaining errors
