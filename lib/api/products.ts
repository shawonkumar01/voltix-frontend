import api from "./client";

export const productsApi = {
    getAll: (params?: Record<string, unknown>) => api.get("/products", { params }),
    getOne: (id: string) => api.get(`/products/${id}`),
    advancedSearch: (params?: Record<string, unknown>) =>
        api.get("/products/search/advanced", { params }),
    create: (data: unknown) => api.post("/products", data),
    update: (id: string, data: unknown) => api.patch(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
};