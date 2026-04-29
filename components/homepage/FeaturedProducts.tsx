"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Heart, Star, Zap, TrendingUp, Flame } from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
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
    reviewCount?: number;
    isFeatured?: boolean;
    stock?: number;
    createdAt?: string;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
    const { user } = useAuthStore();
    const increment = useCartStore((s) => s.increment);
    const [addingCart, setAddingCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    const price = toNumber(product.price);

    const discountedPrice = product.discount
        ? price * (1 - product.discount / 100)
        : price;

    // Check if product is a new arrival (created within 30 days)
    const isNewArrival = product.createdAt ? new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false;
    const isHotDeal = (product.discount ?? 0) >= 10;
    const discount = product.discount ?? 0;

    // Determine border style based on new rules
    const getBorderStyle = () => {
        if (isHotDeal && !isNewArrival) {
            // Only hot deals - orange border
            return 'border-orange-400/50 shadow-[0_0_20px_rgba(251,146,60,0.3)] hover:border-orange-400/70 hover:shadow-[0_0_30px_rgba(251,146,60,0.5)]';
        } else if (isNewArrival && !isHotDeal) {
            // Only new arrival - green border
            return 'border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-400/70 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]';
        } else if (isNewArrival && isHotDeal) {
            // New arrival + hot deals
            if (discount >= 25) {
                // New arrival + hot deals >= 25% - orange border
                return 'border-orange-400/50 shadow-[0_0_20px_rgba(251,146,60,0.3)] hover:border-orange-400/70 hover:shadow-[0_0_30px_rgba(251,146,60,0.5)]';
            } else {
                // New arrival + hot deals < 25% - green border
                return 'border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-400/70 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]';
            }
        } else {
            // Default border
            return 'border-white/[0.08] hover:border-white/[0.15]';
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { 
            toast.error("Please sign in to add to cart"); 
            return; 
        }
        setAddingCart(true);
        try {
            await cartApi.add(product.id, 1);
            increment();
            toast.success("Added to cart ⚡");
        } catch (error: any) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingCart(false);
        }
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Please sign in to save items"); return; }
        try {
            if (wishlisted) {
                await wishlistApi.removeByProduct(product.id);
                setWishlisted(false);
                toast.success("Removed from wishlist");
            } else {
                await wishlistApi.add(product.id);
                setWishlisted(true);
                toast.success("Saved to wishlist ♥");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
        >
            <Link href={`/products/${product.id}`} className="group block">
                <div className={`relative bg-white/[0.03] border rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${getBorderStyle()}`}>

                    {/* Image */}
                    <div className="relative aspect-square bg-white/[0.02] overflow-hidden">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Zap className="w-12 h-12 text-white/10" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                        {/* Wishlist */}
                        <button
                            onClick={handleWishlist}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 opacity-0 group-hover:opacity-100 ${wishlisted
                                ? "bg-red-500/20 border-red-500/30 text-red-400"
                                : "bg-black/40 border-white/10 text-white/50 hover:text-white backdrop-blur-sm"
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-400" : ""}`} />
                        </button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {product.stock === 0 ? (
                                <span className="px-2 py-0.5 rounded-lg bg-red-500/30 border border-red-400/50 text-[10px] font-bold text-red-400">
                                    Sold out
                                </span>
                            ) : (
                                <>
                                    {product.isFeatured && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-400/30 border border-cyan-400/50 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                                            <TrendingUp className="w-2.5 h-2.5" /> Featured
                                        </span>
                                    )}
                                    {(product.discount ?? 0) > 0 && (
                                        <span className="inline-flex px-2 py-0.5 rounded-lg bg-amber-400/30 border border-amber-400/50 text-[10px] font-bold text-amber-400">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Quick add */}
                        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingCart || product.stock === 0}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-400 text-black text-xs font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                {product.stock === 0 ? "Out of stock" : addingCart ? "Adding..." : "Add to cart"}
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        {product.brand && (
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1"
                                style={{ fontFamily: "'Syne', sans-serif" }}>
                                {product.brand}
                            </p>
                        )}
                        <h3
                            className="text-sm font-semibold text-white/85 mb-2 line-clamp-2 group-hover:text-white transition-colors leading-snug"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {product.name}
                        </h3>

                        {product.rating && (
                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-3 h-3 ${star <= Math.round(product.rating!)
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-white/15"
                                                }`}
                                        />
                                    ))}
                                </div>
                                {product.reviewCount && (
                                    <span className="text-[10px] text-white/25">({product.reviewCount})</span>
                                )}
                            </div>
                        )}

                        <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                ${formatPrice(discountedPrice)}
                            </span>
                            {(product.discount ?? 0) > 0 && (
                                <span className="text-xs text-white/25 line-through">${formatPrice(price)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function ProductSkeleton() {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/[0.04]" />
            <div className="p-4 flex flex-col gap-2.5">
                <div className="h-2.5 w-16 bg-white/[0.06] rounded-full" />
                <div className="h-3.5 w-full bg-white/[0.06] rounded-full" />
                <div className="h-3.5 w-3/4 bg-white/[0.06] rounded-full" />
                <div className="h-4 w-20 bg-white/[0.08] rounded-full mt-1" />
            </div>
        </div>
    );
}

export default function FeaturedProducts() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["featured-products"],
        queryFn: async () => {
            const res = await productsApi.getAll({ isFeatured: true, limit: 8 });
            return res.data;
        },
    });

    const products: Product[] = data?.products || data?.data || data || [];

    return (
        <section className="bg-[#080808] py-24 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/3 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/8 border border-cyan-400/15 mb-4">
                            <TrendingUp className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-400/70 uppercase tracking-widest"
                                style={{ fontFamily: "'Syne', sans-serif" }}>
                                Featured
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            Handpicked for you
                        </h2>
                        <p className="text-sm text-white/35 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Our editors&apos; top picks this season
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <Link
                            href="/products?isFeatured=true"
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                        >
                            View all
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Grid */}
                {isError ? (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-sm">Failed to load products. Is your backend running?</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                            : products.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))}
                    </div>
                )}

                {/* Mobile view all */}
                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href="/products?isFeatured=true"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        View all featured <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}