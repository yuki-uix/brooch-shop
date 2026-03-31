import { NextResponse } from "next/server";
import { evaluateCustomBroochRequest } from "@/lib/ai/evaluator";
import { prisma } from "@/lib/prisma";
import { resolveCustomUploadPath } from "@/lib/ai/resolve-upload-path";

function isTimeoutOrAbort(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  return (
    err.name === "AbortError" ||
    err.name === "TimeoutError" ||
    (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError")
  );
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const row = await prisma.customRequest.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "找不到该定制请求" }, { status: 404 });
    }

    if (!row.description?.trim() && !row.imageUrl) {
      return NextResponse.json({ error: "该请求缺少评估所需的描述或图片" }, { status: 400 });
    }

    const imageAbsolutePath = resolveCustomUploadPath(row.imageUrl);

    const abortSignal = AbortSignal.timeout(10_000);

    const { result, provider, model } = await evaluateCustomBroochRequest({
      description: row.description,
      imageAbsolutePath,
      abortSignal,
    });

    const updated = await prisma.customRequest.update({
      where: { id },
      data: {
        feasibility: result.feasibility,
        reason: result.reason,
        quoteAmount: result.quoteAmount,
        provider,
        model,
        evaluatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updated.id,
      description: updated.description,
      imageUrl: updated.imageUrl,
      shortTitle: result.shortTitle,
      feasibility: updated.feasibility,
      reason: updated.reason,
      quoteAmount: updated.quoteAmount,
      provider: updated.provider,
      model: updated.model,
      evaluatedAt: updated.evaluatedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    if (isTimeoutOrAbort(err)) {
      return NextResponse.json(
        { error: "评估超时，请稍后重试" },
        { status: 504 },
      );
    }
    console.error("custom-requests evaluate failed:", err);
    const raw =
      err instanceof Error ? err.message : typeof err === "string" ? err : "";
    let message = "评估服务暂时不可用，请稍后重试";
    if (raw.includes("API_KEY")) {
      message = "AI 服务未正确配置，请检查环境变量";
    } else if (raw.includes("no longer available")) {
      message =
        "当前 Gemini 模型名不可用（常见于旧模型对新账号关闭）。请在 .env.local 设置 AI_MODEL=gemini-2.5-flash 或 gemini-flash-latest 后重启 dev。";
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
