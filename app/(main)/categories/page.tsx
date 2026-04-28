"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Grid3X3, Loader2, Package, ArrowRight } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";

export default function CategoriesPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const categories = data?.categories || data?.data || (Array.isArray(data) ? data : []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-500/3 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Categories
                    </h1>
                    <p className="text-xs text-white/30">Browse products by category</p>
                </motion.div>

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-white/30 text-sm">Failed to load categories. Is your backend running?</p>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((category: any, index: number) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                href={`/products?categoryId=${category.id}`}
                                className="block group"
                            >
                                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300 h-full">
                                    {/* Image */}
                                    <div className="relative aspect-square bg-white/[0.02] overflow-hidden">
                                        {category.image ? (
                                            <img 
                                                src={category.image} 
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    console.error("Category image failed:", category.image);
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-12 h-12 text-white/[0.05]" />
                                            </div>
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3
                                            className="text-sm font-bold text-white mb-1"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="text-[11px] text-white/35 line-clamp-2 mb-2">
                                                {category.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-white/25">
                                                {category._count?.products || 0} products
                                            </span>
                                            <div className="flex items-center gap-1 text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                                                <span className="text-[11px] font-semibold">Browse</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty state */}
                {!isLoading && categories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                            <Grid3X3 className="w-9 h-9 text-white/15" />
                        </div>
                        <h2
                            className="text-xl font-black text-white mb-2"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            No categories yet
                        </h2>
                        <p className="text-sm text-white/35 mb-6">
                            Categories will appear here once they're added
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group"
                        >
                            Browse all products
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
