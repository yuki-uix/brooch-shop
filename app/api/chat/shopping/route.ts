import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type UIMessage,
} from "ai";
import { resolveLanguageModel } from "@/lib/ai/providers";
import { searchProducts, getProductDetails } from "@/lib/ai/shopping-tools";

const SYSTEM_PROMPT = `你是「胸针精品店」的专属 AI 购物助手，专注于帮助用户挑选和了解胸针。

你的能力：
- 根据用户描述的场合、风格、材质偏好、预算，调用 searchProducts 工具搜索合适的商品
- 调用 getProductDetails 工具获取用户感兴趣商品的详细信息
- 向用户介绍不同材质（珍珠、贝母、纯银、锆石）的特点与适用场景

行为规范：
- 优先调用工具获取真实数据，不要凭空捏造商品名称或价格
- 价格以「元」为单位回复用户（数据库存储单位是分，展示时除以 100）
- 搜索结果为空时，友好告知并建议放宽筛选条件
- 保持简洁友好的对话风格，回答控制在 3～5 句话以内
- 回复中提到的商品数量必须与实际列出的数量一致；先列商品，再写总结，不要提前写「为您推荐 N 款」

工具调用规范：
- 直接调用工具，调用前不要输出过渡文字（如「正在为您查找…」「让我搜索一下」）；前端已有搜索中间态动画
- 如果首次搜索无结果需要重试，静默重试即可，不要向用户解释每一步搜索过程
- 所有工具调用完成后，再用一段简洁的回复汇总结果`;

function buildMockResponse(): Response {
  const mockText =
    "【演示模式】你好！我是胸针购物助手。\n目前处于 Mock 模式（AI_PROVIDER=mock），请在 .env.local 中配置真实 AI_PROVIDER 以接入完整对话功能。";

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "text-start", id: "mock-1" });
      for (const char of mockText) {
        writer.write({ type: "text-delta", delta: char, id: "mock-1" });
        await new Promise((r) => setTimeout(r, 25));
      }
      writer.write({ type: "text-end", id: "mock-1" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const resolved = resolveLanguageModel();

  if (!resolved) {
    return buildMockResponse();
  }

  const result = streamText({
    model: resolved.model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { searchProducts, getProductDetails },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
