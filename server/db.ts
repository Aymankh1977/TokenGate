import { eq, and, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
import {
  InsertUser,
  users,
  transactions,
  apiKeys,
  usageLogs,
  modelPricing,
  processedStripeEvents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { picoToUsdString } from "./billing/billing";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function affectedRows(res: unknown): number {
  // drizzle/mysql2 returns [ResultSetHeader, FieldPacket[]]
  const r = res as any;
  return r?.[0]?.affectedRows ?? r?.affectedRows ?? r?.rowsAffected ?? 0;
}

/* ------------------------------------------------------------------ users -- */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach((f) => {
    if (user[f] === undefined) return;
    const v = user[f] ?? null;
    (values as any)[f] = v;
    updateSet[f] = v;
  });
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return r[0];
}

/* --------------------------------------------------------- balance (atomic) */

/**
 * Atomically hold `amountPico` against the balance. Returns true only if the
 * row was updated, i.e. the user actually had the funds. This single statement
 * (decrement guarded by `balance >= amount`) is what kills the race condition /
 * double-spend in the old read-then-write code.
 */
export async function reserveCredits(userId: number, amountPico: bigint): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const res = await db
    .update(users)
    .set({ balancePico: sql`${users.balancePico} - ${amountPico}`, updatedAt: new Date() })
    .where(and(eq(users.id, userId), gte(users.balancePico, amountPico)));
  return affectedRows(res) === 1;
}

/** Atomically return `amountPico` to the balance (settle refund / error refund). */
export async function refundCredits(userId: number, amountPico: bigint): Promise<void> {
  if (amountPico <= 0n) return;
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(users)
    .set({ balancePico: sql`${users.balancePico} + ${amountPico}`, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/* --------------------------------------------------------------- purchases */

/**
 * Credit a Stripe purchase exactly once. The event id is the idempotency key:
 * inserting it first inside the transaction means a webhook retry hits a
 * duplicate-key error and we skip crediting again.
 */
export async function creditPurchaseIfNew(args: {
  eventId: string;
  eventType: string;
  userId: number;
  grantPico: bigint;
  amountUsd: string;
  stripePaymentId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ applied: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  try {
    return await db.transaction(async (tx) => {
      try {
        await tx
          .insert(processedStripeEvents)
          .values({ eventId: args.eventId, type: args.eventType });
      } catch (e: any) {
        if (String(e?.message ?? e).toLowerCase().includes("duplicate")) {
          return { applied: false };
        }
        throw e;
      }
      await tx
        .update(users)
        .set({ balancePico: sql`${users.balancePico} + ${args.grantPico}`, updatedAt: new Date() })
        .where(eq(users.id, args.userId));
      await tx.insert(transactions).values({
        userId: args.userId,
        type: "purchase",
        amountUsd: args.amountUsd,
        description: `Credit purchase (${args.amountUsd} USD)`,
        stripePaymentId: args.stripePaymentId,
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      });
      return { applied: true };
    });
  } catch (e) {
    console.error("[Database] creditPurchaseIfNew failed:", e);
    throw e;
  }
}

/* -------------------------------------------------------------- usage logs */

export async function recordUsage(args: {
  userId: number;
  apiKeyId?: number;
  model: string;
  service: string;
  chargedPico: bigint;
  costPico: bigint;
  requestTokens?: number;
  responseTokens?: number;
  status: "success" | "failed" | "insufficient_balance";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const chargedUsd = picoToUsdString(args.chargedPico);
  const costUsd = picoToUsdString(args.costPico);
  await db.insert(usageLogs).values({
    userId: args.userId,
    apiKeyId: args.apiKeyId,
    model: args.model,
    service: args.service,
    chargedUsd,
    costUsd,
    requestTokens: args.requestTokens,
    responseTokens: args.responseTokens,
    status: args.status,
    metadata: args.metadata ? JSON.stringify(args.metadata) : null,
  });
  if (args.status === "success") {
    await db.insert(transactions).values({
      userId: args.userId,
      type: "usage",
      amountUsd: chargedUsd,
      costUsd,
      description: `API call ${args.service}/${args.model}`,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
    });
  }
}

export async function getUsageLogsByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usageLogs).where(eq(usageLogs.userId, userId)).limit(limit);
}

export async function getTransactionsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.userId, userId)).limit(limit);
}

/* ----------------------------------------------------------------- pricing */

export async function getModelPricing(model: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db
    .select()
    .from(modelPricing)
    .where(and(eq(modelPricing.model, model), eq(modelPricing.isActive, true)))
    .limit(1);
  return r[0];
}

/* ---------------------------------------------------------------- API keys */

const KEY_PEPPER = () => process.env.API_KEY_PEPPER ?? "";

/** HMAC-SHA256 of the raw key. We only ever store / compare this hash. */
export function hashApiKey(rawKey: string): string {
  return crypto.createHmac("sha256", KEY_PEPPER()).update(rawKey).digest("hex");
}

/**
 * Generate a cryptographically-random key, store ONLY its hash, return the
 * plaintext to show the user once. (Old code used Math.random, never hashed,
 * and stored the wrong fields.)
 */
export async function createApiKey(userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const rawKey = `tg_${crypto.randomBytes(24).toString("base64url")}`;
  const keyPrefix = rawKey.slice(0, 8); // "tg_AbCd" for display
  const last4 = rawKey.slice(-4);
  await db.insert(apiKeys).values({
    userId,
    keyHash: hashApiKey(rawKey),
    keyPrefix,
    last4,
    name,
  });
  // rawKey is returned ONCE and never stored.
  return { rawKey, keyPrefix, last4, name };
}

export async function getApiKeyByHash(keyHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
    .limit(1);
  return r[0];
}

export async function touchApiKey(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
}

export async function getApiKeysByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Never returns keyHash — only safe display fields.
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      last4: apiKeys.last4,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
}

export async function revokeApiKey(userId: number, keyId: number) {
  const db = await getDb();
  if (!db) return;
  // Scoped to the owner so a user can't revoke someone else's key.
  await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
}

/* ------------------------------------------------------------------- admin */

export async function getAllUsers(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(limit);
}
export async function getAllTransactions(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).limit(limit);
}
