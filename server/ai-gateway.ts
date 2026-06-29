import { Request, Response } from "express";
import * as db from "./db";
import {
  callProvider,
  isSupportedProvider,
  Provider,
} from "./providers";
import {
  providerCostPico,
  retailPico,
  reservePico,
  estimateInputTokens,
  markupBpsFromEnv,
  picoToUsdString,
} from "./billing/billing";

export interface GatewayCallParams {
  userId: number;
  apiKeyId?: number;
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface GatewayCallResult {
  response: unknown;
  usage: { inputTokens: number; outputTokens: number };
  chargedUsd: string;
  costUsd: string;
}

/**
 * Core billing-correct gateway call, shared by the HTTP handler and the tRPC
 * router. Flow:
 *   1. look up integer pico/token pricing for the model
 *   2. estimate cost and ATOMICALLY reserve it (fails fast if insufficient)
 *   3. call the provider via its correct adapter
 *   4. settle to ACTUAL usage; refund the unused reservation
 * No overspend, no double-spend, real markup applied.
 */
export async function executeGatewayCall(
  p: GatewayCallParams,
): Promise<GatewayCallResult> {
  if (!isSupportedProvider(p.provider)) {
    throw new GatewayError(400, `Provider ${p.provider} not supported`);
  }
  const provider = p.provider as Provider;

  const pricing = await db.getModelPricing(p.model);
  if (!pricing) {
    throw new GatewayError(400, `Model ${p.model} not supported (is modelPricing seeded?)`);
  }
  const inPico = pricing.inputPicoPerToken;
  const outPico = pricing.outputPicoPerToken;
  const markup = markupBpsFromEnv();

  const estIn = estimateInputTokens(p.messages);
  const estOut = p.maxTokens ?? 1024;
  const reserve = reservePico(estIn, estOut, inPico, outPico, markup);

  const held = await db.reserveCredits(p.userId, reserve);
  if (!held) {
    await db.recordUsage({
      userId: p.userId,
      apiKeyId: p.apiKeyId,
      model: p.model,
      service: provider,
      chargedPico: 0n,
      costPico: 0n,
      status: "insufficient_balance",
      metadata: { reserveUsd: picoToUsdString(reserve) },
    });
    throw new GatewayError(402, "Insufficient balance", {
      requiredUsd: picoToUsdString(reserve),
    });
  }

  let result;
  try {
    result = await callProvider(provider, {
      model: p.model,
      messages: p.messages,
      maxTokens: p.maxTokens,
      temperature: p.temperature,
    });
  } catch (err: any) {
    // Provider failed — refund the entire hold so the user isn't charged.
    await db.refundCredits(p.userId, reserve);
    await db.recordUsage({
      userId: p.userId,
      apiKeyId: p.apiKeyId,
      model: p.model,
      service: provider,
      chargedPico: 0n,
      costPico: 0n,
      status: "failed",
      metadata: { error: String(err?.message ?? err) },
    });
    throw new GatewayError(502, `Provider call failed: ${err?.message ?? err}`);
  }

  const { inputTokens, outputTokens } = result.usage;
  const cost = providerCostPico(inputTokens, outputTokens, inPico, outPico);
  let charged = retailPico(inputTokens, outputTokens, inPico, outPico, markup);

  // Settle: refund the difference between the hold and the real charge.
  if (charged <= reserve) {
    await db.refundCredits(p.userId, reserve - charged);
  } else {
    // Real usage exceeded the padded estimate (rare). Try to take the extra;
    // if the user can't cover it, cap the charge at what we already held.
    const extra = charged - reserve;
    const tookExtra = await db.reserveCredits(p.userId, extra);
    if (!tookExtra) charged = reserve;
  }

  await db.recordUsage({
    userId: p.userId,
    apiKeyId: p.apiKeyId,
    model: p.model,
    service: provider,
    chargedPico: charged,
    costPico: cost,
    requestTokens: inputTokens,
    responseTokens: outputTokens,
    status: "success",
    metadata: { markupBps: Number(markup) },
  });

  return {
    response: result.raw,
    usage: { inputTokens, outputTokens },
    chargedUsd: picoToUsdString(charged),
    costUsd: picoToUsdString(cost),
  };
}

export class GatewayError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

/**
 * HTTP entry point for programmatic API-key access.
 * Mount with the API-key middleware which sets req.userId / req.apiKeyId:
 *   app.post("/api/gateway", apiKeyAuth, handleAIGatewayRequest)
 */
export async function handleAIGatewayRequest(req: Request, res: Response) {
  const userId = (req as any).userId as number | undefined;
  const apiKeyId = (req as any).apiKeyId as number | undefined;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const { provider, model, messages, maxTokens, temperature } = req.body ?? {};
  if (!provider || !model || !Array.isArray(messages)) {
    return res.status(400).json({ error: "provider, model and messages[] are required" });
  }

  try {
    const out = await executeGatewayCall({
      userId,
      apiKeyId,
      provider,
      model,
      messages,
      maxTokens,
      temperature,
    });
    return res.json(out);
  } catch (e) {
    if (e instanceof GatewayError) {
      return res.status(e.status).json({ error: e.message, ...(e.extra ?? {}) });
    }
    console.error("[AI Gateway] Unexpected error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
