import { 
  InsertUser, User, Customer, InsertCustomer, ProductCategory, 
  InsertProductCategory, Product, InsertProduct, Order, InsertOrder,
  OrderItem, InsertOrderItem, Payment, InsertPayment, FinancialAccount, 
  InsertFinancialAccount, FinancialCategory, InsertFinancialCategory,
  FinancialTransaction, InsertFinancialFinancialTransaction, SaleUnit, InsertSaleUnit,
  BaseProduct, InsertBaseProduct, ProductSaleVersion, InsertProductSaleVersion,
  CustomerCategoryAllowedSaleUnit,
  users, customers, productCategories, products, customerCategories, 
  customerProducts, orders, orderItems, payments, financialAccounts,
  financialCategories, financialTransactions, saleUnits, baseProducts,
  productSaleVersions, customerCategoryAllowedSaleUnits
} from "@shared/schema";
import { db } from "./db";
import { eq, isNull, and, desc, sql, gt, lte, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  softDeleteUser(id: number): Promise<boolean>;
  hardDeleteUser(id: number): Promise<boolean>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByUserId(userId: number): Promise<Customer | undefined>;
  getCustomers(includeDeleted?: boolean): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  softDeleteCustomer(id: number): Promise<boolean>;
  hardDeleteCustomer(id: number): Promise<boolean>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  getProductCategories(includeDeleted?: boolean): Promise<ProductCategory[]>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<ProductCategory>): Promise<ProductCategory | undefined>;
  softDeleteProductCategory(id: number): Promise<boolean>;
  hardDeleteProductCategory(id: number): Promise<boolean>;

  // Sale Units
  getSaleUnit(id: number): Promise<SaleUnit | undefined>;
  getSaleUnits(): Promise<SaleUnit[]>;
  getSaleUnitsByProductType(productTypeTag: string): Promise<SaleUnit[]>;
  createSaleUnit(saleUnit: InsertSaleUnit): Promise<SaleUnit>;
  updateSaleUnit(id: number, saleUnit: Partial<SaleUnit>): Promise<SaleUnit | undefined>;

  // Base Products
  getBaseProduct(id: number): Promise<BaseProduct | undefined>;
  getBaseProducts(includeDeleted?: boolean): Promise<BaseProduct[]>;
  getBaseProductsByCategory(categoryId: number, includeDeleted?: boolean): Promise<BaseProduct[]>;
  createBaseProduct(baseProduct: InsertBaseProduct): Promise<BaseProduct>;
  updateBaseProduct(id: number, baseProduct: Partial<BaseProduct>): Promise<BaseProduct | undefined>;
  softDeleteBaseProduct(id: number): Promise<boolean>;

  // Product Sale Versions
  getProductSaleVersion(id: number): Promise<ProductSaleVersion | undefined>;
  getProductSaleVersionsByBaseProduct(baseProductId: number, onlyActive?: boolean): Promise<ProductSaleVersion[]>;
  getProductSaleVersionsBySaleUnit(saleUnitId: number, onlyActive?: boolean): Promise<ProductSaleVersion[]>;
  createProductSaleVersion(productSaleVersion: InsertProductSaleVersion): Promise<ProductSaleVersion>;
  updateProductSaleVersion(id: number, productSaleVersion: Partial<ProductSaleVersion>): Promise<ProductSaleVersion | undefined>;

  // Legacy Products (for backward compatibility)
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(includeDeleted?: boolean): Promise<Product[]>;
  getProductsByCategory(categoryId: number, includeDeleted?: boolean): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  softDeleteProduct(id: number): Promise<boolean>;
  hardDeleteProduct(id: number): Promise<boolean>;

  // Customer Catalog Access
  getCustomerProducts(customerId: number): Promise<Product[]>;
  getCustomerCategories(customerId: number): Promise<ProductCategory[]>;
  getCustomerAllowedSaleUnits(customerId: number, categoryId: number): Promise<SaleUnit[]>;
  getCustomerProductVersions(customerId: number): Promise<ProductSaleVersion[]>;
  addProductToCustomer(customerId: number, productId: number): Promise<boolean>;
  removeProductFromCustomer(customerId: number, productId: number): Promise<boolean>;
  addCategoryToCustomer(customerId: number, categoryId: number): Promise<boolean>;
  removeCategoryFromCustomer(customerId: number, categoryId: number): Promise<boolean>;
  addCategorySaleUnitToCustomer(customerId: number, categoryId: number, saleUnitId: number): Promise<boolean>;
  removeCategorySaleUnitFromCustomer(customerId: number, categoryId: number, saleUnitId: number): Promise<boolean>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(includeDeleted?: boolean): Promise<Order[]>;
  getCustomerOrders(customerId: number, includeDeleted?: boolean): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  softDeleteOrder(id: number): Promise<boolean>;
  hardDeleteOrder(id: number): Promise<boolean>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getOrderPayments(orderId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Financial Accounts
  getFinancialAccount(id: number): Promise<FinancialAccount | undefined>;
  getFinancialAccounts(): Promise<FinancialAccount[]>;
  createFinancialAccount(account: InsertFinancialAccount): Promise<FinancialAccount>;
  updateFinancialAccount(id: number, account: Partial<FinancialAccount>): Promise<FinancialAccount | undefined>;

  // Financial Categories
  getFinancialCategory(id: number): Promise<FinancialCategory | undefined>;
  getFinancialCategories(): Promise<FinancialCategory[]>;
  getFinancialCategoriesByType(type: string): Promise<FinancialCategory[]>;
  createFinancialCategory(category: InsertFinancialCategory): Promise<FinancialCategory>;
  updateFinancialCategory(id: number, category: Partial<FinancialCategory>): Promise<FinancialCategory | undefined>;

  // Financial Transactions
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  getFinancialTransactions(includeDeleted?: boolean): Promise<FinancialTransaction[]>;
  getFinancialTransactionsByAccount(accountId: number, includeDeleted?: boolean): Promise<FinancialTransaction[]>;
  getFinancialTransactionsByCategory(categoryId: number, includeDeleted?: boolean): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined>;
  softDeleteFinancialTransaction(id: number): Promise<boolean>;
  hardDeleteFinancialTransaction(id: number): Promise<boolean>;

  // Session
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.data_de_exclusao)));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), isNull(users.data_de_exclusao)));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(and(eq(users.id, id), isNull(users.data_de_exclusao)))
      .returning();
    return updatedUser;
  }

  async softDeleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .update(users)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(users.id, id), isNull(users.data_de_exclusao)))
      .returning();
    return !!deletedUser;
  }

  async hardDeleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(and(eq(customers.id, id), isNull(customers.data_de_exclusao)));
    return customer;
  }

  async getCustomerByUserId(userId: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(and(eq(customers.user_id, userId), isNull(customers.data_de_exclusao)));
    return customer;
  }

  async getCustomers(includeDeleted: boolean = false): Promise<Customer[]> {
    if (includeDeleted) {
      return db.select().from(customers).orderBy(customers.company_name);
    }
    return db.select().from(customers).where(isNull(customers.data_de_exclusao)).orderBy(customers.company_name);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [createdCustomer] = await db.insert(customers).values(customer).returning();
    return createdCustomer;
  }

  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customerData, updated_at: new Date() })
      .where(and(eq(customers.id, id), isNull(customers.data_de_exclusao)))
      .returning();
    return updatedCustomer;
  }

  async softDeleteCustomer(id: number): Promise<boolean> {
    const [deletedCustomer] = await db
      .update(customers)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(customers.id, id), isNull(customers.data_de_exclusao)))
      .returning();
    return !!deletedCustomer;
  }

  async hardDeleteCustomer(id: number): Promise<boolean> {
    const [deletedCustomer] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    return !!deletedCustomer;
  }

  // Product Category methods
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(and(eq(productCategories.id, id), isNull(productCategories.data_de_exclusao)));
    return category;
  }

  async getProductCategories(includeDeleted: boolean = false): Promise<ProductCategory[]> {
    if (includeDeleted) {
      return db.select().from(productCategories).orderBy(productCategories.name);
    }
    return db.select().from(productCategories).where(isNull(productCategories.data_de_exclusao)).orderBy(productCategories.name);
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [createdCategory] = await db.insert(productCategories).values(category).returning();
    return createdCategory;
  }

  async updateProductCategory(id: number, categoryData: Partial<ProductCategory>): Promise<ProductCategory | undefined> {
    const [updatedCategory] = await db
      .update(productCategories)
      .set({ ...categoryData, updated_at: new Date() })
      .where(and(eq(productCategories.id, id), isNull(productCategories.data_de_exclusao)))
      .returning();
    return updatedCategory;
  }

  async softDeleteProductCategory(id: number): Promise<boolean> {
    const [deletedCategory] = await db
      .update(productCategories)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(productCategories.id, id), isNull(productCategories.data_de_exclusao)))
      .returning();
    return !!deletedCategory;
  }

  async hardDeleteProductCategory(id: number): Promise<boolean> {
    const [deletedCategory] = await db
      .delete(productCategories)
      .where(eq(productCategories.id, id))
      .returning();
    return !!deletedCategory;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), isNull(products.data_de_exclusao)));
    return product;
  }

  async getProducts(includeDeleted: boolean = false): Promise<Product[]> {
    if (includeDeleted) {
      return db.select().from(products).orderBy(products.price, products.name);
    }
    return db.select().from(products).where(isNull(products.data_de_exclusao)).orderBy(products.price, products.name);
  }

  async getProductsByCategory(categoryId: number, includeDeleted: boolean = false): Promise<Product[]> {
    if (includeDeleted) {
      return db.select().from(products).where(eq(products.category_id, categoryId)).orderBy(products.price, products.name);
    }
    return db.select().from(products)
      .where(and(
        eq(products.category_id, categoryId),
        isNull(products.data_de_exclusao)
      ))
      .orderBy(products.price, products.name);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [createdProduct] = await db.insert(products).values(product).returning();
    return createdProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...productData, updated_at: new Date() })
      .where(and(eq(products.id, id), isNull(products.data_de_exclusao)))
      .returning();
    return updatedProduct;
  }

  async softDeleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .update(products)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(products.id, id), isNull(products.data_de_exclusao)))
      .returning();
    return !!deletedProduct;
  }

  async hardDeleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }

  // Sale Units implementation
  async getSaleUnit(id: number): Promise<SaleUnit | undefined> {
    const [unit] = await db.select().from(saleUnits).where(eq(saleUnits.sale_unit_id, id));
    return unit;
  }

  async getSaleUnits(): Promise<SaleUnit[]> {
    return db.select().from(saleUnits).orderBy(saleUnits.unit_name);
  }

  async getSaleUnitsByProductType(productTypeTag: string): Promise<SaleUnit[]> {
    // Look for units where the specified tag is in the applicable_product_type_tags array
    // or where 'ALL' is in the array (indicating it's applicable to all products)
    return db.select().from(saleUnits)
      .where(sql`${saleUnits.applicable_product_type_tags} @> ARRAY[${productTypeTag}]::text[] OR ${saleUnits.applicable_product_type_tags} @> ARRAY['ALL']::text[]`)
      .orderBy(saleUnits.unit_name);
  }

  async createSaleUnit(saleUnit: InsertSaleUnit): Promise<SaleUnit> {
    const [createdUnit] = await db.insert(saleUnits).values(saleUnit).returning();
    return createdUnit;
  }

  async updateSaleUnit(id: number, saleUnit: Partial<SaleUnit>): Promise<SaleUnit | undefined> {
    const [updatedUnit] = await db
      .update(saleUnits)
      .set({ ...saleUnit, updated_at: new Date() })
      .where(eq(saleUnits.sale_unit_id, id))
      .returning();
    return updatedUnit;
  }

  // Base Products implementation
  async getBaseProduct(id: number): Promise<BaseProduct | undefined> {
    const [product] = await db.select().from(baseProducts).where(and(
      eq(baseProducts.base_product_id, id),
      isNull(baseProducts.deleted_at)
    ));
    return product;
  }

  async getBaseProducts(includeDeleted: boolean = false): Promise<BaseProduct[]> {
    if (includeDeleted) {
      return db.select().from(baseProducts).orderBy(baseProducts.base_product_name);
    }
    return db.select().from(baseProducts)
      .where(isNull(baseProducts.deleted_at))
      .orderBy(baseProducts.base_product_name);
  }

  async getBaseProductsByCategory(categoryId: number, includeDeleted: boolean = false): Promise<BaseProduct[]> {
    if (includeDeleted) {
      return db.select().from(baseProducts)
        .where(eq(baseProducts.product_category_id, categoryId))
        .orderBy(baseProducts.base_product_name);
    }
    return db.select().from(baseProducts)
      .where(and(
        eq(baseProducts.product_category_id, categoryId),
        isNull(baseProducts.deleted_at)
      ))
      .orderBy(baseProducts.base_product_name);
  }

  async createBaseProduct(baseProduct: InsertBaseProduct): Promise<BaseProduct> {
    const [createdProduct] = await db.insert(baseProducts).values(baseProduct).returning();
    return createdProduct;
  }

  async updateBaseProduct(id: number, baseProduct: Partial<BaseProduct>): Promise<BaseProduct | undefined> {
    const [updatedProduct] = await db
      .update(baseProducts)
      .set({ ...baseProduct, updated_at: new Date() })
      .where(and(eq(baseProducts.base_product_id, id), isNull(baseProducts.deleted_at)))
      .returning();
    return updatedProduct;
  }

  async softDeleteBaseProduct(id: number): Promise<boolean> {
    const [result] = await db
      .update(baseProducts)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(and(eq(baseProducts.base_product_id, id), isNull(baseProducts.deleted_at)))
      .returning();
    return !!result;
  }

  // Product Sale Versions implementation
  async getProductSaleVersion(id: number): Promise<ProductSaleVersion | undefined> {
    const [version] = await db.select().from(productSaleVersions)
      .where(eq(productSaleVersions.product_version_id, id));
    return version;
  }

  // Alias method for backward compatibility
  async getProductVersions(): Promise<ProductSaleVersion[]> {
    return this.getProductSaleVersions();
  }

  // Get all product sale versions
  async getProductSaleVersions(): Promise<ProductSaleVersion[]> {
    return db.select().from(productSaleVersions)
      .orderBy(productSaleVersions.product_version_id);
  }

  async getProductSaleVersionsByBaseProduct(baseProductId: number, onlyActive: boolean = true): Promise<ProductSaleVersion[]> {
    let query = db.select().from(productSaleVersions)
      .where(eq(productSaleVersions.base_product_id, baseProductId));

    if (onlyActive) {
      query = query.where(eq(productSaleVersions.is_active, true));
    }

    return query.orderBy(productSaleVersions.price);
  }

  async getProductSaleVersionsBySaleUnit(saleUnitId: number, onlyActive: boolean = true): Promise<ProductSaleVersion[]> {
    let query = db.select().from(productSaleVersions)
      .where(eq(productSaleVersions.sale_unit_id, saleUnitId));

    if (onlyActive) {
      query = query.where(eq(productSaleVersions.is_active, true));
    }

    return query.orderBy(productSaleVersions.price);
  }

  async createProductSaleVersion(productSaleVersion: InsertProductSaleVersion): Promise<ProductSaleVersion> {
    const [createdVersion] = await db.insert(productSaleVersions).values(productSaleVersion).returning();
    return createdVersion;
  }

  // Alias method for backward compatibility
  async createProductVersion(productSaleVersion: InsertProductSaleVersion): Promise<ProductSaleVersion> {
    return this.createProductSaleVersion(productSaleVersion);
  }

  async updateProductSaleVersion(id: number, productSaleVersion: Partial<ProductSaleVersion>): Promise<ProductSaleVersion | undefined> {
    const [updatedVersion] = await db
      .update(productSaleVersions)
      .set({ ...productSaleVersion, updated_at: new Date() })
      .where(eq(productSaleVersions.product_version_id, id))
      .returning();
    return updatedVersion;
  }

  // Customer Catalog Access methods
  // Legacy methods for backward compatibility
  async getCustomerProducts(customerId: number): Promise<Product[]> {
    // Get products directly assigned to customer
    const directProducts = await db
      .select().from(products)
      .innerJoin(customerProducts, eq(customerProducts.product_id, products.id))
      .where(and(
        eq(customerProducts.customer_id, customerId),
        isNull(products.data_de_exclusao)
      ))
      .orderBy([asc(products.price), asc(products.name)]);

    // Get products from categories assigned to customer
    const categoryProducts = await db
      .select().from(products)
      .innerJoin(productCategories, eq(products.category_id, productCategories.id))
      .innerJoin(customerCategories, eq(customerCategories.category_id, productCategories.id))
      .where(and(
        eq(customerCategories.customer_id, customerId),
        isNull(products.data_de_exclusao)
      ))
      .orderBy([asc(products.price), asc(products.name)]);

    // Combine and deduplicate results
    const allProducts = [...directProducts, ...categoryProducts];
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());

    return uniqueProducts.sort((a, b) => {
      if (a.price === b.price) {
        return a.name.localeCompare(b.name);
      }
      return a.price - b.price;
    });
  }

  async getCustomerCategories(customerId: number): Promise<ProductCategory[]> {
    const result = await db
      .select().from(productCategories)
      .innerJoin(customerCategories, eq(customerCategories.category_id, productCategories.id))
      .where(and(
        eq(customerCategories.customer_id, customerId),
        isNull(productCategories.data_de_exclusao)
      ))
      .orderBy(productCategories.name);

    return result;
  }

  async getCustomerAllowedSaleUnits(customerId: number, categoryId: number): Promise<SaleUnit[]> {
    try {
      console.log(`[STORAGE] Buscando unidades de venda permitidas para cliente ${customerId}, categoria ${categoryId}`);

      const result = await db
        .select({
          sale_unit_id: saleUnits.sale_unit_id,
          unit_name: saleUnits.unit_name,
          short_description: saleUnits.short_description,
          base_equivalent_quantity: saleUnits.base_equivalent_quantity,
        })
        .from(customerCategoryAllowedSaleUnits)
        .innerJoin(
          saleUnits,
          eq(customerCategoryAllowedSaleUnits.sale_unit_id, saleUnits.sale_unit_id)
        )
        .where(
          and(
            eq(customerCategoryAllowedSaleUnits.customer_id, customerId),
            eq(customerCategoryAllowedSaleUnits.product_category_id, categoryId)
          )
        );

      console.log(`[STORAGE] Encontradas ${result.length} unidades de venda para cliente ${customerId}, categoria ${categoryId}`);

      // If no results, verify if the customer-category association exists
      if (result.length === 0) {
        const categoryAssociation = await db
          .select()
          .from(customerCategories)
          .where(
            and(
              eq(customerCategories.customer_id, customerId),
              eq(customerCategories.category_id, categoryId)
            )
          );

        if (categoryAssociation.length === 0) {
          console.log(`[STORAGE] Aviso: Cliente ${customerId} não está associado à categoria ${categoryId}`);
        } else {
          console.log(`[STORAGE] Aviso: Cliente ${customerId} está associado à categoria ${categoryId}, mas não tem unidades de venda associadas`);
        }
      }

      return result;
    } catch (error) {
      console.error(`[STORAGE] Erro ao buscar unidades de venda permitidas para cliente ${customerId}, categoria ${categoryId}:`, error);
      // Log more detailed error information
      if (error.code || error.message) {
        console.error(`[STORAGE] Detalhes do erro: Código: ${error.code}, Mensagem: ${error.message}`);
      }
      return [];
    }
  }

  async getCustomerProductVersions(customerId: number): Promise<ProductSaleVersion[]> {
    // Get categories the customer has access to
    const customerCategories = await this.getCustomerCategories(customerId);
    const categoryIds = customerCategories.map(category => category.id);

    if (categoryIds.length === 0) {
      return [];
    }

    // Get allowed sale units for each category
    const allowedSaleUnits = await db
      .select()
      .from(customerCategoryAllowedSaleUnits)
      .where(eq(customerCategoryAllowedSaleUnits.customer_id, customerId));

    // Group allowed sale units by category
    const saleUnitsByCategory = allowedSaleUnits.reduce((acc: Record<number, number[]>, curr) => {
      if (!acc[curr.product_category_id]) {
        acc[curr.product_category_id] = [];
      }
      acc[curr.product_category_id].push(curr.sale_unit_id);
      return acc;
    }, {});

    // Get all product versions for the allowed categories and sale units
    const productVersionsPromises = categoryIds.map(async (categoryId) => {
      const allowedSaleUnitIds = saleUnitsByCategory[categoryId] || [];
      if (allowedSaleUnitIds.length === 0) return [];

      return db
        .select()
        .from(productSaleVersions)
        .innerJoin(
          baseProducts, 
          eq(productSaleVersions.base_product_id, baseProducts.base_product_id)
        )
        .where(and(
          eq(baseProducts.product_category_id, categoryId),
          eq(productSaleVersions.is_active, true),
          eq(baseProducts.is_active, true),
          isNull(baseProducts.deleted_at)
        ));
    });

    const productVersionsResults = await Promise.all(productVersionsPromises);
    const allProductVersions = productVersionsResults.flat();

    // Remove duplicates if any
    return Array.from(
      new Map(allProductVersions.map(v => [v.product_version_id, v])).values()
    );
  }

  // Legacy methods for backward compatibility
  async addProductToCustomer(customerId: number, productId: number): Promise<boolean> {
    const [result] = await db
      .insert(customerProducts)
      .values({ customer_id: customerId, product_id: productId })
      .returning();
    return !!result;
  }

  async removeProductFromCustomer(customerId: number, productId: number): Promise<boolean> {
    const [result] = await db
      .delete(customerProducts)
      .where(and(
        eq(customerProducts.customer_id, customerId),
        eq(customerProducts.product_id, productId)
      ))
      .returning();
    return !!result;
  }

  async addCategoryToCustomer(customerId: number, categoryId: number): Promise<boolean> {
    const [result] = await db
      .insert(customerCategories)
      .values({ customer_id: customerId, category_id: categoryId })
      .returning();
    return !!result;
  }

  async removeCategoryFromCustomer(customerId: number, categoryId: number): Promise<boolean> {
    const [result] = await db
      .delete(customerCategories)
      .where(and(
        eq(customerCategories.customer_id, customerId),
        eq(customerCategories.category_id, categoryId)
      ))
      .returning();
    return !!result;
  }

  // New methods for customer catalog access
  async addCategorySaleUnitToCustomer(customerId: number, categoryId: number, saleUnitId: number): Promise<boolean> {
    try {
      console.log(`[STORAGE] Tentando adicionar unidade ${saleUnitId} à categoria ${categoryId} do cliente ${customerId}`);

      // First check if the association already exists to avoid duplicates
      const existingAssociation = await db
        .select()
        .from(customerCategoryAllowedSaleUnits)
        .where(
          and(
            eq(customerCategoryAllowedSaleUnits.customer_id, customerId),
            eq(customerCategoryAllowedSaleUnits.product_category_id, categoryId),
            eq(customerCategoryAllowedSaleUnits.sale_unit_id, saleUnitId)
          )
        );

      if (existingAssociation.length > 0) {
        console.log(`[STORAGE] Associação já existe para cliente ${customerId}, categoria ${categoryId}, unidade ${saleUnitId}`);
        return true; // Association already exists, consider it a success
      }

      // Now make sure the customer-category association exists
      const categoryAssociation = await db
        .select()
        .from(customerCategories)
        .where(
          and(
            eq(customerCategories.customer_id, customerId),
            eq(customerCategories.category_id, categoryId)
          )
        );

      if (categoryAssociation.length === 0) {
        console.log(`[STORAGE] Cliente ${customerId} não está associado à categoria ${categoryId}, criando associação...`);
        // Create the customer-category association first
        await db.insert(customerCategories).values({
          customer_id: customerId,
          category_id: categoryId
        });
      }

      // Now create the sale unit association
      const [result] = await db
        .insert(customerCategoryAllowedSaleUnits)
        .values({
          customer_id: customerId,
          product_category_id: categoryId,
          sale_unit_id: saleUnitId
        })
        .returning();

      // Verify the insert was successful
      const verification = await db
        .select()
        .from(customerCategoryAllowedSaleUnits)
        .where(
          and(
            eq(customerCategoryAllowedSaleUnits.customer_id, customerId),
            eq(customerCategoryAllowedSaleUnits.product_category_id, categoryId),
            eq(customerCategoryAllowedSaleUnits.sale_unit_id, saleUnitId)
          )
        );

      const success = verification.length > 0;
      console.log(`[STORAGE] Associação ${success ? 'criada com sucesso' : 'falhou'} para cliente ${customerId}, categoria ${categoryId}, unidade ${saleUnitId}`);

      return success;
    } catch (error) {
      console.error(
        "[STORAGE] Erro ao adicionar unidade de venda à categoria do cliente:",
        error,
        "Dados:",
        { customerId, categoryId, saleUnitId }
      );

      // Check if this is a duplicate key error (which would mean the association already exists)
      if (error.message && (
          error.message.includes('duplicate key') || 
          error.message.includes('unique constraint')
      )) {
        console.log(`[STORAGE] Ignorando erro de duplicação para cliente ${customerId}, categoria ${categoryId}, unidade ${saleUnitId}`);
        return true; // Consider it a success if it's just a duplicate
      }

      return false;
    }
  }

  async removeCategorySaleUnitFromCustomer(customerId: number, categoryId: number, saleUnitId: number): Promise<boolean> {
    const [result] = await db
      .delete(customerCategoryAllowedSaleUnits)
      .where(and(
        eq(customerCategoryAllowedSaleUnits.customer_id, customerId),
        eq(customerCategoryAllowedSaleUnits.product_category_id, categoryId),
        eq(customerCategoryAllowedSaleUnits.sale_unit_id, saleUnitId)
      ))
      .returning();
    return !!result;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(and(eq(orders.id, id), isNull(orders.data_de_exclusao)));
    return order;
  }

  async getOrders(includeDeleted: boolean = false): Promise<Order[]> {
    if (includeDeleted) {
      return db.select().from(orders).orderBy(desc(orders.order_date));
    }
    return db.select().from(orders).where(isNull(orders.data_de_exclusao)).orderBy(desc(orders.order_date));
  }

  async getCustomerOrders(customerId: number, includeDeleted: boolean = false): Promise<Order[]> {
    if (includeDeleted) {
      return db.select().from(orders).where(eq(orders.customer_id, customerId)).orderBy(desc(orders.order_date));
    }
    return db.select().from(orders)
      .where(and(
        eq(orders.customer_id, customerId),
        isNull(orders.data_de_exclusao)
      ))
      .orderBy(desc(orders.order_date));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create the order
      const [createdOrder] = await tx.insert(orders).values(order).returning();

      // Add order items
      for (const item of items) {
        await tx.insert(orderItems).values({
          ...item,
          order_id: createdOrder.id
        });
      }

      return createdOrder;
    });
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...orderData, updated_at: new Date() })
      .where(and(eq(orders.id, id), isNull(orders.data_de_exclusao)))
      .returning();
    return updatedOrder;
  }

  async softDeleteOrder(id: number): Promise<boolean> {
    const [deletedOrder] = await db
      .update(orders)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(orders.id, id), isNull(orders.data_de_exclusao)))
      .returning();
    return !!deletedOrder;
  }

  async hardDeleteOrder(id: number): Promise<boolean> {
    const [deletedOrder] = await db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();
    return !!deletedOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getOrderPayments(orderId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.order_id, orderId)).orderBy(desc(payments.payment_date));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    return await db.transaction(async (tx) => {
      // Create the payment
      const [createdPayment] = await tx.insert(payments).values(payment).returning();

      // Update the order's payment status and paid amount
      const [order] = await tx.select().from(orders).where(eq(orders.id, payment.order_id));
      if (!order) throw new Error('Order not found');

      const allPayments = await tx.select({ amount: payments.amount }).from(payments).where(eq(payments.order_id, payment.order_id));
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
      if (totalPaid >= order.total) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partial';
      }

      await tx.update(orders)
        .set({ 
          payment_status: paymentStatus, 
          paid_amount: totalPaid,
          updated_at: new Date()
        })
        .where(eq(orders.id, payment.order_id));

      // Record revenue transaction if configured
      const [defaultAccount] = await tx.select().from(financialAccounts).orderBy(financialAccounts.id);
      if (defaultAccount) {
        const [revenueCategory] = await tx.select().from(financialCategories)
          .where(and(
            eq(financialCategories.name, 'Venda Atacado'),
            eq(financialCategories.type, 'revenue')
          ));

        if (revenueCategory) {
          await tx.insert(financialTransactions).values({
            type: 'revenue',
            amount: payment.amount,
            date: payment.payment_date,
            description: `Pagamento do pedido #${order.id}`,
            account_id: defaultAccount.id,
            category_id: revenueCategory.id,
            order_id: order.id,
          });
        }
      }

      return createdPayment;
    });
  }

  // Financial Account methods
  async getFinancialAccount(id: number): Promise<FinancialAccount | undefined> {
    const [account] = await db.select().from(financialAccounts).where(eq(financialAccounts.id, id));
    return account;
  }

  async getFinancialAccounts(): Promise<FinancialAccount[]> {
    return db.select().from(financialAccounts).orderBy(financialAccounts.name);
  }

  async createFinancialAccount(account: InsertFinancialAccount): Promise<FinancialAccount> {
    const [createdAccount] = await db.insert(financialAccounts).values(account).returning();
    return createdAccount;
  }

  async updateFinancialAccount(id: number, accountData: Partial<FinancialAccount>): Promise<FinancialAccount | undefined> {
    const [updatedAccount] = await db
      .update(financialAccounts)
      .set({ ...accountData, updated_at: new Date() })
      .where(eq(financialAccounts.id, id))
      .returning();
    return updatedAccount;
  }

  // Financial Category methods
  async getFinancialCategory(id: number): Promise<FinancialCategory | undefined> {
    const [category] = await db.select().from(financialCategories).where(eq(financialCategories.id, id));
    return category;
  }

  async getFinancialCategories(): Promise<FinancialCategory[]> {
    return db.select().from(financialCategories).orderBy(financialCategories.name);
  }

  async getFinancialCategoriesByType(type: string): Promise<FinancialCategory[]> {
    return db.select().from(financialCategories)
      .where(eq(financialCategories.type, type as any))
      .orderBy(financialCategories.name);
  }

  async createFinancialCategory(category: InsertFinancialCategory): Promise<FinancialCategory> {
    const [createdCategory] = await db.insert(financialCategories).values(category).returning();
    return createdCategory;
  }

  async updateFinancialCategory(id: number, categoryData: Partial<FinancialCategory>): Promise<FinancialCategory | undefined> {
    const [updatedCategory] = await db
      .update(financialCategories)
      .set({ ...categoryData, updated_at: new Date() })
      .where(eq(financialCategories.id, id))
      .returning();
    return updatedCategory;
  }

  // Financial Transaction methods
  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db.select().from(financialTransactions).where(and(eq(financialTransactions.id, id), isNull(financialTransactions.data_de_exclusao)));
    return transaction;
  }

  async getFinancialTransactions(includeDeleted: boolean = false): Promise<FinancialTransaction[]> {
    if (includeDeleted) {
      return db.select().from(financialTransactions).orderBy(desc(financialTransactions.date));
    }
    return db.select().from(financialTransactions).where(isNull(financialTransactions.data_de_exclusao)).orderBy(desc(financialTransactions.date));
  }

  async getFinancialTransactionsByAccount(accountId: number, includeDeleted: boolean = false): Promise<FinancialTransaction[]> {
    if (includeDeleted) {
      return db.select().from(financialTransactions).where(eq(financialTransactions.account_id, accountId)).orderBy(desc(financialTransactions.date));
    }
    return db.select().from(financialTransactions)
      .where(and(
        eq(financialTransactions.account_id, accountId),
        isNull(financialTransactions.data_de_exclusao)
      ))
      .orderBy(desc(financialTransactions.date));
  }

  async getFinancialTransactionsByCategory(categoryId: number, includeDeleted: boolean = false): Promise<FinancialTransaction[]> {
    if (includeDeleted) {
      return db.select().from(financialTransactions).where(eq(financialTransactions.category_id, categoryId)).orderBy(desc(financialTransactions.date));
    }
    return db.select().from(financialTransactions)
      .where(and(
        eq(financialTransactions.category_id, categoryId),
        isNull(financialTransactions.data_de_exclusao)
      ))
      .orderBy(desc(financialTransactions.date));
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    return await db.transaction(async (tx) => {
      const [createdTransaction] = await tx.insert(financialTransactions).values(transaction).returning();

      // If it's a transfer, create the corresponding transaction in the destination account
      if (transaction.type === 'transfer' && transaction.transfer_to_account_id) {
        await tx.insert(financialTransactions).values({
          type: 'transfer',
          amount: transaction.amount,
          date: transaction.date,
          description: `${transaction.description} (recebido)`,
          account_id: transaction.transfer_to_account_id,
          category_id: transaction.category_id,
          transfer_to_account_id: transaction.account_id,
        });
      }

      return createdTransaction;
    });
  }

  async updateFinancialTransaction(id: number, transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const [updatedTransaction] = await db
      .update(financialTransactions)
      .set({ ...transactionData, updated_at: new Date() })
      .where(and(eq(financialTransactions.id, id), isNull(financialTransactions.data_de_exclusao)))
      .returning();
    return updatedTransaction;
  }

  async softDeleteFinancialTransaction(id: number): Promise<boolean> {
    const [deletedTransaction] = await db
      .update(financialTransactions)
      .set({ data_de_exclusao: new Date() })
      .where(and(eq(financialTransactions.id, id), isNull(financialTransactions.data_de_exclusao)))
      .returning();
    return !!deletedTransaction;
  }

  async hardDeleteFinancialTransaction(id: number): Promise<boolean> {
    const [deletedTransaction] = await db
      .delete(financialTransactions)
      .where(eq(financialTransactions.id, id))
      .returning();
    return !!deletedTransaction;
  }

  // Check if a customer-category association exists
  async checkCustomerCategoryExists(customerId: number, categoryId: number) {
    const result = await db.select({ count: sql`count(*)` })
      .from(customerCategories)
      .where(and(
        eq(customerCategories.customer_id, customerId),
        eq(customerCategories.category_id, categoryId)
      ));

    return (result[0]?.count || 0) > 0;
  }

  // Add a sale unit to a customer category
  async addSaleUnitToCustomerCategory(customerId: number, categoryId: number, saleUnitId: number) {
    try {
      console.log(`[STORAGE] Associando unidade de venda ${saleUnitId} ao cliente ${customerId} na categoria ${categoryId}`);

      // Check if the association already exists to avoid duplicates
      const existing = await db.select()
        .from(customerCategoryAllowedSaleUnits)
        .where(and(
          eq(customerCategoryAllowedSaleUnits.customer_id, customerId),
          eq(customerCategoryAllowedSaleUnits.product_category_id, categoryId),
          eq(customerCategoryAllowedSaleUnits.sale_unit_id, saleUnitId)
        ));

      if (existing.length > 0) {
        console.log(`[STORAGE] Unidade de venda ${saleUnitId} já associada ao cliente ${customerId} na categoria ${categoryId}`);
        return; // Already exists, no need to insert
      }

      // Insert the new association
      await db.insert(customerCategoryAllowedSaleUnits).values({
        customer_id: customerId,
        product_category_id: categoryId,
        sale_unit_id: saleUnitId
      });

      console.log(`[STORAGE] Unidade de venda ${saleUnitId} associada com sucesso ao cliente ${customerId} na categoria ${categoryId}`);
    } catch (error) {
      console.error(`[STORAGE] Falha ao associar unidade de venda ${saleUnitId} ao cliente ${customerId} na categoria ${categoryId}:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();