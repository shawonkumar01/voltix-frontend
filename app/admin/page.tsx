"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Package, ShoppingCart, Users, DollarSign, TrendingUp,
    ArrowUpRight, Activity, CreditCard, Box, Zap
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";

export default function AdminDashboard() {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: async () => {
            const res = await adminApi.getDashboard();
            return res.data;
        },
        staleTime: 0,
        retry: 2,
    });

    const { data: ordersData } = useQuery({
        queryKey: ["admin-orders-all"],
        queryFn: async () => {
            const res = await adminApi.getOrders();
            return res.data;
        },
        staleTime: 0,
        retry: 2,
    });

    const stats = statsData || {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalProducts: 0,
    };

    const recentOrders = Array.isArray(ordersData) ? ordersData.slice(0, 5) : ordersData?.orders?.slice(0, 5) || [];

    return (
        <div>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-black text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Dashboard Overview
                </h1>
                <p className="text-sm text-white/40">Welcome to your admin control center</p>
            </motion.div>

            {/* Stats Grid - Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${(stats.totalRevenue || 0).toFixed(2)}`}
                    change="+12.5%"
                    icon={DollarSign}
                    gradient="from-emerald-500/20 to-emerald-600/10"
                    iconColor="text-emerald-400"
                    borderColor="border-emerald-400/20"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    change="+8.2%"
                    icon={ShoppingCart}
                    gradient="from-cyan-500/20 to-cyan-600/10"
                    iconColor="text-cyan-400"
                    borderColor="border-cyan-400/20"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change="+24.1%"
                    icon={Users}
                    gradient="from-violet-500/20 to-violet-600/10"
                    iconColor="text-violet-400"
                    borderColor="border-violet-400/20"
                />
                <StatCard
                    title="Products"
                    value={stats.totalProducts}
                    change="+3.4%"
                    icon={Package}
                    gradient="from-amber-500/20 to-amber-600/10"
                    iconColor="text-amber-400"
                    borderColor="border-amber-400/20"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-2 bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/[0.06]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                                <p className="text-xs text-white/40 mt-1">Latest customer orders</p>
                            </div>
                            <Link
                                href="/admin/orders"
                                className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                View all
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                {order.shippingFirstName} {order.shippingLastName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">
                                            ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            order.status === 'delivered' ? 'bg-emerald-400/10 text-emerald-400' :
                                            order.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                                            order.status === 'cancelled' ? 'bg-red-400/10 text-red-400' :
                                            'bg-cyan-400/10 text-cyan-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Box className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                <p className="text-white/40 text-sm">No orders yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats / Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Activity Card */}
                    <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/[0.1] flex items-center justify-center">
                                <Activity className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Activity</h3>
                                <p className="text-xs text-white/40">System status</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ActivityItem label="Server Status" value="Online" status="online" />
                            <ActivityItem label="Database" value="Connected" status="online" />
                            <ActivityItem label="API Health" value="Healthy" status="online" />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <QuickLink href="/admin/products/new" icon={Package} label="Add Product" color="cyan" />
                            <QuickLink href="/admin/brands" icon={Zap} label="Manage Brands" color="amber" />
                            <QuickLink href="/admin/orders" icon={ShoppingCart} label="View Orders" color="emerald" />
                            <QuickLink href="/admin/users" icon={Users} label="Manage Users" color="violet" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Modern Stat Card with Gradient
function StatCard({
    title,
    value,
    change,
    icon: Icon,
    gradient,
    iconColor,
    borderColor,
}: {
    title: string;
    value: string | number;
    change: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
    borderColor: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden bg-[#111] border ${borderColor} rounded-2xl p-6 group hover:border-opacity-40 transition-all`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-[#1a1a1a] border ${borderColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                        {change}
                    </span>
                </div>
                <p className="text-sm text-white/50 mb-1">{title}</p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {value}
                </p>
            </div>
        </motion.div>
    );
}

// Activity Item
function ActivityItem({ label, value, status }: { label: string; value: string; status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{label}</span>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white">{value}</span>
            </div>
        </div>
    );
}

// Quick Link
function QuickLink({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
    const colors: Record<string, string> = {
        cyan: "hover:bg-cyan-400/10 hover:border-cyan-400/30",
        emerald: "hover:bg-emerald-400/10 hover:border-emerald-400/30",
        violet: "hover:bg-violet-400/10 hover:border-violet-400/30",
        amber: "hover:bg-amber-400/10 hover:border-amber-400/30",
    };

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] ${colors[color]} transition-all group`}
        >
            <Icon className="w-5 h-5 text-white/60 group-hover:text-white" />
            <span className="text-sm text-white/80 group-hover:text-white">{label}</span>
            <ArrowUpRight className="w-4 h-4 text-white/40 ml-auto group-hover:text-white" />
        </Link>
    );
}
