/**
 * Credit packages. A package is "pay priceUsd, receive grantUsd of prepaid
 * USD credit". The bonus (grantUsd - priceUsd) is the only discount; keep it
 * BELOW the usage markup or larger tiers go upside-down.
 *
 * With MARKUP_BPS=13000 (+30%), realized margin per tier ≈ (1.30 * priceUsd /
 * grantUsd) - 1. The bonuses below all stay net-positive — see the spreadsheet.
 */
export interface CreditPackage {
  id: string;
  name: string;
  priceUsd: number; // what the customer pays
  grantUsd: number; // prepaid credit they receive (1 token = $0.01)
  tokens: number; // marketing token count = grantUsd / 0.01
  description: string;
}

// 1 token = $0.01 of prepaid credit. Larger tiers cost less per token.
export const creditPackages: CreditPackage[] = [
  { id: "starter", name: "Starter", priceUsd: 100, grantUsd: 100, tokens: 10_000, description: "$0.01 per token" },
  { id: "growth", name: "Growth", priceUsd: 180, grantUsd: 200, tokens: 20_000, description: "$0.009 per token — 10% off" },
  { id: "professional", name: "Professional", priceUsd: 400, grantUsd: 500, tokens: 50_000, description: "$0.008 per token — 20% off" },
  { id: "enterprise", name: "Enterprise", priceUsd: 700, grantUsd: 1000, tokens: 100_000, description: "$0.007 per token — 30% off" },
];

export function getCreditPackage(id: string): CreditPackage | undefined {
  return creditPackages.find((p) => p.id === id);
}

/** Effective net margin for a tier given a markup in basis points. */
export function tierNetMarginPct(pkg: CreditPackage, markupBps = 13000): number {
  const realized = (markupBps / 10000) * (pkg.priceUsd / pkg.grantUsd) - 1;
  return realized * 100;
}
