/**
 * Stripe Products Configuration
 * Defines token packages available for purchase
 */

export const tokenPackages = [
  {
    id: "package_1000",
    name: "Starter Pack",
    tokens: 1000,
    price: 10, // USD
    description: "Perfect for getting started with AI APIs",
  },
  {
    id: "package_5000",
    name: "Growth Pack",
    tokens: 5000,
    price: 45, // USD - 10% discount
    description: "For active development and testing",
  },
  {
    id: "package_10000",
    name: "Professional Pack",
    tokens: 10000,
    price: 80, // USD - 20% discount
    description: "For production applications",
  },
  {
    id: "package_50000",
    name: "Enterprise Pack",
    tokens: 50000,
    price: 350, // USD - 30% discount
    description: "For large-scale deployments",
  },
];

export function getTokenPackage(packageId: string) {
  return tokenPackages.find(p => p.id === packageId);
}

export function getTokensForPrice(priceInCents: number): number {
  // Convert price in cents to price in dollars
  const priceInDollars = priceInCents / 100;
  
  // Find the package that matches this price
  const pkg = tokenPackages.find(p => p.price === priceInDollars);
  return pkg?.tokens || 0;
}
