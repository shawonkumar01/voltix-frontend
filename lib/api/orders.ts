import api from "./client";

export const ordersApi = {
    create: (data: unknown) => api.post("/orders", data),
    getMy: () => api.get("/orders/my"),
    getMyOne: (id: string) => api.get(`/orders/my/${id}`),
    cancel: (id: string, reason: string) =>
        api.patch(`/orders/my/${id}/cancel`, { reason }),
    getInvoice: (id: string) =>
        api.get(`/orders/my/${id}/invoice`, { responseType: "blob" }),
};