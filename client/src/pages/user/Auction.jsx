import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, Search, Heart, X, LogOut,
  ChevronDown, RotateCcw, ArrowUpRight,
  Clock, Zap, CalendarClock, LayoutGrid,
  List, SlidersHorizontal, Bell, TrendingUp,
  Shield, User, Star, BadgeCheck, Mail,
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

const CATEGORIES = ["All", "Art", "Electronics", "Vehicles", "Fashion", "Jewelry", "Furniture", "Sports"];
const CONDITIONS = ["All", "New", "Used", "Refurbished"];
const SORT_OPTIONS = [
  { label: "Ending Soon", value: "ending" },
  { label: "Newest Listed", value: "newest" },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Most Bids", value: "bids" },
];
const STATUS_TABS = [
  { label: "All", value: "All", icon: LayoutGrid, accent: "indigo"  },
  { label: "Live Now", value: "Live", icon: Zap, accent: "emerald" },
  { label: "Upcoming", value: "Upcoming", icon: CalendarClock, accent: "amber"   },
  { label: "Ended", value: "Ended", icon: Clock, accent: "slate"   },
];

// Role badge config
const getRoleConfig = (roles = []) => {
  if (roles.includes("admin")) return { label: "Admin", color: "bg-violet-100 text-violet-700", icon: Shield  };
  if (roles.includes("seller")) return { label: "Seller", color: "bg-emerald-100 text-emerald-700", icon: TrendingUp };
  return { label: "Bidder", color: "bg-indigo-100 text-indigo-700", icon: User };
};

