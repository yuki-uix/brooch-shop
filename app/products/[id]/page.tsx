import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MaterialTag } from "@/components/MaterialTag";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButton } from "@/components/AddToCartButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return { title: "商品未找到" };

  return {
    title: `${product.name} — Brooch Shop`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { material: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-secondary">
        <Link href="/" className="hover:text-accent transition-colors">
          全部胸针
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/?material=${product.material.slug}`}
          className="hover:text-accent transition-colors"
        >
          {product.material.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-card border border-border bg-primary-pale">
          <ProductImage src={product.imageUrl} alt={product.name} size="detail" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-accent">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">材质</span>
            <MaterialTag name={product.material.name} size="md" />
          </div>

          <p className="text-text-secondary leading-relaxed">
            {product.description}
          </p>

          <div className="mt-auto pt-6">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              materialName={product.material.name}
            />
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          ← 继续选购
        </Link>
      </div>
    </div>
  );
}
