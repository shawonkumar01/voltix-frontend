import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
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
            login: async (email: string, password: string) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const { user, accessToken } = data;
                        get().setAuth(user, accessToken);
                        return true;
                    }
                    return false;
                } catch (error) {
                    return false;
                }
            },
            logout: () => {
                get().clearAuth();
            },
        }),
        {
            name: "voltix_auth",
            storage: createJSONStorage(() => localStorage),
        }
    )
);