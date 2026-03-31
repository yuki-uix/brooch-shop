import { z } from "zod";

export const feasibilityValues = [
  "feasible",
  "needs_confirmation",
  "not_recommended",
] as const;

export type Feasibility = (typeof feasibilityValues)[number];

export const evaluationSchema = z.object({
  /** 用于购物车/订单行的短标题（8～24 字为宜），需与下方完整说明区分，不要整段复制用户原文 */
  shortTitle: z.string().min(2).max(40),
  feasibility: z.enum(feasibilityValues),
  reason: z.string().min(8).max(2000),
  quoteAmount: z.number().int().min(0).max(1_000_000),
});

export type EvaluationResult = z.infer<typeof evaluationSchema>;
