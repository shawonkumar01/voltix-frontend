"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { brandsApi } from "@/lib/api/brands";

export default function FeaturedBrands() {
    const { data: brandsData, isLoading } = useQuery({
        queryKey: ["featured-brands"],
        queryFn: async () => {
            const res = await brandsApi.getFeatured();
            return res.data;
        },
    });

    const brands = brandsData || [];

    if (isLoading) {
        return (
            <section className="bg-[#080808] py-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#080808] py-16 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Featured Brands
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        Shop from the world's leading technology brands, all backed by our quality guarantee.
                    </p>
                </motion.div>

                {/* Brands Single Line */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {brands.map((brand: any, index: number) => (
                        <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            className="flex-shrink-0"
                        >
                            <a
                                href={`/products?brand=${brand.name}`}
                                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-400/25 transition-all duration-300"
                                style={{ minWidth: "140px" }}
                            >
                                {/* Brand Logo */}
                                {brand.logo ? (
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="w-12 h-12 rounded-xl object-cover mb-3"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center mb-3 group-hover:from-cyan-400/10 group-hover:to-cyan-400/5 transition-all duration-300">
                                        <span className="text-lg font-bold text-white/30 group-hover:text-cyan-400/60 transition-colors">
                                            {brand.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Brand Name */}
                                <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors mb-1">
                                    {brand.name}
                                </h3>
                                
                                {/* Product Count */}
                                <div className="flex items-center gap-1 text-[10px] text-white/20">
                                    <span>{brand.products?.length || 0} products</span>
                                </div>
                            </a>
                        </motion.div>
                    ))}
                </div>

                {/* View All Brands CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <a
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                        View All Products
                        <Star className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
