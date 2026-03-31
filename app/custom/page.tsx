import type { Metadata } from "next";
import { CustomRequestFlow } from "@/components/CustomRequestFlow";

export const metadata: Metadata = {
  title: "定制胸针 — Brooch Shop",
  description: "上传图片或描述想法，发起专属胸针定制",
};

export default function CustomPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight mb-2">
        定制你的胸针
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        上传参考图和/或文字说明，帮助我们理解你的设想（后续将由 AI 评估可行性与参考报价）。
      </p>
      <div className="rounded-card border border-border bg-bg-card p-6 shadow-card">
        <CustomRequestFlow />
      </div>
    </div>
  );
}
