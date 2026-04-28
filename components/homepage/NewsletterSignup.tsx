"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Gift, CheckCircle, Sparkles } from "lucide-react";

export default function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitted(true);
        setIsLoading(false);
    };

    const benefits = [
        { icon: Gift, text: "15% off your first order" },
        { icon: Sparkles, text: "Early access to new products" },
        { icon: Mail, text: "Exclusive deals & promotions" },
    ];

    return (
        <section className="bg-[#080808] py-20 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 to-orange-500/3 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/5 to-blue-500/3 rounded-full blur-[120px]" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-cyan-400" />
                    </div>

                    {/* Header */}
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Stay in the Loop
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto mb-8">
                        Get exclusive deals, new product announcements, and tech insights delivered straight to your inbox.
                    </p>

                    {/* Benefits */}
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]"
                                >
                                    <Icon className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-white/60">{benefit.text}</span>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Signup Form */}
                    {!isSubmitted ? (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            onSubmit={handleSubmit}
                            className="max-w-md mx-auto"
                        >
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                    className="flex-1 px-5 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 focus:bg-white/[0.08] transition-all"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-xl hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        "Subscribe"
                                    )}
                                </motion.button>
                            </div>
                            <p className="text-xs text-white/20 mt-3">
                                No spam, unsubscribe anytime. We respect your privacy.
                            </p>
                        </motion.form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border border-cyan-400/20"
                        >
                            <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Welcome to Voltix!</h3>
                            <p className="text-white/60 mb-4">
                                Check your email for your 15% discount code and start shopping smarter.
                            </p>
                            <p className="text-sm text-cyan-400/60">
                                Code: <span className="font-mono font-bold">WELCOME15</span>
                            </p>
                        </motion.div>
                    )}

                    {/* Social Proof */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 pt-8 border-t border-white/[0.05]"
                    >
                        <div className="flex items-center justify-center gap-8 text-sm text-white/30">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span>50,000+ subscribers</span>
                            </div>
                            <span>•</span>
                            <span>4.8/5 satisfaction rating</span>
                            <span>•</span>
                            <span>Daily deals</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