// Live Countdown
const Countdown = ({ endTime }) => {
  const [t, setT] = useState(() => getTimeRemaining(endTime));
  useEffect(() => {
    if (t.ended) return;
    const id = setInterval(() => setT(getTimeRemaining(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  if (t.ended) return <span className="text-xs font-semibold text-slate-400">Ended</span>;
  return (
    <span className={`text-xs font-bold tabular-nums ${t.urgent ? "text-red-500" : "text-slate-700"}`}>
      {t.urgent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse align-middle" />}
      {t.label}
    </span>
  );
};

// Seller chip with hover popup preview
const SellerChip = ({ seller, navigate, className = "" }) => {
  const [hovered, setHovered] = useState(false);
  const leaveTimer = React.useRef(null);
  if (!seller) return null;

  const name = seller.name || "Unknown Seller";
  const initial = name.charAt(0).toUpperCase();
  const avatar = seller.profileImage?.url || seller.profileImage || null;
  const memberSince = seller.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (seller._id) navigate(`/seller/${seller._id}`);
  };

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 120);
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Chip trigger */}
      <button onClick={handleClick} className="flex items-center gap-1.5 group/seller transition">
        {avatar ? (
          <img src={avatar} alt={name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-[9px] flex-shrink-0 ring-1 ring-indigo-200">
            {initial}
          </div>
        )}
        <span className="text-[11px] font-semibold text-slate-500 group-hover/seller:text-indigo-600 truncate max-w-[100px] transition-colors leading-none">
          {name}
        </span>
        {seller.isVerified && <BadgeCheck size={11} className="text-indigo-400 flex-shrink-0" />}
      </button>

      {/* Hover popup */}
      {hovered && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2 z-[300] w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          style={{ animation: "fadeSlideUp 0.15s ease-out" }}
        >
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Banner */}
          <div className="h-10 bg-gradient-to-br from-indigo-500 to-violet-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
          </div>

          <div className="px-4 pb-4">
            {/* Avatar overlapping banner */}
 
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    {initial}
                  </div>
                
                {seller.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    <BadgeCheck size={9} /> Verified
                  </span>
              )}
            </div>

            <p className="text-sm font-black text-slate-800 leading-tight">{name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{seller.email}</p>

            {memberSince && (
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Star size={9} className="text-amber-400" />
                Member since {memberSince}
              </p>
            )}

            <div className="h-px bg-slate-100 my-3" />

            <button
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all"
            >
              View Full Profile <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AuctionCard = ({ item, isFav, onFav, onClick, navigate }) => {
  const time = getTimeRemaining(item.endTime);
  const seller = item.createdBy || null;

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={item.image?.url} alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status chip */}
        <div className="absolute top-3 left-3">
          {time.ended ? (
            <span className="inline-flex items-center gap-1 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Ended</span>
          ) : time.urgent ? (
            <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ending Soon
            </span>
          ) : item.status === "Live" ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Upcoming</span>
          )}
        </div>

        {/* Fav */}
        <button onClick={(e) => { e.stopPropagation(); onFav(e, item._id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
            isFav ? "bg-red-500 text-white shadow-lg" : "bg-white/80 text-slate-500 hover:bg-white hover:text-red-400"
          }`}>
          <Heart size={13} fill={isFav ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        {/* Bid count on hover */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            {item.bids?.length || 0} bids
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category + condition row */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
          {item.condition && item.condition !== "Active" && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              item.condition === "New" ? "bg-emerald-50 text-emerald-600" :
              item.condition === "Used" ? "bg-amber-50 text-amber-600" :
              "bg-slate-100 text-slate-500"
            }`}>
              {item.condition}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors mb-2">
          {item.title}
        </h3>

        {/* Seller row */}
        {seller && (
          <div className="flex items-center gap-1 mb-2.5 pb-2.5 border-b border-slate-100">
            <span className="text-[10px] text-slate-400 flex-shrink-0">by</span>
            <SellerChip seller={seller} navigate={navigate} />
          </div>
        )}

        {!seller && <div className="h-px bg-slate-100 mb-3" />}

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
};

const AuctionRow = ({ item, isFav, onFav, onClick, navigate }) => {
  const seller = item.createdBy || null;

  return (
    <div onClick={onClick}
      className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md rounded-2xl p-3 cursor-pointer transition-all duration-200">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.image?.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.category}</p>
        <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-xs text-slate-400">{item.bids?.length || 0} bids</p>
          {item.condition && item.condition !== "Active" && (
            <>
              <span className="text-slate-300">·</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                item.condition === "New" ? "bg-emerald-50 text-emerald-600" :
                item.condition === "Used" ? "bg-amber-50 text-amber-600" :
                "bg-slate-100 text-slate-500"
              }`}>{item.condition}</span>
            </>
          )}
          {seller && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">by</span>
              <SellerChip seller={seller} navigate={navigate} />
            </>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-[10px] text-slate-400">Current Bid</p>
        <p className="text-sm font-black text-slate-900">{fmt(item.currentBid || item.startingBid || 0)}</p>
      </div>
      <div className="text-right flex-shrink-0 hidden md:block w-24">
        <p className="text-[10px] text-slate-400">Time Left</p>
        <Countdown endTime={item.endTime} />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={(e) => { e.stopPropagation(); onFav(e, item._id); }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${isFav ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 hover:text-red-400"}`}>
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
          Bid Now
        </button>
      </div>
    </div>
  );
};

// Wishlist Drawer
const WishlistDrawer = ({ wishlist, open, onClose, onToggleFav, navigate }) => (
  <>
    <aside className={`fixed top-0 right-0 h-full w-[340px] bg-white z-[200] flex flex-col transition-transform duration-300 ease-out shadow-2xl border-l border-slate-100 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
            <Heart size={14} className="fill-red-400 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Saved Items</h2>
            <p className="text-[11px] text-slate-400">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
              <Heart size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">Nothing saved yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Tap the heart on any auction to save it here.</p>
          </div>
        ) : wishlist.map((fav) => (
          <div key={fav.auctionItem._id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition">
            <img src={fav.auctionItem.image?.url} alt={fav.auctionItem.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-snug">{fav.auctionItem.title}</p>
              <p className="text-[11px] font-black text-indigo-600 mt-0.5">{fmt(fav.auctionItem.currentBid || fav.auctionItem.startingBid || 0)}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { onClose(); navigate(`/auction/${fav.auctionItem._id}`); }} className="text-[10px] font-bold text-indigo-600 hover:underline">View</button>
                <button onClick={(e) => onToggleFav(e, fav.auctionItem._id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
    {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[190]" onClick={onClose} />}
  </>
);

const ProfileDropdown = ({ userName, roles, navigate, onLogout }) => {
  const [open, setOpen] = useState(false);
  const roleConfig = getRoleConfig(roles);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs uppercase flex-shrink-0">
          {userName.charAt(0)}
        </div>
        <div className="hidden lg:block leading-none text-left">
          <p className="text-xs font-bold text-slate-800">{userName}</p>
          <p className="text-[10px] text-slate-400">{roleConfig.label}</p>
        </div>
        <ChevronDown size={12} className={`text-slate-400 hidden lg:block transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-[100] overflow-hidden">
            <div className="px-4 py-3.5 bg-gradient-to-br from-indigo-50 to-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm uppercase">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-tight">{userName}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleConfig.color}`}>
                    <RoleIcon size={9} />
                    {roleConfig.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => { setOpen(false); navigate("/profile"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <User size={13} /> View Profile
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={13} /> Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Auction = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("Live");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [sort, setSort] = useState("ending");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [filterOpen, setFilterOpen] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData || {};
  const userName = user.name || "User";
  const userRoles = user.roles || ["user"];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [aRes, wRes] = await Promise.all([api.get("/auctions/all"), api.get("/wishlist")]);
        const all = aRes.data.items || aRes.data || [];
        setAuctions(all.filter((a) => a.approvalStatus === "Approved"));
        setWishlist(wRes.data.wishlist || []);
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleLogout = () => { sessionStorage.removeItem("user"); toast.success("Logged out"); navigate("/"); };

  const toggleFav = useCallback(async (e, id) => {
    e.stopPropagation();
    const has = wishlist.some((f) => f.auctionItem._id === id);
    try {
      if (has) {
        await api.delete(`/wishlist/${id}`);
        setWishlist((p) => p.filter((f) => f.auctionItem._id !== id));
        toast.success("Removed from saved");
      } else {
        await api.post(`/wishlist/${id}`);
        const item = auctions.find((a) => a._id === id);
        setWishlist((p) => [{ auctionItem: item }, ...p]);
        toast.success("Saved!");
      }
    } catch { toast.error("Failed"); }
  }, [wishlist, auctions]);

  const resetFilters = () => { setCategory("All"); setCondition("All"); setMinPrice(0); setMaxPrice(2000000); setSort("ending"); setSearch(""); };

  const activeFilterCount = [category !== "All", condition !== "All", minPrice > 0, maxPrice < 2000000].filter(Boolean).length;

  const filtered = [...auctions]
    .filter((a) => statusTab === "All" || a.status === statusTab)
    .filter((a) => !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => category === "All" || a.category === category)
    .filter((a) => condition === "All" || a.condition === condition)
    .filter((a) => { const p = a.currentBid || a.startingBid || 0; return p >= minPrice && p <= maxPrice; })
    .sort((a, b) => {
      if (sort === "ending") return new Date(a.endTime) - new Date(b.endTime);
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "price_asc")  return (a.currentBid || a.startingBid || 0) - (b.currentBid || b.startingBid || 0);
      if (sort === "price_desc") return (b.currentBid || b.startingBid || 0) - (a.currentBid || a.startingBid || 0);
      if (sort === "bids") return (b.bids?.length || 0) - (a.bids?.length || 0);
      return 0;
    });

  const statusCounts = STATUS_TABS.reduce((acc, t) => ({
    ...acc,
    [t.value]: t.value === "All" ? auctions.length : auctions.filter((a) => a.status === t.value).length,
  }), {});

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">

      <WishlistDrawer wishlist={wishlist} open={wishlistOpen} onClose={() => setWishlistOpen(false)} onToggleFav={toggleFav} navigate={navigate} />

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center gap-3">

          <div onClick={() => navigate("/user-dashboard")}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>

          <div className="w-px h-5 bg-slate-200 hidden md:block" />

          <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0">
            {[
              { label: "Dashboard", path: "/user-dashboard", active: false },
              { label: "Live Auctions", path: "/auctions", active: true  },
            ].map(({ label, path, active }) => (
              <button key={path} onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}>
                {label}
              </button>
            ))}
          </nav>

          <div className="w-px h-5 bg-slate-200 hidden md:block" />

          {/* Search */}
          <div className="flex-1 relative max-w-lg">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search auctions, categories, items..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            <button className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
              <Bell size={13} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </button>
            <button onClick={() => setWishlistOpen(true)}
              className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-400 hover:border-red-100 transition">
              <Heart size={13} className={wishlist.length > 0 ? "fill-red-400 text-red-400" : ""} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-indigo-600 text-white text-[8px] font-black px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </button>
            <div className="w-px h-5 bg-slate-200 mx-0.5" />

            <ProfileDropdown
              userName={userName}
              roles={userRoles}
              navigate={navigate}
              onLogout={handleLogout}
            />
          </div>

        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">

        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Loading..." : `${filtered.length.toLocaleString()} auction${filtered.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="appearance-none text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:border-indigo-400 cursor-pointer transition">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition ${
                filterOpen || activeFilterCount > 0 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}>
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && !filterOpen && (
                <span className="bg-white text-indigo-600 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
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

        {/* Status Tabs */}
        <div className="flex items-center gap-2.5 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map(({ label, value, icon: Icon, accent }) => {
            const active = statusTab === value;
            const styles = {
              indigo:  { on: "bg-indigo-600 text-white border-indigo-600",  cnt: "bg-white/20 text-white", off: "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600" },
              emerald: { on: "bg-emerald-600 text-white border-emerald-600", cnt: "bg-white/20 text-white", off: "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700" },
              amber:   { on: "bg-amber-500 text-white border-amber-500", cnt: "bg-white/20 text-white", off: "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600" },
              slate:   { on: "bg-slate-800 text-white border-slate-800",    cnt: "bg-white/20 text-white", off: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800" },
            }[accent];
            return (
              <button key={value} onClick={() => setStatusTab(value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${active ? styles.on : styles.off}`}>
                <Icon size={14} />
                {label}
                <span className={`text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-md flex items-center justify-center ${active ? styles.cnt : "bg-slate-100 text-slate-500"}`}>
                  {statusCounts[value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filter Panel */}
        {filterOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeFilterCount} active</span>
                )}
              </div>
              <button onClick={resetFilters} className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition">
                <RotateCcw size={11} /> Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Category */}
              <div className="p-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        category === cat
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="p-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Condition</p>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <button key={c} onClick={() => setCondition(c)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center gap-2 ${
                        condition === c
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                      }`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        c === "New" ? "bg-emerald-400" : c === "Used" ? "bg-amber-400" : "bg-slate-300"
                      } ${condition === c ? "bg-white/80" : ""}`} />
                      {c === "All" ? "Any" : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="p-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Price Range</p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Min</p>
                    <p className="text-xs font-black text-indigo-600 mt-0.5">NPR {minPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center text-slate-300 font-bold text-sm">—</div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Max</p>
                    <p className="text-xs font-black text-indigo-600 mt-0.5">NPR {maxPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <input type="range" min="0" max="1000000" step="5000" value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full h-1.5 accent-indigo-600 cursor-pointer" />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium"><span>0</span><span>10,00,000</span></div>
                  </div>
                  <div>
                    <input type="range" min="1000" max="2000000" step="10000" value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 accent-indigo-600 cursor-pointer" />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium"><span>1,000</span><span>20,00,000</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
              <Gavel size={20} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Loading auctions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-slate-300" />
            </div>
            <p className="text-base font-black text-slate-700">No auctions found</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">Try adjusting your filters or browse a different status tab.</p>
            <button onClick={resetFilters} className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">
              <RotateCcw size={13} /> Clear all filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((item) => (
              <AuctionCard key={item._id} item={item}
                isFav={wishlist.some((f) => f.auctionItem._id === item._id)}
                onFav={toggleFav}
                onClick={() => navigate(`/auction/${item._id}`)}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <AuctionRow key={item._id} item={item}
                isFav={wishlist.some((f) => f.auctionItem._id === item._id)}
                onFav={toggleFav}
                onClick={() => navigate(`/auction/${item._id}`)}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auction;