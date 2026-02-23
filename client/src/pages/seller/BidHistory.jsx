import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Gavel, LayoutDashboard, List, LogOut,
  Shield, Search, TrendingUp, Users, Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}>
    <Icon size={15} className={active ? "text-indigo-600" : ""} />
    {label}
  </button>
);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

const BidHistory = () => {
  const navigate   = useNavigate();
  const [bids, setBids]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user     = userData?.user || userData;

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        const mine = (data.items || data || []).filter(
          (item) => item.createdBy === user._id || item.createdBy?._id === user._id
        );
        const flat = mine
          .flatMap((item) =>
            (item.bids || []).map((bid) => ({
              bidderName: bid.bidderName || bid.userName || "Anonymous",
              amount:     Number(bid.bidAmount || bid.amount || 0),
              itemTitle:  item.title,
              itemImage:  item.image?.url,
              category:   item.category,
              bidTime:    bid.createdAt,
            }))
          )
          .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

        setBids(flat);
      } catch (err) {
        console.error("Error fetching bid history:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id]);

  const filtered = bids.filter((b) => {
    const q = search.toLowerCase();
    return !q || b.bidderName.toLowerCase().includes(q) || b.itemTitle.toLowerCase().includes(q);
  });

  // Stats
  const totalRevenue  = bids.reduce((s, b) => s + b.amount, 0);
  const uniqueBidders = new Set(bids.map((b) => b.bidderName)).size;
  const uniqueItems   = new Set(bids.map((b) => b.itemTitle)).size;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">

      <aside className="w-56 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Gavel size={14} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">BidHub</span>
        </div>

        <div className="mx-3 mt-3 mb-1 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={13} className="text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-black text-indigo-700 truncate">{user?.name || "Seller"}</p>
            <p className="text-[10px] text-indigo-500 font-semibold capitalize">Seller</p>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <NavItem icon={LayoutDashboard} label="Dashboard"    active={false} onClick={() => navigate("/seller-dashboard")} />
          <NavItem icon={List}            label="My Inventory" active={false} onClick={() => navigate("/inventory")}        />
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={() => { sessionStorage.clear(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-56 p-7">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-semibold mb-6 transition">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-800">Bid History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? "Loading..." : `${bids.length} total bids across your auctions`}
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: TrendingUp, label: "Total Bid Value",  value: `NPR ${totalRevenue.toLocaleString()}`, color: "bg-indigo-50 text-indigo-600"  },
            { icon: Users,      label: "Unique Bidders",   value: uniqueBidders,                          color: "bg-emerald-50 text-emerald-600" },
            { icon: Package,    label: "Items with Bids",  value: uniqueItems,                            color: "bg-amber-50 text-amber-600"     },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 leading-none">
                  {loading ? <span className="inline-block w-12 h-5 bg-slate-100 rounded animate-pulse" /> : value}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bidder or item..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">#</th>
                  <th className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">Bidder</th>
                  <th className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">Auction Item</th>
                  <th className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-400 text-xs">
                      {search ? "No results match your search." : "No bids recorded yet."}
                    </td>
                  </tr>
                ) : filtered.map((bid, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    {/* Row number */}
                    <td className="px-5 py-3.5 text-[11px] font-bold text-slate-300">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* Bidder */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0 uppercase">
                          {bid.bidderName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{bid.bidderName}</span>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {bid.itemImage && (
                            <img src={bid.itemImage} alt={bid.itemTitle} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{bid.itemTitle}</p>
                          <p className="text-[10px] text-slate-400">{bid.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-black text-indigo-600">
                        NPR {bid.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-slate-700 font-medium">{fmtDate(bid.bidTime)}</p>
                      <p className="text-[10px] text-slate-400">{fmtTime(bid.bidTime)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400 font-medium">
                Showing {filtered.length} of {bids.length} bids
                {search && ` matching "${search}"`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BidHistory;