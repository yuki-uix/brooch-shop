import { readFile } from "fs/promises";
import { generateObject } from "ai";
import {
  evaluationSchema,
  type EvaluationResult,
  type Feasibility,
} from "./evaluation-schema";
import { resolveLanguageModel } from "./providers";

const SYSTEM_PROMPT = `你代表 **1688/源头饰品厂** 的跟单核价视角（合金/铜银件、镶石、滴油珐琅、电镀等常见胸针工艺），根据用户文字与/或参考图，判断能否接单并给出 **出厂侧参考单价（人民币元，整数）**。

核价时请显式在心算中综合以下维度（不必逐条罗列长文，但 reason 里要用一两句话点到关键依据）：
1. **结构复杂度**：平面件 < 多层镂空/多处镶爪 < 强立体件/多组件拼装；开模与夹具难度越高，小单摊销越高。
2. **尺寸与克重感**：在图或描述中合理推断体量（过大则材料+电镀面积上升）；未说明时按常见胸针约 2～4cm 量级假设，并在 reason 中写明「按常规尺寸假设」。
3. **材质与表面**：例如锌合金/铜坯+电镀、925 银、不锈钢、滴油/仿珐琅、锆石/水钻档位的料工差异；避免按零售轻奢品牌溢价报「客单价」。
4. **出货量/起订档位**：用户未写数量时，**默认按「首单试单/小批量」**（可理解为约几十件内、需打样摊销）估 **单件出厂参考**，并在 reason 中说明「已按小批量假设，量大可再降」；若用户写明几百/几千件，应体现 **量增价减** 的区间感（用单价数字落在该档常识范围内）。
5. **工艺风险**：特种石形配对、极细镂空易断、多色滴油公差等 → 倾向 needs_confirmation 或 not_recommended。

可行性判定：
- feasible：厂内常规工艺可稳定复现，单价有据可估。
- needs_confirmation：能打但需要补资料（尺寸、数量、电镀色、石料规格等）才能锁价。
- not_recommended：工艺/结构不划算、信息过少无法核价，或明显不适合建厂线。

输出要求：
- shortTitle：**一句**可放在购物车列表里的商品名（约 8～24 字），概括造型/材质亮点，**不要**把用户整段说明贴进来；无文字仅有图时可写「附图定制胸针」类概括。
- reason：**2～4 句中文**，口语可略带「厂里说人话」，点对复杂度、材质档、数量假设如何影响单价；避免虚构具体 IP/角色名授权结论，可描述「造型类似××风格」但不要断言版权。
- quoteAmount：**单件**参考出厂价（元，非负整数）。not_recommended 时可为 0 或保守示意价；数值应与「小批试单」档位的行业常识大致同量级，避免脱离材质与复杂度。`;

export function buildUserPrompt(description: string | null, hasImage: boolean): string {
  const parts: string[] = [];
  parts.push(
    "请按源头厂核价标准评估下列定制胸针需求，输出结构化结果（可行性、理由、单件参考出厂价）。",
  );
  parts.push(
    "若说明中未写订购数量，按「首单小批量试产、需摊打样」理解；若写了件数请按该量级估单价。",
  );
  if (description?.trim()) {
    parts.push(`【文字说明】\n${description.trim()}`);
  } else {
    parts.push("【文字说明】用户未提供文字说明。");
  }
  if (hasImage) {
    parts.push("【参考图】已附上：请结合尺寸观感、层次与材质线索，推断复杂度与工艺路径。");
  } else {
    parts.push("【参考图】用户未上传图片。");
  }
  return parts.join("\n\n");
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockResult(
  description: string | null,
  hasImage: boolean,
): EvaluationResult {
  const scenario = process.env.AI_MOCK_SCENARIO?.trim() as
    | Feasibility
    | undefined;
  const modes: Feasibility[] = [
    "feasible",
    "needs_confirmation",
    "not_recommended",
  ];

  let feasibility: Feasibility;
  if (scenario && modes.includes(scenario)) {
    feasibility = scenario;
  } else {
    const key = `${description ?? ""}\0${hasImage ? "1" : "0"}`;
    feasibility = modes[hashSeed(key) % 3]!;
  }

  switch (feasibility) {
    case "feasible":
      return {
        shortTitle: "珍珠月牙造型胸针",
        feasibility,
        reason:
          "按锌合金/铜坯+电镀+点钻的常规厂线评估，结构未超出常见开模范围；按小批量试单摊销后单件出厂价落在常见区间。",
        quoteAmount: 185,
      };
    case "needs_confirmation":
      return {
        shortTitle: "镶锆石蝴蝶胸针",
        feasibility,
        reason:
          "大货能做，但镀色号是 PVD 还是水镀、石头规格与数量未锁，需样办后才能压实单价；当前按小批试产略高估单件。",
        quoteAmount: 260,
      };
    default:
      return {
        shortTitle: "定制胸针（待确认）",
        feasibility: "not_recommended",
        reason:
          "当前描述与参考信息叠加后工艺路径不清晰，或复杂度与预算较难匹配；建议简化造型或补充更多具体需求后再评估。",
        quoteAmount: 0,
      };
  }
}

export async function evaluateCustomBroochRequest(options: {
  description: string | null;
  imageAbsolutePath: string | null;
  abortSignal?: AbortSignal;
}): Promise<{
  result: EvaluationResult;
  provider: string;
  model: string;
}> {
  const resolved = resolveLanguageModel();

  if (!resolved) {
    const result = mockResult(
      options.description,
      !!options.imageAbsolutePath,
    );
    return { result, provider: "mock", model: "mock" };
  }

  let imageBuffer: Buffer | undefined;
  if (options.imageAbsolutePath) {
    imageBuffer = await readFile(options.imageAbsolutePath);
  }

  const userText = buildUserPrompt(options.description, !!imageBuffer);
  const userContent: Array<
    { type: "text"; text: string } | { type: "image"; image: Buffer }
  > = [{ type: "text", text: userText }];

  if (imageBuffer) {
    userContent.push({ type: "image", image: imageBuffer });
  }

  const { object } = await generateObject({
    model: resolved.model,
    schema: evaluationSchema,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
    abortSignal: options.abortSignal,
  });

  return {
    result: object,
    provider: resolved.provider,
    model: resolved.modelId,
  };
}
