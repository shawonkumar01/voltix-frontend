import api from "./client";

export const cartApi = {
    get: () => api.get("/cart"),
    add: (productId: string, quantity: number) =>
        api.post("/cart", { productId, quantity }, { 
            skipAuthRedirect: true 
        } as any),
    update: (itemId: string, quantity: number) =>
        api.patch(`/cart/${itemId}`, { quantity }, { 
            skipAuthRedirect: true 
        } as any),
    remove: (itemId: string) =>
        api.delete(`/cart/${itemId}`, { 
            skipAuthRedirect: true 
        } as any),
    clear: () => api.delete("/cart/clear", { 
        skipAuthRedirect: true 
        } as any),
};