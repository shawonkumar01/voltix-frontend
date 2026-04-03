"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, Heart, Star, Zap, ArrowLeft,
    Truck, Shield, RotateCcw, ChevronLeft, ChevronRight,
    Minus, Plus, Share2, TrendingUp, Package, Tag,
    Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice, toNumber } from "@/lib/utils/format";
import ReviewsSection from "@/components/products/ReviewsSection";
import RelatedProducts from "@/components/products/RelatedProducts";
import { LoadingState } from "@/components/ui/layout-components";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const increment = useCartStore((s) => s.increment);

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingCart, setAddingCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const res = await productsApi.getOne(id);
            return res.data;
        },
        enabled: !!id,
    });

    const product = data?.product || data?.data || data;

    // ✅ Derived variables declared here — fixes "images is not defined" & "specs is not defined"
    const images: string[] = product?.images ?? [];
    const specs: Record<string, unknown> = product?.specifications ?? {};

    const handleAddToCart = async () => {
        if (!user) { toast.error("Please sign in to add to cart"); return; }
        setAddingCart(true);
        try {
            await cartApi.add(product.id, quantity);
            for (let i = 0; i < quantity; i++) increment();
            setAddedSuccess(true);
            setTimeout(() => setAddedSuccess(false), 2000);
            toast.success(`${quantity}x added to cart ⚡`);
        } catch {
            toast.error("Failed to add to cart");
        } finally {
            setAddingCart(false);
        }
    };

    const handleWishlist = async () => {
        if (!user) { toast.error("Sign in to save items"); return; }
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

    const handleShare = async () => {
        try {
            await navigator.share({ title: product?.name, url: window.location.href });
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
        }
    };

    return (
        <ErrorBoundary>
            <LoadingState
                isLoading={isLoading}
                error={isError ? "Failed to load product. Please try again." : undefined}
            >
                {/* ✅ Fixed: proper if/else JSX structure with all tags closed */}
                {!product ? (
                    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                        <div className="text-center">
                            <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/40 mb-4">Product not found</p>
                            <Link href="/products" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                                ← Back to products
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-screen bg-[#080808] relative">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">

                            {/* Breadcrumb */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center gap-2 mb-8"
                            >
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors group"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                    Back
                                </button>
                                <span className="text-white/15">/</span>
                                <Link href="/products" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                                    Products
                                </Link>
                                {product.category && (
                                    <>
                                        <span className="text-white/15">/</span>
                                        <Link
                                            href={`/products?categoryId=${product.category.id}`}
                                            className="text-xs text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {product.category.name}
                                        </Link>
                                    </>
                                )}
                                <span className="text-white/15">/</span>
                                <span className="text-xs text-white/50 truncate max-w-[200px]">{product.name}</span>
                            </motion.div>

                            {/* Main grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-16">

                                {/* ── Left: Image Gallery ── */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    {/* Main image */}
                                    <div className="relative aspect-square rounded-3xl bg-white/[0.03] border border-white/[0.08] overflow-hidden mb-3 group">
                                        <AnimatePresence mode="wait">
                                            {images[activeImage] ? (
                                                <motion.img
                                                    key={activeImage}
                                                    src={images[activeImage]}
                                                    alt={product.name}
                                                    initial={{ opacity: 0, scale: 1.04 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.97 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Zap className="w-20 h-20 text-white/[0.06]" />
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Nav arrows */}
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/60 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/60 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {product.isFeatured && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-400/15 border border-cyan-400/25 text-xs font-bold text-cyan-400">
                                                    <TrendingUp className="w-3 h-3" /> Featured
                                                </span>
                                            )}
                                            {(toNumber(product.discount) ?? 0) > 0 && (
                                                <span className="px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/25 text-xs font-bold text-amber-400">
                                                    -{product.discount}% OFF
                                                </span>
                                            )}
                                        </div>

                                        {/* Share */}
                                        <button
                                            onClick={handleShare}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white/40 hover:text-white backdrop-blur-sm transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Thumbnails */}
                                    {images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveImage(i)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === activeImage
                                                            ? "border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                                                            : "border-white/[0.06] hover:border-white/20"
                                                        }`}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* ── Right: Product Info ── */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                    className="flex flex-col"
                                >
                                    {/* Brand + category */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {product.brand && (
                                            <span
                                                className="text-xs font-bold text-white/30 uppercase tracking-widest"
                                                style={{ fontFamily: "'Syne', sans-serif" }}
                                            >
                                                {product.brand}
                                            </span>
                                        )}
                                        {product.category && (
                                            <>
                                                <span className="text-white/15">·</span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/35">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {product.category.name}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h1
                                        className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 tracking-tight"
                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                    >
                                        {product.name}
                                    </h1>

                                    {/* Rating */}
                                    {product.rating && (
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-4 h-4 ${s <= Math.round(toNumber(product.rating))
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-white/15"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-semibold text-white/60">{product.rating}</span>
                                            {product.reviewCount && (
                                                <span className="text-sm text-white/25">({product.reviewCount} reviews)</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-end gap-3 mb-6 pb-6 border-b border-white/[0.06]">
                                        <span
                                            className="text-4xl font-black text-white"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            ${formatPrice(
                                                toNumber(product.discount) > 0
                                                    ? toNumber(product.price) * (1 - toNumber(product.discount) / 100)
                                                    : toNumber(product.price)
                                            )}
                                        </span>
                                        {toNumber(product.discount) > 0 && (
                                            <div className="flex flex-col mb-1">
                                                <span className="text-lg text-white/25 line-through">
                                                    ${formatPrice(product.price)}
                                                </span>
                                                <span className="text-xs text-emerald-400 font-semibold">
                                                    Save ${formatPrice(
                                                        toNumber(product.price) - toNumber(product.price) * (1 - toNumber(product.discount) / 100)
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock status */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className={`w-2 h-2 rounded-full ${toNumber(product.stock) > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                                        <span className={`text-xs font-semibold ${toNumber(product.stock) > 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>
                                            {toNumber(product.stock) > 0
                                                ? `In stock (${product.stock} available)`
                                                : "Out of stock"}
                                        </span>
                                    </div>

                                    {/* Quantity */}
                                    {toNumber(product.stock) > 0 && (
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-xs text-white/40 font-medium">Quantity</span>
                                            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                    className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity((q) => Math.min(toNumber(product.stock), q + 1))}
                                                    className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CTAs */}
                                    <div className="flex gap-3 mb-8">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={addingCart || toNumber(product.stock) === 0}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
                                            style={{
                                                background: addedSuccess ? "rgb(52 211 153)" : "rgb(34 211 238)",
                                                color: "black",
                                                boxShadow: addedSuccess
                                                    ? "0 0 24px rgba(52,211,153,0.4)"
                                                    : "0 0 24px rgba(34,211,238,0.3)",
                                            }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {addedSuccess ? (
                                                    <motion.span key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> Added to cart!
                                                    </motion.span>
                                                ) : addingCart ? (
                                                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                                                    </motion.span>
                                                ) : (
                                                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                        <ShoppingCart className="w-4 h-4" />
                                                        {toNumber(product.stock) === 0 ? "Out of stock" : "Add to cart"}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </button>

                                        <button
                                            onClick={handleWishlist}
                                            className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${wishlisted
                                                    ? "bg-red-500/15 border-red-400/30 text-red-400"
                                                    : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]"
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-400" : ""}`} />
                                        </button>
                                    </div>

                                    {/* Trust badges */}
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {[
                                            { icon: Truck, label: "Free Shipping", sub: "Orders $99+" },
                                            { icon: Shield, label: "Secure Pay", sub: "256-bit SSL" },
                                            { icon: RotateCcw, label: "30-day Return", sub: "No questions" },
                                        ].map(({ icon: Icon, label, sub }) => (
                                            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                                                <Icon className="w-4 h-4 text-cyan-400/60" />
                                                <p className="text-[10px] font-semibold text-white/50">{label}</p>
                                                <p className="text-[9px] text-white/25">{sub}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick meta */}
                                    {(product.model || product.sku || product.warranty || product.weight) && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.sku && <MetaRow label="SKU" value={product.sku} />}
                                            {product.model && <MetaRow label="Model" value={product.model} />}
                                            {product.warranty && <MetaRow label="Warranty" value={product.warranty} />}
                                            {product.weight && <MetaRow label="Weight" value={`${product.weight}g`} />}
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* ── Tabs: Specs / Reviews ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Tab bar */}
                                <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit mb-8">
                                    {(["specs", "reviews"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 capitalize ${activeTab === tab
                                                    ? "bg-white/[0.08] text-white shadow-sm"
                                                    : "text-white/35 hover:text-white/60"
                                                }`}
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "specs" ? (
                                        <motion.div
                                            key="specs"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {product.description && (
                                                <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                                    <h3
                                                        className="text-sm font-black text-white mb-3"
                                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                                    >
                                                        About this product
                                                    </h3>
                                                    <p
                                                        className="text-sm text-white/50 leading-relaxed"
                                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                                    >
                                                        {product.description}
                                                    </p>
                                                </div>
                                            )}

                                            {Object.keys(specs).length > 0 && (
                                                <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
                                                    <div className="px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                                                        <h3
                                                            className="text-sm font-black text-white"
                                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                                        >
                                                            Specifications
                                                        </h3>
                                                    </div>
                                                    <div className="divide-y divide-white/[0.04]">
                                                        {Object.entries(specs).map(([key, value]) => (
                                                            <div key={key} className="flex items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                                                                <span className="text-xs font-semibold text-white/35 w-1/3 flex-shrink-0">{key}</span>
                                                                <span className="text-xs text-white/65 flex-1">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {Object.keys(specs).length === 0 && !product.description && (
                                                <p className="text-sm text-white/25 italic">No specifications available.</p>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="reviews"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ReviewsSection productId={id} productRating={toNumber(product.rating)} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Related products */}
                            {product.category && (
                                <RelatedProducts
                                    categoryId={product.category.id}
                                    excludeId={id}
                                />
                            )}
                        </div>
                    </div>
                )}
            </LoadingState>
        </ErrorBoundary>
    );
}

function MetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
            <span className="text-xs text-white/60 font-medium truncate">{value}</span>
        </div>
    );
}