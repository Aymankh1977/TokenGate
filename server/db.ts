import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, transactions, apiKeys, usageLogs, modelPricing } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserTokenBalance(userId: number, amount: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update token balance: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({
        tokenBalance: amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update token balance:", error);
    throw error;
  }
}

export async function createTransaction(userId: number, type: "purchase" | "usage" | "refund", amount: string, description?: string, stripePaymentId?: string, metadata?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create transaction: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(transactions).values({
      userId,
      type,
      amount,
      description,
      stripePaymentId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    throw error;
  }
}

export async function getTransactionsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy((t) => t.createdAt)
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

export async function createApiKey(userId: number, keyHash: string, keyPrefix: string, name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create API key: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(apiKeys).values({
      userId,
      keyHash,
      keyPrefix,
      name,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create API key:", error);
    throw error;
  }
}

export async function getApiKeysByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get API keys: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get API keys:", error);
    return [];
  }
}

export async function revokeApiKey(keyId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke API key: database not available");
    return;
  }

  try {
    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, keyId));
  } catch (error) {
    console.error("[Database] Failed to revoke API key:", error);
    throw error;
  }
}

export async function createUsageLog(userId: number, model: string, service: string, tokensUsed: string, tokensDeducted: string, status: "success" | "failed" | "insufficient_balance", requestTokens?: number, responseTokens?: number, apiKeyId?: number, metadata?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create usage log: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(usageLogs).values({
      userId,
      apiKeyId,
      model,
      service,
      tokensUsed,
      tokensDeducted,
      requestTokens,
      responseTokens,
      status,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create usage log:", error);
    throw error;
  }
}

export async function getUsageLogsByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get usage logs: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(usageLogs)
      .where(eq(usageLogs.userId, userId))
      .orderBy((l) => l.createdAt)
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get usage logs:", error);
    return [];
  }
}

export async function getModelPricing(model: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get model pricing: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(modelPricing)
      .where(and(eq(modelPricing.model, model), eq(modelPricing.isActive, true)))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get model pricing:", error);
    return undefined;
  }
}

export async function getAllUsers(limit = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db.select().from(users).limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return [];
  }
}

export async function getAllTransactions(limit = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  try {
    const result = await db.select().from(transactions).limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}
