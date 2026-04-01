import api from "./client";

export const adminApi = {
    getDashboard: () => api.get("/admin/dashboard"),
    getUsers: () => api.get("/admin/users"),
    toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
    makeAdmin: (id: string) => api.patch(`/admin/users/${id}/make-admin`),
    getProducts: () => api.get("/admin/products"),
    toggleProductStatus: (id: string) => api.patch(`/admin/products/${id}/toggle-status`),
    getOrders: () => api.get("/admin/orders"),
    getOrderDetails: (id: string) => api.get(`/admin/orders/${id}`),
    getCategories: () => api.get("/admin/categories"),
    getReviews: () => api.get("/admin/reviews"),
    deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
    getAnalytics: () => api.get("/analytics"),
    getDashboardAnalytics: () => api.get("/analytics/dashboard"),
};