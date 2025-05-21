import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertProductCategorySchema, insertProductSchema, insertCustomerSchema,
  insertOrderSchema, insertOrderItemSchema, insertPaymentSchema,
  insertFinancialAccountSchema, insertFinancialCategorySchema, insertFinancialTransactionSchema,
  insertSaleUnitSchema, insertBaseProductSchema, insertProductSaleVersionSchema
} from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Customer endpoints
  app.get("/api/customers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true';
      const customers = await storage.getCustomers(includeDeleted);
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const customer = await storage.updateCustomer(customerId, req.body);
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/customers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';
      
      let success = false;
      if (hardDelete) {
        success = await storage.hardDeleteCustomer(customerId);
      } else {
        success = await storage.softDeleteCustomer(customerId);
      }
      
      if (!success) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Customer category/product access endpoints
  app.get("/api/customers/:id/categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      // For customer users, they can only access their own data
      if (req.user.role === 'customer') {
        const customerData = await storage.getCustomerByUserId(req.user.id);
        if (!customerData || customerData.id !== parseInt(req.params.id)) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      const categories = await storage.getCustomerCategories(parseInt(req.params.id));
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:id/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      // For customer users, they can only access their own data
      if (req.user.role === 'customer') {
        const customerData = await storage.getCustomerByUserId(req.user.id);
        if (!customerData || customerData.id !== parseInt(req.params.id)) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      const products = await storage.getCustomerProducts(parseInt(req.params.id));
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers/:id/categories/:categoryId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);
      
      const success = await storage.addCategoryToCustomer(customerId, categoryId);
      if (!success) {
        return res.status(400).json({ message: "Não foi possível adicionar a categoria ao cliente" });
      }
      
      res.status(201).json({ message: "Categoria adicionada com sucesso" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers/:id/products/:productId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const productId = parseInt(req.params.productId);
      
      const success = await storage.addProductToCustomer(customerId, productId);
      if (!success) {
        return res.status(400).json({ message: "Não foi possível adicionar o produto ao cliente" });
      }
      
      res.status(201).json({ message: "Produto adicionado com sucesso" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/customers/:id/categories/:categoryId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);
      
      const success = await storage.removeCategoryFromCustomer(customerId, categoryId);
      if (!success) {
        return res.status(404).json({ message: "Relação cliente-categoria não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/customers/:id/products/:productId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customerId = parseInt(req.params.id);
      const productId = parseInt(req.params.productId);
      
      const success = await storage.removeProductFromCustomer(customerId, productId);
      if (!success) {
        return res.status(404).json({ message: "Relação cliente-produto não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Product Category endpoints
  app.get("/api/categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true' && 
        (req.user.role === 'admin' || req.user.role === 'manager');
      
      const categories = await storage.getProductCategories(includeDeleted);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const category = await storage.getProductCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateProductCategory(categoryId, req.body);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const categoryId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';
      
      let success = false;
      if (hardDelete) {
        success = await storage.hardDeleteProductCategory(categoryId);
      } else {
        success = await storage.softDeleteProductCategory(categoryId);
      }
      
      if (!success) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Product endpoints
  app.get("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true' && 
        (req.user.role === 'admin' || req.user.role === 'manager');
      
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId, includeDeleted);
      } else {
        products = await storage.getProducts(includeDeleted);
      }
      
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/products/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const productId = parseInt(req.params.id);
      const product = await storage.updateProduct(productId, req.body);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const productId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';
      
      let success = false;
      if (hardDelete) {
        success = await storage.hardDeleteProduct(productId);
      } else {
        success = await storage.softDeleteProduct(productId);
      }
      
      if (!success) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Order endpoints
  app.get("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true' && 
        (req.user.role === 'admin' || req.user.role === 'manager');
      
      // If customer, only return their orders
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer) {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }
        
        const orders = await storage.getCustomerOrders(customer.id, includeDeleted);
        return res.json(orders);
      }
      
      // For admin/manager, can filter by customer or get all
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      
      let orders;
      if (customerId) {
        orders = await storage.getCustomerOrders(customerId, includeDeleted);
      } else {
        orders = await storage.getOrders(includeDeleted);
      }
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // If customer, check if it's their order
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== order.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id/items", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // If customer, check if it's their order
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== order.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const { order, items } = req.body;
      
      // Validate the order data
      const validatedOrder = insertOrderSchema.parse(order);
      
      // If customer, check if it's their order
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== validatedOrder.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      // Validate the order items
      const validatedItems = z.array(insertOrderItemSchema).parse(items);
      
      // Create the order
      const createdOrder = await storage.createOrder(validatedOrder, validatedItems);
      res.status(201).json(createdOrder);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Customers can only update their own orders and only certain fields
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== order.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
        
        // Customers can only update certain fields (e.g. not discounts)
        const allowedFields = ['fulfillment_type', 'delivery_date'];
        const filteredData = Object.keys(req.body)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
          }, {});
        
        const updatedOrder = await storage.updateOrder(orderId, filteredData);
        return res.json(updatedOrder);
      }
      
      // Admin/Manager can update all fields
      const updatedOrder = await storage.updateOrder(orderId, req.body);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const orderId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';
      
      let success = false;
      if (hardDelete) {
        success = await storage.hardDeleteOrder(orderId);
      } else {
        success = await storage.softDeleteOrder(orderId);
      }
      
      if (!success) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Payment endpoints
  app.get("/api/orders/:id/payments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // If customer, check if it's their order
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== order.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      const payments = await storage.getOrderPayments(orderId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertPaymentSchema.parse(req.body);
      
      // Check if the order exists
      const order = await storage.getOrder(validatedData.order_id);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // If customer, check if it's their order
      if (req.user.role === 'customer') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || customer.id !== order.customer_id) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }
      
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  });

  // Financial accounts endpoints
  app.get("/api/financial/accounts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const accounts = await storage.getFinancialAccounts();
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/financial/accounts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.createFinancialAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/financial/accounts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await storage.updateFinancialAccount(accountId, req.body);
      if (!account) {
        return res.status(404).json({ message: "Conta financeira não encontrada" });
      }
      
      res.json(account);
    } catch (error) {
      next(error);
    }
  });

  // Financial categories endpoints
  app.get("/api/financial/categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const type = req.query.type as string;
      
      let categories;
      if (type) {
        categories = await storage.getFinancialCategoriesByType(type);
      } else {
        categories = await storage.getFinancialCategories();
      }
      
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/financial/categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertFinancialCategorySchema.parse(req.body);
      const category = await storage.createFinancialCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/financial/categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateFinancialCategory(categoryId, req.body);
      if (!category) {
        return res.status(404).json({ message: "Categoria financeira não encontrada" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Financial transactions endpoints
  app.get("/api/financial/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true';
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let transactions;
      if (accountId) {
        transactions = await storage.getFinancialTransactionsByAccount(accountId, includeDeleted);
      } else if (categoryId) {
        transactions = await storage.getFinancialTransactionsByCategory(categoryId, includeDeleted);
      } else {
        transactions = await storage.getFinancialTransactions(includeDeleted);
      }
      
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/financial/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/financial/transactions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.updateFinancialTransaction(transactionId, req.body);
      if (!transaction) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/financial/transactions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const transactionId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';
      
      let success = false;
      if (hardDelete) {
        success = await storage.hardDeleteFinancialTransaction(transactionId);
      } else {
        success = await storage.softDeleteFinancialTransaction(transactionId);
      }
      
      if (!success) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Get my customer data (for customers)
  app.get("/api/me/customer", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'customer') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) {
        return res.status(404).json({ message: "Perfil de cliente não encontrado" });
      }
      
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
