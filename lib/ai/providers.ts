import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export type ProviderId = "openai" | "google" | "anthropic" | "mock";

export interface ResolvedModel {
  provider: Exclude<ProviderId, "mock">;
  modelId: string;
  model: LanguageModelV3;
}

export function getProviderId(): ProviderId {
  const raw = (process.env.AI_PROVIDER ?? "mock").toLowerCase().trim();
  if (raw === "openai" || raw === "google" || raw === "anthropic") {
    return raw;
  }
  return "mock";
}

function defaultModelFor(provider: ProviderId): string {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "google":
      // gemini-2.0-flash 已对部分新 key 不可用；2.5 Flash 对通常的多模态/结构化输出仍适用
      return "gemini-2.5-flash";
    case "anthropic":
      return "claude-sonnet-4-20250514";
    default:
      return "mock";
  }
}

/**
 * Resolves the language model from AI_PROVIDER + AI_MODEL, or null when using mock.
 */
export function resolveLanguageModel(): ResolvedModel | null {
  const provider = getProviderId();
  const modelId =
    process.env.AI_MODEL?.trim() || defaultModelFor(provider);

  if (provider === "mock") {
    return null;
  }

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    const openai = createOpenAI({ apiKey: key });
    return { provider, modelId, model: openai(modelId) };
  }

  if (provider === "google") {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
    }
    const google = createGoogleGenerativeAI({ apiKey: key });
    return { provider, modelId, model: google(modelId) };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const anthropic = createAnthropic({ apiKey: key });
  return { provider, modelId, model: anthropic(modelId) };
}
