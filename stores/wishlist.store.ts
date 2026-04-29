import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        price: number;
        discount?: number;
        images?: string[];
        brand?: string;
        stock?: number;
    };
    createdAt: string;
}

interface WishlistStore {
    items: WishlistItem[];
    itemCount: number;
    setWishlist: (wishlist: { items: WishlistItem[] }) => void;
    addItem: (item: WishlistItem) => void;
    removeItem: (productId: string) => void;
    clearWishlist: () => void;
    syncFromAPI: (apiData: { items: WishlistItem[] }) => void;
    // Computed values
    getTotalItems: () => number;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            itemCount: 0,

            setWishlist: (wishlist) => {
                const itemCount = wishlist.items.length;
                set({ items: wishlist.items, itemCount });
            },

            // New method to sync from API - takes precedence over local data
            syncFromAPI: (apiData) => {
                const itemCount = apiData.items.length;
                set({ items: apiData.items, itemCount });
            },

            addItem: (item) => {
                const { items } = get();
                const existingItem = items.find((i) => i.product.id === item.product.id);
                
                if (!existingItem) {
                    // Add new item
                    const updatedItems = [...items, item];
                    set({ items: updatedItems, itemCount: updatedItems.length });
                }
            },

            removeItem: (productId) => {
                const { items } = get();
                const updatedItems = items.filter((item) => item.product.id !== productId);
                set({ items: updatedItems, itemCount: updatedItems.length });
            },

            clearWishlist: () => {
                set({ items: [], itemCount: 0 });
            },

            // Computed values
            getTotalItems: () => get().items.length,
            isInWishlist: (productId) => get().items.some((item) => item.product.id === productId),
        }),
        {
            name: "voltix_wishlist",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
