import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, ArrowLeft, Clock, Zap, Mail, ShieldCheck,
  BadgeCheck, TrendingUp, Package, ChevronRight,
  LayoutGrid, List, ArrowUpRight, Star, Trash2,
  MessageSquare, AlertCircle, CheckCircle, ChevronDown,
  CalendarDays, Award, BarChart2, User,
} from "lucide-react";
import { toast } from "react-hot-toast";

const fmt = (n) => "NPR\u00A0" + Number(n).toLocaleString();

const getTimeRemaining = (endTime) => {
  if (!endTime) return { label: "N/A", urgent: false, ended: false };
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return { label: "Ended", urgent: false, ended: true };
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total / 3600000) % 24);
  const mins = Math.floor((total / 60000) % 60);
  const urgent = total < 10800000;
  if (days > 0) return { label: `${days}d ${hours}h`, urgent: false, ended: false };
  if (hours > 0) return { label: `${hours}h ${mins}m`, urgent, ended: false };
  return { label: `${mins}m`, urgent: true, ended: false };
};

const Countdown = ({ endTime }) => {
  const [t, setT] = useState(() => getTimeRemaining(endTime));
  useEffect(() => {
    if (t.ended) return;
    const id = setInterval(() => setT(getTimeRemaining(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  if (t.ended) return <span className="text-xs font-semibold text-slate-400">Ended</span>;
  return (
    <span className={`text-xs font-bold tabular-nums ${t.urgent ? "text-red-500" : "text-slate-600"}`}>
      {t.urgent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse align-middle" />}
      {t.label}
    </span>
  );
};

const StatusPill = ({ status, endTime }) => {
  const time = getTimeRemaining(endTime);
  if (time.ended || status === "Ended")
    return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Ended</span>;
  if (time.urgent)
    return <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Ending Soon</span>;
  if (status === "Live")
    return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Live</span>;
  return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Upcoming</span>;
};

/* Star Display (read-only)*/
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
    ))}
  </div>
);

/* Star Picker */
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95">
          <Star size={32}
            className={s <= (hovered || value)
              ? "text-amber-400 fill-amber-400 drop-shadow-sm"
              : "text-slate-300 fill-slate-100"} />
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className={`ml-1 text-xs font-bold px-2 py-1 rounded-lg ${
          (hovered || value) >= 4 ? "bg-emerald-50 text-emerald-600" :
          (hovered || value) === 3 ? "bg-amber-50 text-amber-600" :
          "bg-red-50 text-red-500"
        }`}>
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
};

/* Rating Summary Bar Chart */
const RatingSummary = ({ avgRating, total, breakdown }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h3 className="text-sm font-black text-slate-700 mb-5 flex items-center gap-2">
      <BarChart2 size={15} className="text-indigo-500" /> Rating Overview
    </h3>
    <div className="flex items-center gap-8">
      {/* Big number */}
      <div className="text-center flex-shrink-0 bg-slate-50 rounded-2xl px-6 py-5 border border-slate-100">
        <p className="text-5xl font-black text-slate-900 leading-none">{avgRating}</p>
        <div className="mt-2.5 flex justify-center"><StarDisplay rating={avgRating} size={15} /></div>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">{total} review{total !== 1 ? "s" : ""}</p>
      </div>
      {/* Breakdown bars */}
      <div className="flex-1 space-y-2.5">
        {breakdown.map(({ star, count, percent }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 w-3 text-right flex-shrink-0">{star}</span>
            <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[11px] text-slate-400 w-5 text-right flex-shrink-0 font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const isOwn = review.reviewer._id === currentUserId;
  const name = review.reviewer.name || "Anonymous";
  const initial = name.charAt(0).toUpperCase();
  const avatar = review.reviewer.profileImage?.url || review.reviewer.profileImage || null;
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${isOwn ? "border-indigo-200 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
              {initial}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800 leading-tight">{name}</p>
              {isOwn && <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md">You</span>}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-xl">
            <StarDisplay rating={review.rating} size={11} />
            <span className="text-xs font-black text-amber-600 ml-0.5">{review.rating}</span>
          </div>
          {isOwn && (
            <button onClick={() => onDelete(review._id)}
              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition border border-red-100"
              title="Delete your review">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed pl-[52px]">{review.comment}</p>
    </div>
  );
};

const ReviewForm = ({ sellerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
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
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 p-6">
      <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
        <MessageSquare size={15} className="text-indigo-500" /> Share Your Experience
      </h3>

      {/* Star picker */}
      <div className="mb-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Comment box */}
      <div className="mb-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Review</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500} rows={4}
          placeholder="How was your experience with this seller? Was the item as described? Was communication good?"
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition resize-none shadow-sm"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">Be honest and helpful to other bidders</span>
          <span className={`text-[10px] font-bold ${comment.length > 450 ? "text-amber-500" : "text-slate-400"}`}>{comment.length}/500</span>
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
          : <><Star size={14} /> Publish Review</>}
      </button>
    </form>
  );
};

const ListingsAccordion = ({ auctions, navigate }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const TABS = ["All", "Live", "Upcoming", "Ended"];
  const filtered = auctions.filter((a) => tab === "All" || a.status === tab);
  const counts = TABS.reduce((acc, t) => ({
    ...acc,
    [t]: t === "All" ? auctions.length : auctions.filter((a) => a.status === t).length,
  }), {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${open ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}>
            <Package size={16} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-slate-800">Auction Listings</p>
            <p className="text-xs text-slate-400">{auctions.length} total listing{auctions.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {counts["Live"] > 0 && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {counts["Live"]} Live
            </span>
          )}
          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-0.5">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}>
                  {t}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    tab === t ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
                  }`}>{counts[t]}</span>
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-0.5">
              <button onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                <List size={13} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <Package size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-600">No {tab !== "All" ? tab.toLowerCase() : ""} listings</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <article key={item._id} onClick={() => navigate(`/auction/${item._id}`)}
                  className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={item.image?.url} alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-2.5 left-2.5"><StatusPill status={item.status} endTime={item.endTime} /></div>
                    <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.bids?.length || 0} bids
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
                      {item.condition && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.condition === "New" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {item.condition}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors mb-3 leading-snug">{item.title}</h3>
                    <div className="h-px bg-slate-200 mb-3" />
                    <div className="flex items-end justify-between mt-auto mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Current Bid</p>
                        <p className="text-sm font-black text-slate-900">{fmt(item.currentBid || item.startingBid || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Time Left</p>
                        <Countdown endTime={item.endTime} />
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/auction/${item._id}`); }}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition group/btn">
                      Place Bid <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((item) => (
                <div key={item._id} onClick={() => navigate(`/auction/${item._id}`)}
                  className="group flex items-center gap-4 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:shadow-md rounded-2xl p-3 cursor-pointer transition-all">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image?.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
                      <StatusPill status={item.status} endTime={item.endTime} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.bids?.length || 0} bids · {item.condition}</p>
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-[10px] text-slate-400">Bid</p>
                    <p className="text-sm font-black text-slate-900">{fmt(item.currentBid || item.startingBid || 0)}</p>
                  </div>
                  <div className="hidden md:block flex-shrink-0 w-20 text-right">
                    <p className="text-[10px] text-slate-400">Left</p>
                    <Countdown endTime={item.endTime} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/auction/${item._id}`); }}
                    className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex-shrink-0">
                    Bid
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const currentUser = userData?.user || userData || {};
  const currentUserId = currentUser._id;

  const [seller, setSeller] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, total: 0, breakdown: [] });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canLeaveReview, setCanLeaveReview] = useState(true);
  const [cantReason, setCantReason] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/auth/seller/${id}`);
        setSeller(res.data.seller);
        setAuctions(res.data.auctions || []);
      } catch {
        toast.error("Could not load seller profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        setReviewsLoading(true);
        const reviewRes = await api.get(`/reviews/${id}`);
        setReviews(reviewRes.data.reviews || []);
        setReviewStats({
          avgRating: reviewRes.data.avgRating,
          total: reviewRes.data.total,
          breakdown: reviewRes.data.breakdown || [],
        });
      } catch (err) {
        toast.error("Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }


      try {
        const eligRes = await api.get(`/reviews/${id}/can-review`);
        setCanLeaveReview(eligRes.data.canReview);
        setCantReason(eligRes.data.reason || "");
      } catch (err) {
        setCanLeaveReview(true);
      }
    })();
  }, [id]);

  const recalcStats = (updatedReviews) => {
    const total = updatedReviews.length;
    const avg = total > 0 ? updatedReviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    setReviewStats({
      avgRating: parseFloat(avg.toFixed(1)),
      total,
      breakdown: [5, 4, 3, 2, 1].map((star) => {
        const count = updatedReviews.filter((r) => r.rating === star).length;
        return { star, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
      }),
    });
  };

  const handleReviewAdded = (newReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    setCanLeaveReview(false);
    setCantReason("already_reviewed");
    recalcStats(updated);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      const updated = reviews.filter((r) => r._id !== reviewId);
      setReviews(updated);
      setCanLeaveReview(true);
      setCantReason("");
      recalcStats(updated);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const liveCount = auctions.filter((a) => a.status === "Live").length;
  const endedCount = auctions.filter((a) => a.status === "Ended").length;
  const initial = seller?.name?.charAt(0).toUpperCase() || "S";
  const memberSince = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Gavel size={20} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-black text-slate-700">Seller not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm font-bold text-indigo-600 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <div onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-400">
            <button onClick={() => navigate("/auctions")} className="hover:text-indigo-600 transition font-medium">Auctions</button>
            <ChevronRight size={11} />
            <span className="text-slate-600 font-semibold">Seller Profile</span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Seller Details ── */}
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 relative">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              </div>
              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="-mt-8 mb-4 flex items-end justify-between">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border-[3px] border-white flex items-center justify-center overflow-hidden">
                      {seller.profileImage?.url ? (
                        <img src={seller.profileImage.url} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl">{initial}</div>
                      )}
                    </div>
                    {seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                        <BadgeCheck size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                    seller.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${seller.status === "Active" ? "bg-emerald-500" : "bg-red-400"}`} />
                    {seller.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h1 className="text-lg font-black text-slate-900">{seller.name}</h1>
                  {seller.isVerified && <BadgeCheck size={15} className="text-indigo-500" />}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg mb-4">
                  <TrendingUp size={10} /> Seller
                </span>

                {/* Info rows */}
                <div className="space-y-2.5 mt-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Mail size={12} className="text-slate-400" />
                    </div>
                    <span className="truncate">{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={12} className="text-slate-400" />
                    </div>
                    <span>Member since {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={12} className="text-slate-400" />
                    </div>
                    <span>{seller.isVerified ? "Verified account" : "Unverified account"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Seller Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Listings", value: auctions.length, icon: Package, color: "bg-indigo-50 text-indigo-600" },
                  { label: "Live Now", value: liveCount, icon: Zap, color: "bg-emerald-50 text-emerald-600" },
                  { label: "Completed", value: endedCount, icon: Clock, color: "bg-amber-50 text-amber-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mb-2`}>
                      <Icon size={13} />
                    </div>
                    <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating summary card */}
            {reviewStats.total > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rating Summary</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center flex-shrink-0">
                    <p className="text-3xl font-black text-amber-600 leading-none">{reviewStats.avgRating}</p>
                    <div className="mt-1.5 flex justify-center"><StarDisplay rating={reviewStats.avgRating} size={12} /></div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {reviewStats.breakdown.map(({ star, count, percent }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-2">{star}</span>
                        <Star size={8} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 w-3 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">{reviewStats.total} review{reviewStats.total !== 1 ? "s" : ""} from bidders</p>
              </div>
            )}
          </div>

          {/* Reviews + Listings */}
          <div className="lg:col-span-2 space-y-5">

            {/* Reviews section header */}
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
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-black text-amber-700">{reviewStats.avgRating}</span>
                </div>
              )}
            </div>

            {/* Write review form or notice */}
            {currentUserId !== id && (
              canLeaveReview ? (
                <ReviewForm sellerId={id} onSuccess={handleReviewAdded} />
              ) : cantReason === "already_reviewed" ? (
                <div className="flex items-start gap-3 p-4 rounded-2xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p><span className="font-bold">You've already reviewed this seller.</span> Delete your review below to write a new one.</p>
                </div>
              ) : null
            )}

            {/* Reviews list */}
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
            <ListingsAccordion auctions={auctions} navigate={navigate} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;