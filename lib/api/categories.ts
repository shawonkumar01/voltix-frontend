import api from "./client";
import { Category } from "@/types";

export const categoriesApi = {
    getAll: () => api.get("/categories"),
    getOne: (id: string) => api.get(`/categories/${id}`),
    create: (data: Partial<Category>) => api.post("/categories", data),
    update: (id: string, data: Partial<Category>) => api.patch(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};