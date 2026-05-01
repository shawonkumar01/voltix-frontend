"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

const schema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetForm>({ resolver: zodResolver(schema) });

    // Verify token on mount
    useEffect(() => {
        if (!token) { setTokenValid(false); return; }
        api.get(`/password-reset/verify?token=${token}`)
            .then(() => setTokenValid(true))
            .catch(() => setTokenValid(false));
    }, [token]);

    const onSubmit = async (data: ResetForm) => {
        if (!token) return;
        setIsLoading(true);
        try {
            await api.post("/password-reset/reset", { token, newPassword: data.password });
            toast.success("Password reset successfully! Please sign in ⚡");
            router.push("/login");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Failed to reset password");
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

                    {/* Loading state */}
                    {tokenValid === null && (
                        <div className="flex flex-col items-center py-8 gap-3">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                            <p className="text-sm text-white/30">Verifying reset link...</p>
                        </div>
                    )}

                    {/* Invalid token */}
                    {tokenValid === false && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                                <XCircle className="w-7 h-7 text-red-400" />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Link expired
                            </h2>
                            <p className="text-sm text-white/40 mb-6">
                                This reset link is invalid or has expired.
                            </p>
                            <Link
                                href="/forgot-password"
                                className="inline-flex items-center gap-2 py-3 px-6 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all"
                            >
                                Request new link
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )}

                    {/* Valid token - show form */}
                    {tokenValid === true && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    New password
                                </h1>
                                <p className="text-sm text-white/40">
                                    Choose a strong password for your account
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all duration-200"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-400/80 mt-1.5 ml-1">{errors.password.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register("confirmPassword")}
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all duration-200"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-400/80 mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
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
                                            Reset password
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}