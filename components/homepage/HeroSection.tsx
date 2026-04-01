"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Zap, Star, Shield, Truck, RotateCcw, Headphones, Wifi } from "lucide-react";

const products = [
    {
        src:   "/hero-mobile.png",
        alt:   "Hero Mobile",
        label: "Mobile",
        badge: { icon: Star,   text: "4.9 Rating",  sub: "50k+ reviews"  },
    },
    {
        src:   "/hero-laptop.png",
        alt:   "Hero Laptop",
        label: "Laptop",
        badge: { icon: Wifi,   text: "Wi-Fi 7",     sub: "Tri-band ready" },
    },
    {
        src:   "/hero-router.png",
        alt:   "Hero Router",
        label: "Router",
        badge: { icon: Shield, text: "Secure Pay",  sub: "256-bit SSL"   },
    },
];

const features = [
    { icon: Truck,      label: "Free Shipping",  sub: "Orders over $99" },
    { icon: Shield,     label: "Secure Payment", sub: "100% protected"  },
    { icon: RotateCcw,  label: "Easy Returns",   sub: "30-day policy"   },
    { icon: Headphones, label: "24/7 Support",   sub: "Always here"     },
];

const containerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } as never },
};
const itemVariants: Variants = {
    hidden:  { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } as never },
};

// slot 0 = front, 1 = middle, 2 = back
function getSlot(imgIdx: number, activeIdx: number, total: number) {
    return (imgIdx - activeIdx + total) % total;
}

const slotConfig = [
    { z: 30, scale: 1,    x: 70,   y: -10, rotate: 3,   opacity: 1,    brightness: 1    },
    { z: 20, scale: 0.87, x: 10,   y: 40,  rotate: -7,  opacity: 0.8,  brightness: 0.65 },
    { z: 10, scale: 0.74, x: -50,  y: 85,  rotate: -15, opacity: 0.5,  brightness: 0.4  },
];

export default function HeroSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const total = products.length;

    // Auto-cycle every 2.8s
    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setActive((p) => (p + 1) % total), 2800);
        return () => clearInterval(id);
    }, [paused, total]);

    // Particle grid canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animId: number;
        let t = 0;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener("resize", resize);
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cols = Math.floor(canvas.width  / 50);
            const rows = Math.floor(canvas.height / 50);
            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    const x    = i * 50;
                    const y    = j * 50;
                    const dist = Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2));
                    const wave = Math.sin(dist / 80 - t) * 0.5 + 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(34, 211, 238, ${wave * 0.12})`;
                    ctx.fill();
                }
            }
            t += 0.015;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, []);

    const activeBadge = products[active].badge;
    const BadgeIcon   = activeBadge.icon;

    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#080808]">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/6 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-0 w-[300px] h-[300px] bg-cyan-400/4 rounded-full blur-[80px]" />
            </div>

            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" />
            <div className="absolute top-0 right-[40%] w-px h-full bg-gradient-to-b from-transparent via-white/4 to-transparent" />

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16 pb-20">
                <div className="flex items-center justify-between gap-8">

                    {/* ── LEFT: Copy ── */}
                    <div className="max-w-xl flex-shrink-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-7"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
                                New arrivals just dropped ⚡
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            The future of
                            <br />
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500">
                                    tech shopping
                                </span>
                                <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-400/60 to-transparent" />
                            </span>
                            <br />
                            is here.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-white/40 leading-relaxed mb-10 max-w-xl"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            Premium electronics, cutting-edge accessories, and the latest gadgets —
                            curated for those who demand the best.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
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

                    {/* ── RIGHT: Cycling stack ── */}
                    <div
                       className="relative hidden lg:flex flex-shrink-0 items-center justify-center -ml-300"
                        style={{ width: 440, height: 480 }}
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        {/* Decorative rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-cyan-400/8 pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/4 pointer-events-none" />

                        {/* Stacked image cards */}
                        {products.map((product, idx) => {
                            const slot   = getSlot(idx, active, total);
                            const cfg    = slotConfig[slot];

                            return (
                                <motion.div
                                    key={product.src}
                                    animate={{
                                        x:      cfg.x,
                                        y:      cfg.y,
                                        scale:  cfg.scale,
                                        rotate: cfg.rotate,
                                        opacity: cfg.opacity,
                                        filter: `brightness(${cfg.brightness})`,
                                        zIndex: cfg.z,
                                    }}
                                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={() => setActive(idx)}
                                    className="absolute cursor-pointer select-none"
                                    style={{ transformOrigin: "50% 50%" }}
                                >
                                    <div
                                        className="relative rounded-3xl overflow-hidden"
                                        style={{
                                            width:     300,
                                            height:    300,
                                            background: "rgba(255,255,255,0.04)",
                                            border: slot === 0
                                                ? "1px solid rgba(34,211,238,0.35)"
                                                : "1px solid rgba(255,255,255,0.07)",
                                            boxShadow: slot === 0
                                                ? "0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(34,211,238,0.08)"
                                                : "0 10px 30px rgba(0,0,0,0.35)",
                                        }}
                                    >
                                        {/* Cyan glow on front card */}
                                        {slot === 0 && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/12 to-transparent pointer-events-none z-10 rounded-3xl" />
                                        )}

                                        <Image
                                            src={product.src}
                                            alt={product.alt}
                                            fill
                                            className="object-contain p-5"
                                            sizes="200px"
                                        />

                                        {/* Product label chip */}
                                        <div className="absolute bottom-2.5 left-2.5 z-20 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-sm">
                                            <span className="text-[10px] font-semibold text-white/60 tracking-widest uppercase">
                                                {product.label}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Floating badge — changes per active product */}
                        <div className="absolute top-6 right-2 z-50 pointer-events-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, y: -12, scale: 0.88 }}
                                    animate={{ opacity: 1,  y: 0,   scale: 1    }}
                                    exit={{   opacity: 0,  y: 12,  scale: 0.88 }}
                                    transition={{ duration: 0.38, ease: "easeOut" }}
                                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center flex-shrink-0">
                                        <BadgeIcon className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white/80 leading-none mb-0.5">{activeBadge.text}</p>
                                        <p className="text-[10px] text-white/35">{activeBadge.sub}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dot indicators / manual nav */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
                            {products.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActive(idx); setPaused(true); setTimeout(() => setPaused(false), 4000); }}
                                    style={{
                                        width:        idx === active ? 22 : 6,
                                        height:       6,
                                        borderRadius: 9999,
                                        background:   idx === active ? "rgba(34,211,238,0.9)" : "rgba(255,255,255,0.2)",
                                        transition:   "all 0.3s ease",
                                        border:       "none",
                                        cursor:       "pointer",
                                        padding:      0,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feature strip */}
                <div className="mt-16 border-t border-white/5 pt-2">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6"
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

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
        </section>
    );
}