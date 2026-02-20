import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel,
  Search,
  LogOut,
  ChevronRight,
  Car,
  Palette,
  Watch,
  Laptop,
  Gem,
  Bell,
  Zap,
  ArrowUpRight,
  Package,
  Shield,
  Trophy,
  TrendingUp,
  Star,
} from "lucide-react";

const fmt = (n) => "NPR " + Number(n).toLocaleString();

const getTime = (endTime) => {
  if (!endTime) return { label: "—", urgent: false, ended: false };
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return { label: "Ended", urgent: false, ended: true };
  const d = Math.floor(total / 86400000);
  const h = Math.floor((total / 3600000) % 24);
  const m = Math.floor((total / 60000) % 60);
  const urgent = total < 10800000;
  if (d > 0) return { label: `${d}d ${h}h`, urgent: false, ended: false };
  if (h > 0) return { label: `${h}h ${m}m`, urgent, ended: false };
  return { label: `${m}m`, urgent: true, ended: false };
};

const Navbar = ({
  userName,
  userRole,
  onLogout,
  navigate,
  search,
  setSearch,
}) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center gap-3">
      <div
        onClick={() => navigate("/user-dashboard")}
        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
      >
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Gavel size={14} className="text-white" />
        </div>
        <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">
          BidHub
        </span>
      </div>

      <div className="w-px h-5 bg-slate-200 hidden md:block" />

      <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0">
        {[
          { label: "Dashboard", path: "/user-dashboard", active: true },
          { label: "Live Auctions", path: "/auctions", active: false },
        ].map(({ label, path, active }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="w-px h-5 bg-slate-200 hidden md:block" />

      {/* Search */}
      <div className="flex-1 relative max-w-lg">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search auctions, categories, items..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
        <button className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
          <Bell size={13} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-0.5" />
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs uppercase flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="hidden lg:block leading-none">
            <p className="text-xs font-bold text-slate-800 capitalize">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={13} />
        </button>
      </div>
    </div>
  </header>
);

// Live Auction Card
const AuctionCard = ({ item, navigate }) => {
  const t = getTime(item.endTime);
  return (
    <div
      onClick={() => navigate(`/auction/${item._id}`)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.image?.url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3">
          {t.urgent ? (
            <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />{" "}
              Ending Soon
            </span>
          ) : item.status === "Live" ? (
            <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
            </span>
          ) : (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Upcoming
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          {item.category}
        </p>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700 transition-colors mb-auto">
          {item.title}
        </h3>
        <div className="h-px bg-slate-100 my-3" />
        <div className="flex items-end justify-between mb-3.5">
          <div>
            <p className="text-[10px] text-slate-400">Current Bid</p>
            <p className="text-sm font-black text-slate-900">
              {fmt(item.currentBid || item.startingBid || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Time Left</p>
            <p
              className={`text-xs font-bold ${t.urgent ? "text-red-500" : "text-slate-700"}`}
            >
              {t.label}
            </p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all group/btn">
          Place Bid{" "}
          <ArrowUpRight
            size={12}
            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

// Category Box 
const CategoryBox = ({ icon: Icon, label, color, count, navigate }) => {
  const palette = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600",
    slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-700",
  };
  return (
    <button
      onClick={() => navigate("/auctions")}
      className="group bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:text-white ${palette[color]}`}
      >
        <Icon size={20} />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
          {label}
        </p>
        {count > 0 && (
          <p className="text-[10px] text-slate-400 mt-0.5">{count} listings</p>
        )}
      </div>
    </button>
  );
};

// Main
const UserDashboard = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "User";
  const rawRole = userData?.role || userData?.user?.role || "BIDDER";
  const userRole = rawRole.replace("ROLE_", "").toLowerCase();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auctions/all");
        setAuctions(data.items || data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live search
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = search.toLowerCase();
    setSearchResults(
      auctions
        .filter(
          (a) =>
            a.title?.toLowerCase().includes(q) ||
            a.category?.toLowerCase().includes(q),
        )
        .slice(0, 5),
    );
  }, [search, auctions]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const live = auctions.filter((a) => a.status === "Live");
  const ending = auctions.filter(
    (a) => getTime(a.endTime).urgent && !getTime(a.endTime).ended,
  );
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cats = [
    {
      icon: Car,
      label: "Vehicles",
      color: "blue",
      count: auctions.filter((a) => a.category === "Vehicles").length,
    },
    {
      icon: Palette,
      label: "Fine Art",
      color: "violet",
      count: auctions.filter((a) => a.category === "Art").length,
    },
    {
      icon: Watch,
      label: "Watches",
      color: "amber",
      count: auctions.filter((a) => a.category === "Watches").length,
    },
    {
      icon: Laptop,
      label: "Tech",
      color: "emerald",
      count: auctions.filter((a) => a.category === "Electronics").length,
    },
    {
      icon: Gem,
      label: "Jewelry",
      color: "rose",
      count: auctions.filter((a) => a.category === "Jewelry").length,
    },
    {
      icon: Package,
      label: "All Items",
      color: "slate",
      count: auctions.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">
      <Navbar
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
        navigate={navigate}
        search={search}
        setSearch={setSearch}
      />

      {/* Live search dropdown */}
      {searchResults.length > 0 && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-[480px] z-[200] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          {searchResults.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                navigate(`/auction/${item._id}`);
                setSearch("");
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition border-b border-slate-50 last:border-0"
            >
              <img
                src={item.image?.url}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                alt={item.title}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {item.category} ·{" "}
                  {fmt(item.currentBid || item.startingBid || 0)}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "Live"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
          <div
            onClick={() => {
              navigate("/auctions");
              setSearch("");
            }}
            className="px-4 py-2.5 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
          >
            See all results →
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-10">
        <section className="grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-50 rounded-full opacity-50 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-slate-50 rounded-full opacity-80 pointer-events-none" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                Market Active · {live.length} Live
              </div>

              <div>
                <p className="text-slate-400 text-sm font-medium">{greet},</p>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mt-1">
                  Bid Smarter.
                  <br />
                  <span className="text-indigo-600">Win Faster.</span>
                </h1>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Welcome back,{" "}
                <span className="text-slate-800 font-bold capitalize">
                  {userName}
                </span>
                . Discover high-value lots and track your winning bids in
                real-time.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate("/auctions")}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-slate-200 hover:-translate-y-0.5 group"
                >
                  Enter Auction Hall{" "}
                  <ChevronRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
                <button
                  onClick={() => navigate("/auctions")}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-5 py-3 rounded-2xl transition"
                >
                  <Zap size={14} className="text-amber-500" /> Live Now
                </button>
              </div>
            </div>
          </div>

          {/* Right — featured auction or fallback */}
          {live[0] ? (
            <div
              onClick={() => navigate(`/auction/${live[0]._id}`)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer min-h-[380px] border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={live[0].image?.url}
                alt={live[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-5 left-5 flex gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <Star size={9} fill="currentColor" /> Featured
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />{" "}
                  Live
                </span>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {live[0].category}
                </p>
                <h2 className="text-xl font-black text-white leading-snug mb-4 line-clamp-2">
                  {live[0].title}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex gap-5">
                    <div>
                      <p className="text-white/40 text-[10px] mb-0.5">
                        Current Bid
                      </p>
                      <p className="text-white font-black text-base">
                        {fmt(live[0].currentBid || live[0].startingBid || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] mb-0.5">
                        Time Left
                      </p>
                      <p
                        className={`font-black text-base ${getTime(live[0].endTime).urgent ? "text-red-400" : "text-white"}`}
                      >
                        {getTime(live[0].endTime).label}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white group-hover:bg-indigo-600 rounded-xl flex items-center justify-center text-slate-900 group-hover:text-white transition-all shadow-xl">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 min-h-[380px]">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <Gavel size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600">
                No live auctions
              </p>
              <p className="text-xs text-slate-400 mt-1">Check back soon.</p>
            </div>
          )}
        </section>

        {/* Top stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Shield,
              color: "bg-emerald-50 text-emerald-600",
              label: "Verified Sellers",
              desc: "Every seller reviewed",
            },
            {
              icon: Zap,
              color: "bg-indigo-50 text-indigo-600",
              label: "Real-Time Bidding",
              desc: "Live countdowns",
            },
            {
              icon: Trophy,
              color: "bg-amber-50 text-amber-600",
              label: "Buyer Protection",
              desc: "Money-back guarantee",
            },
            {
              icon: TrendingUp,
              color: "bg-rose-50 text-rose-600",
              label: "Transparent Pricing",
              desc: "Full bid history",
            },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Live auction grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Live Auctions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {live.length} active right now
              </p>
            </div>
            <button
              onClick={() => navigate("/auctions")}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : live.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-14 text-center">
              <p className="text-sm font-semibold text-slate-500">
                No live auctions at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {live.slice(0, 8).map((item) => (
                <AuctionCard key={item._id} item={item} navigate={navigate} />
              ))}
            </div>
          )}
        </section>

        {/* CATEGORIES */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Browse Categories
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {cats.map((cat) => (
              <CategoryBox key={cat.label} {...cat} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* Banner */}
        <section className="relative rounded-2xl overflow-hidden bg-indigo-600 p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 right-32 w-28 h-28 bg-indigo-500/50 rounded-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                <Zap size={10} className="text-yellow-300" /> {live.length}{" "}
                Auctions Live Right Now
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                Don't miss the next big win.
              </h2>
              <p className="text-indigo-200 text-sm mt-1">
                New items added daily. Place your bid before the clock runs out.
              </p>
            </div>
            <button
              onClick={() => navigate("/auctions")}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg group"
            >
              Browse Auctions{" "}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
