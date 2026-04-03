"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, ThumbsUp, Loader2, PenLine, X, Send,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reviewsApi } from "@/lib/api/reviews";
import { useAuthStore } from "@/stores/auth.store";

interface Review {
    id: string;
    rating: number;
    title?: string;
    comment: string;
    helpfulCount?: number;
    createdAt: string;
    user?: { firstName: string; lastName: string; avatar?: string };
}

// ✅ Separate payload type for creating a review
interface CreateReviewPayload {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
}

const reviewSchema = z.object({
    rating: z.number().min(1, "Please select a rating").max(5),
    title: z.string().optional(),
    comment: z.string().min(10, "Comment must be at least 10 characters"),
});
type ReviewForm = z.infer<typeof reviewSchema>;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`w-6 h-6 transition-colors ${s <= (hovered || value)
                                ? "text-amber-400 fill-amber-400"
                                : "text-white/15"
                            }`}
                    />
                </button>
            ))}
            <span className="text-xs text-white/30 ml-1.5">
                {value ? ["", "Poor", "Fair", "Good", "Great", "Excellent"][value] : "Select rating"}
            </span>
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const [marked, setMarked] = useState(false);
    const [helpCount, setHelpCount] = useState(review.helpfulCount || 0);

    const handleHelpful = async () => {
        if (marked) return;
        try {
            await reviewsApi.markHelpful(review.id);
            setMarked(true);
            setHelpCount((c) => c + 1);
        } catch {
            toast.error("Could not mark helpful");
        }
    };

    const initials = review.user
        ? `${review.user.firstName[0]}${review.user.lastName[0]}`
        : "?";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-colors"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                        {review.user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.user.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <span className="text-[10px] font-black text-cyan-400">{initials}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/70">
                            {review.user ? `${review.user.firstName} ${review.user.lastName}` : "Anonymous"}
                        </p>
                        <p className="text-[10px] text-white/25">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={`w-3 h-3 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-white/10"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {review.title && (
                <h4
                    className="text-sm font-bold text-white/80 mb-1.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                >
                    {review.title}
                </h4>
            )}
            <p
                className="text-sm text-white/45 leading-relaxed mb-4"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                {review.comment}
            </p>

            <button
                onClick={handleHelpful}
                disabled={marked}
                className={`flex items-center gap-1.5 text-xs transition-colors ${marked ? "text-cyan-400/70 cursor-default" : "text-white/25 hover:text-white/60"
                    }`}
            >
                <ThumbsUp className={`w-3.5 h-3.5 ${marked ? "fill-cyan-400/70" : ""}`} />
                Helpful {helpCount > 0 && `(${helpCount})`}
            </button>
        </motion.div>
    );
}

export default function ReviewsSection({
    productId,
    productRating,
}: {
    productId: string;
    productRating?: number;
}) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["reviews", productId],
        queryFn: async () => {
            const res = await reviewsApi.getByProduct(productId);
            return res.data;
        },
        enabled: !!productId,
    });

    const reviews: Review[] = data?.reviews || data?.data || data || [];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReviewForm>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0 },
    });
    const rating = watch("rating");

    // ✅ Build a properly typed payload — no more TS error
    const mutation = useMutation({
        mutationFn: (d: ReviewForm) => {
            const payload: CreateReviewPayload = {
                productId,
                rating: d.rating,
                comment: d.comment,
                ...(d.title ? { title: d.title } : {}),
            };
            return reviewsApi.create(payload);
        },
        onSuccess: () => {
            toast.success("Review submitted! ⚡");
            reset();
            setFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
        },
        onError: () => toast.error("Failed to submit review"),
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map((r) => ({
        star: r,
        count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
    }));
    const totalReviews = reviews.length;

    return (
        <div>
            {/* Summary bar */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
                <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:border-white/[0.06] sm:pr-8 flex-shrink-0">
                    <span
                        className="text-5xl font-black text-white"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {productRating ? productRating.toFixed(1) : "—"}
                    </span>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`w-4 h-4 ${s <= Math.round(productRating || 0)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-white/10"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-white/25">{totalReviews} reviews</span>
                </div>

                <div className="flex-1 flex flex-col gap-2 justify-center">
                    {ratingBreakdown.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                            <span className="text-[10px] text-white/30 w-4 text-right">{star}</span>
                            <Star className="w-3 h-3 text-amber-400/50 flex-shrink-0" />
                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400/50 rounded-full transition-all duration-500"
                                    style={{
                                        width: totalReviews ? `${(count / totalReviews) * 100}%` : "0%",
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-white/20 w-5">{count}</span>
                        </div>
                    ))}
                </div>

                {user && (
                    <div className="flex items-center sm:pl-4 sm:border-l sm:border-white/[0.06]">
                        <button
                            onClick={() => setFormOpen(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold hover:bg-cyan-400/15 transition-all whitespace-nowrap"
                        >
                            <PenLine className="w-3.5 h-3.5" />
                            Write a review
                        </button>
                    </div>
                )}
            </div>

            {/* Write review form */}
            <AnimatePresence>
                {formOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <form
                            onSubmit={handleSubmit((d) => mutation.mutate(d))}
                            className="p-5 rounded-2xl bg-white/[0.03] border border-cyan-400/15"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h4
                                    className="text-sm font-black text-white"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    Your review
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="text-white/30 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[10px] text-white/35 uppercase tracking-widest font-bold block mb-2">
                                        Rating *
                                    </label>
                                    <StarPicker value={rating} onChange={(v) => setValue("rating", v)} />
                                    {errors.rating && (
                                        <p className="text-xs text-red-400/80 mt-1">{errors.rating.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/35 uppercase tracking-widest font-bold block mb-2">
                                        Title
                                    </label>
                                    <input
                                        {...register("title")}
                                        placeholder="Great product!"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/35 uppercase tracking-widest font-bold block mb-2">
                                        Review *
                                    </label>
                                    <textarea
                                        {...register("comment")}
                                        placeholder="Share your experience with this product..."
                                        rows={4}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 transition-all resize-none"
                                    />
                                    {errors.comment && (
                                        <p className="text-xs text-red-400/80 mt-1">{errors.comment.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="self-end flex items-center gap-2 px-5 py-2.5 bg-cyan-400 text-black text-xs font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 transition-all"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5" />
                                    )}
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews list */}
            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
                        />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">No reviews yet</p>
                    {user && (
                        <button
                            onClick={() => setFormOpen(true)}
                            className="text-xs text-cyan-400/70 hover:text-cyan-400 mt-2 transition-colors"
                        >
                            Be the first to review
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}