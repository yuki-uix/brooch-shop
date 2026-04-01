"use client";

import { useState } from "react";
import { MaterialTag } from "./MaterialTag";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";

export interface ProductSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  materialName: string;
  tags?: string[];
}

function useAddToCart(product: ProductSummary) {
  const addItem = useCartStore((s) => s.addItem);
  const quantity = useCartStore(
    (s) =>
      s.items.find((i) => i.productId === product.id && i.type === "standard")
        ?.quantity ?? 0,
  );

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      materialName: product.materialName,
    });
  };

  return { quantity, handleAdd };
}

/* ─── Compact card for searchProducts results (horizontal layout) ──────── */

function CompactCard({ product }: { product: ProductSummary }) {
  const [imgError, setImgError] = useState(false);
  const { quantity, handleAdd } = useAddToCart(product);

  const allTags = [product.materialName, ...(product.tags ?? [])];

  return (
    <div className="flex gap-2 rounded-xl border border-border bg-bg-card p-1.5 transition-shadow hover:shadow-card">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-pale">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl">💎</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <p className="truncate text-xs font-semibold leading-tight text-text">{product.name}</p>
        <div className="flex flex-wrap gap-1">
          {allTags.map((tag) => (
            <MaterialTag key={tag} name={tag} size="sm" />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-accent">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-accent-hover active:scale-95"
          >
            {quantity > 0 ? `加购 · ${quantity}件` : "加入购物车"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail card for getProductDetails result (larger layout) ──────────── */

function DetailCard({ product }: { product: ProductSummary }) {
  const [imgError, setImgError] = useState(false);
  const { quantity, handleAdd } = useAddToCart(product);

  const allTags = [product.materialName, ...(product.tags ?? [])];

  return (
    <div className="max-w-56 overflow-hidden rounded-xl border border-border bg-bg-card shadow-card">
      <div className="aspect-4/3 w-full bg-primary-pale">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl">💎</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-2.5">
        <h4 className="text-sm font-semibold text-text">{product.name}</h4>
        <div className="flex flex-wrap items-center gap-1.5">
          {allTags.map((tag) => (
            <MaterialTag key={tag} name={tag} size="sm" />
          ))}
          <span className="text-sm font-bold text-accent">{formatPrice(product.price)}</span>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
            {product.description}
          </p>
        )}
        <button
          onClick={handleAdd}
          className="mt-0.5 w-full rounded-md bg-accent py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          {quantity > 0 ? `加购 · 购物车已有 ${quantity} 件` : "加入购物车"}
        </button>
      </div>
    </div>
  );
}

/* ─── Public composites ────────────────────────────────────────────────── */

export function ChatProductList({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <div className="flex max-w-72 flex-col gap-1.5 py-1">
      {products.map((p) => (
        <CompactCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ChatProductDetail({ product }: { product: ProductSummary }) {
  return (
    <div className="py-1">
      <DetailCard product={product} />
    </div>
  );
}
