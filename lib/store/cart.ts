"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** AI 报价快照（元），下单时锁定 */
export interface CustomLineSnapshot {
  description?: string | null;
  imageUrl?: string | null;
  quoteAmountYuan: number;
  /** AI 生成的短标题快照（下单时锁定，可与用户改过的 productName 对照） */
  aiShortTitle?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  materialName: string;
  quantity: number;
  type: "standard" | "custom";
  customRequestId?: string;
  snapshot?: CustomLineSnapshot;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "type">) => void;
  /** 返回 true 表示新行，false 表示同一定制已存在、仅增加数量 */
  addCustomItem: (payload: {
    customRequestId: string;
    productName: string;
    price: number;
    imageUrl: string;
    snapshot: CustomLineSnapshot;
  }) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.type === "standard",
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.type === "standard"
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: 1, type: "standard" as const },
            ],
          };
        }),

      addCustomItem: (payload) => {
        const pid = `custom-${payload.customRequestId}`;
        const existing = get().items.find((i) => i.productId === pid);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === pid
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          }));
          return false;
        }
        set((state) => ({
          items: [
            ...state.items,
            {
              productId: pid,
              productName: payload.productName,
              price: payload.price,
              imageUrl: payload.imageUrl,
              materialName: "定制",
              quantity: 1,
              type: "custom" as const,
              customRequestId: payload.customRequestId,
              snapshot: payload.snapshot,
            },
          ],
        }));
        return true;
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "brooch-shop-cart",
    },
  ),
);
