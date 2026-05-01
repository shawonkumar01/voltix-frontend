"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_5123456789");

interface StripeCheckoutProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, currency, onSuccess, onError }: Omit<StripeCheckoutProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (elements) {
      let timeoutId: NodeJS.Timeout;
      
      // Listen for the 'ready' event from the Payment Element
      const handleReady = () => {
        setIsReady(true);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const handleError = (event: any) => {
        setMessage("Payment form failed to load. Please refresh the page or try again.");
        if (timeoutId) clearTimeout(timeoutId);
      };

      // Set a timeout fallback
      timeoutId = setTimeout(() => {
        setIsReady(true);
      }, 3000); // 3 seconds

      // Get the payment element and add event listeners
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        paymentElement.on('ready', handleReady);
        paymentElement.on('loaderror', handleError);
      } else {
        // Fallback: try to find the element after a short delay
        setTimeout(() => {
          const element = elements.getElement('payment');
          if (element) {
            element.on('ready', handleReady);
            element.on('loaderror', handleError);
          } else {
            setIsReady(true);
          }
        }, 1000);
      }

      // Cleanup
      return () => {
        const element = elements.getElement('payment');
        if (element) {
          element.off('ready', handleReady);
          element.off('loaderror', handleError);
        }
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      setMessage("Payment system is not ready. Please wait...");
      return;
    }

    // Double-check Payment Element exists
    const paymentElement = elements.getElement('payment');
    if (!paymentElement) {
      setMessage("Payment form is not ready. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required' // Don't redirect automatically
      });

      if (error) {
        setMessage(error.message || "An unexpected error occurred.");
        onError(error.message || "Payment failed");
      } else {
        setMessage("Payment successful!");
        onSuccess();
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      onError("Payment failed");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        {!isReady ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <span className="ml-3 text-sm text-white/40">Loading payment form...</span>
          </div>
        ) : (
          <PaymentElement />
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-red-400/[0.1] border border-red-400/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <div className="flex-1">
            <p className="text-sm text-red-400">{message}</p>
            {message.includes("failed to load") && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements || !isReady}
        className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.toUpperCase(),
            }).format(amount)}
          </>
        )}
      </button>
    </form>
  );
}

export default function StripeCheckout({ clientSecret, amount, currency, onSuccess, onError }: StripeCheckoutProps) {
  const appearance = {
    theme: 'night' as const,
    variables: {
      colorBackground: '#080808',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.3)]">
              <CreditCard className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1
            className="text-3xl font-black text-white tracking-tight mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Complete Payment
          </h1>
          <p className="text-sm text-white/40">
            Enter your payment details securely
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
        >
          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-400/[0.05] border border-cyan-400/20 mb-6">
            <Lock className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-cyan-400/70">
              🔒 Your payment information is encrypted and secure
            </p>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Order Total</span>
              <span className="text-lg font-bold text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency.toUpperCase(),
                }).format(amount)}
              </span>
            </div>
          </div>

          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              amount={amount}
              currency={currency}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>

          <p className="text-xs text-white/20 text-center mt-4">
            Powered by Stripe • Secure payment processing
          </p>
        </motion.div>
      </div>
    </div>
  );
}
