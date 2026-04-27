"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    ArrowRight,
    Loader2,
    LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { adminApi } from "@/lib/api/admin";
import { ordersApi } from "@/lib/api/orders";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, clearAuth, isAdmin } = useAuthStore();

    // Redirect if not admin
    useEffect(() => {
        if (!user) {
            toast.error("Please sign in");
            router.push("/login");
        } else if (!isAdmin()) {
            toast.error("Access denied. Admin only.");
            router.push("/");
        }
    }, [user, isAdmin, router]);

    const { data: statsData, isLoading } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: async () => {
            const res = await adminApi.getDashboard();
            return res.data;
        },
        enabled: isAdmin(),
    });

    const { data: ordersData } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const res = await ordersApi.getMy();
            return res.data;
        },
        enabled: isAdmin(),
    });

    const stats = statsData || {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalProducts: 0,
    };

    const recentOrders = ordersData?.orders?.slice(0, 5) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-500/3 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1
                            className="text-2xl font-black text-white tracking-tight mb-2"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-white/30">Manage your store</p>
                    </div>
                    <button
                        onClick={() => {
                            clearAuth();
                            router.push("/");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-400/[0.05] border border-red-400/10 rounded-lg text-red-400 hover:bg-red-400/[0.10] transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={ShoppingCart}
                        color="cyan"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toFixed(2)}`}
                        icon={DollarSign}
                        color="emerald"
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Total Products"
                        value={stats.totalProducts}
                        icon={Package}
                        color="amber"
                    />
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2
                        className="text-sm font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionLink
                            href="/admin/products"
                            icon={Package}
                            label="Products"
                            description="Manage products"
                        />
                        <QuickActionLink
                            href="/admin/orders"
                            icon={ShoppingCart}
                            label="Orders"
                            description="View orders"
                        />
                        <QuickActionLink
                            href="/admin/users"
                            icon={Users}
                            label="Users"
                            description="Manage users"
                        />
                        <QuickActionLink
                            href="/admin/categories"
                            icon={LayoutDashboard}
                            label="Categories"
                            description="Manage categories"
                        />
                    </div>
                </motion.div>

                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className="text-sm font-black text-white"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Recent Orders
                        </h2>
                        <Link
                            href="/admin/orders"
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            View all
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl"
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-white">
                                            Order #{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-[11px] text-white/30">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-white">
                                            ${order.total?.toFixed(2) || "0.00"}
                                        </p>
                                        <p className="text-[10px] text-white/30 capitalize">{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-sm text-white/30">No orders yet</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: "cyan" | "emerald" | "blue" | "amber";
}) {
    const colors = {
        cyan: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400",
        emerald: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
        blue: "bg-blue-400/10 border-blue-400/20 text-blue-400",
        amber: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    };

    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors[color].split(" ")[0]} border ${colors[color].split(" ")[1]} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors[color].split(" ")[2]}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1">{title}</p>
            <p
                className="text-xl font-black text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
            >
                {value}
            </p>
        </div>
    );
}

function QuickActionLink({
    href,
    icon: Icon,
    label,
    description,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group block bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
        >
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-3 group-hover:bg-cyan-400/20 transition-colors">
                <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{label}</h3>
            <p className="text-[11px] text-white/30">{description}</p>
        </Link>
    );
}
