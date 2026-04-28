"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Clock, Eye, ArrowRight, Play, FileText, Video, Lightbulb, ChevronRight } from "lucide-react";

interface ContentItem {
    id: string;
    title: string;
    description: string;
    category: "guide" | "review" | "news" | "tutorial";
    readTime: string;
    views: string;
    image: string;
    date: string;
    featured?: boolean;
}

const content: ContentItem[] = [
    {
        id: "1",
        title: "Ultimate Laptop Buying Guide 2024",
        description: "Everything you need to know before buying your next laptop - specs, brands, and budget recommendations.",
        category: "guide",
        readTime: "8 min",
        views: "15.2k",
        image: "/content/laptop-guide.jpg",
        date: "2 days ago",
        featured: true
    },
    {
        id: "2",
        title: "iPhone 15 Pro vs Samsung S24 Ultra",
        description: "In-depth comparison of the two flagship smartphones. Which one should you buy in 2024?",
        category: "review",
        readTime: "12 min",
        views: "8.7k",
        image: "/content/phone-comparison.jpg",
        date: "1 week ago",
        featured: true
    },
    {
        id: "3",
        title: "Best Gaming Headsets Under $100",
        description: "We tested 20 gaming headsets to find the best options for budget-conscious gamers.",
        category: "review",
        readTime: "6 min",
        views: "5.3k",
        image: "/content/headsets.jpg",
        date: "3 days ago"
    },
    {
        id: "4",
        title: "How to Build Your First PC",
        description: "Step-by-step tutorial for beginners. From choosing components to first boot.",
        category: "tutorial",
        readTime: "15 min",
        views: "22.1k",
        image: "/content/pc-build.jpg",
        date: "5 days ago"
    },
    {
        id: "5",
        title: "Apple Vision Pro: First Impressions",
        description: "Our hands-on experience with Apple's revolutionary spatial computer.",
        category: "news",
        readTime: "10 min",
        views: "31.5k",
        image: "/content/vision-pro.jpg",
        date: "1 day ago",
        featured: true
    },
    {
        id: "6",
        title: "Wireless Earbuds Buying Guide",
        description: "Sound quality, battery life, and comfort - what matters most when choosing earbuds.",
        category: "guide",
        readTime: "7 min",
        views: "9.8k",
        image: "/content/earbuds.jpg",
        date: "4 days ago"
    }
];

const categories = [
    { name: "All", icon: BookOpen, count: content.length },
    { name: "Guides", icon: FileText, count: content.filter(c => c.category === "guide").length },
    { name: "Reviews", icon: TrendingUp, count: content.filter(c => c.category === "review").length },
    { name: "News", icon: Video, count: content.filter(c => c.category === "news").length },
    { name: "Tutorials", icon: Lightbulb, count: content.filter(c => c.category === "tutorial").length }
];

export default function EducationalContentHub() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredContent = activeCategory === "All" 
        ? content 
        : content.filter(item => item.category === activeCategory.toLowerCase());

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "guide": return FileText;
            case "review": return TrendingUp;
            case "news": return Video;
            case "tutorial": return Lightbulb;
            default: return BookOpen;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "guide": return "text-blue-400";
            case "review": return "text-green-400";
            case "news": return "text-red-400";
            case "tutorial": return "text-purple-400";
            default: return "text-cyan-400";
        }
    };

    const featuredContent = content.filter(item => item.featured);
    const regularContent = filteredContent.filter(item => !item.featured);

    return (
        <section className="bg-[#080808] py-20 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/3 rounded-full blur-[120px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-6">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase">
                            Learning Hub
                        </span>
                    </div>
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Tech Insights & Guides
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        Stay informed with our expert reviews, buying guides, and the latest tech news
                    </p>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 justify-center mb-12"
                >
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.name}
                                onClick={() => setActiveCategory(category.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeCategory === category.name
                                        ? "bg-cyan-400/10 border border-cyan-400/30 text-cyan-400"
                                        : "bg-white/[0.03] border border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{category.name}</span>
                                <span className="text-xs text-white/30">({category.count})</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Featured Content */}
                {featuredContent.length > 0 && activeCategory === "All" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h3 className="text-xl font-semibold text-white mb-6">Featured Articles</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featuredContent.map((item, index) => {
                                const Icon = getCategoryIcon(item.category);
                                return (
                                    <motion.article
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-400/25 transition-all duration-300">
                                            {/* Image Placeholder */}
                                            <div className="h-48 bg-gradient-to-br from-white/[0.05] to-white/[0.02] relative overflow-hidden">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Icon className={`w-12 h-12 ${getCategoryColor(item.category)}`} />
                                                </div>
                                                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                                                    <span className={`text-xs font-semibold ${getCategoryColor(item.category)}`}>
                                                        {item.category.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-6">
                                                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {item.description}
                                                </p>
                                                
                                                <div className="flex items-center justify-between text-xs text-white/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{item.readTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            <span>{item.views}</span>
                                                        </div>
                                                    </div>
                                                    <span>{item.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Regular Content Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {regularContent.map((item, index) => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                            <motion.article
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-400/25 transition-all duration-300">
                                    {/* Image Placeholder */}
                                    <div className="h-32 bg-gradient-to-br from-white/[0.05] to-white/[0.02] relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon className={`w-8 h-8 ${getCategoryColor(item.category)}`} />
                                        </div>
                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                                            <span className={`text-[10px] font-semibold ${getCategoryColor(item.category)}`}>
                                                {item.category.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">
                                            {item.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-[10px] text-white/30">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{item.readTime}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    <span>{item.views}</span>
                                                </div>
                                            </div>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border border-cyan-400/20">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-6">
                            <Play className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Want to contribute?</h3>
                        <p className="text-white/40 mb-6 max-w-2xl mx-auto">
                            Share your tech expertise with our community. Write reviews, create tutorials, and help others make informed decisions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="/blog/contribute"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-semibold rounded-xl hover:bg-cyan-300 transition-colors"
                            >
                                Become a Contributor
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href="/blog"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                View All Articles
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
