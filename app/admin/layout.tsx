"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, Package, ShoppingCart, Users, FolderTree,
    Star, Settings, LogOut, Zap, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/brands", icon: Zap, label: "Brands" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/categories", icon: FolderTree, label: "Categories" },
    { href: "/admin/reviews", icon: Star, label: "Reviews" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Wait for store to hydrate from localStorage
        const timeout = setTimeout(() => setIsHydrated(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        
        if (!user) {
            toast.error("Please sign in");
            router.push("/login");
        } else if (!isAdmin()) {
            toast.error("Access denied. Admin only.");
            router.push("/");
        }
    }, [user, isAdmin, router, isHydrated]);

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        clearAuth();
        router.push("/");
        toast.success("Logged out successfully");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111] border-r border-white/[0.06] fixed h-full z-50">
                {/* Logo - Click to go to main website */}
                <div className="p-6 border-b border-white/[0.06]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-400/20 group-hover:shadow-cyan-400/40 transition-all">
                            <Zap className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Voltix
                            </h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Admin Panel</p>
                        </div>
                    </Link>
                    <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Click logo to visit store
                    </p>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                                    isActive
                                        ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                                        : "text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent"
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white"}`} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all group"
                    >
                        <LogOut className="w-5 h-5 text-white/40 group-hover:text-red-400" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Bar */}
                <header className="h-16 bg-[#111]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-white/40">
                            Welcome back, <span className="text-white">{user?.firstName || "Admin"}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/[0.1] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{user?.firstName?.[0] || "A"}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
