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
    shippingFirstName: z.string().min(2, "First name is required"),
    shippingLastName: z.string().min(2, "Last name is required"),
    shippingAddress: z.string().min(5, "Address is required"),
    shippingCity: z.string().min(2, "City is required"),
    shippingState: z.string().min(2, "State is required"),
    shippingZip: z.string().min(5, "ZIP code is required"),
    shippingCountry: z.string().min(2, "Country is required"),
    shippingPhone: z.string().min(10, "Phone number is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderCreated, setOrderCreated] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cash_on_delivery'>('stripe');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            shippingFirstName: user?.firstName || "",
            shippingLastName: user?.lastName || "",
            shippingCountry: "United States",
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
        mutationFn: (data: CheckoutForm) => {
            const orderData: Partial<any> = {
                shippingFirstName: data.shippingFirstName,
                shippingLastName: data.shippingLastName,
                shippingAddress: data.shippingAddress,
                shippingCity: data.shippingCity,
                shippingState: data.shippingState,
                shippingZip: data.shippingZip,
                shippingCountry: data.shippingCountry,
                shippingPhone: data.shippingPhone,
                paymentMethod: selectedPaymentMethod,
            };
            return ordersApi.create(orderData);
        },
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
        mutationFn: (orderId: string) => paymentsApi.createIntent({ orderId, paymentMethod: selectedPaymentMethod }),
        onSuccess: (res) => {
            if (selectedPaymentMethod === 'cash_on_delivery') {
                // COD order is confirmed
                toast.success("Order placed successfully! Pay on delivery.");
                queryClient.invalidateQueries({ queryKey: ["cart"] });
                router.push(`/checkout/success`);
            } else {
                // Stripe payment - redirect to Stripe checkout
                if (res.data.clientSecret) {
                    // Store payment data in sessionStorage for the checkout page
                    sessionStorage.setItem('stripePaymentData', JSON.stringify({
                        clientSecret: res.data.clientSecret,
                        amount: res.data.amount,
                        currency: res.data.currency,
                        orderId: res.data.orderId || orderCreated
                    }));
                    // Redirect to Stripe checkout page
                    router.push(`/checkout/payment`);
                } else {
                    toast.error("Failed to initialize payment");
                    setIsProcessing(false);
                }
            }
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
            console.log('Submitting order data:', data);
            const orderResult = await createOrderMutation.mutateAsync(data);
            console.log('Order creation result:', orderResult);
            const orderId = orderResult.data?.id || orderResult.data?.order?.id;
            console.log('Extracted order ID:', orderId);
            
            if (orderId) {
                // Step 2: Process payment (simplified - in real app, redirect to Stripe)
                console.log('Processing payment for order ID:', orderId);
                await paymentMutation.mutateAsync(orderId);
                console.log('Payment processed successfully');
            }
        } catch (error) {
            console.error('Order submission error:', error);
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
                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            First Name
                                        </label>
                                        <input
                                            {...register("shippingFirstName")}
                                            type="text"
                                            placeholder="John"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingFirstName && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingFirstName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            {...register("shippingLastName")}
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingLastName && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingLastName.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Address
                                        </label>
                                        <input
                                            {...register("shippingAddress")}
                                            type="text"
                                            placeholder="123 Main Street"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingAddress && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingAddress.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            City
                                        </label>
                                        <input
                                            {...register("shippingCity")}
                                            type="text"
                                            placeholder="New York"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingCity && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingCity.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            State
                                        </label>
                                        <input
                                            {...register("shippingState")}
                                            type="text"
                                            placeholder="NY"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingState && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingState.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            {...register("shippingZip")}
                                            type="text"
                                            placeholder="10001"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingZip && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingZip.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Country
                                        </label>
                                        <input
                                            {...register("shippingCountry")}
                                            type="text"
                                            placeholder="United States"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingCountry && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingCountry.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                            Phone
                                        </label>
                                        <input
                                            {...register("shippingPhone")}
                                            type="tel"
                                            placeholder="+1234567890"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
                                        />
                                        {errors.shippingPhone && (
                                            <p className="text-xs text-red-400/80 mt-1">{errors.shippingPhone.message}</p>
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
                                        <p className="text-[11px] text-white/30">Choose your payment option</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Stripe Option */}
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="stripe"
                                            checked={selectedPaymentMethod === 'stripe'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value as 'stripe')}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            selectedPaymentMethod === 'stripe'
                                                ? 'bg-cyan-400/[0.05] border-cyan-400/20'
                                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                                    selectedPaymentMethod === 'stripe'
                                                        ? 'border-cyan-400 bg-cyan-400'
                                                        : 'border-white/30'
                                                }`}>
                                                    {selectedPaymentMethod === 'stripe' && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-black rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-white">Credit/Debit Card</p>
                                                    <p className="text-[11px] text-white/40">Pay securely with Stripe</p>
                                                </div>
                                                <CreditCard className="w-5 h-5 text-white/40" />
                                            </div>
                                        </div>
                                    </label>

                                    {/* Cash on Delivery Option */}
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash_on_delivery"
                                            checked={selectedPaymentMethod === 'cash_on_delivery'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value as 'cash_on_delivery')}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            selectedPaymentMethod === 'cash_on_delivery'
                                                ? 'bg-cyan-400/[0.05] border-cyan-400/20'
                                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                                    selectedPaymentMethod === 'cash_on_delivery'
                                                        ? 'border-cyan-400 bg-cyan-400'
                                                        : 'border-white/30'
                                                }`}>
                                                    {selectedPaymentMethod === 'cash_on_delivery' && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-black rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-white">Cash on Delivery</p>
                                                    <p className="text-[11px] text-white/40">Pay when you receive your order</p>
                                                </div>
                                                <Truck className="w-5 h-5 text-white/40" />
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-cyan-400/[0.03] border border-cyan-400/10">
                                    <p className="text-[11px] text-cyan-400/70">
                                        {selectedPaymentMethod === 'stripe' 
                                            ? '🔒 Secure SSL encryption - Your payment information is protected'
                                            : '💵 Pay with cash when your order arrives'
                                        }
                                    </p>
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
