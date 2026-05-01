"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [orderDetails, setOrderDetails] = useState<any>(null);

    const paymentIntentId = searchParams.get("payment_intent");
    const paymentStatus = searchParams.get("payment_intent_status");

    useEffect(() => {
        if (!paymentIntentId) {
            // COD order or direct navigation
            setIsVerifying(false);
            return;
        }

        // Verify Stripe payment
        const verifyPayment = async () => {
            try {
                // In a real app, you'd verify the payment with your backend
                // For now, we'll simulate verification
                if (paymentStatus === "succeeded") {
                    toast.success("Payment successful!");
                } else if (paymentStatus === "processing") {
                    toast.info("Payment is processing...");
                } else {
                    toast.error("Payment failed");
                }
            } catch (error) {
                console.error("Payment verification error:", error);
                toast.error("Failed to verify payment");
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [paymentIntentId, paymentStatus]);

    const { data: ordersData } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await ordersApi.getMy();
            return res.data;
        },
        enabled: !isVerifying,
    });

    const orders = ordersData?.orders || ordersData || [];
    const latestOrder = orders[0];

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-500/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-500/3 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="w-20 h-20 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>

                    {/* Success Message */}
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {isVerifying ? "Verifying Payment..." : "Order Confirmed!"}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-white/40 mb-8"
                    >
                        {isVerifying 
                            ? "Please wait while we verify your payment..."
                            : paymentStatus === "succeeded"
                                ? "Your payment was successful and your order has been confirmed."
                                : paymentStatus === "cash_on_delivery"
                                    ? "Your order has been placed successfully. Pay on delivery."
                                    : "Your order has been confirmed."
                        }
                    </motion.p>

                    {/* Order Details */}
                    {!isVerifying && latestOrder && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-sm font-semibold text-white">Order Details</h2>
                            </div>
                            
                            <div className="space-y-3 text-left">
                                <div className="flex justify-between">
                                    <span className="text-xs text-white/40">Order Number</span>
                                    <span className="text-xs font-semibold text-white">
                                        {latestOrder.orderNumber || `VLT-${Date.now()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-white/40">Total Amount</span>
                                    <span className="text-xs font-semibold text-white">
                                        ${latestOrder.totalAmount?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-white/40">Payment Method</span>
                                    <span className="text-xs font-semibold text-white">
                                        {latestOrder.paymentMethod === "cash_on_delivery" 
                                            ? "Cash on Delivery"
                                            : "Credit/Debit Card"
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-white/40">Order Status</span>
                                    <span className="text-xs font-semibold text-emerald-400">
                                        {latestOrder.status === "confirmed" ? "Confirmed" : "Processing"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button
                            onClick={() => router.push("/account/orders")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all"
                        >
                            View Order
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.05] border border-white/[0.10] text-white text-sm font-medium rounded-xl hover:bg-white/[0.10] transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Continue Shopping
                        </button>
                    </motion.div>

                    {/* What's Next */}
                    {!isVerifying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-12 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]"
                        >
                            <h3 className="text-sm font-semibold text-white mb-3">What's Next?</h3>
                            <div className="space-y-2 text-left">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                                    <p className="text-xs text-white/40">
                                        You'll receive an order confirmation email shortly
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                                    <p className="text-xs text-white/40">
                                        We'll process your order within 24 hours
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                                    <p className="text-xs text-white/40">
                                        You'll receive tracking information once shipped
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
