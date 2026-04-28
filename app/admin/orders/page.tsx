"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, Loader2, Search, Package,
    Truck, CheckCircle2, Clock, XCircle, Eye, Download, X, FileText, MapPin, Phone, Mail, CreditCard, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: Clock, label: "Pending" },
    confirmed: { color: "bg-blue-400/10 text-blue-400 border-blue-400/20", icon: CheckCircle2, label: "Confirmed" },
    processing: { color: "bg-purple-400/10 text-purple-400 border-purple-400/20", icon: Package, label: "Processing" },
    shipped: { color: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20", icon: Truck, label: "Shipped" },
    delivered: { color: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: CheckCircle2, label: "Delivered" },
    cancelled: { color: "bg-red-400/10 text-red-400 border-red-400/20", icon: XCircle, label: "Cancelled" },
};

export default function AdminOrdersPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const res = await adminApi.getOrders();
            return res.data;
        },
        staleTime: 0,
        retry: 2,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            adminApi.updateOrderStatus(id, status),
        onSuccess: () => {
            toast.success("Order status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update status");
        },
    });

    const orders = Array.isArray(data?.orders) ? data.orders : Array.isArray(data) ? data : [];
    const filteredOrders = orders.filter((o: any) => {
        const matchesSearch = o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id?.slice(-8).toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.shippingFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.shippingLastName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (orderId: string, newStatus: string) => {
        updateStatusMutation.mutate({ id: orderId, status: newStatus });
    };

    const handleViewOrder = async (order: any) => {
        try {
            const res = await adminApi.getOrderDetails(order.id);
            setSelectedOrder(res.data);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Failed to load order details");
        }
    };

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            const res = await adminApi.downloadInvoice(orderId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Invoice downloaded successfully");
        } catch (error) {
            toast.error("Failed to download invoice");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

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
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Order Management
                            </h1>
                            <p className="text-xs text-white/30 mt-1">View and manage customer orders</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white outline-none"
                            >
                                <option value="all" className="bg-[#080808]">All Status</option>
                                <option value="pending" className="bg-[#080808]">Pending</option>
                                <option value="confirmed" className="bg-[#080808]">Confirmed</option>
                                <option value="processing" className="bg-[#080808]">Processing</option>
                                <option value="shipped" className="bg-[#080808]">Shipped</option>
                                <option value="delivered" className="bg-[#080808]">Delivered</option>
                                <option value="cancelled" className="bg-[#080808]">Cancelled</option>
                            </select>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                <Search className="w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-48"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/[0.08]">
                                <tr className="text-left text-xs text-white/40">
                                    <th className="px-6 py-4 font-medium">Order</th>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Total</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-white/20" />
                                                </div>
                                                <p className="text-white/40 text-sm">No orders found</p>
                                                <p className="text-white/30 text-xs">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.map((order: any) => {
                                    const status = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={order.id} className="text-sm">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white font-medium">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                                                    <p className="text-white/40 text-xs">{order.items?.length || 0} items</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white">{order.shippingFirstName} {order.shippingLastName}</p>
                                                    <p className="text-white/40 text-xs">{order.shippingCity}, {order.shippingState}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white font-medium">${Number(order.totalAmount || order.total || 0).toFixed(2)}</p>
                                                <p className="text-white/40 text-xs capitalize">{order.paymentMethod?.replace(/_/g, " ")}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${status.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/40">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={order.status?.toLowerCase()}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="px-2 py-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-xs text-white outline-none hover:border-cyan-400/50 transition-colors disabled:opacity-50"
                                                    >
                                                        <option value="pending" className="bg-[#080808]">Pending</option>
                                                        <option value="confirmed" className="bg-[#080808]">Confirmed</option>
                                                        <option value="processing" className="bg-[#080808]">Processing</option>
                                                        <option value="shipped" className="bg-[#080808]">Shipped</option>
                                                        <option value="delivered" className="bg-[#080808]">Delivered</option>
                                                        <option value="cancelled" className="bg-[#080808]">Cancelled</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(order.id)}
                                                        className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                                                        title="Download Invoice"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >
                            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Order #{selectedOrder.orderNumber || selectedOrder.id.slice(-8).toUpperCase()}</h2>
                                        <p className="text-sm text-white/40">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Customer Info */}
                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-cyan-400" />
                                            Customer Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-white">{selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}</p>
                                            <p className="text-white/60 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" />
                                                {selectedOrder.user?.email || 'N/A'}
                                            </p>
                                            <p className="text-white/60 flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5" />
                                                {selectedOrder.shippingPhone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-cyan-400" />
                                            Shipping Address
                                        </h3>
                                        <div className="space-y-1 text-sm text-white/60">
                                            <p>{selectedOrder.shippingAddress}</p>
                                            <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}</p>
                                            <p>{selectedOrder.shippingCountry}</p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-cyan-400" />
                                            Order Items ({selectedOrder.items?.length || 0})
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center overflow-hidden">
                                                            {item.product?.image ? (
                                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-white/20" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-white">{item.product?.name || 'Product'}</p>
                                                            <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-white font-medium">${Number(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-cyan-400" />
                                            Order Summary
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-white/60">
                                                <span>Subtotal</span>
                                                <span>${Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-white/60">
                                                <span>Tax</span>
                                                <span>${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-white/60">
                                                <span>Shipping</span>
                                                <span>${Number(selectedOrder.shipping || 0).toFixed(2)}</span>
                                            </div>
                                            {selectedOrder.discount > 0 && (
                                                <div className="flex justify-between text-emerald-400">
                                                    <span>Discount</span>
                                                    <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/[0.08]">
                                                <span>Total</span>
                                                <span>${Number(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                        className="flex-1 px-4 py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Invoice
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
