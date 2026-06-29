# TokenOasis — money-path fixes

Drop-in replacements for the broken billing/auth/payment path. Files mirror the
repo layout; copy them over the originals (back up first), run the migration and
seed, then wire the two routes noted below.

## What was broken → what these files do

1. **Unit mismatch that lost ~100x** (purchases credited a "token count" while
   usage deducted raw USD). → One unit everywhere: integer **pico-USD** in
   `server/billing/billing.ts`; balance column is now `balancePico BIGINT`.
2. **No margin at all.** → Configurable markup (`MARKUP_BPS`, default +30%).
   Proven profitable by `scripts/verify-billing.mjs`.
3. **Insecure/broken API keys** (Math.random, never hashed, args in wrong order,
   never validated). → `crypto.randomBytes` keys, **HMAC-SHA256 hashed at rest**,
   shown once, validated by `server/api-key-auth.ts` middleware.
4. **Race condition / double-spend** (read-then-write balance). → Atomic
   guarded decrement (`reserveCredits`) + reserve→settle→refund flow.
5. **Webhook double-credited and was never mounted** (Stripe retries, global
   json broke signature). → Idempotent `creditPurchaseIfNew` keyed on event id,
   raw-body mount, test backdoor removed.
6. **Multi-provider was OpenAI-only** (wrong auth header + usage fields → others
   metered 0 = free). → Per-provider adapters in `server/providers/index.ts`.
7. **Gateway couldn't run** (modelPricing never seeded). → `seedModelPricing.ts`.
8. **Float money math.** → BigInt integers throughout.

## Apply

```bash
# 1) copy files over the originals (server/*, drizzle/schema.ts, scripts/*)
# 2) migrate
pnpm drizzle-kit generate   # or apply drizzle/0002_credits_fix.sql directly
pnpm drizzle-kit migrate
# 3) seed real provider prices
pnpm tsx server/billing/seedModelPricing.ts
# 4) prove the accounting (no DB needed)
node scripts/verify-billing.mjs
```

## Wire two routes (in server/_core/index.ts)

The Stripe webhook needs the RAW body, so mount it **before** `express.json()`:

```ts
import { handleStripeWebhook } from "../stripe-webhook";
import { handleAIGatewayRequest } from "../ai-gateway";
import { apiKeyAuth } from "../api-key-auth";

app.post("/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook);

app.use(express.json({ limit: "50mb" }));   // existing line stays AFTER the webhook

app.post("/api/gateway", apiKeyAuth, handleAIGatewayRequest);
```

## Env vars

```
DATABASE_URL=mysql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
COHERE_API_KEY=...
API_KEY_PEPPER=<long random string>   # HMAC pepper for API-key hashing
MARKUP_BPS=13000                       # 10000=cost, 13000=+30% (profit lever)
```

## Notes / still to do
- Client pages still say "tokens"; rename to USD credit and read `balanceUsd`.
- Verify the **Cohere v2** usage field names against current docs.
- **Before launch:** confirm reselling each provider's API is allowed under
  their terms, or switch to a bring-your-own-key model. This is a legal gate,
  not a code fix.
