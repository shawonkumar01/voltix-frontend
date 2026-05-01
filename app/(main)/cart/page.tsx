"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, ArrowRight, Trash2, Zap,
    ShoppingBag, Shield, Truck, RotateCcw, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cartApi } from "@/lib/api/cart";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import CartItem from "@/components/cart/cartItem";

interface CartItemType {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: number;
        discount?: number;
        images?: string[];
        brand?: string;
        stock?: number;
    };
}

export default function CartPage() {
    const router = useRouter();
    const { user, token } = useAuthStore();
    const queryClient = useQueryClient();
    const { syncFromAPI, clearCart } = useCartStore();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Redirect if user is not authenticated
    useEffect(() => {
        // Small delay to allow zustand to hydrate from localStorage
        const timer = setTimeout(() => {
            setIsCheckingAuth(false);
            if (!user && !token) {
                toast.error("Please sign in to view your cart");
                router.push("/login");
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [user, token, router]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const res = await cartApi.get();
            return res.data;
        },
        enabled: !!user && !isCheckingAuth,
        staleTime: 0, // Always consider data stale
        refetchOnWindowFocus: true, // Refetch when window gains focus
        refetchOnMount: true, // Always refetch when component mounts
    });

    const items: CartItemType[] = data?.items || data?.cart?.items || [];

    // Sync local cart store with server cart using new syncFromAPI method
    useEffect(() => {
        if (data && !isLoading && !isCheckingAuth) {
            if (items.length === 0) {
                clearCart();
            } else {
                syncFromAPI({ items });
            }
        }
    }, [data, items, isLoading, clearCart, syncFromAPI, isCheckingAuth]);

    const clearMutation = useMutation({
        mutationFn: () => cartApi.clear(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            clearCart();
            toast.success("Cart cleared");
        },
        onError: () => toast.error("Failed to clear cart"),
    });

    // Price calculations
    const subtotal = items.reduce((acc, item) => {
        const price = item.product.discount
            ? Number(item.product.price) * (1 - Number(item.product.discount) / 100)
            : Number(item.product.price);
        return acc + price * item.quantity;
    }, 0);
    const shipping = subtotal >= 99 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

    // ── Loading ──
    if (isLoading || isCheckingAuth) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">{isCheckingAuth ? 'Checking authentication...' : 'Loading cart...'}</p>
                </div>
            </div>
        );
    }

    // ── Empty cart ──
    if (!isLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/4 rounded-full blur-[100px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center relative z-10 px-4"
                >
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-9 h-9 text-white/15" />
                    </div>
                    <h2
                        className="text-2xl font-black text-white mb-2 tracking-tight"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Your cart is empty
                    </h2>
                    <p className="text-sm text-white/35 mb-8 max-w-xs mx-auto">
                        Looks like you haven&apos;t added anything yet. Start shopping!
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group"
                    >
                        <Zap className="w-4 h-4 fill-black" />
                        Browse products
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </motion.div>
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
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1
                            className="text-2xl font-black text-white tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Your Cart
                            <span className="ml-2 text-base font-bold text-white/25">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                        </h1>
                        <p className="text-xs text-white/30 mt-0.5">Review your items before checkout</p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => clearMutation.mutate()}
                            disabled={clearMutation.isPending}
                            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-red-400 transition-colors"
                        >
                            {clearMutation.isPending
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />
                            }
                            Clear cart
                        </button>
                    )}
                </motion.div>

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-white/30 text-sm">Failed to load cart. Is your backend running?</p>
                    </div>
                )}

                {/* Main layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Cart Items ── */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                        <AnimatePresence initial={false}>
                            {items.map((item, i) => (
                                <CartItem key={item.id} item={item} index={i} />
                            ))}
                        </AnimatePresence>

                        {/* Continue shopping */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="pt-2"
                        >
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors group"
                            >
                                <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                                Continue shopping
                            </Link>
                        </motion.div>
                    </div>

                    {/* ── Order Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 sticky top-24">
                            <h2
                                className="text-sm font-black text-white mb-5"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                Order Summary
                            </h2>

                            {/* Line items */}
                            <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-white/[0.06]">
                                <SummaryRow label={`Subtotal (${totalItems} items)`} value={`$${subtotal.toFixed(2)}`} />
                                <SummaryRow
                                    label="Shipping"
                                    value={shipping === 0 ? "Free ✓" : `$${shipping.toFixed(2)}`}
                                    highlight={shipping === 0}
                                />
                                <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} muted />
                            </div>

                            {/* Free shipping nudge */}
                            {subtotal < 99 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-5 p-3 rounded-xl bg-amber-400/[0.07] border border-amber-400/[0.15]"
                                >
                                    <p className="text-xs text-amber-400/80 font-medium">
                                        Add <span className="font-black">${(99 - subtotal).toFixed(2)}</span> more for free shipping!
                                    </p>
                                    <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400/50 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((subtotal / 99) * 100, 100)}%` }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Total */}
                            <div className="flex items-center justify-between mb-6 pt-1">
                                <span className="text-base font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Total
                                </span>
                                <span className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            {/* Checkout CTA */}
                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group mb-4"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>

                            {/* Trust badges */}
                            <div className="flex flex-col gap-2">
                                {[
                                    { icon: Shield, text: "Secure & encrypted checkout" },
                                    { icon: Truck, text: "Free shipping on orders $99+" },
                                    { icon: RotateCcw, text: "30-day hassle-free returns" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                                        <span className="text-[11px] text-white/25">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    highlight,
    muted,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-xs ${muted ? "text-white/25" : "text-white/45"}`}>{label}</span>
            <span
                className={`text-xs font-semibold ${highlight ? "text-emerald-400" : muted ? "text-white/30" : "text-white/70"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}