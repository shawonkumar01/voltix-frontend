import axios from "axios";
import { env } from "@/lib/validation";

const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("voltix_token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Only redirect on actual authentication errors, not all 401s
        if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
            localStorage.removeItem("voltix_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;