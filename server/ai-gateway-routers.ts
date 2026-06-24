import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { getGatewayStats } from "./ai-gateway";

const PROVIDER_ENDPOINTS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1/chat/completions',
  'anthropic': 'https://api.anthropic.com/v1/messages',
  'cohere': 'https://api.cohere.ai/v1/generate',
};

export const aiGatewayRouter = router({
  // Make an AI API call through the gateway
  callAPI: protectedProcedure
    .input(z.object({
      provider: z.string(),
      model: z.string(),
      messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
      })).optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { provider, model, ...requestBody } = input;

      // Get user and check token balance
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Get model pricing
      const pricing = await db.getModelPricing(model);
      if (!pricing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Model ${model} not supported` });
      }

      // Get provider endpoint
      const endpoint = PROVIDER_ENDPOINTS[provider];
      if (!endpoint) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Provider ${provider} not supported` });
      }

      // Estimate token usage (rough estimate for demo)
      const estimatedInputTokens = requestBody.messages
        ? requestBody.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0)
        : 100;
      const estimatedOutputTokens = requestBody.maxTokens || 500;

      // Calculate estimated cost
      const inputCost = parseFloat(pricing.inputTokenPrice.toString()) * estimatedInputTokens;
      const outputCost = parseFloat(pricing.outputTokenPrice.toString()) * estimatedOutputTokens;
      const totalEstimatedCost = inputCost + outputCost;

      // Check if user has sufficient balance
      const currentBalance = parseFloat(user.tokenBalance.toString());
      if (currentBalance < totalEstimatedCost) {
        // Log failed attempt
        await db.createUsageLog(
          ctx.user.id,
          model,
          provider,
          totalEstimatedCost.toString(),
          '0',
          'insufficient_balance',
          estimatedInputTokens,
          estimatedOutputTokens,
          undefined,
          { endpoint, requestBody }
        );

        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Insufficient token balance. Required: ${totalEstimatedCost.toFixed(6)}, Available: ${currentBalance.toFixed(6)}`,
        });
      }

      try {
        // Make request to AI provider
        const response = await axios.post(endpoint, requestBody, {
          headers: {
            'Authorization': `Bearer ${process.env[`${provider.toUpperCase()}_API_KEY`] || 'demo-key'}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });

        const aiResponse = response.data;
        const usage = aiResponse.usage || {
          prompt_tokens: estimatedInputTokens,
          completion_tokens: estimatedOutputTokens,
          total_tokens: estimatedInputTokens + estimatedOutputTokens,
        };

        // Use actual usage if available, otherwise use estimate
        const actualInputTokens = usage.prompt_tokens || estimatedInputTokens;
        const actualOutputTokens = usage.completion_tokens || estimatedOutputTokens;
        const actualInputCost = parseFloat(pricing.inputTokenPrice.toString()) * actualInputTokens;
        const actualOutputCost = parseFloat(pricing.outputTokenPrice.toString()) * actualOutputTokens;
        const totalActualCost = actualInputCost + actualOutputCost;

        // Deduct tokens from user balance
        const newBalance = (currentBalance - totalActualCost).toString();
        await db.updateUserTokenBalance(ctx.user.id, newBalance);

        // Log successful usage
        await db.createUsageLog(
          ctx.user.id,
          model,
          provider,
          totalActualCost.toString(),
          totalActualCost.toString(),
          'success',
          actualInputTokens,
          actualOutputTokens,
          undefined,
          { endpoint, actualInputCost, actualOutputCost }
        );

        // Create transaction record
        await db.createTransaction(
          ctx.user.id,
          'usage',
          totalActualCost.toString(),
          `API call to ${provider} using ${model}`,
          undefined,
          {
            provider,
            model,
            inputTokens: actualInputTokens,
            outputTokens: actualOutputTokens,
            inputCost: actualInputCost,
            outputCost: actualOutputCost,
          }
        );

        return {
          success: true,
          response: aiResponse,
          tokenUsage: {
            inputTokens: actualInputTokens,
            outputTokens: actualOutputTokens,
            totalTokensDeducted: totalActualCost.toFixed(6),
          },
          newBalance: newBalance,
        };
      } catch (error: any) {
        console.error(`[AI Gateway] Error calling ${provider}:`, error.message);

        // Log failed attempt
        await db.createUsageLog(
          ctx.user.id,
          model,
          provider,
          totalEstimatedCost.toString(),
          '0',
          'failed',
          estimatedInputTokens,
          estimatedOutputTokens,
          undefined,
          { endpoint, error: error.message }
        );

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to call ${provider} API: ${error.message}`,
        });
      }
    }),

  // Get gateway statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getGatewayStats(ctx.user.id);
  }),

  // Get supported models and pricing
  getModels: protectedProcedure.query(async () => {
    // This would fetch from database in production
    return {
      providers: Object.keys(PROVIDER_ENDPOINTS),
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          inputPrice: 0.00003,
          outputPrice: 0.00006,
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          inputPrice: 0.0000005,
          outputPrice: 0.0000015,
        },
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          inputPrice: 0.000015,
          outputPrice: 0.000075,
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          provider: 'anthropic',
          inputPrice: 0.000003,
          outputPrice: 0.000015,
        },
      ],
    };
  }),
});
