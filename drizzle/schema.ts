import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with token gateway specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tokenBalance: decimal("tokenBalance", { precision: 20, scale: 6 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Transactions table for tracking all token purchases and usage
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund"]).notNull(),
  amount: decimal("amount", { precision: 20, scale: 6 }).notNull(),
  description: text("description"),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * API Keys table for user API key management
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("keyPrefix", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Usage logs table for tracking API calls and token consumption
 */
export const usageLogs = mysqlTable("usageLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  apiKeyId: int("apiKeyId"),
  model: varchar("model", { length: 255 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  tokensUsed: decimal("tokensUsed", { precision: 20, scale: 6 }).notNull(),
  tokensDeducted: decimal("tokensDeducted", { precision: 20, scale: 6 }).notNull(),
  requestTokens: int("requestTokens"),
  responseTokens: int("responseTokens"),
  status: mysqlEnum("status", ["success", "failed", "insufficient_balance"]).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;

/**
 * Model pricing table for token deduction calculations
 */
export const modelPricing = mysqlTable("modelPricing", {
  id: int("id").autoincrement().primaryKey(),
  model: varchar("model", { length: 255 }).notNull().unique(),
  service: varchar("service", { length: 100 }).notNull(),
  inputTokenPrice: decimal("inputTokenPrice", { precision: 20, scale: 10 }).notNull(),
  outputTokenPrice: decimal("outputTokenPrice", { precision: 20, scale: 10 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ModelPricing = typeof modelPricing.$inferSelect;
export type InsertModelPricing = typeof modelPricing.$inferInsert;
