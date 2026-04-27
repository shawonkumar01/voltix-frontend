"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShoppingCart, Heart, Star, Zap, TrendingUp,
    PackageX, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice, toNumber } from "@/lib/utils/format";

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
    category?: { name: string };
}

interface Props {
    products: Product[];
    isLoading: boolean;
    isError: boolean;
    viewMode: "grid" | "list";
    total: number;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// ─── Product Card (Grid) ──────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
    const { user } = useAuthStore();
    const addItem = useCartStore((s) => s.addItem);
    const [addingCart, setAddingCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    const finalPrice = product.discount
        ? toNumber(product.price) * (1 - toNumber(product.discount) / 100)
        : toNumber(product.price);

    const handleCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Sign in to add to cart"); return; }
        setAddingCart(true);
        try {
            await cartApi.add(product.id, 1);
            addItem({
                id: product.id,
                quantity: 1,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount,
                    images: product.images,
                    brand: product.brand,
                    stock: product.stock,
                }
            });
            toast.success("Added to cart ⚡");
        } catch { toast.error("Failed to add"); }
        finally { setAddingCart(false); }
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Sign in to save items"); return; }
        try {
            if (wishlisted) {
                await wishlistApi.removeByProduct(product.id);
                setWishlisted(false);
            } else {
                await wishlistApi.add(product.id);
                setWishlisted(true);
                toast.success("Saved ♥");
            }
        } catch { toast.error("Something went wrong"); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
        >
            <Link href={`/products/${product.id}`} className="group block h-full">
                <div className="h-full bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.35)] flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-square bg-white/[0.02] overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Zap className="w-10 h-10 text-white/8" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Wishlist */}
                        <button
                            onClick={handleWishlist}
                            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm ${wishlisted ? "bg-red-500/20 border-red-400/30 text-red-400" : "bg-black/40 border-white/10 text-white/50 hover:text-white"
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-400" : ""}`} />
                        </button>

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {product.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-400/15 border border-cyan-400/25 text-[9px] font-bold text-cyan-400">
                                    <TrendingUp className="w-2.5 h-2.5" /> Hot
                                </span>
                            )}
                            {(product.discount ?? 0) > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/25 text-[9px] font-bold text-amber-400">
                                    -{product.discount}%
                                </span>
                            )}
                            {product.stock === 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-red-500/15 border border-red-400/25 text-[9px] font-bold text-red-400">
                                    Sold out
                                </span>
                            )}
                        </div>

                        {/* Add to cart */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                                onClick={handleCart}
                                disabled={addingCart || product.stock === 0}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-400 text-black text-[11px] font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                {product.stock === 0 ? "Out of stock" : addingCart ? "Adding..." : "Add to cart"}
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex flex-col flex-1">
                        {product.brand && (
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1"
                                style={{ fontFamily: "'Syne', sans-serif" }}>
                                {product.brand}
                            </p>
                        )}
                        <h3
                            className="text-xs font-semibold text-white/80 line-clamp-2 group-hover:text-white transition-colors leading-snug flex-1 mb-2"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {product.name}
                        </h3>

                        {product.rating && (
                            <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(product.rating!) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                                ))}
                                {product.reviewCount && <span className="text-[9px] text-white/20 ml-0.5">({product.reviewCount})</span>}
                            </div>
                        )}

                        <div className="flex items-baseline gap-1.5 mt-auto">
                            <span className="text-sm font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                ${formatPrice(product.price)}
                            </span>

                            {(product.discount ?? 0) > 0 && (
                                <span className="text-[10px] text-white/20 line-through">${formatPrice(product.price)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Product Row (List) ───────────────────────────────────────────────────────
function ProductRow({ product, index }: { product: Product; index: number }) {
    const { user } = useAuthStore();
    const addItem = useCartStore((s) => s.addItem);
    const [addingCart, setAddingCart] = useState(false);

    const finalPrice = product.discount
        ? toNumber(product.price) * (1 - toNumber(product.discount) / 100)
        : toNumber(product.price);

    const handleCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Sign in to add to cart"); return; }
        setAddingCart(true);
        try {
            await cartApi.add(product.id, 1);
            addItem({
                id: product.id,
                quantity: 1,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount,
                    images: product.images,
                    brand: product.brand,
                    stock: product.stock,
                }
            });
            toast.success("Added to cart ⚡");
        } catch { toast.error("Failed to add"); }
        finally { setAddingCart(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
        >
            <Link href={`/products/${product.id}`} className="group block">
                <div className="flex gap-4 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-200">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-white/[0.03] overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><Zap className="w-6 h-6 text-white/10" /></div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {product.brand && (
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-0.5">{product.brand}</p>
                        )}
                        <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {product.name}
                        </h3>
                        {product.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(product.rating!) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                        <div className="text-right">
                            <p className="text-sm font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                ${formatPrice(product.price)}
                            </p>
                            {(product.discount ?? 0) > 0 && (
                                <p className="text-[10px] text-white/20 line-through">${formatPrice(product.price)}</p>
                            )}
                        </div>
                        <button
                            onClick={handleCart}
                            disabled={addingCart || product.stock === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold rounded-lg hover:bg-cyan-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            {addingCart ? "..." : "Add"}
                        </button>
                    </div>  
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/[0.04]" />
            <div className="p-3.5 flex flex-col gap-2">
                <div className="h-2 w-12 bg-white/[0.05] rounded-full" />
                <div className="h-3 w-full bg-white/[0.06] rounded-full" />
                <div className="h-3 w-2/3 bg-white/[0.06] rounded-full" />
                <div className="h-4 w-16 bg-white/[0.08] rounded-full mt-1" />
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        if (totalPages <= 7) return i + 1;
        if (page <= 4) return i + 1;
        if (page >= totalPages - 3) return totalPages - 6 + i;
        return page - 3 + i;
    });

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page
                        ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                        : "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]"
                        }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProductGrid({ products, isLoading, isError, viewMode, total, page, totalPages, onPageChange }: Props) {
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <PackageX className="w-10 h-10 text-white/15" />
                <p className="text-sm text-white/30">Failed to load products</p>
                <p className="text-xs text-white/20">Make sure your backend is running on port 3001</p>
            </div>
        );
    }

    if (!isLoading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <PackageX className="w-10 h-10 text-white/15" />
                <p className="text-sm text-white/30">No products found</p>
                <p className="text-xs text-white/20">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div>
            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {isLoading
                        ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
                        : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                    }
                </div>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-28 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse" />
                        ))
                        : products.map((p, i) => <ProductRow key={p.id} product={p} index={i} />)
                    }
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
    );
}