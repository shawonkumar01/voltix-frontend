import api from "./client";

export const authApi = {
    register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
        api.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data),
    logout: () => api.post("/auth/logout"),
    getProfile: () => api.get("/auth/profile"),
};