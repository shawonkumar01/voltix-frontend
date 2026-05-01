"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Package, ArrowLeft, Loader2, Calendar, MapPin, CreditCard,
    Truck, CheckCircle2, Clock, XCircle, FileText, Download,
    User, Phone, Mail, Building2, Home
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { ordersApi } from "@/lib/api/orders";

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const { user } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for store to hydrate from localStorage
    useEffect(() => {
        const timeout = setTimeout(() => setIsHydrated(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    // Redirect if not logged in (only after hydration)
    useEffect(() => {
        if (!isHydrated) return;
        if (!user) {
            toast.error("Please sign in to view order details");
            router.push("/login");
        }
    }, [user, router, isHydrated]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            const res = await ordersApi.getMyOne(orderId);
            return res.data;
        },
        enabled: !!user && !!orderId,
    });

    const order = data?.order || data;

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/30 text-sm mb-4">Failed to load order details</p>
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.10] rounded-lg text-xs text-white/60 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case "shipped":
                return <Truck className="w-5 h-5 text-cyan-400" />;
            case "processing":
                return <Package className="w-5 h-5 text-blue-400" />;
            case "cancelled":
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-amber-400" />;
        }
    };

    const getPaymentStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case "failed":
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Clock className="w-4 h-4 text-amber-400" />;
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            toast.info("Generating invoice...");
            const response = await ordersApi.getInvoice(orderId);
            
            // Create blob from response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${order.orderNumber || orderId.slice(-8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            console.error("Failed to download invoice:", error);
            toast.error("Failed to download invoice. Please try again.");
        }
    };

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
                        href="/account/orders"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Orders
                    </Link>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1
                                className="text-2xl font-black text-white tracking-tight mb-2"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                Order #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-xs text-white/30">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/[0.08]">
                                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Package className="w-4 h-4 text-cyan-400" />
                                    Order Items
                                </h2>
                            </div>
                            <div className="divide-y divide-white/[0.06]">
                                {order.items?.map((item: any, index: number) => (
                                    <div key={index} className="p-5 flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.productImage || item.product?.images?.[0] ? (
                                                <img
                                                    src={item.productImage || item.product?.images?.[0]}
                                                    alt={item.productName || item.product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-white/[0.1]" />
                                            )}
                                        </div>
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white truncate">
                                                {item.productName || item.product?.name || "Product"}
                                            </h3>
                                            {item.productBrand || item.product?.brand && (
                                                <p className="text-xs text-white/40 mt-0.5">
                                                    {item.productBrand || item.product?.brand}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs text-white/50">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="text-xs text-white/50">
                                                    ${Number(item.price || item.product?.price || 0).toFixed(2)} each
                                                </span>
                                            </div>
                                        </div>
                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-white">
                                                ${(Number(item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Order Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
                        >
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
                                <Truck className="w-4 h-4 text-cyan-400" />
                                Order Status
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                    {getStatusIcon(order.status)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white capitalize">
                                        {order.status}
                                    </p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        {order.status === "delivered"
                                            ? "Your order has been delivered"
                                            : order.status === "shipped"
                                            ? "Your order is on the way"
                                            : order.status === "processing"
                                            ? "We're preparing your order"
                                            : order.status === "cancelled"
                                            ? "This order has been cancelled"
                                            : "Waiting for confirmation"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
                        >
                            <h2 className="text-sm font-semibold text-white mb-4">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-white/60">
                                    <span>Subtotal</span>
                                    <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Tax</span>
                                    <span>${Number(order.tax || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Shipping</span>
                                    <span>${Number(order.shipping || 0).toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Discount</span>
                                        <span>-${Number(order.discount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-white/[0.08] flex justify-between">
                                    <span className="font-semibold text-white">Total</span>
                                    <span className="font-black text-white text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                                        ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
                        >
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                                <CreditCard className="w-4 h-4 text-cyan-400" />
                                Payment
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    {getPaymentStatusIcon(order.paymentStatus)}
                                    <div>
                                        <p className="text-sm text-white capitalize">
                                            {order.paymentMethod?.replace(/_/g, " ") || "Unknown"}
                                        </p>
                                        <p className="text-xs text-white/40 capitalize">
                                            {order.paymentStatus || "Pending"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
                        >
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                                <MapPin className="w-4 h-4 text-cyan-400" />
                                Shipping Address
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-white font-medium">
                                    {order.shippingFirstName} {order.shippingLastName}
                                </p>
                                <p className="text-white/60">{order.shippingAddress}</p>
                                <p className="text-white/60">
                                    {order.shippingCity}, {order.shippingState} {order.shippingZip}
                                </p>
                                <p className="text-white/60">{order.shippingCountry}</p>
                                {order.shippingPhone && (
                                    <p className="text-white/60 flex items-center gap-2 mt-3">
                                        <Phone className="w-3.5 h-3.5" />
                                        {order.shippingPhone}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col gap-3"
                        >
                            <button
                                onClick={handleDownloadInvoice}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.10] transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Download Invoice
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
        pending: { color: "bg-amber-400/10 border-amber-400/20 text-amber-400", label: "Pending", icon: Clock },
        processing: { color: "bg-blue-400/10 border-blue-400/20 text-blue-400", label: "Processing", icon: Package },
        shipped: { color: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400", label: "Shipped", icon: Truck },
        delivered: { color: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400", label: "Delivered", icon: CheckCircle2 },
        cancelled: { color: "bg-red-400/10 border-red-400/20 text-red-400", label: "Cancelled", icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}
