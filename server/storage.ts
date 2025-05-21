import { 
  InsertUser, User, Customer, InsertCustomer, ProductCategory, 
  InsertProductCategory, Product, InsertProduct, Order, InsertOrder,
  OrderItem, InsertOrderItem, Payment, InsertPayment, FinancialAccount, 
  InsertFinancialAccount, FinancialCategory, InsertFinancialCategory,
  FinancialTransaction, InsertFinancialTransaction,
  users, customers, productCategories, products, customerCategories, 
  customerProducts, orders, orderItems, payments, financialAccounts,
  financialCategories, financialTransactions
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

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(includeDeleted?: boolean): Promise<Product[]>;
  getProductsByCategory(categoryId: number, includeDeleted?: boolean): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  softDeleteProduct(id: number): Promise<boolean>;
  hardDeleteProduct(id: number): Promise<boolean>;

  // Customer Product Access
  getCustomerProducts(customerId: number): Promise<Product[]>;
  getCustomerCategories(customerId: number): Promise<ProductCategory[]>;
  addProductToCustomer(customerId: number, productId: number): Promise<boolean>;
  removeProductFromCustomer(customerId: number, productId: number): Promise<boolean>;
  addCategoryToCustomer(customerId: number, categoryId: number): Promise<boolean>;
  removeCategoryFromCustomer(customerId: number, categoryId: number): Promise<boolean>;

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

  // Customer Product Access methods
  async getCustomerProducts(customerId: number): Promise<Product[]> {
    // Get products directly assigned to customer
    const directProducts = await db
      .select({ product: products })
      .from(customerProducts)
      .innerJoin(products, eq(customerProducts.product_id, products.id))
      .where(and(
        eq(customerProducts.customer_id, customerId),
        isNull(products.data_de_exclusao)
      ))
      .orderBy([asc(products.price), asc(products.name)]);

    // Get products from categories assigned to customer
    const categoryProducts = await db
      .select({ product: products })
      .from(customerCategories)
      .innerJoin(products, eq(customerCategories.category_id, products.category_id))
      .where(and(
        eq(customerCategories.customer_id, customerId),
        isNull(products.data_de_exclusao)
      ))
      .orderBy([asc(products.price), asc(products.name)]);

    // Combine and deduplicate results
    const allProducts = [...directProducts.map(p => p.product), ...categoryProducts.map(p => p.product)];
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
      .select({ category: productCategories })
      .from(customerCategories)
      .innerJoin(productCategories, eq(customerCategories.category_id, productCategories.id))
      .where(and(
        eq(customerCategories.customer_id, customerId),
        isNull(productCategories.data_de_exclusao)
      ))
      .orderBy(productCategories.name);

    return result.map(r => r.category);
  }

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
}

export const storage = new DatabaseStorage();