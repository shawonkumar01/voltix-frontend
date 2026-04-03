"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import type { Filters, SortOption } from "@/app/(main)/products/page";

interface Props {
    filters: Filters;
    onUpdate: (updates: Partial<Filters>) => void;
    onClear: () => void;
    activeCount: number;
}

function Section({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/[0.06] pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full mb-3 group"
            >
                <span
                    className="text-xs font-bold text-white/50 uppercase tracking-widest group-hover:text-white/70 transition-colors"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                >
                    {title}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FiltersSidebar({ filters, onUpdate, onClear, activeCount }: Props) {
    const { data: catData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const categories = catData?.data || catData || [];

    const popularBrands = ["Apple", "Samsung", "Sony", "Dell", "LG", "Asus", "Microsoft", "Google"];

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span
                        className="text-sm font-black text-white"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Filters
                    </span>
                    {activeCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>

            {/* Categories */}
            <Section title="Category">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onUpdate({ categoryId: "" })}
                        className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${!filters.categoryId
                                ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-semibold"
                                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat: { id: string; name: string }) => (
                        <button
                            key={cat.id}
                            onClick={() => onUpdate({ categoryId: cat.id })}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${filters.categoryId === cat.id
                                    ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-semibold"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Price range */}
            <Section title="Price Range">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <label className="text-[10px] text-white/25 mb-1 block">Min ($)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => onUpdate({ minPrice: e.target.value })}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 transition-all"
                        />
                    </div>
                    <div className="w-3 h-px bg-white/20 mt-4 flex-shrink-0" />
                    <div className="flex-1">
                        <label className="text-[10px] text-white/25 mb-1 block">Max ($)</label>
                        <input
                            type="number"
                            placeholder="9999"
                            value={filters.maxPrice}
                            onChange={(e) => onUpdate({ maxPrice: e.target.value })}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 transition-all"
                        />
                    </div>
                </div>
                {/* Quick price presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                        { label: "Under $100", min: "", max: "100" },
                        { label: "$100–500", min: "100", max: "500" },
                        { label: "$500–1000", min: "500", max: "1000" },
                        { label: "$1000+", min: "1000", max: "" },
                    ].map(({ label, min, max }) => (
                        <button
                            key={label}
                            onClick={() => onUpdate({ minPrice: min, maxPrice: max })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${filters.minPrice === min && filters.maxPrice === max
                                    ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400"
                                    : "bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/60 hover:bg-white/[0.06]"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Brands */}
            <Section title="Brand" defaultOpen={false}>
                <div className="flex flex-col gap-1">
                    {popularBrands.map((brand) => (
                        <button
                            key={brand}
                            onClick={() => onUpdate({ brand: filters.brand === brand ? "" : brand })}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${filters.brand === brand
                                    ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-semibold"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                                }`}
                        >
                            {brand}
                            {filters.brand === brand && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            )}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Sort (mobile only - desktop has it in header) */}
            <Section title="Sort By" defaultOpen={false}>
                <div className="flex flex-col gap-1">
                    {([
                        { value: "newest", label: "Newest first" },
                        { value: "price_low", label: "Price: Low to High" },
                        { value: "price_high", label: "Price: High to Low" },
                        { value: "rating", label: "Top Rated" },
                        { value: "best_selling", label: "Best Selling" },
                        { value: "name", label: "Name A–Z" },
                    ] as { value: SortOption; label: string }[]).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => onUpdate({ sortBy: value })}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${filters.sortBy === value
                                    ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-semibold"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Toggles */}
            <Section title="Availability" defaultOpen={false}>
                <div className="flex flex-col gap-2.5">
                    <Toggle
                        label="In Stock Only"
                        checked={filters.inStock}
                        onChange={(v) => onUpdate({ inStock: v })}
                    />
                    <Toggle
                        label="Featured Items"
                        checked={filters.isFeatured}
                        onChange={(v) => onUpdate({ isFeatured: v })}
                    />
                </div>
            </Section>
        </div>
    );
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs text-white/45 group-hover:text-white/70 transition-colors">
                {label}
            </span>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${checked ? "bg-cyan-400/30 border border-cyan-400/40" : "bg-white/[0.06] border border-white/[0.10]"
                    }`}
            >
                <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${checked ? "left-[18px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "left-0.5 bg-white/30"
                        }`}
                />
            </button>
        </label>
    );
}