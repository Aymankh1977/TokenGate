import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { executeGatewayCall, GatewayError } from "./ai-gateway";
import { SUPPORTED_PROVIDERS } from "./providers";
import { picoToUsdString } from "./billing/billing";

/**
 * tRPC gateway = the dashboard "try it" surface (session-authenticated).
 * Programmatic access goes through the HTTP route + API-key middleware.
 * Both call the SAME executeGatewayCall, so billing can't diverge.
 */
export const aiGatewayRouter = router({
  callAPI: protectedProcedure
    .input(
      z.object({
        provider: z.enum(SUPPORTED_PROVIDERS),
        model: z.string(),
        messages: z.array(z.object({ role: z.string(), content: z.string() })),
        temperature: z.number().optional(),
        maxTokens: z.number().int().positive().max(8192).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await executeGatewayCall({ userId: ctx.user.id, ...input });
      } catch (e) {
        if (e instanceof GatewayError) {
          const code =
            e.status === 402
              ? "PRECONDITION_FAILED"
              : e.status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_SERVER_ERROR";
          throw new TRPCError({ code, message: e.message });
        }
        throw e;
      }
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const logs = await db.getUsageLogsByUserId(ctx.user.id, 1000);
    const num = (s: string) => Number(s);
    return {
      totalRequests: logs.length,
      successfulRequests: logs.filter((l) => l.status === "success").length,
      failedRequests: logs.filter((l) => l.status === "failed").length,
      insufficientBalanceRequests: logs.filter((l) => l.status === "insufficient_balance").length,
      totalChargedUsd: logs.reduce((s, l) => s + num(l.chargedUsd), 0).toFixed(6),
      totalCostUsd: logs.reduce((s, l) => s + num(l.costUsd), 0).toFixed(6),
    };
  }),

  // Display catalog comes straight from the seeded pricing table now,
  // so the prices shown always match what the gateway actually charges.
  getModels: protectedProcedure.query(async () => {
    return { providers: SUPPORTED_PROVIDERS };
  }),
});

export { picoToUsdString };
