"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Calendar, DollarSign, ArrowLeft, Loader2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { ordersApi } from "@/lib/api/orders";

export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            toast.error("Please sign in to view your orders");
            router.push("/login");
        }
    }, [user, router]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await ordersApi.getMy();
            return res.data;
        },
        enabled: !!user,
    });

    const orders = data?.orders || data || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading orders...</p>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Account
                    </Link>
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        My Orders
                    </h1>
                    <p className="text-xs text-white/30">View your order history and status</p>
                </motion.div>

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-white/30 text-sm">Failed to load orders. Is your backend running?</p>
                    </div>
                )}

                {/* Orders List */}
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: any, index: number) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                            >
                                <div className="p-5">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-white/30">Order #{order.id.slice(-8).toUpperCase()}</span>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <p className="text-[11px] text-white/25">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <p
                                            className="text-lg font-black text-white"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            ${order.total?.toFixed(2) || "0.00"}
                                        </p>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="flex gap-2 mb-4">
                                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                                            <div
                                                key={i}
                                                className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0"
                                            >
                                                {item.product?.images?.[0] ? (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-[8px] text-gray-500">Img</span>
                                                    </div>
                                                ) : (
                                                    <Package className="w-5 h-5 text-white/[0.07]" />
                                                )}
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] text-white/30">+{order.items.length - 3}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.10] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                            <Package className="w-9 h-9 text-white/15" />
                        </div>
                        <h2
                            className="text-xl font-black text-white mb-2"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            No orders yet
                        </h2>
                        <p className="text-sm text-white/35 mb-6">
                            When you place an order, it will appear here
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group"
                        >
                            Start Shopping
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        pending: { color: "bg-amber-400/10 border-amber-400/20 text-amber-400", label: "Pending" },
        processing: { color: "bg-blue-400/10 border-blue-400/20 text-blue-400", label: "Processing" },
        shipped: { color: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400", label: "Shipped" },
        delivered: { color: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400", label: "Delivered" },
        cancelled: { color: "bg-red-400/10 border-red-400/20 text-red-400", label: "Cancelled" },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest border ${config.color}`}>
            {config.label}
        </span>
    );
}
