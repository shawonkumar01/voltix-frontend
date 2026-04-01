"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
    Zap,
    Mail,
    MapPin,
    Phone,
    ArrowUpRight,
    Shield,
    Truck,
    RotateCcw,
    Headphones,
    MessageCircle,
    Code2,
    Camera,
    Play,
} from "lucide-react";

const footerLinks = {
    Shop: [
        { label: "All Products", href: "/products" },
        { label: "Featured Deals", href: "/products?isFeatured=true" },
        { label: "New Arrivals", href: "/products?sortBy=newest" },
        { label: "Best Sellers", href: "/products?sortBy=best_selling" },
        { label: "Categories", href: "/categories" },
    ],
    Account: [
        { label: "My Profile", href: "/account" },
        { label: "My Orders", href: "/account/orders" },
        { label: "Wishlist", href: "/wishlist" },
        { label: "Cart", href: "/cart" },
        { label: "Track Order", href: "/account/orders" },
    ],
    Support: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "Returns & Refunds", href: "/returns" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Privacy Policy", href: "/privacy" },
    ],
};

const socials = [
    { icon: MessageCircle, href: "#", label: "Twitter" },
    { icon: Code2, href: "#", label: "GitHub" },
    { icon: Camera, href: "#", label: "Instagram" },
    { icon: Play, href: "#", label: "YouTube" },
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

export default function Footer() {
    return (
        <footer className="relative mt-auto border-t border-white/5 bg-gradient-to-b from-zinc-900/80 to-zinc-900/60 backdrop-blur-xl overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[400px] h-[200px] bg-amber-500/[0.03] rounded-full blur-[80px] pointer-events-none" />

            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10"
                >
                    {/* Brand column */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 group w-fit mb-5">
                            <div className="relative w-9 h-9">
                                <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-md group-hover:bg-cyan-400/30 transition-all duration-300" />
                                <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.3)]">
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

                        <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                            The premium destination for cutting-edge electronics and tech
                            accessories. Powered by passion, delivered with precision.
                        </p>

                        {/* Contact info */}
                        <div className="flex flex-col gap-2 mb-6">
                            {[
                                { icon: Mail, text: "support@voltix.store" },
                                { icon: Phone, text: "+1 (555) 000-0000" },
                                { icon: MapPin, text: "San Francisco, CA 94105" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2.5">
                                    <Icon className="w-3.5 h-3.5 text-cyan-400/60 flex-shrink-0" />
                                    <span className="text-xs text-white/40">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Socials */}
                        <div className="flex items-center gap-2">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/[0.15] transition-all duration-200"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Links columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <motion.div key={group} variants={itemVariants}>
                            <h4
                                className="text-xs font-bold uppercase tracking-[0.15em] text-white/30 mb-4"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                {group}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.map((link) => (
                                    <li key={`${link.label}-${link.href}`}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-center gap-1 text-sm text-white/45 hover:text-white transition-colors duration-200"
                                        >
                                            <span>{link.label}</span>
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Newsletter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/[0.08] via-white/[0.03] to-amber-500/[0.08] border border-white/[0.08]"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h4
                                className="text-sm font-bold text-white mb-1"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                Stay in the loop ⚡
                            </h4>
                            <p className="text-xs text-white/40">
                                Get exclusive deals and new arrivals in your inbox.
                            </p>
                        </div>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex gap-2 w-full sm:w-auto"
                        >
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 sm:w-56 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 focus:bg-white/[0.08] transition-all"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                    <p className="text-xs text-white/25">
                        © {new Date().getFullYear()} Voltix. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {["Terms", "Privacy", "Cookies"].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="text-xs text-white/25 hover:text-white/60 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs text-white/25">All systems operational</span>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}