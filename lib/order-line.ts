import type { OrderLine } from "@prisma/client";
import type { CartItem, CustomLineSnapshot } from "@/lib/store/cart";

export function orderLineToCartItem(line: OrderLine): CartItem {
  const snapshot = line.snapshotData as CustomLineSnapshot | null | undefined;
  return {
    productId:
      line.productId ??
      (line.customRequestId ? `custom-${line.customRequestId}` : line.id),
    productName: line.productName,
    price: line.unitPrice,
    imageUrl: line.imageUrl,
    materialName: line.materialName,
    quantity: line.quantity,
    type: line.type === "custom" ? "custom" : "standard",
    customRequestId: line.customRequestId ?? undefined,
    snapshot: snapshot ?? undefined,
  };
}
