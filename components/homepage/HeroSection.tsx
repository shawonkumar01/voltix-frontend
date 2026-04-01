"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Zap, Star, Shield, Truck, RotateCcw, Headphones } from "lucide-react";

const floatingBadges = [
    { icon: Star, text: "4.9 Rating", sub: "50k+ reviews", x: "right-[8%]", y: "top-[22%]", delay: 0.8 },
    { icon: Shield, text: "Secure Pay", sub: "256-bit SSL", x: "left-[6%]", y: "bottom-[30%]", delay: 1.0 },
    { icon: Truck, text: "Free Ship", sub: "Orders $99+", x: "right-[10%]", y: "bottom-[25%]", delay: 1.2 },
];
const features = [
    { icon: Truck, label: "Free Shipping", sub: "Orders over $99" },
    { icon: Shield, label: "Secure Payment", sub: "100% protected" },
    { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
    { icon: Headphones, label: "24/7 Support", sub: "Always here" },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 } as never,
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" } as never,
    },
};

export default function HeroSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animated particle grid
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cols = Math.floor(canvas.width / 50);
            const rows = Math.floor(canvas.height / 50);

            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    const x = i * 50;
                    const y = j * 50;
                    const dist = Math.sqrt(
                        Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
                    );
                    const wave = Math.sin(dist / 80 - t) * 0.5 + 0.5;
                    const alpha = wave * 0.12;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
                    ctx.fill();
                }
            }
            t += 0.015;
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#080808]">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/6 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-0 w-[300px] h-[300px] bg-cyan-400/4 rounded-full blur-[80px]" />
            </div>

            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Diagonal accent line */}
            <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" />
            <div className="absolute top-0 right-[40%] w-px h-full bg-gradient-to-b from-transparent via-white/4 to-transparent" />

            {/* Floating badges
            {floatingBadges.map(({ icon: Icon, text, sub, x, y, delay }) => (
                <motion.div
                    key={text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay, ease: "easeOut" }}
                    className={`absolute ${x} ${y} hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
                    style={{
                        animation: `float-${delay * 10} 4s ease-in-out infinite`,
                    }}
                >
                    <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/80 leading-none mb-0.5">{text}</p>
                        <p className="text-[10px] text-white/35">{sub}</p>
                    </div>
                </motion.div>
            ))} */}

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16 pb-20">
                <div className="max-w-3xl">
                    {/* Eyebrow badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-7"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span
                            className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            New arrivals just dropped ⚡
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        The future of
                        <br />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500">
                                tech shopping
                            </span>
                            {/* Underline glow */}
                            <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-400/60 to-transparent" />
                        </span>
                        <br />
                        is here.
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-lg text-white/40 leading-relaxed mb-10 max-w-xl"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                        Premium electronics, cutting-edge accessories, and the latest gadgets —
                        curated for those who demand the best.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Link
                            href="/products"
                            className="group inline-flex items-center gap-2.5 px-7 py-4 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                        >
                            <Zap className="w-4 h-4 fill-black" />
                            Shop now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/products?isFeatured=true"
                            className="inline-flex items-center gap-2 px-7 py-4 bg-white/5 text-white/70 text-sm font-semibold rounded-2xl border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                        >
                            View deals
                        </Link>
                    </motion.div>

                 

                </div>
                {/* Feature strip */}
                <div className="border-b border-white/5">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {features.map(({ icon: Icon, label, sub }) => (
                            <motion.div
                                key={label}
                                variants={itemVariants}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/20 transition-all duration-300 flex-shrink-0">
                                    <Icon className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white/80">{label}</p>
                                    <p className="text-[11px] text-white/30">{sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
        </section>
    );
}