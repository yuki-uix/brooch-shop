import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { orderLineToCartItem } from "@/lib/order-line";
import { CartItemRow } from "@/components/CartItem";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) return { title: "订单未找到" };
  return { title: `订单 #${order.orderNumber} — Brooch Shop` };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 rounded-card border border-success/30 bg-success-bg p-6 text-center">
        <p className="text-4xl">✅</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          订单已提交！
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          订单号:{" "}
          <span className="font-mono font-semibold text-text">
            #{order.orderNumber}
          </span>
        </p>
      </div>

      <div className="rounded-card border border-border bg-bg-card p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">订单详情</h2>

        <div className="flex flex-col divide-y divide-border">
          {order.lines.map((line) => (
            <CartItemRow
              key={line.id}
              item={orderLineToCartItem(line)}
              variant="confirmation"
            />
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">合计</span>
            <span className="text-xl font-bold text-accent">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-text-secondary">状态</span>
            <span className="rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success">
              已提交
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-card border border-border bg-bg-card p-6 shadow-card">
        <h2 className="mb-3 text-lg font-semibold">收货信息</h2>
        <p className="text-sm text-text">
          {order.customerName} / {order.customerPhone} / {order.customerAddress}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="rounded-sm bg-accent px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
