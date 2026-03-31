import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(materials);
}
