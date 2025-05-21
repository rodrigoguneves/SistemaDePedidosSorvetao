/**
 * Migration script for product catalog data model refactoring
 * 
 * This script:
 * 1. Populates the sale_units table with standard units
 * 2. Converts existing products to base_products
 * 3. Creates product_sale_versions from products
 * 4. Updates existing customer catalog access permissions
 */

import { db } from "./db";
import { 
  products, baseProducts, saleUnits, productSaleVersions,
  productCategories, customerCategories, customerProducts,
  customerCategoryAllowedSaleUnits
} from "@shared/schema";
import { eq, and, isNull } from "drizzle-orm";

// Initial sale units to pre-populate
const initialSaleUnits = [
  {
    unit_name: "Unidade",
    short_description: "Produto vendido por unidade",
    base_equivalent_quantity: 1,
    applicable_product_type_tags: ["ALL"]
  },
  {
    unit_name: "Meia Caixa 12un",
    short_description: "Caixa com 12 sorvetes",
    base_equivalent_quantity: 12,
    applicable_product_type_tags: ["POPSICLE_FRUIT_MILK", "STICK_ICE_CREAM"]
  },
  {
    unit_name: "Caixa Completa 24un",
    short_description: "Caixa com 24 sorvetes",
    base_equivalent_quantity: 24,
    applicable_product_type_tags: ["POPSICLE_FRUIT_MILK", "STICK_ICE_CREAM"]
  },
  {
    unit_name: "Meia Caixa 8un",
    short_description: "Caixa com 8 sorvetes premium",
    base_equivalent_quantity: 8,
    applicable_product_type_tags: ["PREMIUM_ICE_CREAM"]
  },
  {
    unit_name: "Caixa Completa 16un",
    short_description: "Caixa com 16 sorvetes premium",
    base_equivalent_quantity: 16,
    applicable_product_type_tags: ["PREMIUM_ICE_CREAM"]
  },
  {
    unit_name: "Pote 2L",
    short_description: "Pote com 2 litros de sorvete",
    base_equivalent_quantity: 1,
    applicable_product_type_tags: ["BULK_ICE_CREAM"]
  },
  {
    unit_name: "Pote 5L",
    short_description: "Pote com 5 litros de sorvete",
    base_equivalent_quantity: 1,
    applicable_product_type_tags: ["BULK_ICE_CREAM"]
  },
  {
    unit_name: "Pote 10L",
    short_description: "Pote com 10 litros de sorvete",
    base_equivalent_quantity: 1,
    applicable_product_type_tags: ["BULK_ICE_CREAM"]
  }
];

// Map from common unit names to standard sale unit IDs
const unitNameMapping: Record<string, string> = {
  "Unidade": "Unidade",
  "Unid": "Unidade",
  "Un": "Unidade",
  "Caixa 12": "Meia Caixa 12un",
  "Meia Caixa": "Meia Caixa 12un",
  "Cx 12": "Meia Caixa 12un",
  "Caixa 24": "Caixa Completa 24un",
  "Caixa Completa": "Caixa Completa 24un",
  "Cx 24": "Caixa Completa 24un",
  "Caixa 8": "Meia Caixa 8un",
  "Cx 8": "Meia Caixa 8un",
  "Caixa 16": "Caixa Completa 16un",
  "Cx 16": "Caixa Completa 16un",
  "Pote 2L": "Pote 2L",
  "2L": "Pote 2L",
  "Pote 5L": "Pote 5L",
  "5L": "Pote 5L",
  "Pote 10L": "Pote 10L",
  "10L": "Pote 10L"
};

// Guess product type based on naming patterns
function guessProductType(productName: string, unitOfSale: string): string[] {
  const name = productName.toLowerCase();
  const unit = unitOfSale.toLowerCase();
  
  if (name.includes("picolé") || name.includes("picole")) {
    if (name.includes("leite") || name.includes("creme")) {
      return ["POPSICLE_FRUIT_MILK"];
    }
    return ["POPSICLE_FRUIT_MILK"];
  }
  
  if (unit.includes("pote") || unit.includes("l")) {
    return ["BULK_ICE_CREAM"];
  }
  
  if (name.includes("premium") || name.includes("especial")) {
    return ["PREMIUM_ICE_CREAM"];
  }
  
  return ["STICK_ICE_CREAM"];
}

