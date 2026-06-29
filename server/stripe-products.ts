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
  grantUsd: number; // prepaid credit they receive
  description: string;
}

export const creditPackages: CreditPackage[] = [
  { id: "starter", name: "Starter", priceUsd: 10, grantUsd: 10, description: "Try it out — no bonus" },
  { id: "growth", name: "Growth", priceUsd: 50, grantUsd: 52.5, description: "+5% bonus credit" },
  { id: "professional", name: "Professional", priceUsd: 200, grantUsd: 216, description: "+8% bonus credit" },
  { id: "enterprise", name: "Enterprise", priceUsd: 1000, grantUsd: 1120, description: "+12% bonus credit" },
];

export function getCreditPackage(id: string): CreditPackage | undefined {
  return creditPackages.find((p) => p.id === id);
}

/** Effective net margin for a tier given a markup in basis points. */
export function tierNetMarginPct(pkg: CreditPackage, markupBps = 13000): number {
  const realized = (markupBps / 10000) * (pkg.priceUsd / pkg.grantUsd) - 1;
  return realized * 100;
}
