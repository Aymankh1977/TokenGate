import { getDb } from "../db";
import { modelPricing } from "../../drizzle/schema";

/**
 * Provider list prices as USD per 1M tokens (verify against live pricing pages
 * before launch — providers change these often). We convert to integer
 * pico-USD per token: picoPerToken = round(usdPerMillion / 1e6 * 1e12)
 *                                  = round(usdPerMillion * 1e6).
 */
const picoPerToken = (usdPerMillion: number): bigint =>
  BigInt(Math.round(usdPerMillion * 1_000_000));

type Seed = { model: string; service: string; inM: number; outM: number };

export const MODEL_SEED: Seed[] = [
  // OpenAI
  { model: "gpt-4o", service: "openai", inM: 2.5, outM: 10 },
  { model: "gpt-4o-mini", service: "openai", inM: 0.15, outM: 0.6 },
  { model: "gpt-4.1", service: "openai", inM: 2.0, outM: 8.0 },
  // Anthropic
  { model: "claude-3-5-sonnet", service: "anthropic", inM: 3, outM: 15 },
  { model: "claude-3-opus", service: "anthropic", inM: 15, outM: 75 },
  { model: "claude-3-haiku", service: "anthropic", inM: 0.8, outM: 4 },
  // Cohere
  { model: "command-r", service: "cohere", inM: 0.5, outM: 1.5 },
];

export async function seedModelPricing() {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  for (const s of MODEL_SEED) {
    await db
      .insert(modelPricing)
      .values({
        model: s.model,
        service: s.service,
        inputPicoPerToken: picoPerToken(s.inM),
        outputPicoPerToken: picoPerToken(s.outM),
        isActive: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          service: s.service,
          inputPicoPerToken: picoPerToken(s.inM),
          outputPicoPerToken: picoPerToken(s.outM),
          isActive: true,
        },
      });
  }
  console.log(`[seed] modelPricing seeded: ${MODEL_SEED.length} models`);
}

// Allow: `tsx server/billing/seedModelPricing.ts`
if (require.main === module) {
  seedModelPricing().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
