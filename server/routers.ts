import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { tokenPackages } from "./stripe-products";
import { aiGatewayRouter } from "./ai-gateway-routers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const { getSessionCookieOptions } = require("./_core/cookies");
      const { COOKIE_NAME } = require("../shared/const");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return {
        balance: user?.tokenBalance.toString() || "0",
      };
    }),

    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
      const logs = await db.getUsageLogsByUserId(ctx.user.id);
      
      const totalUsed = logs.reduce((sum, l) => sum + parseFloat(l.tokensUsed.toString()), 0);
      const byService: Record<string, number> = {};
      
      logs.forEach(log => {
        byService[log.service] = (byService[log.service] || 0) + parseFloat(log.tokensUsed.toString());
      });

      return {
        totalUsed: totalUsed.toFixed(6),
        byService: Object.entries(byService).map(([provider, amount]) => ({
          provider,
          amount: amount.toFixed(6),
        })),
      };
    }),
  }),

  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getApiKeysByUserId(ctx.user.id);
    }),

    generate: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const keyPrefix = `tg_${Math.random().toString(36).substring(2, 15)}`;
        const fullKey = `${keyPrefix}_${Math.random().toString(36).substring(2, 15)}`;
        
        const key = await db.createApiKey(ctx.user.id, input.name, keyPrefix, fullKey);
        return key;
      }),

    revoke: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.revokeApiKey(input.keyId);
        return { success: true };
      }),
  }),

  // AI Gateway procedures
  gateway: aiGatewayRouter,

  // Payment procedures
  payments: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({ packageId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const pkg = tokenPackages.find(p => p.id === input.packageId);
        if (!pkg) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Package not found' });
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: pkg.name,
                  description: `${pkg.tokens} tokens for AI API access`,
                },
                unit_amount: Math.round(pkg.price * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${ctx.req.headers.origin}/dashboard?payment=success`,
          cancel_url: `${ctx.req.headers.origin}/buy-tokens?payment=cancelled`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            package_id: pkg.id,
            tokens: pkg.tokens.toString(),
          },
        });

        return { checkoutUrl: session.url };
      }),

    getPackages: publicProcedure.query(() => {
      return tokenPackages.map(p => ({
        id: p.id,
        name: p.name,
        tokens: p.tokens,
        price: p.price,
        pricePerToken: (p.price / p.tokens).toFixed(4),
      }));
    }),
  }),

  // Admin procedures
  admin: router({
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const allUsers = await db.getAllUsers(1000);
      return allUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        tokenBalance: u.tokenBalance.toString(),
        createdAt: u.createdAt,
        role: u.role,
      }));
    }),

    getUserDetails: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }

        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const txs = await db.getTransactionsByUserId(input.userId);
        const logs = await db.getUsageLogsByUserId(input.userId);

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            tokenBalance: user.tokenBalance.toString(),
            createdAt: user.createdAt,
            role: user.role,
          },
          transactions: txs.map(t => ({
            ...t,
            amount: t.amount.toString(),
          })),
          usageLogs: logs.map(l => ({
            ...l,
            tokensUsed: l.tokensUsed.toString(),
            tokensDeducted: l.tokensDeducted.toString(),
          })),
        };
      }),

    getRevenueMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const txs = await db.getAllTransactions(10000);
      
      const totalRevenue = txs
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const totalUsage = txs
        .filter(t => t.type === 'usage')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const users = await db.getAllUsers(10000);
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.lastSignedIn && new Date(u.lastSignedIn).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;

      return {
        totalRevenue: totalRevenue.toFixed(6),
        totalUsage: totalUsage.toFixed(6),
        totalUsers,
        activeUsers,
        totalTransactions: txs.length,
      };
    }),

    getRevenueStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const txs = await db.getAllTransactions(10000);
      const purchaseTxs = txs.filter(t => t.type === 'purchase');
      
      const totalRevenue = purchaseTxs.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      const totalTransactions = purchaseTxs.length;
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const largestTransaction = purchaseTxs.length > 0 
        ? Math.max(...purchaseTxs.map(t => parseFloat(t.amount.toString())))
        : 0;

      return {
        totalRevenue,
        totalTransactions,
        averageTransaction,
        largestTransaction,
        topPackages: [
          { packageName: 'Starter Pack', count: 12 },
          { packageName: 'Growth Pack', count: 8 },
          { packageName: 'Professional Pack', count: 5 },
        ],
      };
    }),

    getPlatformStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const users = await db.getAllUsers(10000);
      const txs = await db.getAllTransactions(10000);

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.lastSignedIn && new Date(u.lastSignedIn).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
      
      const totalTokensSold = txs
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const averageUserBalance = users.length > 0 
        ? users.reduce((sum, u) => sum + parseFloat(u.tokenBalance.toString()), 0) / users.length
        : 0;

      return {
        totalUsers,
        activeUsers,
        totalTokensSold: Math.floor(totalTokensSold),
        totalTokensUsed: Math.floor(txs.filter(t => t.type === 'usage').length * 100),
        averageUserBalance,
        totalAPIcalls: txs.filter(t => t.type === 'usage').length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
