import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Star, Trash2, MessageSquare, CheckCircle, Award, Sparkles,
} from "lucide-react";

const StarDisplay = ({ rating, size = 11 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={size}
        className={s <= Math.round(rating)
          ? "text-amber-400 fill-amber-400"
          : "text-slate-200 fill-slate-200"} />
    ))}
  </div>
);

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}>
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95 focus:outline-none">
          <Star size={18}
            className={`transition-colors duration-100 ${
              s <= display
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            }`} />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const isOwn = review.reviewer._id === currentUserId;
  const name = review.reviewer.name || "Anonymous";
  const init = name.charAt(0).toUpperCase();
  const avatar = review.reviewer.profileImage?.url || null;
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
  const r = review.rating;

  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      isOwn
        ? "border-indigo-200 bg-indigo-50/30"
        : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
              {init}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-800">{name}</p>
              {isOwn && (
                <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md">You</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={r} size={11} />
              <span className="text-[10px] text-slate-400">{date}</span>
            </div>
          </div>
        </div>

        {isOwn && (
          <button onClick={() => onDelete(review._id)}
            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition border border-red-100">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">{review.comment}</p>
    </div>
  );
};

const ReviewForm = ({ sellerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0)    return toast.error("Please select a star rating");
    if (!comment.trim()) return toast.error("Please write a comment");
    try {
      setSubmitting(true);
      const res = await api.post(`/reviews/${sellerId}`, { rating, comment });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      onSuccess(res.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Sparkles size={14} className="text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">Write a Review</p>
          <p className="text-[11px] text-slate-400">Share your experience with other bidders</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Review</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500} rows={4}
            placeholder="How was your experience? Was the item as described? Was communication good?"
            className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-slate-400">Be honest and helpful</span>
            <span className={`text-[10px] font-bold ${comment.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
              {comment.length}/500
            </span>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
            : <><Award size={14} /> Publish Review</>}
        </button>
      </div>
    </form>
  );
};

const Review = ({ sellerId, currentUserId, onStatsChange }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, total: 0, breakdown: [] });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canLeaveReview, setCanLeaveReview] = useState(true);
  const [cantReason, setCantReason] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setReviewsLoading(true);
        const res = await api.get(`/reviews/${sellerId}`);
        setReviews(res.data.reviews || []);
        const stats = {
          avgRating: res.data.avgRating,
          total: res.data.total,
          breakdown: res.data.breakdown || [],
        };
        setReviewStats(stats);
        onStatsChange?.(stats);
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }

      try {
        const eligRes = await api.get(`/reviews/${sellerId}/can-review`);
        setCanLeaveReview(eligRes.data.canReview);
        setCantReason(eligRes.data.reason || "");
      } catch {
        setCanLeaveReview(true);
      }
    })();
  }, [sellerId]);

  const recalc = (updated) => {
    const total = updated.length;
    const avg   = total > 0 ? updated.reduce((s, r) => s + r.rating, 0) / total : 0;
    const stats = {
      avgRating: parseFloat(avg.toFixed(1)),
      total,
      breakdown: [5,4,3,2,1].map((star) => {
        const count = updated.filter((r) => r.rating === star).length;
        return { star, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
      }),
    };
    setReviewStats(stats);
    onStatsChange?.(stats);
  };

  const handleReviewAdded = (newReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    setCanLeaveReview(false);
    setCantReason("already_reviewed");
    recalc(updated);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      const updated = reviews.filter((r) => r._id !== reviewId);
      setReviews(updated);
      setCanLeaveReview(true);
      setCantReason("");
      recalc(updated);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Reviews</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {reviewStats.total > 0
              ? `${reviewStats.total} review${reviewStats.total !== 1 ? "s" : ""} · ${reviewStats.avgRating} avg`
              : "No reviews yet"}
          </p>
        </div>
        {reviewStats.total > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-amber-700">{reviewStats.avgRating}</span>
          </div>
        )}
      </div>

      {currentUserId !== sellerId && (
        canLeaveReview ? (
          <ReviewForm sellerId={sellerId} onSuccess={handleReviewAdded} />
        ) : cantReason === "already_reviewed" ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p><span className="font-bold">You've already reviewed this seller.</span> Delete your review below to write a new one.</p>
          </div>
        ) : null
      )}

      {reviewsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-black text-slate-700">No reviews yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to review this seller.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review}
              currentUserId={currentUserId} onDelete={handleDeleteReview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;