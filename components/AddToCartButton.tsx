"use client";

import { useCartStore } from "@/lib/store/cart";
import { toast } from "@/components/Toast";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  materialName: string;
}

export function AddToCartButton({
  productId,
  productName,
  price,
  imageUrl,
  materialName,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleClick = () => {
    addItem({ productId, productName, price, imageUrl, materialName });
    toast(`已加入购物车: ${productName}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-sm bg-accent py-3 text-base font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
    >
      加入购物车
    </button>
  );
}
