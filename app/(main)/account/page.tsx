"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Package, Settings, LogOut, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";

export default function AccountPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin } = useAuthStore();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const { data: ordersData } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await ordersApi.getMy();
            return res.data;
        },
        enabled: !!user,
    });

    const orders = ordersData?.orders || ordersData || [];

    const handleLogout = () => {
        clearAuth();
        router.push("/");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-500/3 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        My Account
                    </h1>
                    <p className="text-xs text-white/30">Manage your account settings</p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-2xl font-black text-black">
                            {user.firstName[0]}
                            {user.lastName[0]}
                        </div>
                        <div>
                            <h2
                                className="text-lg font-black text-white"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-sm text-white/40">{user.email}</p>
                            {user.role === "admin" && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={User} label="Name" value={`${user.firstName} ${user.lastName}`} />
                        <InfoItem icon={Mail} label="Email" value={user.email} />
                        <InfoItem icon={Calendar} label="Member Since" value="January 2026" />
                        <InfoItem icon={Package} label="Total Orders" value={`${orders.length} orders`} />
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h3
                        className="text-sm font-black text-white mb-3"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Quick Actions
                    </h3>

                    {isAdmin() && (
                        <Link
                            href="/admin"
                            className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Admin Dashboard</p>
                                    <p className="text-[11px] text-white/30">Manage products, orders, and users</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    )}

                    <Link
                        href="/account/orders"
                        className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
                                <Package className="w-5 h-5 text-white/60" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">My Orders</p>
                                <p className="text-[11px] text-white/30">View order history and tracking</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <Link
                        href="/account/settings"
                        className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white/60" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Account Settings</p>
                                <p className="text-[11px] text-white/30">Update your profile and preferences</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-red-400/[0.05] border border-red-400/10 rounded-xl hover:bg-red-400/[0.10] hover:border-red-400/20 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-400">Sign Out</p>
                                <p className="text-[11px] text-white/30">Log out of your account</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-red-400/40 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <Icon className="w-4 h-4 text-white/20" />
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm text-white/70 truncate">{value}</p>
            </div>
        </div>
    );
}
