"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { MaterialTag } from "@/components/MaterialTag";
import { QuantitySelector } from "@/components/QuantitySelector";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/store/cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
  variant?: "cart" | "confirmation";
}

function descriptionPreview(text: string | null | undefined, max = 56): string {
  const t = text?.trim() ?? "";
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  variant = "cart",
}: CartItemProps) {
  const subtotal = item.price * item.quantity;
  const isCustom = item.type === "custom";
  const productHref = isCustom ? "/custom" : `/products/${item.productId}`;
  const snapDesc = descriptionPreview(item.snapshot?.description);

  if (variant === "confirmation") {
    return (
      <div className="flex items-start gap-3 py-3">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-primary-pale">
          <ProductImage
            src={item.imageUrl}
            alt={item.productName}
            size="card"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                {item.productName}
                <span className="text-text-secondary"> ×{item.quantity}</span>
              </p>
              {item.type === "standard" ? (
                <p className="mt-0.5 text-xs text-text-secondary">
                  {item.materialName} · 单价 {formatPrice(item.price)}
                </p>
              ) : snapDesc ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                  「{snapDesc}」
                </p>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-1">
              <span className="font-semibold text-text">
                {formatPrice(subtotal)}
              </span>
              <span
                className={
                  item.type === "standard"
                    ? "rounded-full bg-primary-pale px-2 py-0.5 text-xs font-semibold text-primary"
                    : "rounded-full bg-primary-pale px-2 py-0.5 text-xs font-semibold text-primary"
                }
              >
                {item.type === "standard" ? "标准品" : "定制"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 rounded-card border border-border bg-bg-card p-4 shadow-card">
      <Link
        href={productHref}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-primary-pale"
      >
        <ProductImage src={item.imageUrl} alt={item.productName} size="card" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={productHref}
              className="line-clamp-1 font-medium transition-colors hover:text-accent"
            >
              {isCustom && (
                <span className="mr-1.5 inline-block rounded-full bg-primary-pale px-2 py-0.5 text-xs font-semibold text-primary">
                  定制
                </span>
              )}
              {item.productName}
            </Link>
            {isCustom && snapDesc ? (
              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                「{snapDesc}」
              </p>
            ) : (
              <div className="mt-0.5 flex items-center gap-1.5">
                <MaterialTag name={item.materialName} size="sm" />
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="font-semibold text-accent">
              {formatPrice(item.price)}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.productId)}
                className="text-text-secondary transition-colors hover:text-danger"
                aria-label="删除商品"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          {onUpdateQuantity ? (
            <QuantitySelector
              quantity={item.quantity}
              onChange={(q) => onUpdateQuantity(item.productId, q)}
            />
          ) : (
            <span className="text-sm text-text-secondary">
              数量: {item.quantity}
            </span>
          )}
          <span className="text-sm text-text-secondary">
            小计{" "}
            <span className="font-semibold text-text">
              {formatPrice(subtotal)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
