import api from "./client";

export const brandsApi = {
  getAll: () => api.get("/brands"),
  
  getFeatured: () => api.get("/brands/featured"),
  
  getById: (id: string) => api.get(`/brands/${id}`),
  
  create: (data: {
    name: string;
    description?: string;
    logo?: string;
    isFeatured?: boolean;
    website?: string;
  }) => api.post("/brands", data),
  
  update: (id: string, data: {
    name?: string;
    description?: string;
    logo?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    website?: string;
  }) => api.patch(`/brands/${id}`, data),
  
  delete: (id: string) => api.delete(`/brands/${id}`),
};
