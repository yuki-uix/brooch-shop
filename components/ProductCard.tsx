"use client";

import Link from "next/link";
import { MaterialTag } from "./MaterialTag";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  material: { name: string; slug: string };
}

export function ProductCard({ id, name, price, imageUrl, material }: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-bg-card shadow-card transition-all hover:shadow-elevated hover:border-primary-light"
    >
      <div className="relative aspect-square overflow-hidden bg-primary-pale">
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
          <ProductImage src={imageUrl} alt={name} size="card" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {name}
        </h3>
        <MaterialTag name={material.name} />
        <p className="mt-auto text-lg font-bold text-accent">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
