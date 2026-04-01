import { describe, it, expect, afterEach, vi } from "vitest";
import { getProviderId, resolveLanguageModel } from "@/lib/ai/providers";

describe("getProviderId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns "mock" when AI_PROVIDER is not set', () => {
    vi.stubEnv("AI_PROVIDER", "");
    expect(getProviderId()).toBe("mock");
  });

  it('returns "openai" for AI_PROVIDER=openai', () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    expect(getProviderId()).toBe("openai");
  });

  it('returns "google" for AI_PROVIDER=google', () => {
    vi.stubEnv("AI_PROVIDER", "google");
    expect(getProviderId()).toBe("google");
  });

  it('returns "anthropic" for AI_PROVIDER=anthropic', () => {
    vi.stubEnv("AI_PROVIDER", "anthropic");
    expect(getProviderId()).toBe("anthropic");
  });

  it("normalizes uppercase provider values to lowercase", () => {
    vi.stubEnv("AI_PROVIDER", "OPENAI");
    expect(getProviderId()).toBe("openai");
  });

  it('returns "mock" for unknown provider strings', () => {
    vi.stubEnv("AI_PROVIDER", "some-unknown-provider");
    expect(getProviderId()).toBe("mock");
  });
});

describe("resolveLanguageModel", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when using mock provider", () => {
    vi.stubEnv("AI_PROVIDER", "");
    expect(resolveLanguageModel()).toBeNull();
  });

  it("throws when openai is selected but OPENAI_API_KEY is missing", () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(() => resolveLanguageModel()).toThrow("OPENAI_API_KEY is not set");
  });

  it("throws when google is selected but GOOGLE_GENERATIVE_AI_API_KEY is missing", () => {
    vi.stubEnv("AI_PROVIDER", "google");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    expect(() => resolveLanguageModel()).toThrow(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set",
    );
  });

  it("throws when anthropic is selected but ANTHROPIC_API_KEY is missing", () => {
    vi.stubEnv("AI_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(() => resolveLanguageModel()).toThrow("ANTHROPIC_API_KEY is not set");
  });
});
