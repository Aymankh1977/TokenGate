import { Request, Response } from 'express';
import axios from 'axios';
import * as db from './db';
import { TRPCError } from '@trpc/server';

/**
 * AI Gateway Handler
 * Proxies requests to AI providers and handles token metering
 */

interface AIRequest {
  model: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
  [key: string]: unknown;
}

interface AIResponse {
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  [key: string]: unknown;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1/chat/completions',
  'anthropic': 'https://api.anthropic.com/v1/messages',
  'cohere': 'https://api.cohere.ai/v1/generate',
};

export async function handleAIGatewayRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const apiKeyId = (req as any).apiKeyId;
    const { provider, model, ...requestBody } = req.body as AIRequest & { provider: string };

    if (!provider || !model) {
      return res.status(400).json({ error: 'Missing provider or model' });
    }

    // Get user and check token balance
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get model pricing
    const pricing = await db.getModelPricing(model);
    if (!pricing) {
      return res.status(400).json({ error: `Model ${model} not supported` });
    }

    // Get provider endpoint
    const endpoint = PROVIDER_ENDPOINTS[provider];
    if (!endpoint) {
      return res.status(400).json({ error: `Provider ${provider} not supported` });
    }

    // Make request to AI provider
    let aiResponse: AIResponse;
    try {
      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${process.env[`${provider.toUpperCase()}_API_KEY`]}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      aiResponse = response.data;
    } catch (error: any) {
      console.error(`[AI Gateway] Error calling ${provider}:`, error.message);
      return res.status(502).json({ error: `Failed to call ${provider} API` });
    }

    // Calculate token usage
    const usage = aiResponse.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;

    // Calculate token cost
    const inputCost = parseFloat(pricing.inputTokenPrice.toString()) * inputTokens;
    const outputCost = parseFloat(pricing.outputTokenPrice.toString()) * outputTokens;
    const totalCost = (inputCost + outputCost).toString();

    // Check if user has sufficient balance
    const currentBalance = parseFloat(user.tokenBalance.toString());
    if (currentBalance < parseFloat(totalCost)) {
      // Log failed attempt
      await db.createUsageLog(
        userId,
        model,
        provider,
        totalCost,
        '0',
        'insufficient_balance',
        inputTokens,
        outputTokens,
        apiKeyId,
        { endpoint, requestBody }
      );

      return res.status(402).json({
        error: 'Insufficient token balance',
        required: totalCost,
        available: user.tokenBalance.toString(),
      });
    }

    // Deduct tokens from user balance
    const newBalance = (currentBalance - parseFloat(totalCost)).toString();
    await db.updateUserTokenBalance(userId, newBalance);

    // Log successful usage
    await db.createUsageLog(
      userId,
      model,
      provider,
      totalCost,
      totalCost,
      'success',
      inputTokens,
      outputTokens,
      apiKeyId,
      { endpoint, inputCost, outputCost }
    );

    // Create transaction record
    await db.createTransaction(
      userId,
      'usage',
      totalCost,
      `API call to ${provider} using ${model}`,
      undefined,
      {
        provider,
        model,
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
      }
    );

    // Return response with usage info
    return res.json({
      ...aiResponse,
      _gateway_info: {
        tokens_deducted: totalCost,
        new_balance: newBalance,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          input_cost: inputCost,
          output_cost: outputCost,
        },
      },
    });
  } catch (error) {
    console.error('[AI Gateway] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGatewayStats(userId: number) {
  try {
    const logs = await db.getUsageLogsByUserId(userId, 1000);

    const stats = {
      totalRequests: logs.length,
      successfulRequests: logs.filter(l => l.status === 'success').length,
      failedRequests: logs.filter(l => l.status === 'failed').length,
      insufficientBalanceRequests: logs.filter(l => l.status === 'insufficient_balance').length,
      totalTokensUsed: logs.reduce((sum, l) => sum + parseFloat(l.tokensUsed.toString()), 0),
      totalTokensDeducted: logs.reduce((sum, l) => sum + parseFloat(l.tokensDeducted.toString()), 0),
      byProvider: {} as Record<string, { requests: number; tokensUsed: number }>,
      byModel: {} as Record<string, { requests: number; tokensUsed: number }>,
    };

    logs.forEach(log => {
      // By provider
      if (!stats.byProvider[log.service]) {
        stats.byProvider[log.service] = { requests: 0, tokensUsed: 0 };
      }
      stats.byProvider[log.service].requests++;
      stats.byProvider[log.service].tokensUsed += parseFloat(log.tokensUsed.toString());

      // By model
      if (!stats.byModel[log.model]) {
        stats.byModel[log.model] = { requests: 0, tokensUsed: 0 };
      }
      stats.byModel[log.model].requests++;
      stats.byModel[log.model].tokensUsed += parseFloat(log.tokensUsed.toString());
    });

    return stats;
  } catch (error) {
    console.error('[AI Gateway] Error getting stats:', error);
    throw error;
  }
}
