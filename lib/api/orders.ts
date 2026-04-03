import api from "./client";
import { Order } from "@/types";

export const ordersApi = {
    create: (data: Partial<Order>) => api.post("/orders", data),
    getMy: () => api.get("/orders/my"),
    getMyOne: (id: string) => api.get(`/orders/my/${id}`),
    cancel: (id: string, reason: string) =>
        api.patch(`/orders/my/${id}/cancel`, { reason }),
    getInvoice: (id: string) =>
        api.get(`/orders/my/${id}/invoice`, { responseType: "blob" }),
};