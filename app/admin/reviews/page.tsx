"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Star, ArrowLeft, Loader2, Search, Trash2, ThumbsUp,
    MessageSquare, User, Package, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { reviewsApi } from "@/lib/api/reviews";

export default function AdminReviewsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isAdmin } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) {
            toast.error("Please sign in");
            router.push("/login");
        } else if (!isAdmin()) {
            toast.error("Access denied. Admin only.");
            router.push("/");
        }
    }, [user, isAdmin, router]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-reviews"],
        queryFn: async () => {
            const res = await reviewsApi.getAll();
            return res.data;
        },
        enabled: isAdmin(),
    });

    const deleteMutation = useMutation({
        mutationFn: reviewsApi.adminDelete,
        onSuccess: () => {
            toast.success("Review deleted");
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
        },
        onError: () => toast.error("Failed to delete review"),
    });

    const toggleFeaturedMutation = useMutation({
        mutationFn: reviewsApi.toggleFeatured,
        onSuccess: (res: any) => {
            toast.success(res.data?.message || "Review featured status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
        },
        onError: () => toast.error("Failed to toggle featured status"),
    });

    const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];
    const filteredReviews = reviews.filter((r: any) =>
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Review Management
                            </h1>
                            <p className="text-xs text-white/30 mt-1">Manage customer reviews</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                            <Search className="w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-48"
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {filteredReviews.map((review: any, index: number) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{review.user?.firstName} {review.user?.lastName}</p>
                                            <p className="text-white/40 text-xs">{review.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/20"
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-xs text-white/40">{review.rating}/5</span>
                                    </div>
                                    <p className="text-white/70 text-sm mb-3">{review.comment}</p>
                                    <div className="flex items-center gap-4 text-xs text-white/30">
                                        <span className="flex items-center gap-1">
                                            <Package className="w-3.5 h-3.5" />
                                            {review.product?.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            {review.helpfulCount || 0} helpful
                                        </span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        {review.isFeatured && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Featured on Homepage
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleFeaturedMutation.mutate(review.id)}
                                        className={`p-2 rounded-lg border transition-all ${
                                            review.isFeatured
                                                ? "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20"
                                                : "bg-white/[0.05] border-white/[0.08] text-white/60 hover:text-amber-400 hover:bg-amber-400/10"
                                        }`}
                                        title={review.isFeatured ? "Remove from featured" : "Add to featured"}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate(review.id)}
                                        className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
