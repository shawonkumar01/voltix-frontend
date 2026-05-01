import api from "./client";

export const paymentsApi = {
  createIntent: (data: { orderId: string; paymentMethod: string }) => 
    api.post("/payments/create-intent", data),
  confirm: (orderId: string) => api.post(`/payments/confirm/${orderId}`),
  getStatus: (orderId: string) => api.get(`/payments/status/${orderId}`),
};