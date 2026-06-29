// scripts/verify-billing.mjs
// Run: node scripts/verify-billing.mjs
// Mirrors server/billing/billing.ts and proves the accounting is consistent
// and profitable. No DB, no deps.

const PICO_PER_USD = 1_000_000_000_000n;
const usdToPico = (usd) => BigInt(Math.round(usd * 1e6)) * 1_000_000n;
const picoToUsd = (p) => Number(p) / 1e12;
const ceilDiv = (a, b) => (a <= 0n ? 0n : (a + b - 1n) / b);
const providerCostPico = (inT, outT, inP, outP) =>
  BigInt(inT) * inP + BigInt(outT) * outP;
const retailPico = (inT, outT, inP, outP, bps) =>
  ceilDiv(providerCostPico(inT, outT, inP, outP) * bps, 10000n);

// Real provider prices (USD/token) -> integer pico/token (from current API price lists)
const price = (usdPerTok) => BigInt(Math.round(usdPerTok * 1e12));
const MODELS = {
  "gpt-4o":        { in: price(2.5e-6),  out: price(10e-6) },   // $2.50 / $10 per 1M
  "gpt-4o-mini":   { in: price(0.15e-6), out: price(0.60e-6) }, // $0.15 / $0.60 per 1M
  "claude-sonnet": { in: price(3e-6),    out: price(15e-6) },   // $3 / $15 per 1M
};

const MARKUP_BPS = 13000n; // +30%

function simulate(model, paidUsd, inTok, outTok) {
  const p = MODELS[model];
  let balance = usdToPico(paidUsd); // purchase: USD paid -> pUSD credit (no bonus here)
  const granted = balance;
  let calls = 0;
  let providerCostTotal = 0n;
  let chargedTotal = 0n;

  while (true) {
    const charge = retailPico(inTok, outTok, p.in, p.out, MARKUP_BPS);
    if (balance < charge) break;           // atomic reserve would fail here
    balance -= charge;                     // settle (actual == estimate in this sim)
    chargedTotal += charge;
    providerCostTotal += providerCostPico(inTok, outTok, p.in, p.out);
    calls++;
    if (calls > 5_000_000) break;
  }

  const revenue = picoToUsd(chargedTotal);     // value the user consumed (== paid, minus dust)
  const cost = picoToUsd(providerCostTotal);   // what we paid the provider
  const grossProfit = picoToUsd(granted) - cost; // we collected `granted` USD up front
  const marginPct = (grossProfit / picoToUsd(granted)) * 100;

  return {
    model,
    paidUsd,
    calls,
    perCallCharge: picoToUsd(retailPico(inTok, outTok, p.in, p.out, MARKUP_BPS)),
    perCallCost: picoToUsd(providerCostPico(inTok, outTok, p.in, p.out)),
    providerCostTotal: cost,
    grossProfit,
    marginPct,
  };
}

console.log("=== TokenOasis billing verification (markup +30%) ===\n");
const scenarios = [
  ["gpt-4o-mini", 10, 800, 400],
  ["gpt-4o", 50, 1200, 600],
  ["claude-sonnet", 100, 2000, 1000],
];
const rows = scenarios.map(([m, paid, i, o]) => simulate(m, paid, i, o));
for (const r of rows) {
  console.log(`${r.model}  (paid $${r.paidUsd}, ${r.calls.toLocaleString()} calls)`);
  console.log(`  per call: charged $${r.perCallCharge.toFixed(8)}  cost $${r.perCallCost.toFixed(8)}`);
  console.log(`  provider cost total: $${r.providerCostTotal.toFixed(4)}`);
  console.log(`  gross profit:        $${r.grossProfit.toFixed(4)}  (${r.marginPct.toFixed(1)}% of revenue)\n`);
}

// Sanity assertions
let ok = true;
for (const r of rows) {
  if (r.grossProfit <= 0) { ok = false; console.log(`FAIL: ${r.model} not profitable`); }
  const expected = (3000 / 13000) * 100; // markup/(1+markup)
  if (Math.abs(r.marginPct - expected) > 0.5) {
    ok = false; console.log(`FAIL: ${r.model} margin ${r.marginPct} != ~${expected.toFixed(1)}`);
  }
}
console.log(ok
  ? "PASS: every model is profitable and margin == markup/(1+markup) ≈ 23.1% of revenue.\nUnits are consistent: purchase and consumption are both pico-USD."
  : "ASSERTIONS FAILED");
