import React, { useState, useEffect } from "react";
import { ArrowLeft, Gavel, LayoutDashboard, List, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Nav Item
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      active
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    <Icon size={16} className={active ? "text-indigo-600" : ""} />
    {label}
  </button>
);

// Main
const BidHistory = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        const myItems = (data.items || []).filter(
          (item) => item.createdBy === user?._id
        );

        const flattenedBids = myItems
          .flatMap((item) =>
            (item.bids || []).map((bid) => ({
              bidderName: bid.bidderName || bid.userName || "Anonymous",
              amount: Number(bid.bidAmount || bid.amount || 0),
              itemTitle: item.title,
              itemImage: item.image?.url,
              category: item.category,
              bidTime: bid.createdAt,
            }))
          )
          .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

        setBids(flattenedBids);
      } catch (err) {
        console.error("Error fetching bid history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchFullHistory();
  }, [user?._id]);

  const filtered = bids.filter(
    (b) =>
      b.bidderName.toLowerCase().includes(search.toLowerCase()) ||
      b.itemTitle.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Gavel size={16} />
          </div>
          <span className="font-bold text-indigo-900 text-lg tracking-tight">Auction</span>
        </div>

        <div className="mx-4 mt-4 mb-2 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={14} className="text-indigo-600" />
          <div>
            <p className="text-[11px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-bold text-indigo-700 truncate">
              {user?.name || user?.email || "Seller"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={false} onClick={() => navigate("/seller-dashboard")} />
          <NavItem icon={List} label="My Inventory" active={false} onClick={() => navigate("/inventory")} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => { sessionStorage.clear(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 p-8">

        {/* Back + Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-medium mb-6 transition"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bid History</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? "Loading..." : `${bids.length} total bids across your auctions`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bidder or item..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Bidder</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Auction Item</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-400 text-sm">
                    {search ? "No results match your search." : "No bids recorded yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((bid, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    {/* Bidder */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
                          {bid.bidderName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{bid.bidderName}</span>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={bid.itemImage}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          alt={bid.itemTitle}
                        />
                        <div>
                          <p className="font-semibold text-slate-800 truncate max-w-[220px]">{bid.itemTitle}</p>
                          <p className="text-xs text-slate-400">{bid.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">
                        NPR {bid.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-slate-600 text-sm">{formatDate(bid.bidTime)}</p>
                      <p className="text-xs text-slate-400">{formatTime(bid.bidTime)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BidHistory;