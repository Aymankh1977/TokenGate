import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runMigrations() {
  try {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (!db) { console.warn("[Migrations] No DB connection, skipping"); return; }
    const { sql } = await import("drizzle-orm");
    const stmts = [
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`openId\` varchar(64) NOT NULL,
        \`name\` text,
        \`email\` varchar(320),
        \`loginMethod\` varchar(64),
        \`passwordHash\` varchar(255),
        \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
        \`balancePico\` bigint NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        \`lastSignedIn\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
      )`,
      `CREATE TABLE IF NOT EXISTS \`transactions\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`type\` enum('purchase','usage','refund') NOT NULL,
        \`amountUsd\` varchar(32) NOT NULL DEFAULT '0',
        \`costUsd\` varchar(32),
        \`description\` text,
        \`stripePaymentId\` varchar(255),
        \`metadata\` json,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`transactions_id\` PRIMARY KEY(\`id\`)
      )`,
      `CREATE TABLE IF NOT EXISTS \`apiKeys\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`keyHash\` varchar(128) NOT NULL,
        \`keyPrefix\` varchar(16) NOT NULL,
        \`last4\` varchar(8) NOT NULL DEFAULT '',
        \`name\` varchar(255) NOT NULL,
        \`lastUsedAt\` timestamp,
        \`isActive\` boolean NOT NULL DEFAULT true,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`apiKeys_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`apiKeys_keyHash_unique\` UNIQUE(\`keyHash\`)
      )`,
      `CREATE TABLE IF NOT EXISTS \`usageLogs\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`apiKeyId\` int,
        \`model\` varchar(255) NOT NULL,
        \`service\` varchar(100) NOT NULL,
        \`chargedUsd\` varchar(32) NOT NULL DEFAULT '0',
        \`costUsd\` varchar(32) NOT NULL DEFAULT '0',
        \`requestTokens\` int,
        \`responseTokens\` int,
        \`status\` enum('success','failed','insufficient_balance') NOT NULL,
        \`metadata\` json,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`usageLogs_id\` PRIMARY KEY(\`id\`)
      )`,
      `CREATE TABLE IF NOT EXISTS \`modelPricing\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`model\` varchar(255) NOT NULL,
        \`service\` varchar(100) NOT NULL,
        \`inputPicoPerToken\` bigint NOT NULL DEFAULT 0,
        \`outputPicoPerToken\` bigint NOT NULL DEFAULT 0,
        \`isActive\` boolean NOT NULL DEFAULT true,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`modelPricing_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`modelPricing_model_unique\` UNIQUE(\`model\`)
      )`,
      `CREATE TABLE IF NOT EXISTS \`processedStripeEvents\` (
        \`eventId\` varchar(255) NOT NULL,
        \`type\` varchar(100),
        \`processedAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`processedStripeEvents_eventId\` PRIMARY KEY(\`eventId\`)
      )`,
    ];
    for (const stmt of stmts) {
      await db.execute(sql.raw(stmt));
    }
    // Add columns that may be missing (safe check via information_schema)
    const colsToAdd: { table: string; column: string; definition: string }[] = [
      { table: "users", column: "passwordHash", definition: "varchar(255) NULL" },
      { table: "users", column: "balancePico", definition: "bigint NOT NULL DEFAULT 0" },
      { table: "transactions", column: "amountUsd", definition: "varchar(32) NOT NULL DEFAULT '0'" },
      { table: "transactions", column: "costUsd", definition: "varchar(32) NULL" },
      { table: "apiKeys", column: "last4", definition: "varchar(8) NOT NULL DEFAULT ''" },
      { table: "usageLogs", column: "chargedUsd", definition: "varchar(32) NOT NULL DEFAULT '0'" },
      { table: "usageLogs", column: "costUsd", definition: "varchar(32) NOT NULL DEFAULT '0'" },
      { table: "modelPricing", column: "inputPicoPerToken", definition: "bigint NOT NULL DEFAULT 0" },
      { table: "modelPricing", column: "outputPicoPerToken", definition: "bigint NOT NULL DEFAULT 0" },
    ];
    const dbName = process.env.DATABASE_URL?.split("/").pop()?.split("?")[0] ?? "railway";
    for (const { table, column, definition } of colsToAdd) {
      const rows = await db.execute(sql.raw(
        `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${dbName}' AND TABLE_NAME='${table}' AND COLUMN_NAME='${column}'`
      ));
      const exists = Array.isArray(rows) && (rows[0] as any[]).length > 0;
      if (!exists) {
        await db.execute(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`));
      }
    }
    console.log("[Migrations] Done");
  } catch (e) {
    console.error("[Migrations] Failed (server will still start):", e);
  }
}

async function startServer() {
  await runMigrations();
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
