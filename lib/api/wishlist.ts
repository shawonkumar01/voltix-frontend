import api from "./client";

export const wishlistApi = {
    get: () => api.get("/wishlist"),
    add: (productId: string) => api.post("/wishlist", { productId }),
    removeByProduct: (productId: string) => api.delete(`/wishlist/product/${productId}`),
    check: (productId: string) => api.get(`/wishlist/check/${productId}`),
    clear: () => api.delete("/wishlist/clear"),
};