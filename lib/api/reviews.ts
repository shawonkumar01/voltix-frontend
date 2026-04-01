import api from "./client";

export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: unknown) => api.post("/reviews", data),
  update: (id: string, data: unknown) => api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  markHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
  getMy: () => api.get("/reviews/my"),
};