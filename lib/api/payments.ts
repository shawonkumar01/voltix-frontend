import api from "./client";

export const paymentsApi = {
  createIntent: (orderId: string) => api.post("/payments/create-intent", { orderId }),
  confirm: (orderId: string) => api.post(`/payments/confirm/${orderId}`),
  getStatus: (orderId: string) => api.get(`/payments/status/${orderId}`),
};