import api from "./client";
import { Review } from "@/types";

export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  getFeatured: () => api.get("/reviews/featured"),
  create: (data: Partial<Review>) => api.post("/reviews", data),
  update: (id: string, data: Partial<Review>) => api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  markHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
  getMy: () => api.get("/reviews/my"),
  // Admin
  getAll: () => api.get("/reviews"),
  adminDelete: (id: string) => api.delete(`/reviews/admin/${id}`),
  toggleFeatured: (id: string) => api.patch(`/reviews/admin/${id}/featured`),
};