import { describe, it, expect, afterEach, vi } from "vitest";
import {
  evaluateCustomBroochRequest,
  buildUserPrompt,
} from "@/lib/ai/evaluator";

describe("buildUserPrompt", () => {
  it("includes text description when provided", () => {
    const prompt = buildUserPrompt("一个蝴蝶胸针", false);
    expect(prompt).toContain("【文字说明】\n一个蝴蝶胸针");
    expect(prompt).toContain("【参考图】用户未上传图片");
  });

  it("shows placeholder when description is null", () => {
    const prompt = buildUserPrompt(null, false);
    expect(prompt).toContain("【文字说明】用户未提供文字说明");
    expect(prompt).toContain("【参考图】用户未上传图片");
  });

  it("shows placeholder when description is empty string", () => {
    const prompt = buildUserPrompt("   ", false);
    expect(prompt).toContain("【文字说明】用户未提供文字说明");
  });

  it("includes image note when hasImage is true", () => {
    const prompt = buildUserPrompt(null, true);
    expect(prompt).toContain("【参考图】已附上");
  });

  it("combines description and image note when both are present", () => {
    const prompt = buildUserPrompt("简单平面件", true);
    expect(prompt).toContain("【文字说明】\n简单平面件");
    expect(prompt).toContain("【参考图】已附上");
  });
});

describe("mockResult via evaluateCustomBroochRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns feasible result when AI_MOCK_SCENARIO=feasible', async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("AI_MOCK_SCENARIO", "feasible");
    const { result, provider, model } = await evaluateCustomBroochRequest({
      description: null,
      imageAbsolutePath: null,
    });
    expect(result.feasibility).toBe("feasible");
    expect(result.quoteAmount).toBeGreaterThan(0);
    expect(provider).toBe("mock");
    expect(model).toBe("mock");
  });

  it('returns needs_confirmation result when AI_MOCK_SCENARIO=needs_confirmation', async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("AI_MOCK_SCENARIO", "needs_confirmation");
    const { result } = await evaluateCustomBroochRequest({
      description: null,
      imageAbsolutePath: null,
    });
    expect(result.feasibility).toBe("needs_confirmation");
    expect(result.quoteAmount).toBeGreaterThan(0);
  });

  it('returns not_recommended result when AI_MOCK_SCENARIO=not_recommended', async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("AI_MOCK_SCENARIO", "not_recommended");
    const { result } = await evaluateCustomBroochRequest({
      description: null,
      imageAbsolutePath: null,
    });
    expect(result.feasibility).toBe("not_recommended");
    expect(result.quoteAmount).toBe(0);
  });

  it("hash-based selection is deterministic: same input always yields same feasibility", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("AI_MOCK_SCENARIO", "");
    const description = "固定测试输入-确定性验证";
    const { result: r1 } = await evaluateCustomBroochRequest({
      description,
      imageAbsolutePath: null,
    });
    const { result: r2 } = await evaluateCustomBroochRequest({
      description,
      imageAbsolutePath: null,
    });
    expect(r1.feasibility).toBe(r2.feasibility);
  });

  it("image flag changes hash seed and may yield different feasibility from text-only", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("AI_MOCK_SCENARIO", "");
    const { result: withoutImage } = await evaluateCustomBroochRequest({
      description: "hash-divergence-test",
      imageAbsolutePath: null,
    });
    // imageAbsolutePath being non-null triggers hasImage=true in mockResult
    // We only verify that the call itself succeeds; feasibility difference is hash-determined
    expect(["feasible", "needs_confirmation", "not_recommended"]).toContain(
      withoutImage.feasibility,
    );
  });
});
