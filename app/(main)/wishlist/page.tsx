"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { wishlistApi } from "@/lib/api/wishlist";
import { useAuthStore } from "@/stores/auth.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export default function WishlistPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { removeItem: removeFromWishlistStore, clearWishlist, syncFromAPI } = useWishlistStore();

    // Only redirect if user is not authenticated
    useEffect(() => {
        if (user === null) {
            toast.error("Please sign in to view your wishlist");
            router.push("/login");
        }
    }, [user, router]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["wishlist"],
        queryFn: async () => {
            const res = await wishlistApi.get();
            return res.data;
        },
        enabled: !!user,
        staleTime: 0, // Always consider data stale
        refetchOnWindowFocus: true, // Refetch when window gains focus
        refetchOnMount: true, // Always refetch when component mounts
    });

    // Sync API data to store when data changes
    useEffect(() => {
        if (data) {
            const items = data?.data || data?.items || data?.wishlist?.items || [];
            syncFromAPI({ items });
        }
    }, [data, syncFromAPI]);

    const items = data?.data || data?.items || data?.wishlist?.items || [];

    const removeMutation = useMutation({
        mutationFn: (productId: string) => wishlistApi.removeByProduct(productId),
        onSuccess: (_, productId) => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            removeFromWishlistStore(productId);
            toast.success("Item removed from wishlist");
        },
        onError: () => toast.error("Failed to remove item"),
    });

    const clearMutation = useMutation({
        mutationFn: () => wishlistApi.clear(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            clearWishlist();
            toast.success("Wishlist cleared");
        },
        onError: () => toast.error("Failed to clear wishlist"),
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (!isLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/4 rounded-full blur-[100px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center relative z-10 px-4"
                >
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-9 h-9 text-white/15" />
                    </div>
                    <h2
                        className="text-2xl font-black text-white mb-2 tracking-tight"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Your wishlist is empty
                    </h2>
                    <p className="text-sm text-white/35 mb-8 max-w-xs mx-auto">
                        Save your favorite items for later
                    </p>
                    <button
                        onClick={() => router.push("/products")}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:shadow-[0_0_36px_rgba(34,211,238,0.45)] group"
                    >
                        Browse products
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </motion.div>
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
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1
                            className="text-2xl font-black text-white tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            My Wishlist
                            <span className="ml-2 text-base font-bold text-white/25">({items.length} {items.length === 1 ? "item" : "items"})</span>
                        </h1>
                        <p className="text-xs text-white/30 mt-0.5">Your saved favorites</p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => clearMutation.mutate()}
                            disabled={clearMutation.isPending}
                            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-red-400 transition-colors"
                        >
                            {clearMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Clear all
                        </button>
                    )}
                </motion.div>

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-white/30 text-sm">Failed to load wishlist. Is your backend running?</p>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {items.map((item: any, index: number) => {
                            const product = item.product || item;
                            const finalPrice = product.discount
                                ? Number(product.price) * (1 - Number(product.discount) / 100)
                                : Number(product.price);

                            return (
                                <motion.div
                                    key={item.id || product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group"
                                >
                                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300">
                                        {/* Image */}
                                        <div className="relative aspect-square bg-white/[0.02] overflow-hidden">
                                            {product.images?.[0] ? (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">Image</span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-12 h-12 text-white/[0.05]" />
                                                </div>
                                            )}
                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeMutation.mutate(product.id)}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {product.brand && (
                                                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    {product.brand}
                                                </p>
                                            )}
                                            <h3
                                                className="text-sm font-semibold text-white/80 line-clamp-2 mb-2"
                                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                                            >
                                                {product.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-black text-white/70" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    ${finalPrice.toFixed(2)}
                                                </span>
                                                {(Number(product.discount) ?? 0) > 0 && (
                                                    <>
                                                        <span className="text-xs text-white/20 line-through">${Number(product.price).toFixed(2)}</span>
                                                        <span className="text-[10px] text-amber-400/70 font-semibold">-{product.discount}%</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
