"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Feasibility } from "@/lib/ai/evaluation-schema";
import { CUSTOM_QUOTE_DISCLAIMER } from "@/lib/copy/custom-quote";
import { FileUploader } from "@/components/FileUploader";
import { FeasibilityBadge } from "@/components/FeasibilityBadge";
import { toast } from "@/components/Toast";
import { useCartStore } from "@/lib/store/cart";

const MAX_DESC = 500;

type Phase = "form" | "loading" | "result";

interface EvaluationResponse {
  id: string;
  description: string | null;
  imageUrl: string | null;
  shortTitle: string;
  feasibility: Feasibility;
  reason: string;
  quoteAmount: number;
}

function formatQuoteYuan(amount: number): string {
  if (amount <= 0) {
    return "暂无有效参考价";
  }
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function customProductTitle(
  description: string | null,
  hasImage: boolean,
): string {
  const raw = description?.trim();
  if (raw) {
    return raw.length > 40 ? `${raw.slice(0, 40)}…` : raw;
  }
  return hasImage ? "定制胸针（附图）" : "定制胸针";
}

export function CustomRequestFlow() {
  const router = useRouter();
  const addCustomItem = useCartStore((s) => s.addCustomItem);
  const cartItems = useCartStore((s) => s.items);

  const [phase, setPhase] = useState<Phase>("form");
  const [loadingHint, setLoadingHint] = useState("处理中…");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [editableTitle, setEditableTitle] = useState("");

  function resetForm() {
    setPhase("form");
    setDescription("");
    setFile(null);
    setSubmitError(null);
    setResult(null);
    setEditableTitle("");
    setLoadingHint("处理中…");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = description.trim();
    if (!trimmed && !file) {
      setSubmitError("请上传参考图片或填写文字描述");
      return;
    }

    setPhase("loading");
    setLoadingHint("正在上传需求…");

    try {
      const formData = new FormData();
      if (trimmed) {
        formData.set("description", trimmed);
      }
      if (file) {
        formData.set("image", file);
      }

      const createRes = await fetch("/api/custom-requests", {
        method: "POST",
        body: formData,
      });
      const createJson = (await createRes.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };

      if (!createRes.ok) {
        setPhase("form");
        setSubmitError(createJson.error || "提交失败，请稍后重试");
        return;
      }

      const requestId = createJson.id;
      if (!requestId) {
        setPhase("form");
        setSubmitError("提交响应异常，请重试");
        return;
      }

      setLoadingHint("AI 评估中，请稍候…");

      const evalRes = await fetch(
        `/api/custom-requests/${requestId}/evaluate`,
        { method: "POST" },
      );
      const evalJson = (await evalRes.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
        shortTitle?: string;
        feasibility?: Feasibility;
        reason?: string;
        quoteAmount?: number;
        description?: string | null;
        imageUrl?: string | null;
      };

      if (!evalRes.ok) {
        setPhase("form");
        setSubmitError(evalJson.error || "评估失败，请稍后重试");
        return;
      }

      if (
        !evalJson.feasibility ||
        evalJson.reason == null ||
        evalJson.quoteAmount == null
      ) {
        setPhase("form");
        setSubmitError("评估结果不完整，请重试");
        return;
      }

      const fallbackTitle = customProductTitle(
        evalJson.description ?? null,
        Boolean(evalJson.imageUrl),
      );
      setResult({
        id: evalJson.id!,
        description: evalJson.description ?? null,
        imageUrl: evalJson.imageUrl ?? null,
        shortTitle: evalJson.shortTitle?.trim() || fallbackTitle,
        feasibility: evalJson.feasibility,
        reason: evalJson.reason,
        quoteAmount: evalJson.quoteAmount,
      });
      setEditableTitle(evalJson.shortTitle?.trim() || fallbackTitle);
      setPhase("result");
    } catch {
      setPhase("form");
      setSubmitError("网络异常，请稍后重试");
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 py-12">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-text">{loadingHint}</p>
        <p className="text-xs text-text-secondary">
          通常不超过几秒，复杂请求可能需要更久
        </p>
      </div>
    );
  }

  if (phase === "result" && result) {
    const evalResult = result;
    const canPurchase = evalResult.feasibility === "feasible";

    function buildCustomPayload() {
      const productName =
        editableTitle.trim() ||
        evalResult.shortTitle.trim() ||
        customProductTitle(
          evalResult.description,
          Boolean(evalResult.imageUrl),
        );
      const priceCents = Math.round(evalResult.quoteAmount * 100);
      return {
        customRequestId: evalResult.id,
        productName,
        price: priceCents,
        imageUrl: evalResult.imageUrl || "",
        snapshot: {
          description: evalResult.description,
          imageUrl: evalResult.imageUrl,
          quoteAmountYuan: evalResult.quoteAmount,
          aiShortTitle: evalResult.shortTitle,
        },
      };
    }

    function handleAddToCart() {
      const isNew = addCustomItem(buildCustomPayload());
      toast(isNew ? "已加入购物车" : "已在购物车中，数量 +1");
    }

    function handleCheckoutNow() {
      const pid = `custom-${evalResult.id}`;
      if (!cartItems.some((i) => i.productId === pid)) {
        addCustomItem(buildCustomPayload());
      }
      router.push("/checkout");
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-text">评估结果</h2>
          <FeasibilityBadge feasibility={evalResult.feasibility} />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
            理由
          </p>
          <p className="text-sm leading-relaxed text-text">{evalResult.reason}</p>
        </div>

        <div>
          <label
            htmlFor="custom-line-title"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-secondary"
          >
            定制名称（购物车 / 订单中显示）
          </label>
          <input
            id="custom-line-title"
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value.slice(0, 40))}
            disabled={!canPurchase}
            placeholder="例如：珍珠蝴蝶胸针"
            className="w-full rounded-sm border border-border bg-bg-card px-3 py-2.5 text-sm text-text placeholder:text-text-secondary shadow-card focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="mt-1 text-xs text-text-secondary">
            默认由 AI 生成简短标题，可自行修改；下方说明与理由保留完整需求细节。
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
            参考报价
          </p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent">
            {formatQuoteYuan(evalResult.quoteAmount)}
          </p>
        </div>

        <p className="rounded-sm border border-warning/40 bg-warning-bg/80 px-3 py-2 text-xs leading-relaxed text-text">
          <span className="font-semibold text-warning">免责声明：</span>
          {CUSTOM_QUOTE_DISCLAIMER}
        </p>

        {canPurchase ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              加入购物车
            </button>
            <button
              type="button"
              onClick={handleCheckoutNow}
              className="flex-1 rounded-full border border-border bg-bg-card px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary-light"
            >
              立即结账
            </button>
          </div>
        ) : null}

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm font-medium text-accent hover:underline"
          >
            重新提交需求
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label className="mb-2 block text-sm font-semibold text-text">
          <span className="mr-1" aria-hidden>
            📷
          </span>
          上传参考图片
        </label>
        <FileUploader value={file} onChange={setFile} />
      </div>

      <div>
        <label
          htmlFor="custom-description"
          className="mb-2 block text-sm font-semibold text-text"
        >
          <span className="mr-1" aria-hidden>
            ✏️
          </span>
          描述你想要的胸针
        </label>
        <textarea
          id="custom-description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
          placeholder="例如：一枚银色底座搭配淡水珍珠的蝴蝶造型胸针..."
          rows={5}
          maxLength={MAX_DESC}
          className="w-full resize-y rounded-sm border border-border bg-bg-card px-3 py-2.5 text-sm text-text placeholder:text-text-secondary shadow-card focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-right text-xs text-text-secondary">
          {description.length} / {MAX_DESC}
        </p>
      </div>

      {submitError && (
        <p
          className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        提交定制需求
      </button>

      <p className="text-center text-xs text-text-secondary">
        <Link href="/" className="text-accent hover:underline">
          ← 返回首页
        </Link>
      </p>
    </form>
  );
}
