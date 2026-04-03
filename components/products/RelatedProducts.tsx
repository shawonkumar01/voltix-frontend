"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { cartApi } from "@/lib/api/cart";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice, toNumber } from "@/lib/utils/format";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    discount?: number;
    images?: string[];
    brand?: string;
    rating?: number;
}

export default function RelatedProducts({
    categoryId,
    excludeId,
}: {
    categoryId: string;
    excludeId: string;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ["related-products", categoryId, excludeId],
        queryFn: async () => {
            const res = await productsApi.advancedSearch({
                categories: [categoryId],
                limit: 6,
                page: 1,
            });
            return res.data;
        },
        enabled: !!categoryId,
    });

    const allProducts: Product[] = data?.products || data?.data || [];
    const products = allProducts.filter((p) => p.id !== excludeId).slice(0, 5);

    if (!isLoading && products.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 pt-10 border-t border-white/[0.05]"
        >
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-xl font-black text-white tracking-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    You might also like
                </h2>
                <Link
                    href={`/products?categoryId=${categoryId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors group"
                >
                    View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden animate-pulse">
                            <div className="aspect-square bg-white/[0.04]" />
                            <div className="p-3 flex flex-col gap-2">
                                <div className="h-2.5 bg-white/[0.05] rounded-full" />
                                <div className="h-3 bg-white/[0.06] rounded-full" />
                                <div className="h-3.5 w-16 bg-white/[0.07] rounded-full" />
                            </div>
                        </div>
                    ))
                    : products.map((product, i) => (
                        <RelatedCard key={product.id} product={product} index={i} />
                    ))}
            </div>
        </motion.section>
    );
}

function RelatedCard({ product, index }: { product: Product; index: number }) {
    const { user } = useAuthStore();
    const increment = useCartStore((s) => s.increment);
    const [adding, setAdding] = useState(false);

    const price = toNumber(product.price);
    const discount = toNumber(product.discount ?? 0);
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    const handleCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Sign in to add to cart"); return; }
        setAdding(true);
        try {
            await cartApi.add(product.id, 1);
            increment();
            toast.success("Added ⚡");
        } catch { toast.error("Failed"); }
        finally { setAdding(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Link href={`/products/${product.id}`} className="group block">
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Zap className="w-8 h-8 text-white/[0.07]" />
                            </div>
                        )}

                        {/* Quick add */}
                        <div className="absolute inset-x-2 bottom-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <button
                                onClick={handleCart}
                                disabled={adding}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-400 text-black text-[11px] font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-[0_0_14px_rgba(34,211,238,0.3)]"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                {adding ? "..." : "Add"}
                            </button>
                        </div>
                    </div>

                    <div className="p-3">
                        {product.brand && (
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-0.5">{product.brand}</p>
                        )}
                        <h3
                            className="text-xs font-semibold text-white/75 line-clamp-2 group-hover:text-white transition-colors leading-snug mb-2"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {product.name}
                        </h3>

                        {product.rating && (
                            <div className="flex items-center gap-0.5 mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(product.rating!) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                                ))}
                            </div>
                        )}

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                ${formatPrice(finalPrice)}
                            </span>
                            {(product.discount ?? 0) > 0 && (
                                <span className="text-[10px] text-white/20 line-through">${formatPrice(price)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}