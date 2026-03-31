import type { Feasibility } from "@/lib/ai/evaluation-schema";

const config: Record<
  Feasibility,
  { label: string; emoji: string; className: string }
> = {
  feasible: {
    label: "可制作",
    emoji: "✅",
    className: "bg-success-bg text-success",
  },
  needs_confirmation: {
    label: "需确认",
    emoji: "⚠️",
    className: "bg-warning-bg text-warning",
  },
  not_recommended: {
    label: "不建议制作",
    emoji: "⛔",
    className: "bg-danger-bg text-danger",
  },
};

export function FeasibilityBadge({ feasibility }: { feasibility: Feasibility }) {
  const c = config[feasibility];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${c.className}`}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}
