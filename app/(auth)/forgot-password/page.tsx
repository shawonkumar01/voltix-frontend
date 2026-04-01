"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, ArrowRight, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

const schema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: ForgotForm) => {
        setIsLoading(true);
        try {
            await api.post("/password-reset/request", { email: data.email });
            setSentEmail(data.email);
            setSent(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden px-4">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-cyan-400/30 rounded-xl blur-lg" />
                                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                                    <Zap className="w-5 h-5 text-black fill-black" />
                                </div>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                VOLT<span className="text-cyan-400">IX</span>
                            </span>
                        </Link>
                    </div>

                    {!sent ? (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Reset password
                                </h1>
                                <p className="text-sm text-white/40">
                                    Enter your email and we&apos;ll send you a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                        Email
                                    </label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all duration-200"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-400/80 mt-1.5 ml-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Send reset link
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                                <MailCheck className="w-7 h-7 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Check your inbox
                            </h2>
                            <p className="text-sm text-white/40 mb-1">
                                We sent a reset link to
                            </p>
                            <p className="text-sm text-cyan-400 font-medium mb-6">{sentEmail}</p>
                            <p className="text-xs text-white/25">
                                Didn&apos;t receive it? Check spam or{" "}
                                <button onClick={() => setSent(false)} className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                                    try again
                                </button>
                            </p>
                        </motion.div>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}