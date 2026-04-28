"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cartApi } from "@/lib/api/cart";
import { useCartStore } from "@/stores/cart.store";

interface CartItemProps {
    item: {
        id: string;
        quantity: number;
        product: {
            id: string;
            name: string;
            price: number;
            discount?: number;
            images?: string[];
            brand?: string;
            stock?: number;
        };
    };
    index: number;
}

export default function CartItem({ item, index }: CartItemProps) {
    const queryClient = useQueryClient();
    const { setItemCount } = useCartStore();
    const [localQty, setLocalQty] = useState(item.quantity);

    const finalPrice = item.product.discount
        ? Number(item.product.price) * (1 - Number(item.product.discount) / 100)
        : Number(item.product.price);
    const lineTotal = finalPrice * localQty;

    const updateMutation = useMutation({
        mutationFn: (qty: number) => cartApi.update(item.id, qty),
        onSuccess: (_, qty) => {
            setLocalQty(qty);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: () => {
            setLocalQty(item.quantity);
            toast.error("Failed to update quantity");
        },
    });

    const removeMutation = useMutation({
        mutationFn: () => cartApi.remove(item.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Item removed");
        },
        onError: () => toast.error("Failed to remove item"),
    });

    const handleQtyChange = (newQty: number) => {
        if (newQty < 1 || newQty > (item.product.stock ?? 99)) return;
        setLocalQty(newQty);
        updateMutation.mutate(newQty);
    };

    const isUpdating = updateMutation.isPending;
    const isRemoving = removeMutation.isPending;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className={`group flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] transition-all duration-300 ${isRemoving ? "opacity-40 pointer-events-none" : ""}`}
        >
            <Link
                href={`/products/${item.product.id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] transition-colors"
            >
                {item.product.images?.[0] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Image</span>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-7 h-7 text-white/[0.07]" />
                    </div>
                )}
            </Link>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
                {item.product.brand && (
                    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {item.product.brand}
                    </p>
                )}
                <Link
                    href={`/products/${item.product.id}`}
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors leading-snug line-clamp-2 block"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    {item.product.name}
                </Link>

                <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-white/70" style={{ fontFamily: "'Syne', sans-serif" }}>
                        ${finalPrice.toFixed(2)}
                    </span>
                    {(Number(item.product.discount) ?? 0) > 0 && (
                        <>
                            <span className="text-xs text-white/20 line-through">${Number(item.product.price).toFixed(2)}</span>
                            <span className="text-[10px] text-amber-400/70 font-semibold">-{item.product.discount}%</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                    <button
                        onClick={() => handleQtyChange(localQty - 1)}
                        disabled={localQty <= 1 || isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Minus className="w-3 h-3" />
                    </button>

                    <div className="w-8 h-8 flex items-center justify-center">
                        {isUpdating ? (
                            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                        ) : (
                            <span className="text-xs font-bold text-white">{localQty}</span>
                        )}
                    </div>

                    <button
                        onClick={() => handleQtyChange(localQty + 1)}
                        disabled={localQty >= (item.product.stock ?? 99) || isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                <span className="text-sm font-black text-white ml-auto" style={{ fontFamily: "'Syne', sans-serif" }}>
                    ${lineTotal.toFixed(2)}
                </span>

                <button
                    onClick={() => removeMutation.mutate()}
                    disabled={isRemoving}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/[0.08] transition-all duration-200"
                >
                    {isRemoving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        </motion.div>
    );
}