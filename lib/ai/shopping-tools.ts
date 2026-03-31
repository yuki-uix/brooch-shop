import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const searchProducts = tool({
  description:
    "搜索符合用户需求的胸针商品。根据关键词、材质名称、价格上限过滤，最多返回 6 件。价格单位为「分」（1 元 = 100 分）。",
  parameters: z.object({
    query: z
      .string()
      .describe("搜索关键词，匹配商品名称或描述，如「婚礼」「蝴蝶」「优雅」"),
    material: z
      .string()
      .optional()
      .describe("材质名称，如「珍珠」「纯银」「锆石」「贝母」"),
    maxPrice: z
      .number()
      .optional()
      .describe("价格上限（单位：分），如 30000 = 300 元"),
  }),
  execute: async ({ query, material, maxPrice }) => {
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          },
          material ? { material: { name: { contains: material } } } : {},
          maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
        ],
      },
      include: { material: true },
      take: 6,
      orderBy: { price: "asc" },
    });

    if (products.length === 0) {
      return { found: false, products: [] as never[] };
    }

    return {
      found: true,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        materialName: p.material.name,
      })),
    };
  },
});

export const getProductDetails = tool({
  description: "获取单个商品的完整详情，包括图片、描述、材质、价格。",
  parameters: z.object({
    productId: z.string().describe("商品 ID"),
  }),
  execute: async ({ productId }) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { material: true },
    });

    if (!product) {
      return { found: false, product: null };
    }

    return {
      found: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        materialName: product.material.name,
      },
    };
  },
});
