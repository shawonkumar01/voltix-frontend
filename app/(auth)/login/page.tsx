"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const success = await useAuthStore.getState().login(data.email, data.password);
            if (success) {
                const { user } = useAuthStore.getState();
                if (user) {
                    toast.success(`Welcome back, ${user.firstName}! ⚡`);
                    router.push(user.role === "admin" ? "/admin" : "/");
                } else {
                    toast.error("Login failed - no user data");
                }
            } else {
                toast.error("Invalid credentials");
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden px-4">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
                {/* Grid lines */}
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
                {/* Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex justify-center mb-8"
                    >
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-cyan-400/30 rounded-xl blur-lg group-hover:bg-cyan-400/40 transition-all duration-300" />
                                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                                    <Zap className="w-5 h-5 text-black fill-black" />
                                </div>
                            </div>
                            <span
                                className="text-2xl font-black tracking-tight text-white"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                VOLT<span className="text-cyan-400">IX</span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h1
                            className="text-2xl font-black text-white mb-1.5 tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Welcome back
                        </h1>
                        <p className="text-sm text-white/40">
                            Sign in to your Voltix account
                        </p>
                    </motion.div>

                    {/* Google OAuth */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 mb-6 group"
                    >
                        <Globe className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                        Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="flex-1 h-px bg-white/8" />
                        <span className="text-xs text-white/25 font-medium">or</span>
                        <div className="flex-1 h-px bg-white/8" />
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                        >
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all duration-200"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400/80 mt-1.5 ml-1">{errors.email.message}</p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400/80 mt-1.5 ml-1">{errors.password.message}</p>
                            )}
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="text-center text-sm text-white/30 mt-6"
                    >
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                            Create one
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}