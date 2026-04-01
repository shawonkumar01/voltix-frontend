import api from "./client";

export const cartApi = {
    get: () => api.get("/cart"),
    add: (productId: string, quantity: number) =>
        api.post("/cart", { productId, quantity }),
    update: (itemId: string, quantity: number) =>
        api.patch(`/cart/${itemId}`, { quantity }),
    remove: (itemId: string) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete("/cart/clear"),
};