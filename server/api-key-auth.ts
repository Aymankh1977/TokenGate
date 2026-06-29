import { Request, Response, NextFunction } from "express";
import * as db from "./db";

/**
 * Authenticates programmatic gateway requests using a developer API key.
 * The old build generated keys but NOTHING ever validated an incoming one, so
 * the "API key" feature granted no access and the HTTP gateway read req.userId
 * that was never set. This middleware closes that gap.
 *
 * Mount on the HTTP gateway route only:
 *   app.post("/api/gateway", apiKeyAuth, handleAIGatewayRequest)
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const m = header.match(/^Bearer\s+(tg_[A-Za-z0-9_-]+)$/);
  if (!m) {
    return res.status(401).json({ error: "Missing or malformed API key" });
  }
  const rawKey = m[1];

  let record;
  try {
    record = await db.getApiKeyByHash(db.hashApiKey(rawKey));
  } catch (e) {
    console.error("[apiKeyAuth] lookup failed:", e);
    return res.status(500).json({ error: "Auth lookup failed" });
  }

  if (!record) {
    return res.status(401).json({ error: "Invalid or revoked API key" });
  }

  (req as any).userId = record.userId;
  (req as any).apiKeyId = record.id;
  // Fire-and-forget; don't block the request on a timestamp write.
  db.touchApiKey(record.id).catch(() => {});
  next();
}
