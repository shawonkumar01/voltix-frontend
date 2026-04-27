import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                localStorage.setItem("voltix_token", token);
                // Clear local cart when logging in
                localStorage.removeItem("voltix_cart");
                set({ user, token });
            },
            clearAuth: () => {
                localStorage.removeItem("voltix_token");
                // Clear local cart when logging out
                localStorage.removeItem("voltix_cart");
                set({ user: null, token: null });
            },
            isAdmin: () => get().user?.role === "admin",
        }),
        { name: "voltix_auth" }
    )
);