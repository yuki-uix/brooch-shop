"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Material {
  id: string;
  name: string;
  slug: string;
}

interface MaterialFilterProps {
  materials: Material[];
}

export function MaterialFilter({ materials }: MaterialFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("material");

  const handleFilter = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("material", slug);
      } else {
        params.delete("material");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-text-secondary mr-1">筛选</span>

      {materials.map((m) => {
        const isActive = activeSlug === m.slug;
        return (
          <button
            key={m.id}
            onClick={() => handleFilter(isActive ? null : m.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-accent text-white shadow-sm"
                : "bg-primary-pale text-primary hover:bg-primary-light"
            }`}
          >
            {m.name}
          </button>
        );
      })}

      {activeSlug && (
        <button
          onClick={() => handleFilter(null)}
          className="rounded-full px-3 py-1.5 text-sm text-text-secondary hover:text-danger transition-colors"
        >
          清除
        </button>
      )}
    </div>
  );
}
