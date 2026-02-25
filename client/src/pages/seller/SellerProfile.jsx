import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, ArrowLeft, Clock, Zap, CalendarClock,
  Mail, ShieldCheck, BadgeCheck, TrendingUp,
  Package, Users, Award, ChevronRight,
  LayoutGrid, List, ArrowUpRight, Heart,
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

const AuctionCard = ({ item, onClick }) => (
  <article
    onClick={onClick}
    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
  >
    <div className="relative overflow-hidden aspect-[4/3]">
      <img src={item.image?.url} alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="absolute top-3 left-3">
        <StatusPill status={item.status} endTime={item.endTime} />
      </div>
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          {item.bids?.length || 0} bids
        </span>
      </div>
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
        {item.condition && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            item.condition === "New" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>{item.condition}</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors mb-3 leading-snug">
        {item.title}
      </h3>
      <div className="h-px bg-slate-100 mb-3" />
      <div className="flex items-end justify-between mt-auto mb-4">
        <div>
          <p className="text-[10px] text-slate-400 font-medium mb-0.5">Current Bid</p>
          <p className="text-base font-black text-slate-900">{fmt(item.currentBid || item.startingBid || 0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-medium mb-0.5">Time Left</p>
          <Countdown endTime={item.endTime} />
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 group/btn">
        Place Bid <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  </article>
);

const AuctionRow = ({ item, onClick }) => (
  <div onClick={onClick}
    className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md rounded-2xl p-3 cursor-pointer transition-all duration-200">
    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
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
    <div className="text-right flex-shrink-0 hidden sm:block">
      <p className="text-[10px] text-slate-400">Current Bid</p>
      <p className="text-sm font-black text-slate-900">{fmt(item.currentBid || item.startingBid || 0)}</p>
    </div>
    <div className="text-right flex-shrink-0 hidden md:block w-20">
      <p className="text-[10px] text-slate-400">Time Left</p>
      <Countdown endTime={item.endTime} />
    </div>
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex-shrink-0">
      Bid
    </button>
  </div>
);

const StatCard = ({ icon: Icon, label, value, accent }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[accent]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  );
};

const FILTER_TABS = [
  { label: "All", value: "All" },
  { label: "Live", value: "Live", icon: Zap },
  { label: "Upcoming", value: "Upcoming", icon: CalendarClock },
  { label: "Ended", value: "Ended", icon: Clock },
];

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

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

  const filtered = auctions.filter((a) => tab === "All" || a.status === tab);

  const stats = {
    total: auctions.length,
    live: auctions.filter((a) => a.status === "Live").length,
    ended: auctions.filter((a) => a.status === "Ended").length,
    totalBids: auctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0),
  };

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

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <div onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-400">
            <button onClick={() => navigate("/auctions")} className="hover:text-indigo-600 transition font-medium">Auctions</button>
            <ChevronRight size={11} />
            <span className="text-slate-600 font-semibold">Seller Profile</span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Hero Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          </div>

          <div className="px-8 pb-8">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                  {seller.profileImage?.url ? (
                    <img src={seller.profileImage.url} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-black text-2xl">
                      {initial}
                    </div>
                  )}
                </div>
                {seller.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck size={12} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  seller.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${seller.status === "Active" ? "bg-emerald-500" : "bg-red-400"}`} />
                  {seller.status}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-indigo-50 text-indigo-700 border-indigo-200">
                  <TrendingUp size={11} /> Seller
                </span>
              </div>
            </div>

            {/* Name + info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-black text-slate-900">{seller.name}</h1>
                  {seller.isVerified && <BadgeCheck size={16} className="text-indigo-500" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={11} className="text-slate-400" />
                    {seller.email}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-slate-400" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/auctions")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
              >
                <Gavel size={13} /> View All Auctions
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Listings" value={stats.total} accent="indigo" />
          <StatCard icon={Zap} label="Live Now" value={stats.live} accent="emerald" />
          <StatCard icon={Clock} label="Ended" value={stats.ended} accent="amber" />
          <StatCard icon={Users} label="Total Bids Received" value={stats.totalBids} accent="violet" />
        </div>

        {/* Auctions section */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Listings by {seller.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} auction{filtered.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Status filter tabs */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
                {FILTER_TABS.map(({ label, value }) => (
                  <button key={value} onClick={() => setTab(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      tab === value ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
                <button onClick={() => setViewMode("grid")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}>
                  <LayoutGrid size={13} />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}>
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Package size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-700">No {tab !== "All" ? tab.toLowerCase() : ""} auctions</p>
              <p className="text-xs text-slate-400 mt-1">This seller has no listings in this category yet.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <AuctionCard key={item._id} item={item} onClick={() => navigate(`/auction/${item._id}`)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((item) => (
                <AuctionRow key={item._id} item={item} onClick={() => navigate(`/auction/${item._id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;