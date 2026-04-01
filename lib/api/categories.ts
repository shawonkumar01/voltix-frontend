import api from "./client";

export const categoriesApi = {
    getAll: () => api.get("/categories"),
    getOne: (id: string) => api.get(`/categories/${id}`),
    create: (data: unknown) => api.post("/categories", data),
    update: (id: string, data: unknown) => api.patch(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};