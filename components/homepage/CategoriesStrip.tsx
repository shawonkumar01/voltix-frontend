"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";

interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    _count?: { products: number };
}

export default function CategoriesStrip() {
    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const categories: Category[] = data?.data || data || [];

    if (!isLoading && categories.length === 0) return null;

    return (
        <section className="bg-[#080808] py-16 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <h2
                            className="text-xl font-black text-white tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Shop by category
                        </h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <Link
                            href="/categories"
                            className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors group"
                        >
                            All categories
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-32 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                        ))
                        : categories.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                                className="flex-shrink-0"
                            >
                                <Link
                                    href={`/products?categoryId=${cat.id}`}
                                    className="group flex flex-col items-center justify-center gap-2 w-32 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-400/25 transition-all duration-200 px-3"
                                >
                                    {cat.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={cat.image} alt={cat.name} className="w-7 h-7 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <Tag className="w-5 h-5 text-white/25 group-hover:text-cyan-400/60 transition-colors" />
                                    )}
                                    <span
                                        className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition-colors text-center leading-tight"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    >
                                        {cat.name}
                                    </span>
                                    {cat._count && (
                                        <span className="text-[9px] text-white/20">{cat._count.products} items</span>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                </div>
            </div>
        </section>
    );
}