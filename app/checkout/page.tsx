"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 py-20">
          <span className="text-6xl">🛒</span>
          <p className="text-lg text-text-secondary">购物车是空的，无法结账</p>
          <Link
            href="/"
            className="mt-2 rounded-sm bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            去选购
          </Link>
        </div>
      </div>
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "请填写姓名";
    if (!phone.trim()) errs.phone = "请填写手机号";
    else if (!/^1\d{10}$/.test(phone.trim())) errs.phone = "请输入 11 位手机号";
    if (!address.trim()) errs.address = "请填写收货地址";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "提交失败");
      }

      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "网络错误，请重试");
      setSubmitting(false);
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-sm border px-3 py-2.5 text-sm transition-colors outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
      errors[field] ? "border-danger bg-danger-bg" : "border-border bg-bg-card"
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/cart"
          className="text-sm text-text-secondary transition-colors hover:text-accent"
        >
          ← 返回购物车
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          结账
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Shipping form */}
          <div className="rounded-card border border-border bg-bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">收货信息</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm text-text-secondary"
                >
                  姓名
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入收货人姓名"
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm text-text-secondary"
                >
                  手机号
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入 11 位手机号"
                  className={inputClass("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-1 block text-sm text-text-secondary"
                >
                  收货地址
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="请输入详细收货地址"
                  rows={3}
                  className={inputClass("address")}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-danger">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="h-fit rounded-card border border-border bg-bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">订单摘要</h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-primary-pale">
                    <ProductImage
                      src={item.imageUrl}
                      alt={item.productName}
                      size="card"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.type === "custom" && (
                        <span className="mr-1 text-xs text-primary">
                          [定制]
                        </span>
                      )}
                      {item.productName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      x{item.quantity}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">合计</span>
                <span className="text-xl font-bold text-accent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {apiError && (
              <p className="mt-3 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-sm bg-accent py-3 text-base font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? "提交中..." : "提交订单（模拟支付）"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
