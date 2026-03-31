import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CustomLineSnapshot } from "@/lib/store/cart";

interface OrderLineInput {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  materialName: string;
  type: "standard" | "custom";
  customRequestId?: string;
  snapshot?: CustomLineSnapshot;
}

interface CreateOrderBody {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderLineInput[];
}

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderBody = await request.json();

    if (!body.customerName?.trim()) {
      return NextResponse.json({ error: "姓名为必填项" }, { status: 400 });
    }
    if (!body.customerPhone?.trim()) {
      return NextResponse.json({ error: "手机号为必填项" }, { status: 400 });
    }
    if (!body.customerAddress?.trim()) {
      return NextResponse.json({ error: "地址为必填项" }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    for (const item of body.items) {
      if (item.type === "custom") {
        if (!item.customRequestId?.trim()) {
          return NextResponse.json(
            { error: "定制行缺少定制请求标识" },
            { status: 400 },
          );
        }
        if (
          !item.snapshot ||
          typeof item.snapshot.quoteAmountYuan !== "number"
        ) {
          return NextResponse.json(
            { error: "定制行缺少报价快照" },
            { status: 400 },
          );
        }
      }
    }

    const totalAmount = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone.trim(),
        customerAddress: body.customerAddress.trim(),
        totalAmount,
        status: "submitted",
        lines: {
          create: body.items.map((item) => ({
            type: item.type,
            productId:
              item.type === "standard" ? item.productId : null,
            customRequestId:
              item.type === "custom" ? item.customRequestId!.trim() : null,
            productName: item.productName,
            unitPrice: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            materialName: item.materialName,
            snapshotData:
              item.type === "custom" && item.snapshot
                ? (item.snapshot as object)
                : undefined,
          })),
        },
      },
      include: { lines: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "订单创建失败" }, { status: 500 });
  }
}
