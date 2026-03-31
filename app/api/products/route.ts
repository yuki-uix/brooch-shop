import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const materialSlug = request.nextUrl.searchParams.get("material");

  const products = await prisma.product.findMany({
    where: materialSlug ? { material: { slug: materialSlug } } : undefined,
    include: { material: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