// Create standard sale units
async function migrateSaleUnits() {
  console.log("Migrating Sale Units...");
  
  // Insert standard sale units
  for (const unit of initialSaleUnits) {
    try {
      await db.insert(saleUnits).values(unit).onConflictDoNothing();
      console.log(`Added sale unit: ${unit.unit_name}`);
    } catch (error) {
      console.error(`Error adding sale unit ${unit.unit_name}:`, error);
    }
  }
}

// Migrate products to base_products and product_sale_versions
async function migrateProducts() {
  console.log("Migrating Products...");
  
  // Get all active products
  const existingProducts = await db.select().from(products)
    .where(isNull(products.data_de_exclusao));
  
  console.log(`Found ${existingProducts.length} products to migrate`);
  
  // Get all sale units for reference
  const allSaleUnits = await db.select().from(saleUnits);
  const saleUnitMap = new Map(allSaleUnits.map(unit => [unit.unit_name, unit]));
  
  // Process each product
  for (const product of existingProducts) {
    try {
      // Determine which sale unit to use
      let matchedUnitName = "Unidade"; // Default
      
      // Try to match the unit of sale to a standard unit
      const normalizedUnit = unitNameMapping[product.unit_of_sale] || product.unit_of_sale;
      
      if (saleUnitMap.has(normalizedUnit)) {
        matchedUnitName = normalizedUnit;
      }
      
      const saleUnit = saleUnitMap.get(matchedUnitName);
      
      if (!saleUnit) {
        console.warn(`Could not find matching sale unit for ${product.unit_of_sale}, using default`);
        continue;
      }
      
      // Create base product
      const [baseProduct] = await db.insert(baseProducts).values({
        product_category_id: product.category_id,
        base_product_name: product.name,
        long_description: product.description,
        is_active: true,
        allows_decimal_quantity: product.allow_decimal_quantities
      }).returning();
      
      console.log(`Created base product: ${baseProduct.base_product_name}`);
      
      // Create product sale version
      const [productVersion] = await db.insert(productSaleVersions).values({
        base_product_id: baseProduct.base_product_id,
        sale_unit_id: saleUnit.sale_unit_id,
        price: product.price,
        is_active: true
      }).returning();
      
      console.log(`Created product sale version for ${baseProduct.base_product_name} with unit ${saleUnit.unit_name}`);
    } catch (error) {
      console.error(`Error migrating product ${product.name}:`, error);
    }
  }
}

// Migrate customer catalog access permissions
async function migrateCustomerAccess() {
  console.log("Migrating Customer Access...");
  
  // Get all customer category assignments
  const customerCategoryAssignments = await db.select().from(customerCategories);
  
  console.log(`Found ${customerCategoryAssignments.length} customer-category assignments to process`);
  
  // Get all sale units
  const allSaleUnits = await db.select().from(saleUnits);
  
  // For each customer-category assignment, give access to all sale units
  for (const assignment of customerCategoryAssignments) {
    try {
      for (const saleUnit of allSaleUnits) {
        await db.insert(customerCategoryAllowedSaleUnits).values({
          customer_id: assignment.customer_id,
          product_category_id: assignment.category_id,
          sale_unit_id: saleUnit.sale_unit_id
        }).onConflictDoNothing();
      }
      
      console.log(`Granted all sale units to customer ${assignment.customer_id} for category ${assignment.category_id}`);
    } catch (error) {
      console.error(`Error migrating customer access for customer ${assignment.customer_id}, category ${assignment.category_id}:`, error);
    }
  }
}

// Main migration function
export async function migrateProductCatalog() {
  console.log("Starting Product Catalog Migration...");
  
  try {
    await migrateSaleUnits();
    await migrateProducts();
    await migrateCustomerAccess();
    
    console.log("Product Catalog Migration Completed Successfully!");
    return true;
  } catch (error) {
    console.error("Error during product catalog migration:", error);
    return false;
  }
}