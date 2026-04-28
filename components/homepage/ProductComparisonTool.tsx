"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, ArrowRight, HelpCircle, Star } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    specs: {
        [key: string]: string;
    };
}

const sampleProducts: Product[] = [
    {
        id: "1",
        name: "MacBook Pro 14\"",
        price: 1999,
        image: "/products/macbook-pro.jpg",
        rating: 4.8,
        specs: {
            "Processor": "M3 Pro",
            "RAM": "16GB",
            "Storage": "512GB SSD",
            "Display": "14.2\" Liquid Retina XDR",
            "Battery": "18 hours",
            "Weight": "3.5 lbs"
        }
    },
    {
        id: "2", 
        name: "Dell XPS 15",
        price: 1799,
        image: "/products/dell-xps.jpg",
        rating: 4.6,
        specs: {
            "Processor": "Intel Core i7-13700H",
            "RAM": "16GB",
            "Storage": "1TB SSD",
            "Display": "15.6\" OLED",
            "Battery": "12 hours",
            "Weight": "4.2 lbs"
        }
    },
    {
        id: "3",
        name: "ASUS ROG Strix",
        price: 1599,
        image: "/products/asus-rog.jpg",
        rating: 4.7,
        specs: {
            "Processor": "AMD Ryzen 9",
            "RAM": "32GB",
            "Storage": "1TB SSD",
            "Display": "15.6\" 165Hz",
            "Battery": "8 hours",
            "Weight": "5.1 lbs"
        }
    }
];

const categories = ["Laptops", "Smartphones", "Tablets", "Headphones", "Cameras", "Gaming"];

export default function ProductComparisonTool() {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const addProduct = (product: Product) => {
        if (selectedProducts.length < 3 && !selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const removeProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
        if (selectedProducts.length <= 2) {
            setShowComparison(false);
        }
    };

    const allSpecs = selectedProducts.length > 0 
        ? Array.from(new Set(selectedProducts.flatMap(p => Object.keys(p.specs))))
        : [];

    return (
        <section className="bg-[#080808] py-20 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-6">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase">
                            Compare Products
                        </span>
                    </div>
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Find Your Perfect Match
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        Compare up to 3 products side-by-side to make the best choice for your needs
                    </p>
                </motion.div>

                {/* Category Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 justify-center mb-8"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white transition-all duration-200"
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                Selected ({selectedProducts.length}/3)
                            </h3>
                            {selectedProducts.length >= 2 && (
                                <button
                                    onClick={() => setShowComparison(!showComparison)}
                                    className="px-4 py-2 bg-cyan-400 text-black text-sm font-semibold rounded-xl hover:bg-cyan-300 transition-colors"
                                >
                                    {showComparison ? "Hide" : "Show"} Comparison
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {selectedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex-shrink-0 w-64 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center">
                                            <span className="text-lg font-bold text-white/30">
                                                {product.name.charAt(0)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeProduct(product.id)}
                                            className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <h4 className="font-semibold text-white mb-1">{product.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <span className="text-cyan-400 font-semibold">${product.price}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span>{product.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedProducts.length < 3 && (
                                <div className="flex-shrink-0 w-64 p-4 rounded-2xl border-2 border-dashed border-white/[0.2] flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto mb-3">
                                            <Plus className="w-6 h-6 text-white/40" />
                                        </div>
                                        <p className="text-sm text-white/40">Add another product</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Sample Products Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="grid md:grid-cols-3 gap-6 mb-12"
                >
                    {sampleProducts.map((product) => {
                        const isSelected = selectedProducts.find(p => p.id === product.id);
                        return (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 rounded-2xl border transition-all duration-300 ${
                                    isSelected 
                                        ? "bg-cyan-400/10 border-cyan-400/30" 
                                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center">
                                        <span className="text-xl font-bold text-white/30">
                                            {product.name.charAt(0)}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-black" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-bold text-cyan-400">${product.price}</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-white/60">{product.rating}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => isSelected ? removeProduct(product.id) : addProduct(product)}
                                    disabled={!isSelected && selectedProducts.length >= 3}
                                    className={`w-full py-2 rounded-xl font-medium transition-all duration-200 ${
                                        isSelected
                                            ? "bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20"
                                            : selectedProducts.length >= 3
                                            ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                                            : "bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20"
                                    }`}
                                >
                                    {isSelected ? "Remove" : selectedProducts.length >= 3 ? "Max Selected" : "Add to Compare"}
                                </button>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Comparison Table */}
                <AnimatePresence>
                    {showComparison && selectedProducts.length >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="overflow-x-auto"
                        >
                            <div className="min-w-[800px]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.1]">
                                            <th className="text-left py-4 px-4 text-white/60 font-medium">Feature</th>
                                            {selectedProducts.map((product) => (
                                                <th key={product.id} className="text-center py-4 px-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center">
                                                            <span className="text-lg font-bold text-white/30">
                                                                {product.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">{product.name}</div>
                                                            <div className="text-cyan-400 font-bold">${product.price}</div>
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-white/[0.05]">
                                            <td className="py-4 px-4 text-white/60">Rating</td>
                                            {selectedProducts.map((product) => (
                                                <td key={product.id} className="text-center py-4 px-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="text-white font-semibold">{product.rating}</span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                        {allSpecs.map((spec) => (
                                            <tr key={spec} className="border-b border-white/[0.05]">
                                                <td className="py-4 px-4 text-white/60 font-medium">{spec}</td>
                                                {selectedProducts.map((product) => (
                                                    <td key={product.id} className="text-center py-4 px-4 text-white">
                                                        {product.specs[spec] || "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <a
                        href="/compare"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                        Advanced Comparison Tool
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
