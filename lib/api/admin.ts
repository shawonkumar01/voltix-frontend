import api from "./client";

export const adminApi = {
    getDashboard: () => api.get("/admin/dashboard"),
    getUsers: () => api.get("/admin/users"),
    toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
    makeAdmin: (id: string) => api.patch(`/admin/users/${id}/make-admin`),
    getProducts: () => api.get("/admin/products"),
    toggleProductStatus: (id: string) => api.patch(`/admin/products/${id}/toggle-status`),
    createProduct: (data: any) => api.post("/admin/products", data),
    updateProduct: (id: string, data: any) => api.patch(`/admin/products/${id}`, data),
    deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
    getOrders: () => api.get("/admin/orders"),
    getOrderDetails: (id: string) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
    downloadInvoice: (id: string) => api.get(`/admin/orders/${id}/invoice`, { responseType: "blob" }),
    getCategories: () => api.get("/admin/categories"),
    createCategory: (data: { name: string; description?: string; image?: string }) =>
        api.post("/admin/categories", data),
    updateCategory: (id: string, data: { name?: string; description?: string; image?: string }) =>
        api.patch(`/admin/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
    getReviews: () => api.get("/admin/reviews"),
    deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
    getAnalytics: () => api.get("/analytics"),
    getDashboardAnalytics: () => api.get("/analytics/dashboard"),
};