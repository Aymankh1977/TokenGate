import {
  int,
  bigint,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Local email/password accounts store a scrypt hash here (null for OAuth users).
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  balancePico: bigint("balancePico", { mode: "bigint" }).default(0n).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund"]).notNull(),
  amountUsd: varchar("amountUsd", { length: 32 }).notNull(),
  costUsd: varchar("costUsd", { length: 32 }),
  description: text("description"),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Transaction = typeof transactions.$inferSelect;

export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  keyPrefix: varchar("keyPrefix", { length: 16 }).notNull(),
  last4: varchar("last4", { length: 8 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ApiKey = typeof apiKeys.$inferSelect;

export const usageLogs = mysqlTable("usageLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  apiKeyId: int("apiKeyId"),
  model: varchar("model", { length: 255 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  chargedUsd: varchar("chargedUsd", { length: 32 }).notNull(),
  costUsd: varchar("costUsd", { length: 32 }).notNull(),
  requestTokens: int("requestTokens"),
  responseTokens: int("responseTokens"),
  status: mysqlEnum("status", ["success", "failed", "insufficient_balance"]).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UsageLog = typeof usageLogs.$inferSelect;

export const modelPricing = mysqlTable("modelPricing", {
  id: int("id").autoincrement().primaryKey(),
  model: varchar("model", { length: 255 }).notNull().unique(),
  service: varchar("service", { length: 100 }).notNull(),
  inputPicoPerToken: bigint("inputPicoPerToken", { mode: "bigint" }).notNull(),
  outputPicoPerToken: bigint("outputPicoPerToken", { mode: "bigint" }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ModelPricing = typeof modelPricing.$inferSelect;

export const processedStripeEvents = mysqlTable("processedStripeEvents", {
  eventId: varchar("eventId", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});
export type ProcessedStripeEvent = typeof processedStripeEvents.$inferSelect;
