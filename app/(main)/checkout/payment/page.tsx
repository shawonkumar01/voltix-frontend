"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/checkout/StripeCheckout";

export default function PaymentPage() {
    const router = useRouter();
    const [paymentData, setPaymentData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve payment data from sessionStorage
        const storedData = sessionStorage.getItem('stripePaymentData');
        
        if (!storedData) {
            toast.error("Payment session expired. Please try again.");
            router.push('/checkout');
            return;
        }

        try {
            const data = JSON.parse(storedData);
            
            // Validate required fields
            if (!data.clientSecret || !data.amount || !data.currency) {
                toast.error("Invalid payment data. Please try again.");
                router.push('/checkout');
                return;
            }
            
            setPaymentData(data);
            setIsLoading(false);
        } catch (error) {
            toast.error("Invalid payment data. Please try again.");
            router.push('/checkout');
        }
    }, [router]);

    const handlePaymentSuccess = () => {
        // Clear session storage
        sessionStorage.removeItem('stripePaymentData');
        // Redirect to success page
        router.push('/checkout/success');
    };

    const handlePaymentError = (error: string) => {
        toast.error(error);
        // Clear session storage and redirect back to checkout
        sessionStorage.removeItem('stripePaymentData');
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading payment...</p>
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">No payment data found</p>
                    <button
                        onClick={() => router.push('/checkout')}
                        className="px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors"
                    >
                        Back to Checkout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Back Button */}
            <div className="fixed top-32 left-6 z-50">
                <button
                    onClick={() => {
                        sessionStorage.removeItem('stripePaymentData');
                        router.push('/checkout');
                    }}
                    className="flex items-center gap-2 px-4 py-3 bg-white/[0.05] border border-white/[0.10] text-white/60 hover:text-white hover:bg-white/[0.10] rounded-xl transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Checkout
                </button>
            </div>

            <StripeCheckout
                clientSecret={paymentData.clientSecret}
                amount={paymentData.amount}
                currency={paymentData.currency}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
            />
        </div>
    );
}
