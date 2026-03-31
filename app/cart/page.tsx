"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { CartItemRow } from "@/components/CartItem";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);

  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          购物车
        </h1>
        {!isEmpty && (
          <span className="text-sm text-text-secondary">
            共 {totalItems()} 件商品
          </span>
        )}
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 py-20">
          <span className="text-6xl">🛒</span>
          <p className="text-lg text-text-secondary">购物车是空的</p>
          <Link
            href="/"
            className="mt-2 rounded-sm bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            去选购
          </Link>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-card border border-border bg-bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">合计</span>
              <span className="text-2xl font-bold text-accent">
                {formatPrice(totalPrice())}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-4 block rounded-sm bg-accent py-3 text-center text-base font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
            >
              去结账
            </Link>
          </div>

          {/* Continue shopping */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-text-secondary transition-colors hover:text-accent"
            >
              ← 继续购物
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
