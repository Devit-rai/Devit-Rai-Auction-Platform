// src/pages/user/AuctionDetail.jsx
// Route: /auction/:id
// Layout: left col = image + seller chip + description + bid history
//         right col = price/countdown/bid form (sticky)

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket";
import {
  ArrowLeft, Gavel, Clock,
  CheckCircle, AlertCircle,
  ChevronRight, Zap, Trophy, BadgeCheck,
  Mail, User, ArrowUpRight, Star, Shield,
} from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

const fmt   = (n) => "NPR " + Number(n || 0).toLocaleString();
const fmtTs = (d) => new Date(d).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });

/* ── Countdown hook ──────────────────────────────────────────── */
const useCountdown = (endTime) => {
  const calc = () => {
    const total = Date.parse(endTime) - Date.now();
    if (total <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true, urgent: false };
    return {
      d: Math.floor(total / 86400000),
      h: Math.floor((total / 3600000) % 24),
      m: Math.floor((total / 60000) % 60),
      s: Math.floor((total / 1000) % 60),
      done: false,
      urgent: total < 3600000,
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    if (!endTime) return;
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return tick;
};

/* ── Countdown unit box ──────────────────────────────────────── */
const TimeBox = ({ value, label, urgent }) => (
  <div className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 min-w-[52px] ${urgent ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
    <span className={`text-xl font-black tabular-nums leading-none ${urgent ? "text-red-600" : "text-slate-800"}`}>
      {String(value).padStart(2, "0")}
    </span>
    <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${urgent ? "text-red-400" : "text-slate-400"}`}>
      {label}
    </span>
  </div>
);

/* ── Seller Chip — same component as Auction.jsx ─────────────── */
const SellerChip = ({ seller, navigate }) => {
  const [hovered, setHovered]       = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const leaveTimer  = useRef(null);
  const fetchedRef  = useRef(false);

  if (!seller) return null;

  const name      = seller.name || "Unknown Seller";
  const initial   = name.charAt(0).toUpperCase();
  const avatar    = seller.profileImage?.url || seller.profileImage || null;
  const memberSince = seller.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
    if (!fetchedRef.current && seller._id) {
      fetchedRef.current = true;
      setReviewLoading(true);
      api.get(`/reviews/${seller._id}`)
        .then((res) => setReviewData({ avg: res.data.avgRating, total: res.data.total }))
        .catch(() => setReviewData({ avg: 0, total: 0 }))
        .finally(() => setReviewLoading(false));
    }
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={10}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
    ));

  return (
    <div className="relative inline-flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={(e) => { e.stopPropagation(); if (seller._id) navigate(`/seller/${seller._id}`); }}
        className="flex items-center gap-2 group/seller"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-[10px] flex-shrink-0 ring-1 ring-indigo-200">
            {initial}
          </div>
        )}
        <span className="text-sm font-semibold text-slate-600 group-hover/seller:text-indigo-600 transition-colors">
          {name}
        </span>
        {seller.isVerified && <BadgeCheck size={14} className="text-indigo-400 flex-shrink-0" />}
      </button>

      {/* Hover popup — same as Auction.jsx */}
      {hovered && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-2 z-[300] w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          style={{ animation: "fadeSlideDown 0.15s ease-out" }}
          onMouseEnter={() => clearTimeout(leaveTimer.current)}
          onMouseLeave={handleMouseLeave}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity:0; transform:translateY(-6px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>
          <div className="px-4 pt-4 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-700 font-black text-sm">{initial}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                <BadgeCheck size={9} /> Verified
              </span>
            </div>

            <p className="text-sm font-black text-slate-800 leading-tight">{name}</p>
            {seller.email && (
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                <Mail size={9} /> {seller.email}
              </p>
            )}
            {memberSince && (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <User size={9} /> Member since {memberSince}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100">
              {reviewLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-indigo-300 border-t-indigo-600 animate-spin" />
                  <span className="text-[11px] text-slate-400">Loading reviews…</span>
                </div>
              ) : reviewData && reviewData.total > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-0.5 mb-0.5">{renderStars(reviewData.avg)}</div>
                    <p className="text-[10px] text-slate-400">{reviewData.total} review{reviewData.total !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5 text-center">
                    <p className="text-base font-black text-amber-600 leading-none">{reviewData.avg}</p>
                    <p className="text-[9px] text-amber-400 font-medium">/ 5</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">{renderStars(0)}</div>
                  <p className="text-[11px] text-slate-400">No reviews yet</p>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 mt-3 mb-3" />
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/seller/${seller._id}`); }}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition"
            >
              View Full Profile <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Bid row in history ──────────────────────────────────────── */
const BidRow = ({ bid, rank }) => {
  const isTop = rank === 0;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isTop ? "bg-indigo-50 border border-indigo-100" : "border border-transparent hover:bg-slate-50"}`}>
      {/* Rank number */}
      <span className={`text-[11px] font-black w-5 text-center flex-shrink-0 ${isTop ? "text-indigo-500" : "text-slate-300"}`}>
        {isTop ? <Trophy size={14} className="text-indigo-500 mx-auto" /> : rank + 1}
      </span>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 uppercase ${isTop ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
        {(bid.userName || "?").charAt(0)}
      </div>
      {/* Name + time */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate leading-snug ${isTop ? "text-indigo-700" : "text-slate-700"}`}>
          {bid.userName || "Anonymous"}
        </p>
        <p className="text-[10px] text-slate-400 leading-snug">
          {bid.createdAt ? fmtTs(bid.createdAt) : "—"}
        </p>
      </div>
      {/* Amount */}
      <p className={`text-sm font-black flex-shrink-0 tabular-nums ${isTop ? "text-indigo-700" : "text-slate-600"}`}>
        {fmt(bid.amount)}
      </p>
    </div>
  );
};

const AuctionDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmt, setBidAmt] = useState("");
  const [placing, setPlacing] = useState(false);
  const [bidMsg, setBidMsg] = useState(null);
  const [newBidPop, setNewBidPop] = useState(null);
  const msgTimer = useRef(null);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userId = userData?.user?._id  || userData?._id  || null;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/auctions/${id}`);
        setAuction(data.auctionItem);
        setBidders(data.bidders || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load auction");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* socket */
  useEffect(() => {
    socket.emit("joinAuction", id);
    if (userId) socket.emit("joinUserRoom", userId);

    const onBid = ({ auctionId, amount, userName: bidderName, userId: bidderId }) => {
      if (auctionId !== id) return;
      const updatedBid = { amount, userName: bidderName, userId: bidderId, createdAt: new Date().toISOString() };
      setAuction((a) => a ? { ...a, currentBid: amount } : a);
      setBidders((prev) => {
        const exists = prev.some((b) => String(b.userId) === String(bidderId));
        const updated = exists
          ? prev.map((b) => String(b.userId) === String(bidderId) ? updatedBid : b)
          : [updatedBid, ...prev];
        return updated.sort((a, b) => b.amount - a.amount);
      });
      if (bidderId !== userId) {
        setNewBidPop({ name: bidderName, amount });
        setTimeout(() => setNewBidPop(null), 3500);
      }
    };
    const onStatus = ({ auctionId, status }) => {
      if (auctionId === id) setAuction((a) => a ? { ...a, status } : a);
    };

    socket.on("newBidPlaced", onBid);
    socket.on("auctionStatusUpdated", onStatus);
    return () => {
      socket.emit("leaveAuction", id);
      socket.off("newBidPlaced", onBid);
      socket.off("auctionStatusUpdated", onStatus);
    };
  }, [id, userId]);

  const countdown = useCountdown(auction?.endTime);

  const handleBid = async () => {
    if (!bidAmt || isNaN(bidAmt)) return;
    setPlacing(true);
    setBidMsg(null);
    clearTimeout(msgTimer.current);
    try {
      await api.post(`/bids/${id}`, { amount: Number(bidAmt) });
      setBidMsg({ type: "success", text: `Bid of ${fmt(bidAmt)} placed!` });
      setBidAmt("");
    } catch (e) {
      setBidMsg({ type: "error", text: e.response?.data?.message || "Bid failed. Try again." });
    } finally {
      setPlacing(false);
      msgTimer.current = setTimeout(() => setBidMsg(null), 4000);
    }
  };

  const minBid = auction ? Number(auction.currentBid || auction.startingBid || 0) + 1 : 1;
  const isLive = auction?.status === "Live";
  const isEnded = auction?.status === "Ended";
  const isSeller  = auction?.createdBy?._id === userId || auction?.createdBy === userId;
  const canBid = isLive && !isSeller && auction?.approvalStatus === "Approved";

  if (loading) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error || !auction) return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-slate-600 font-semibold">{error || "Auction not found"}</p>
      <button onClick={() => navigate("/auctions")} className="text-sm font-bold text-indigo-600 hover:underline">← Back</button>
    </div>
  );

  const seller = auction.createdBy;

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mr-1">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>
          <div className="flex-1" />
          <NotificationBell />
        </div>
      </header>

      {/* New-bid toast */}
      {newBidPop && (
        <div className="fixed top-20 right-5 z-[300] bg-white border border-indigo-200 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3"
          style={{ animation: "slideIn .25s ease" }}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm uppercase">
            {newBidPop.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{newBidPop.name}</p>
            <p className="text-[11px] text-indigo-600 font-semibold">placed {fmt(newBidPop.amount)}</p>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }`}</style>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 text-[11px] text-slate-400">
          <button onClick={() => navigate("/auctions")} className="hover:text-indigo-600 transition font-medium">Auctions</button>
          <ChevronRight size={11} />
          <span className="text-slate-500 font-medium truncate max-w-xs">{auction.title}</span>
          <div className="ml-auto flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
              </span>
            )}
            {isEnded && <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full">Ended</span>}
            {auction.status === "Upcoming" && (
              <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <Clock size={10} /> Upcoming
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

          <div className="space-y-5">

            {/* Image card */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img src={auction.image?.url} alt={auction.title} className="w-full h-full object-cover" />
                {isLive && countdown.urgent && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Ending Soon!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{auction.category}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">{auction.condition}</span>
              </div>

              <h1 className="text-xl font-black text-slate-900 leading-snug mb-3">{auction.title}</h1>

              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Listed by</span>
                <SellerChip seller={seller} navigate={navigate} />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed mt-4">{auction.description}</p>

              {/* Timeline row */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Start Time</p>
                  <p className="text-xs font-bold text-slate-700">{fmtTs(auction.startTime)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">End Time</p>
                  <p className={`text-xs font-bold ${countdown.urgent && isLive ? "text-red-600" : "text-slate-700"}`}>{fmtTs(auction.endTime)}</p>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-slate-800">Bid History</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{bidders.length} bid{bidders.length !== 1 ? "s" : ""} placed</p>
                </div>
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
              </div>
              {bidders.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Gavel size={28} className="text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No bids yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {bidders.map((bid, i) => <BidRow key={i} bid={bid} rank={i} />)}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-4 lg:sticky lg:top-20">

            {/* Price + Countdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {isEnded ? "Final Bid" : "Current Bid"}
              </p>
              <p className="text-4xl font-black text-slate-900">{fmt(auction.currentBid || auction.startingBid)}</p>
              {auction.currentBid > 0 && (
                <p className="text-[11px] text-slate-400 mt-1">Starting bid: {fmt(auction.startingBid)}</p>
              )}

              {!isEnded && (
                <>
                  <div className="h-px bg-slate-100 my-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    {isLive ? "Time Remaining" : "Starts In"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {countdown.d > 0 && <TimeBox value={countdown.d} label="days" urgent={countdown.urgent} />}
                    <TimeBox value={countdown.h} label="hrs" urgent={countdown.urgent} />
                    <TimeBox value={countdown.m} label="min" urgent={countdown.urgent} />
                    <TimeBox value={countdown.s} label="sec" urgent={countdown.urgent} />
                  </div>
                  {countdown.urgent && isLive && (
                    <p className="text-xs text-red-500 font-bold mt-3 flex items-center gap-1.5">
                      <Zap size={12} /> Hurry! Auction ending very soon.
                    </p>
                  )}
                </>
              )}

              {/* Winner */}
              {isEnded && auction.winner && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Trophy size={18} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Winner</p>
                    <p className="text-sm font-bold text-amber-800">{auction.winner.userName}</p>
                    <p className="text-[11px] text-amber-600">{fmt(auction.winner.amount)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bid Form */}
            {canBid && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <p className="text-sm font-black text-slate-800 mb-0.5">Place Your Bid</p>
                <p className="text-[11px] text-slate-400 mb-4">
                  Minimum: <span className="font-bold text-indigo-600">{fmt(minBid)}</span>
                </p>

                <div className="relative mb-3">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">NPR</span>
                  <input
                    type="number"
                    value={bidAmt}
                    onChange={(e) => setBidAmt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBid()}
                    placeholder={minBid.toLocaleString()}
                    min={minBid}
                    className="w-full pl-11 pr-4 py-3 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
                  />
                </div>

                {/* Quick picks */}
                <div className="flex gap-2 mb-4">
                  {[0, 500, 1000, 5000].map((bump) => (
                    <button key={bump} onClick={() => setBidAmt(String(minBid + bump))}
                      className="flex-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 py-1.5 rounded-lg transition whitespace-nowrap">
                      {bump === 0 ? "Min" : `+${bump.toLocaleString()}`}
                    </button>
                  ))}
                </div>

                <button onClick={handleBid} disabled={placing || !bidAmt}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-black py-3.5 rounded-xl transition-all active:scale-95">
                  {placing ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Placing…</>
                  ) : (
                    <><Gavel size={15} /> Place Bid</>
                  )}
                </button>

                {bidMsg && (
                  <div className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl ${
                    bidMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {bidMsg.type === "success" ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    {bidMsg.text}
                  </div>
                )}
              </div>
            )}

            {isSeller && isLive && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800">You listed this auction and cannot bid on your own items.</p>
              </div>
            )}

            {auction.status === "Upcoming" && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                <Clock size={15} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-700">Bidding not open yet</p>
                  <p className="text-[11px] text-indigo-500 mt-0.5">Opens at {fmtTs(auction.startTime)}</p>
                </div>
              </div>
            )}

            {isEnded && !auction.winner && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-center">
                <p className="text-xs font-semibold text-slate-500">This auction ended with no bids.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;