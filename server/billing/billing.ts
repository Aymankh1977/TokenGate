/**
 * billing.ts — single source of truth for money math.
 *
 * THE ONE RULE: every monetary value in the system is an integer number of
 * pico-USD (pUSD), held in a BigInt. 1 USD = 1_000_000_000_000 pUSD (1e12).
 *
 * Why pico-USD + BigInt:
 *  - No floating point. parseFloat on money is how the old code silently lost
 *    and mismatched value. Integers can't drift.
 *  - Pico resolution is fine-grained enough for per-token prices (e.g. GPT-4o
 *    mini input is 1.5e-7 USD/token = 150_000 pUSD/token, an exact integer).
 *  - A BigInt balance maxes out around $9.2M per user — irrelevant for prepaid
 *    credits, where balances are small.
 *
 * Units recap (this is the bug that made the old build lose ~100x):
 *  - The user's prepaid balance is in pUSD.
 *  - A purchase converts USD paid -> pUSD granted (same currency, 1:1 + bonus).
 *  - A call's *provider cost* is computed in pUSD from per-token prices.
 *  - The user is charged provider cost x markup (also pUSD).
 * Purchase and consumption are now in the SAME unit. There is no 100x gap.
 */

export const PICO_PER_USD = 1_000_000_000_000n; // 1e12

/** Convert a USD amount (number) to integer pUSD. Safe for amounts < ~$9e6. */
export function usdToPico(usd: number): bigint {
  // Round at micro-USD first (exact for these magnitudes), then scale to pico.
  // Avoids float error from usd * 1e12 on larger values.
  return BigInt(Math.round(usd * 1_000_000)) * 1_000_000n;
}

/** Format pUSD as a USD string with `decimals` places (display only). */
export function picoToUsdString(pico: bigint, decimals = 6): string {
  const neg = pico < 0n;
  const abs = neg ? -pico : pico;
  const whole = abs / PICO_PER_USD;
  const frac = abs % PICO_PER_USD; // 0 .. 1e12-1
  const fracStr = frac.toString().padStart(12, "0").slice(0, decimals);
  return `${neg ? "-" : ""}${whole.toString()}.${fracStr}`;
}

/** Ceiling division for positive BigInts. Always round charges UP, never down. */
function ceilDiv(a: bigint, b: bigint): bigint {
  if (a <= 0n) return 0n;
  return (a + b - 1n) / b;
}

/**
 * Provider cost (pUSD) for a single call.
 * inputPicoPerToken / outputPicoPerToken come from the modelPricing table and
 * are integer pUSD-per-token (see seedModelPricing.ts).
 */
export function providerCostPico(
  inputTokens: number | bigint,
  outputTokens: number | bigint,
  inputPicoPerToken: bigint,
  outputPicoPerToken: bigint,
): bigint {
  const inT = BigInt(inputTokens);
  const outT = BigInt(outputTokens);
  const cost = inT * inputPicoPerToken + outT * outputPicoPerToken;
  return cost < 0n ? 0n : cost;
}

/**
 * Apply the platform markup. markupBps is the multiplier in basis points where
 * 10000 = 1.00 (no markup). e.g. 13000 = 1.30 = +30% margin on top of cost.
 * This is THE profit lever. The old code had no markup at all.
 */
export function applyMarkupPico(providerCost: bigint, markupBps: bigint): bigint {
  return ceilDiv(providerCost * markupBps, 10000n);
}

/** Retail price charged to the user for a call (pUSD). */
export function retailPico(
  inputTokens: number | bigint,
  outputTokens: number | bigint,
  inputPicoPerToken: bigint,
  outputPicoPerToken: bigint,
  markupBps: bigint,
): bigint {
  return applyMarkupPico(
    providerCostPico(inputTokens, outputTokens, inputPicoPerToken, outputPicoPerToken),
    markupBps,
  );
}

/**
 * Amount to RESERVE before calling the provider. We don't know real usage yet,
 * so we estimate and pad by `safetyBps` (10000 = no pad). The reserve is an
 * atomic hold against the balance; after the call we settle to the real cost
 * and refund the difference. This is what prevents overspend / double-spend.
 */
export function reservePico(
  estInputTokens: number,
  estOutputTokens: number,
  inputPicoPerToken: bigint,
  outputPicoPerToken: bigint,
  markupBps: bigint,
  safetyBps: bigint = 13000n, // pad estimate by 30%
): bigint {
  const base = retailPico(
    estInputTokens,
    estOutputTokens,
    inputPicoPerToken,
    outputPicoPerToken,
    markupBps,
  );
  return ceilDiv(base * safetyBps, 10000n);
}

/** Cheap input-token estimate when no tokenizer is available (~4 chars/token). */
export function estimateInputTokens(
  messages: Array<{ content: string }> | undefined,
): number {
  if (!messages || messages.length === 0) return 64;
  const chars = messages.reduce((s, m) => s + (m.content?.length ?? 0), 0);
  return Math.max(16, Math.ceil(chars / 4));
}

/** Read markup from env once, with a safe default of +30%. */
export function markupBpsFromEnv(): bigint {
  const raw = process.env.MARKUP_BPS;
  const n = raw ? Number(raw) : 13000;
  if (!Number.isFinite(n) || n < 10000) return 13000n; // never sell below cost
  return BigInt(Math.round(n));
}
