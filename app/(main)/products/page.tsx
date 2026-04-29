"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, Grid3X3, List, ChevronDown } from "lucide-react";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { wishlistApi } from "@/lib/api/wishlist";
import ProductGrid from "@/components/products/ProductGrid";
import FiltersSidebar from "@/components/products/FiltersSidebar";
import { useAuthStore } from "@/stores/auth.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export type SortOption = "newest" | "price_low" | "price_high" | "rating" | "name" | "best_selling";

export interface Filters {
    search: string;
    categoryId: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    inStock: boolean;
    isFeatured: boolean;
    sortBy: SortOption;
    page: number;
}

const LIMIT = 12;

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const { user } = useAuthStore();
    const { syncFromAPI } = useWishlistStore();

    // Load wishlist from API when user is logged in
    useEffect(() => {
        if (user) {
            wishlistApi.get().then(res => {
                const items = res.data?.data || res.data?.items || res.data?.wishlist?.items || [];
                syncFromAPI({ items });
            }).catch(() => {
                // Silently fail - wishlist might be empty or API error
            });
        }
    }, [user, syncFromAPI]);

    const getFilters = useCallback((): Filters => ({
        search: searchParams.get("search") || "",
        categoryId: searchParams.get("categoryId") || "",
        brand: searchParams.get("brand") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        inStock: searchParams.get("inStock") === "true",
        isFeatured: searchParams.get("isFeatured") === "true",
        sortBy: (searchParams.get("sortBy") as SortOption) || "newest",
        page: Number(searchParams.get("page") || 1),
    }), [searchParams]);

    const filters = getFilters();

    const updateFilters = (updates: Partial<Filters>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === false || value === undefined) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        if (!("page" in updates)) params.set("page", "1");
        const newUrl = `/products?${params.toString()}`;
        router.push(newUrl);
    };

    const clearAllFilters = () => {
        router.push("/products");
    };

    const activeFilterCount = [
        filters.search,
        filters.categoryId,
        filters.brand,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
        filters.isFeatured,
    ].filter(Boolean).length;

    const queryOptions: UseQueryOptions<any, Error> = {
        queryKey: ["products", filters],
        queryFn: async () => {
            const params: Record<string, unknown> = {
                page: filters.page,
                limit: LIMIT,
                sortBy: filters.sortBy,
            };
            if (filters.search) params.query = filters.search;
            if (filters.categoryId) params.categories = [filters.categoryId];
            if (filters.brand) params.brands = [filters.brand];
            if (filters.minPrice) params.minPrice = Number(filters.minPrice);
            if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
            if (filters.inStock) params.inStock = true;
            if (filters.isFeatured) params.isFeatured = true;

            const res = await productsApi.advancedSearch(params);
            return res.data;
        },
        enabled: true,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    };

    const { data, isLoading, isError } = useQuery(queryOptions);

    const products = data?.data || [];
    const total = data?.meta?.total || 0;
    const totalPages = Math.ceil(total / LIMIT);

    // Fetch categories for filter chip labels
    const { data: catData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const categories = catData?.categories || catData?.data || (Array.isArray(catData) ? catData : []);
    const getCategoryName = (id: string) => {
        const cat = categories.find((c: { id: string; name: string }) => c.id === id);
        return cat?.name || id;
    };

    useEffect(() => {
        if (filters.categoryId) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    }, [filters.categoryId, queryClient]);

    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 1024) setFiltersOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Page header */}
            <div className="border-b border-white/[0.05] bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: title + count */}
                        <div className="flex items-center gap-4">
                            <div>
                                <h1
                                    className="text-lg font-black text-white tracking-tight"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {filters.search ? `"${filters.search}"` : "All Products"}
                                </h1>
                                <p className="text-xs text-white/30 mt-0.5">
                                    {isLoading ? "Loading..." : `${total.toLocaleString()} results`}
                                </p>
                            </div>
                        </div>

                        {/* Right: search bar + controls */}
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            {/* Inline search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                                />
                                {filters.search && (
                                    <button
                                        onClick={() => updateFilters({ search: "" })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <SortDropdown
                                value={filters.sortBy}
                                onChange={(v) => updateFilters({ sortBy: v })}
                            />

                            {/* View mode */}
                            <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
                                >
                                    <Grid3X3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Filter toggle */}
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/60 hover:text-white transition-all text-xs font-medium lg:hidden"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    <AnimatePresence>
                        {activeFilterCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 mt-3 flex-wrap"
                            >
                                {filters.search && (
                                    <FilterChip label={`Search: ${filters.search}`} onRemove={() => updateFilters({ search: "" })} />
                                )}
                                {filters.categoryId && (
                                    <FilterChip label={`Category: ${getCategoryName(filters.categoryId)}`} onRemove={() => updateFilters({ categoryId: "" })} />
                                )}
                                {filters.brand && (
                                    <FilterChip label={`Brand: ${filters.brand}`} onRemove={() => updateFilters({ brand: "" })} />
                                )}
                                {filters.minPrice && (
                                    <FilterChip label={`Min: $${filters.minPrice}`} onRemove={() => updateFilters({ minPrice: "" })} />
                                )}
                                {filters.maxPrice && (
                                    <FilterChip label={`Max: $${filters.maxPrice}`} onRemove={() => updateFilters({ maxPrice: "" })} />
                                )}
                                {filters.inStock && (
                                    <FilterChip label="In Stock" onRemove={() => updateFilters({ inStock: false })} />
                                )}
                                {filters.isFeatured && (
                                    <FilterChip label="Featured" onRemove={() => updateFilters({ isFeatured: false })} />
                                )}
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs text-white/30 hover:text-red-400 transition-colors ml-1"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Body: sidebar + grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-60 flex-shrink-0">
                    <FiltersSidebar
                        filters={filters}
                        onUpdate={updateFilters}
                        onClear={clearAllFilters}
                        activeCount={activeFilterCount}
                    />
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <ProductGrid
                        products={products}
                        isLoading={isLoading}
                        isError={isError}
                        viewMode={viewMode}
                        total={total}
                        page={filters.page}
                        totalPages={totalPages}
                        onPageChange={(p) => updateFilters({ page: p })}
                    />
                </div>
            </div>

            {/* Mobile filters drawer */}
            <AnimatePresence>
                {filtersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFiltersOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#0e0e0e] border-r border-white/[0.08] z-50 overflow-y-auto lg:hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                                <span className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Filters {activeFilterCount > 0 && <span className="text-cyan-400">({activeFilterCount})</span>}
                                </span>
                                <button onClick={() => setFiltersOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4">
                                <FiltersSidebar
                                    filters={filters}
                                    onUpdate={(u) => { updateFilters(u); }}
                                    onClear={() => { clearAllFilters(); setFiltersOpen(false); }}
                                    activeCount={activeFilterCount}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
    const [open, setOpen] = useState(false);

    const options = [
        { value: "newest", label: "Newest" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "rating", label: "Top Rated" },
        { value: "best_selling", label: "Best Selling" },
        { value: "name", label: "Name A-Z" },
    ] as { value: SortOption; label: string }[];

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative hidden sm:block">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/60 outline-none hover:border-cyan-400/40 transition-all cursor-pointer whitespace-nowrap"
            >
                {selected?.label}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1.5 w-48 bg-[#0e0e0e] border border-white/[0.08] rounded-xl overflow-hidden z-20 shadow-xl shadow-black/40"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2.5 text-xs transition-all flex items-center gap-2 ${
                                        value === opt.value
                                            ? "bg-cyan-400/10 text-cyan-400 font-semibold"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value === opt.value ? "bg-cyan-400" : "bg-transparent"}`} />
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400/80"
        >
            {label}
            <button onClick={onRemove} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
            </button>
        </motion.span>
    );
}