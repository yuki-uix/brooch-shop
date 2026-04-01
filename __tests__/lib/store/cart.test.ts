import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/lib/store/cart";

const mockItem = {
  productId: "prod-1",
  productName: "测试胸针",
  price: 100,
  imageUrl: "https://example.com/img.jpg",
  materialName: "合金",
};

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("adds a new standard item with quantity 1", () => {
      useCartStore.getState().addItem(mockItem);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        ...mockItem,
        quantity: 1,
        type: "standard",
      });
    });

    it("increments quantity when adding a duplicate standard item", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.addItem(mockItem);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("adds distinct standard items as separate entries", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.addItem({ ...mockItem, productId: "prod-2", productName: "另一件" });
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("addCustomItem", () => {
    const customPayload = {
      customRequestId: "req-001",
      productName: "自定义蝴蝶胸针",
      price: 260,
      imageUrl: "https://example.com/custom.jpg",
      snapshot: { quoteAmountYuan: 260 },
    };

    it("adds a new custom item and returns true", () => {
      const result = useCartStore.getState().addCustomItem(customPayload);
      expect(result).toBe(true);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe("custom");
      expect(items[0].productId).toBe("custom-req-001");
    });

    it("increments quantity for same customRequestId and returns false", () => {
      const store = useCartStore.getState();
      store.addCustomItem(customPayload);
      const result = store.addCustomItem(customPayload);
      expect(result).toBe(false);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("adds different customRequestIds as separate entries", () => {
      const store = useCartStore.getState();
      store.addCustomItem(customPayload);
      store.addCustomItem({ ...customPayload, customRequestId: "req-002" });
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes the correct item by productId", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.addItem({ ...mockItem, productId: "prod-2", productName: "另一件" });
      store.removeItem("prod-1");
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("prod-2");
    });
  });

  describe("updateQuantity", () => {
    it("updates item quantity to the specified value", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.updateQuantity("prod-1", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity is set to 0", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.updateQuantity("prod-1", 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.updateQuantity("prod-1", -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("totalItems", () => {
    it("sums quantities across all items", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem);
      store.addItem(mockItem); // quantity becomes 2
      store.addItem({ ...mockItem, productId: "prod-2", productName: "另一件" });
      expect(store.totalItems()).toBe(3);
    });

    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().totalItems()).toBe(0);
    });
  });

  describe("totalPrice", () => {
    it("calculates total price correctly across mixed quantities", () => {
      const store = useCartStore.getState();
      store.addItem(mockItem); // 100 * 1
      store.addItem(mockItem); // 100 * 2 after merge
      store.addItem({ ...mockItem, productId: "prod-2", productName: "另一件", price: 50 }); // 50 * 1
      expect(store.totalPrice()).toBe(250);
    });

    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().totalPrice()).toBe(0);
    });
  });
});
