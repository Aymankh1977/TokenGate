import axios from "axios";

/**
 * Provider adapters. The old code sent `Authorization: Bearer` and read
 * `usage.prompt_tokens/completion_tokens` for EVERY provider — so Anthropic and
 * Cohere calls either failed (wrong auth header / body shape) or metered ZERO
 * tokens (= free usage). Each provider needs its own request + usage parsing.
 */

export interface NormalizedUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ProviderCallInput {
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface ProviderResult {
  raw: unknown;
  usage: NormalizedUsage;
}

const env = (k: string) => process.env[k] ?? "";

export const SUPPORTED_PROVIDERS = ["openai", "anthropic", "cohere"] as const;
export type Provider = (typeof SUPPORTED_PROVIDERS)[number];

export function isSupportedProvider(p: string): p is Provider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(p);
}

export async function callProvider(
  provider: Provider,
  input: ProviderCallInput,
): Promise<ProviderResult> {
  const { model, messages, maxTokens = 1024, temperature } = input;

  if (provider === "openai") {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      { model, messages, max_tokens: maxTokens, temperature },
      {
        headers: {
          Authorization: `Bearer ${env("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );
    const u = res.data?.usage ?? {};
    return {
      raw: res.data,
      usage: {
        inputTokens: u.prompt_tokens ?? 0,
        outputTokens: u.completion_tokens ?? 0,
      },
    };
  }

  if (provider === "anthropic") {
    // Anthropic: x-api-key + anthropic-version, body needs max_tokens,
    // usage is input_tokens/output_tokens.
    const sys = messages.find((m) => m.role === "system")?.content;
    const turns = messages.filter((m) => m.role !== "system");
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      { model, max_tokens: maxTokens, system: sys, messages: turns, temperature },
      {
        headers: {
          "x-api-key": env("ANTHROPIC_API_KEY"),
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );
    const u = res.data?.usage ?? {};
    return {
      raw: res.data,
      usage: {
        inputTokens: u.input_tokens ?? 0,
        outputTokens: u.output_tokens ?? 0,
      },
    };
  }

  if (provider === "cohere") {
    // Cohere v2 chat. Verify field names against current Cohere docs before launch.
    const res = await axios.post(
      "https://api.cohere.com/v2/chat",
      { model, messages, max_tokens: maxTokens, temperature },
      {
        headers: {
          Authorization: `Bearer ${env("COHERE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );
    const billed = res.data?.usage?.billed_units ?? res.data?.usage?.tokens ?? {};
    return {
      raw: res.data,
      usage: {
        inputTokens: billed.input_tokens ?? 0,
        outputTokens: billed.output_tokens ?? 0,
      },
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
