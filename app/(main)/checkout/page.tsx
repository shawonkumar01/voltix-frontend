"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    ShoppingBag, ArrowRight, Truck, Shield, CreditCard,
    MapPin, User, Phone, Mail, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cartApi } from "@/lib/api/cart";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { useAuthStore } from "@/stores/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
    shippingAddress: z.object({
        fullName: z.string().min(2, "Full name is required"),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        zipCode: z.string().min(5, "ZIP code is required"),
        country: z.string().min(2, "Country is required"),
        phone: z.string().min(10, "Phone number is required"),
    }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderCreated, setOrderCreated] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            shippingAddress: {
                fullName: user ? `${user.firstName} ${user.lastName}` : "",
                country: "United States",
            },
        },
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            toast.error("Please sign in to checkout");
            router.push("/login");
        }
    }, [user, router]);

    // Fetch cart
    const { data: cartData, isLoading: cartLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const res = await cartApi.get();
            return res.data;
        },
        enabled: !!user,
    });

    const items = cartData?.items || cartData?.cart?.items || [];

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            toast.error("Your cart is empty");
            router.push("/products");
        }
    }, [items, cartLoading, router]);

    // Price calculations
    const subtotal = items.reduce((acc: number, item: any) => {
        const price = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
        return acc + price * item.quantity;
    }, 0);
    const shipping = subtotal >= 99 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (data: CheckoutForm) =>
            ordersApi.create({
                items: items.map((item: any) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                shippingAddress: data.shippingAddress,
                total,
            }),
        onSuccess: (res) => {
            const orderId = res.data.id || res.data.order?.id;
            setOrderCreated(orderId);
            toast.success("Order created successfully");
        },
        onError: () => {
            toast.error("Failed to create order");
            setIsProcessing(false);
        },
    });

    // Process payment mutation
    const paymentMutation = useMutation({
        mutationFn: (orderId: string) => paymentsApi.createIntent(orderId),
        onSuccess: (res) => {
            // In a real app, you would redirect to Stripe checkout here
            // For now, we'll simulate success
            toast.success("Payment processed successfully");
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            router.push(`/account/orders`);
        },
        onError: () => {
            toast.error("Payment failed");
            setIsProcessing(false);
        },
    });

    const onSubmit = async (data: CheckoutForm) => {
        setIsProcessing(true);
        try {
            // Step 1: Create order
            await createOrderMutation.mutateAsync(data);
            
            // Step 2: Process payment (simplified - in real app, redirect to Stripe)
            if (orderCreated) {
                await paymentMutation.mutateAsync(orderCreated);
            }
        } catch (error) {
            setIsProcessing(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading checkout...</p>
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
                    className="mb-8"
                >
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Checkout
                    </h1>
                    <p className="text-xs text-white/30">Complete your order</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <motion.form
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Shipping Address */}
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-sm font-black text-white"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            Shipping Address
                                        </h2>
                                        <p className="text-[11px] text-white/30">Where should we send your order?</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            {...register("shippingAddress.fullName")}
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.fullName && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.fullName.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Address
                                        </label>
                                        <input
                                            {...register("shippingAddress.address")}
                                            type="text"
                                            placeholder="123 Main Street"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.address && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.address.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            City
                                        </label>
                                        <input
                                            {...register("shippingAddress.city")}
                                            type="text"
                                            placeholder="New York"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.city && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.city.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            State
                                        </label>
                                        <input
                                            {...register("shippingAddress.state")}
                                            type="text"
                                            placeholder="NY"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.state && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.state.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            {...register("shippingAddress.zipCode")}
                                            type="text"
                                            placeholder="10001"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.zipCode && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.zipCode.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Country
                                        </label>
                                        <input
                                            {...register("shippingAddress.country")}
                                            type="text"
                                            placeholder="United States"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.country && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.country.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Phone
                                        </label>
                                        <input
                                            {...register("shippingAddress.phone")}
                                            type="tel"
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress?.phone && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.phone.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-sm font-black text-white"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            Payment Method
                                        </h2>
                                        <p className="text-[11px] text-white/30">Secure payment with Stripe</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-cyan-400/[0.05] border border-cyan-400/20 flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Stripe Test Mode</p>
                                        <p className="text-[11px] text-white/40">No actual charges will be made</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        Place Order - ${total.toFixed(2)}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </div>

                    {/* Right: Order Summary */}
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

                            {/* Items */}
                            <div className="space-y-3 mb-5 pb-5 border-b border-white/[0.06] max-h-64 overflow-y-auto">
                                {items.map((item: any) => {
                                    const price = item.product.discount
                                        ? item.product.price * (1 - item.product.discount / 100)
                                        : item.product.price;
                                    return (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-16 h-16 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                                {item.product.images?.[0] ? (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-[10px] text-gray-500">Img</span>
                                                    </div>
                                                ) : (
                                                    <ShoppingBag className="w-5 h-5 text-white/[0.07]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white/80 truncate">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-[11px] text-white/30">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-bold text-white">${(price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-white/[0.06]">
                                <SummaryRow label={`Subtotal (${items.length} items)`} value={`$${subtotal.toFixed(2)}`} />
                                <SummaryRow
                                    label="Shipping"
                                    value={shipping === 0 ? "Free ✓" : `$${shipping.toFixed(2)}`}
                                    highlight={shipping === 0}
                                />
                                <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} muted />
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between mb-6 pt-1">
                                <span className="text-base font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Total
                                </span>
                                <span className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-col gap-2">
                                {[
                                    { icon: Shield, text: "Secure SSL encryption" },
                                    { icon: Truck, text: "Free shipping on orders $99+" },
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
                className={`text-xs font-semibold ${
                    highlight ? "text-emerald-400" : muted ? "text-white/30" : "text-white/70"
                }`}
            >
                {value}
            </span>
        </div>
    );
}
