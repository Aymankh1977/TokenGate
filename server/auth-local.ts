import crypto from "crypto";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { ENV } from "./_core/env";

/**
 * Password hashing with Node's built-in scrypt — no external dependency.
 * Stored format: "<saltHex>:<hashHex>".
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/** Create a local (email/password) user. Becomes admin if openId === OWNER_OPEN_ID. */
export async function createPasswordUser(args: {
  openId: string;
  email: string;
  name: string;
  passwordHash: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(users).values({
    openId: args.openId,
    email: args.email,
    name: args.name,
    loginMethod: "password",
    passwordHash: args.passwordHash,
    role: args.openId === ENV.ownerOpenId ? "admin" : "user",
    lastSignedIn: new Date(),
  });
}
