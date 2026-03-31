import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MaterialFilter } from "@/components/MaterialFilter";
import { ProductCard } from "@/components/ProductCard";

interface PageProps {
  searchParams: Promise<{ material?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { material } = await searchParams;

  const [materials, products] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: material ? { material: { slug: material } } : undefined,
      include: { material: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeMaterial = materials.find((m) => m.slug === material);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero section */}
      <section className="mb-10 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight mb-3">
          精美胸针，点亮你的风格
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          从珍珠到纯银，每一枚都是精心打造的艺术品。按材质探索，或
          <Link href="/custom" className="text-accent hover:underline font-medium">
            定制你的专属设计
          </Link>
          。
        </p>
      </section>

      {/* Material filter */}
      <section className="mb-8">
        <Suspense fallback={<div className="h-10" />}>
          <MaterialFilter materials={materials} />
        </Suspense>
      </section>

      {/* Results heading */}
      {activeMaterial && (
        <p className="mb-4 text-sm text-text-secondary">
          正在筛选：
          <span className="font-semibold text-primary">{activeMaterial.name}</span>
          <span className="ml-1">（{products.length} 件商品）</span>
        </p>
      )}

      {/* Product grid */}
      {products.length > 0 ? (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              material={product.material}
            />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">💎</span>
          <p className="text-text-secondary text-lg">
            暂无{activeMaterial ? `「${activeMaterial.name}」材质的` : ""}商品
          </p>
        </section>
      )}

      {/* Custom CTA */}
      <section className="mt-16 text-center">
        <div className="inline-block rounded-card bg-primary-pale px-8 py-6 border border-border">
          <p className="text-lg font-semibold mb-2">没找到心仪的款式？</p>
          <p className="text-text-secondary text-sm mb-4">
            上传图片或描述你的想法，AI 帮你评估可行性并报价
          </p>
          <Link
            href="/custom"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            💎 定制你的专属胸针
          </Link>
        </div>
      </section>
    </div>
  );
}
