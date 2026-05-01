"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((s) => s.setAuth);

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("message");

        if (error) {
            toast.error(error);
            router.push("/login");
            return;
        }

        if (token) {
            // Store the token and fetch user data
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        setAuth(data.user, token);
                        const displayName = data.user.firstName || data.user.email?.split('@')[0] || 'User';
                        toast.success(`Welcome, ${displayName}! ⚡`);
                        router.push(data.user.role === "admin" ? "/admin" : "/");
                    } else {
                        toast.error("Failed to authenticate");
                        router.push("/login");
                    }
                })
                .catch(() => {
                    toast.error("Failed to authenticate");
                    router.push("/login");
                });
        } else {
            toast.error("No token received");
            router.push("/login");
        }
    }, [searchParams, router, setAuth]);

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm text-white/40">Authenticating...</p>
            </div>
        </div>
    );
}
