import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { creditPackages, getCreditPackage } from "./stripe-products";
import { aiGatewayRouter } from "./ai-gateway-routers";
import { picoToUsdString } from "./billing/billing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      // balancePico is a BigInt; the client runs JSON.stringify on this object,
      // which throws on BigInt. Return it as a string.
      return { ...u, balancePico: (u.balancePico ?? 0n).toString() };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const { getSessionCookieOptions } = require("./_core/cookies");
      const { COOKIE_NAME } = require("../shared/const");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const pico = user?.balancePico ?? 0n;
      return { balanceUsd: picoToUsdString(pico), balancePico: pico.toString() };
    }),

    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
      const logs = await db.getUsageLogsByUserId(ctx.user.id, 1000);
      const num = (s: string) => Number(s);
      const byService: Record<string, number> = {};
      logs.forEach((l) => {
        byService[l.service] = (byService[l.service] || 0) + num(l.chargedUsd);
      });
      return {
        totalChargedUsd: logs.reduce((s, l) => s + num(l.chargedUsd), 0).toFixed(6),
        byService: Object.entries(byService).map(([provider, amount]) => ({
          provider,
          amountUsd: amount.toFixed(6),
        })),
      };
    }),
  }),

  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getApiKeysByUserId(ctx.user.id)),

    // Returns the plaintext key ONCE. It is hashed at rest and can't be retrieved again.
    generate: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ ctx, input }) => {
        const created = await db.createApiKey(ctx.user.id, input.name);
        return {
          key: created.rawKey, // show once
          keyPrefix: created.keyPrefix,
          last4: created.last4,
          name: created.name,
          warning: "Copy this key now — it will not be shown again.",
        };
      }),

    revoke: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.revokeApiKey(ctx.user.id, input.keyId); // owner-scoped
        return { success: true };
      }),
  }),

  gateway: aiGatewayRouter,

  payments: router({
    getPackages: publicProcedure.query(() =>
      creditPackages.map((p) => ({
        id: p.id,
        name: p.name,
        priceUsd: p.priceUsd,
        grantUsd: p.grantUsd,
        bonusPct: +(((p.grantUsd - p.priceUsd) / p.priceUsd) * 100).toFixed(1),
        description: p.description,
      })),
    ),

    createCheckoutSession: protectedProcedure
      .input(z.object({ packageId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const pkg = getCreditPackage(input.packageId);
        if (!pkg) throw new TRPCError({ code: "NOT_FOUND", message: "Package not found" });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: pkg.name,
                  description: `$${pkg.grantUsd.toFixed(2)} of prepaid AI credit`,
                },
                unit_amount: Math.round(pkg.priceUsd * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${ctx.req.headers.origin}/dashboard?payment=success`,
          cancel_url: `${ctx.req.headers.origin}/buy-credits?payment=cancelled`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          // The webhook reads grant_usd to know how much credit to add.
          metadata: {
            user_id: ctx.user.id.toString(),
            package_id: pkg.id,
            amount_usd: pkg.priceUsd.toString(),
            grant_usd: pkg.grantUsd.toString(),
          },
        });
        return { checkoutUrl: session.url };
      }),
  }),

  admin: router({
    getRevenueMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });

      const txs = await db.getAllTransactions(100000);
      const num = (s: string) => Number(s);
      const purchases = txs.filter((t) => t.type === "purchase");
      const usage = txs.filter((t) => t.type === "usage");

      const revenue = purchases.reduce((s, t) => s + num(t.amountUsd), 0); // cash collected
      const charged = usage.reduce((s, t) => s + num(t.amountUsd), 0); // credit consumed
      const providerCost = usage.reduce((s, t) => s + num(t.costUsd || "0"), 0); // real cost
      const grossProfit = charged - providerCost;

      const users = await db.getAllUsers(100000);
      return {
        cashCollectedUsd: revenue.toFixed(2),
        creditConsumedUsd: charged.toFixed(6),
        providerCostUsd: providerCost.toFixed(6),
        grossProfitUsd: grossProfit.toFixed(6),
        grossMarginPct: charged > 0 ? +((grossProfit / charged) * 100).toFixed(1) : 0,
        totalUsers: users.length,
        totalTransactions: txs.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
