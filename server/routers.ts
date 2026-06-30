import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { creditPackages, getCreditPackage } from "./stripe-products";
import { aiGatewayRouter } from "./ai-gateway-routers";
import { picoToUsdString } from "./billing/billing";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { hashPassword, verifyPassword, createPasswordUser } from "./auth-local";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const num = (s: unknown) => Number(s ?? 0);
const requireAdmin = (ctx: any) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
};

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      return { ...u, balancePico: (u.balancePico ?? 0n).toString() };
    }),

    // Email/password sign-up. Issues the same signed session cookie the app
    // already verifies locally — no Manus / OAuth server involved.
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8, "Password must be at least 8 characters"),
          name: z.string().max(120).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        const openId = `local:${email}`;
        const existing = await db.getUserByOpenId(openId);
        if (existing)
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });

        const name = input.name?.trim() || email.split("@")[0];
        await createPasswordUser({ openId, email, name, passwordHash: hashPassword(input.password) });

        const token = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        const openId = `local:${email}`;
        const user = await db.getUserByOpenId(openId);
        if (!user || !verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const name = user.name || email.split("@")[0];
        const token = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const pico = user?.balancePico ?? 0n;
      const usd = picoToUsdString(pico);
      return { balance: usd, balanceUsd: usd, balancePico: pico.toString() };
    }),

    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
      const logs = await db.getUsageLogsByUserId(ctx.user.id, 1000);
      const byMap: Record<string, number> = {};
      logs.forEach((l) => {
        byMap[l.service] = (byMap[l.service] || 0) + num(l.chargedUsd);
      });
      const totalCharged = logs.reduce((s, l) => s + num(l.chargedUsd), 0);
      return {
        totalUsed: totalCharged.toFixed(6),
        totalChargedUsd: totalCharged.toFixed(6),
        byService: Object.entries(byMap).map(([provider, amount]) => ({
          provider,
          amount: amount.toFixed(6),
          amountUsd: amount.toFixed(6),
        })),
      };
    }),
  }),

  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getApiKeysByUserId(ctx.user.id)),

    generate: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ ctx, input }) => {
        const created = await db.createApiKey(ctx.user.id, input.name);
        return {
          key: created.rawKey,
          keyPrefix: created.keyPrefix,
          last4: created.last4,
          name: created.name,
          warning: "Copy this key now — it will not be shown again.",
        };
      }),

    revoke: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.revokeApiKey(ctx.user.id, input.keyId);
        return { success: true };
      }),
  }),

  gateway: aiGatewayRouter,

  payments: router({
    getPackages: publicProcedure.query(() =>
      creditPackages.map((p) => {
        const bonusPct = +(((p.grantUsd - p.priceUsd) / p.priceUsd) * 100).toFixed(1);
        const pricePerToken = p.priceUsd / p.tokens;
        return {
          id: p.id,
          name: p.name,
          priceUsd: p.priceUsd,
          grantUsd: p.grantUsd,
          bonusPct,
          description: p.description,
          price: p.priceUsd,
          tokens: p.tokens,
          pricePerToken: `$${pricePerToken.toFixed(3)}`,
        };
      }),
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
          cancel_url: `${ctx.req.headers.origin}/buy-tokens?payment=cancelled`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
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
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const us = await db.getAllUsers(10000);
      return us.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        tokenBalance: picoToUsdString(u.balancePico),
      }));
    }),

    getRevenueStats: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const txs = await db.getAllTransactions(100000);
      const purchases = txs.filter((t) => t.type === "purchase");
      const totalRevenue = purchases.reduce((s, t) => s + num(t.amountUsd), 0);
      const totalTransactions = purchases.length;
      const averageTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;
      const largestTransaction = purchases.length
        ? Math.max(...purchases.map((t) => num(t.amountUsd)))
        : 0;
      const counts: Record<string, number> = {};
      purchases.forEach((t) => {
        try {
          const m = typeof t.metadata === "string" ? JSON.parse(t.metadata) : (t.metadata as any);
          const pid = m?.packageId;
          if (pid) counts[pid] = (counts[pid] || 0) + 1;
        } catch {
          /* ignore */
        }
      });
      const topPackages = Object.entries(counts)
        .map(([id, count]) => ({ packageName: getCreditPackage(id)?.name || id, count }))
        .sort((a, b) => b.count - a.count);
      return { totalRevenue, totalTransactions, averageTransaction, largestTransaction, topPackages };
    }),

    getPlatformStats: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const us = await db.getAllUsers(10000);
      const txs = await db.getAllTransactions(100000);
      const usageTx = txs.filter((t) => t.type === "usage");
      const month = 30 * 24 * 60 * 60 * 1000;
      return {
        totalUsers: us.length,
        activeUsers: us.filter(
          (u) => u.lastSignedIn && new Date(u.lastSignedIn).getTime() > Date.now() - month,
        ).length,
        totalTokensSold: txs.filter((t) => t.type === "purchase").reduce((s, t) => s + num(t.amountUsd), 0),
        totalTokensUsed: usageTx.reduce((s, t) => s + num(t.amountUsd), 0),
        averageUserBalance: us.length
          ? us.reduce((s, u) => s + num(picoToUsdString(u.balancePico)), 0) / us.length
          : 0,
        totalAPIcalls: usageTx.length,
      };
    }),

    getRevenueMetrics: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const txs = await db.getAllTransactions(100000);
      const usage = txs.filter((t) => t.type === "usage");
      const charged = usage.reduce((s, t) => s + num(t.amountUsd), 0);
      const cost = usage.reduce((s, t) => s + num(t.costUsd), 0);
      return {
        creditConsumedUsd: charged.toFixed(6),
        providerCostUsd: cost.toFixed(6),
        grossProfitUsd: (charged - cost).toFixed(6),
        grossMarginPct: charged > 0 ? +(((charged - cost) / charged) * 100).toFixed(1) : 0,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
