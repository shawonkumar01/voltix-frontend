"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api/reviews";

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const { data: featuredReviews, isLoading } = useQuery({
        queryKey: ["featured-reviews"],
        queryFn: async () => {
            const res = await reviewsApi.getFeatured();
            return res.data;
        },
    });

    const testimonials = featuredReviews || [];

    // Default testimonials if no featured reviews
    const defaultTestimonials = [
        {
            id: "1",
            user: { firstName: "Sarah", lastName: "Johnson" },
            rating: 5,
            title: "Tech Enthusiast",
            comment: "Voltix has been my go-to store for all things tech. Their customer service is exceptional, and the product quality is always top-notch. Fast shipping and great prices!",
            product: { name: "MacBook Pro 14\"" },
            createdAt: new Date().toISOString(),
            isVerifiedPurchase: true,
        },
        {
            id: "2",
            user: { firstName: "Michael", lastName: "Chen" },
            rating: 5,
            title: "Professional Photographer",
            comment: "I bought my camera gear from Voltix and couldn't be happier. The team helped me choose the perfect setup, and their after-sales support is amazing. Highly recommend!",
            product: { name: "Sony A7R V" },
            createdAt: new Date().toISOString(),
            isVerifiedPurchase: true,
        },
        {
            id: "3",
            user: { firstName: "Emily", lastName: "Rodriguez" },
            rating: 5,
            title: "Software Developer",
            comment: "Best online shopping experience I've had. The website is easy to navigate, prices are competitive, and delivery was faster than expected. Will definitely shop again.",
            product: { name: "Dell XPS 15" },
            createdAt: new Date().toISOString(),
            isVerifiedPurchase: true,
        },
    ];

    const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
    };

    const goToTestimonial = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto-play functionality
    React.useEffect(() => {
        if (!isAutoPlaying || displayTestimonials.length === 0) return;
        
        const interval = setInterval(nextTestimonial, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, displayTestimonials.length]);

    if (isLoading) {
        return (
            <section className="bg-[#080808] py-20 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
            </section>
        );
    }

    const currentTestimonial = displayTestimonials[currentIndex];
    if (!currentTestimonial) return null;

    return (
        <section className="bg-[#080808] py-20 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/3 rounded-full blur-[120px]" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-6">
                        <Star className="w-4 h-4 text-cyan-400 fill-current" />
                        <span className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase">
                            Customer Reviews
                        </span>
                    </div>
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        What Our Customers Say
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        Real reviews from real customers who love shopping with Voltix
                    </p>
                </motion.div>

                {/* Testimonial Carousel */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 md:p-12 relative overflow-hidden">
                                {/* Quote Icon */}
                                <Quote className="absolute top-6 right-6 w-12 h-12 text-cyan-400/10" />
                                
                                <div className="grid md:grid-cols-[1fr,auto] gap-8 items-start">
                                    {/* Content */}
                                    <div className="space-y-6">
                                        {/* Rating */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < currentTestimonial.rating
                                                            ? "text-cyan-400 fill-current"
                                                            : "text-white/10"
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        {/* Review Text */}
                                        <blockquote className="text-lg text-white/70 leading-relaxed">
                                            "{currentTestimonial.comment}"
                                        </blockquote>

                                        {/* Author Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 flex items-center justify-center">
                                                <span className="text-lg font-bold text-cyan-400">
                                                    {currentTestimonial.user?.firstName?.charAt(0) || "U"}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">
                                                    {currentTestimonial.user?.firstName} {currentTestimonial.user?.lastName}
                                                </div>
                                                {currentTestimonial.isVerifiedPurchase && (
                                                    <div className="text-sm text-cyan-400">Verified Purchase</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product & Date */}
                                        <div className="flex items-center gap-4 text-sm text-white/30">
                                            <span>Purchased: {currentTestimonial.product?.name || "Unknown Product"}</span>
                                            <span>•</span>
                                            <span>{new Date(currentTestimonial.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevTestimonial}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-white/[0.1] border border-white/[0.2] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.2] transition-all duration-200 z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextTestimonial}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-white/[0.1] border border-white/[0.2] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.2] transition-all duration-200 z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {displayTestimonials.map((_: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => goToTestimonial(index)}
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                            className={`transition-all duration-300 ${
                                index === currentIndex
                                    ? "w-8 h-2 bg-cyan-400 rounded-full"
                                    : "w-2 h-2 bg-white/20 rounded-full hover:bg-white/40"
                            }`}
                        />
                    ))}
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/[0.05]"
                >
                    <div className="text-center">
                        <div className="text-2xl font-black text-cyan-400 mb-1">4.9/5</div>
                        <div className="text-sm text-white/40">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-cyan-400 mb-1">12,847</div>
                        <div className="text-sm text-white/40">Customer Reviews</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-cyan-400 mb-1">98%</div>
                        <div className="text-sm text-white/40">Would Recommend</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
