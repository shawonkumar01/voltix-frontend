import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discount?: number;
    images?: string[];
    brand?: string;
    stock?: number;
  };
}

interface CartStore {
  items: CartItem[];
  itemCount: number;
  total: number;
  setCart: (cart: { items: CartItem[] }) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  increment: () => void;
  decrement: () => void;
  setItemCount: (count: number) => void;
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      setCart: (cart) => {
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        set({ items: cart.items, itemCount, total });
      },

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);
        
        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          get().setCart({ items: updatedItems });
        } else {
          // Add new item
          const updatedItems = [...items, item];
          get().setCart({ items: updatedItems });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        const updatedItems = items.filter((item) => item.id !== itemId);
        get().setCart({ items: updatedItems });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        get().setCart({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },

      increment: () => set((s) => ({ itemCount: s.itemCount + 1 })),
      decrement: () => set((s) => ({ itemCount: Math.max(0, s.itemCount - 1) })),
      setItemCount: (count) => set({ itemCount: count }),

      // Computed values
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
      isInCart: (productId) => get().items.some((item) => item.id === productId),
      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    { name: "voltix_cart" }
  )
);