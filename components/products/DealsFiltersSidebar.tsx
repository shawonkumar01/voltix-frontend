"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";

interface Filters {
    search: string;
    categoryId: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    inStock: boolean;
    sortBy: "newest" | "price_low" | "price_high" | "rating" | "name" | "best_selling";
    page: number;
}

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

export default function DealsFiltersSidebar({ filters, onUpdate, onClear, activeCount }: Props) {
    const { data: catData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const categories = catData?.categories || catData?.data || (Array.isArray(catData) ? catData : []);

    return (
        <div className="bg-[#0e0e0e] border-r border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Filters {activeCount > 0 && <span className="text-cyan-400 ml-1">({activeCount})</span>}
                </span>
                <button onClick={onClear} className="text-white/40 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <Section title="Sort By">
                <div className="space-y-2">
                    {[
                        { value: "price_low", label: "Price: Low to High" },
                        { value: "price_high", label: "Price: High to Low" },
                        { value: "newest", label: "Newest First" },
                        { value: "rating", label: "Highest Rated" },
                        { value: "name", label: "Name: A-Z" },
                        { value: "best_selling", label: "Best Selling" },
                    ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="sortBy"
                                value={option.value}
                                checked={filters.sortBy === option.value}
                                onChange={() => onUpdate({ sortBy: option.value as any })}
                                className="w-3 h-3 text-cyan-400 border-white/20 bg-white/10 focus:ring-cyan-400/50 focus:ring-offset-0"
                            />
                            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </Section>

            <Section title="Category">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat: { id: string; name: string }) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="categoryId"
                                value={cat.id}
                                checked={filters.categoryId === cat.id}
                                onChange={() => onUpdate({ categoryId: cat.id })}
                                className="w-3 h-3 text-cyan-400 border-white/20 bg-white/10 focus:ring-cyan-400/50 focus:ring-offset-0"
                            />
                            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </Section>

            <Section title="Price Range">
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-white/50 mb-1 block">Min Price</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => onUpdate({ minPrice: e.target.value })}
                            className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-white/50 mb-1 block">Max Price</label>
                        <input
                            type="number"
                            placeholder="1000"
                            value={filters.maxPrice}
                            onChange={(e) => onUpdate({ maxPrice: e.target.value })}
                            className="w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 transition-all"
                        />
                    </div>
                </div>
            </Section>

            <Section title="Availability">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => onUpdate({ inStock: e.target.checked })}
                        className="w-3 h-3 text-cyan-400 border-white/20 bg-white/10 rounded focus:ring-cyan-400/50 focus:ring-offset-0"
                    />
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                        In Stock Only
                    </span>
                </label>
            </Section>
        </div>
    );
}
