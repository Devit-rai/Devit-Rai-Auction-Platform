import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  List,
  TrendingUp,
  Gavel,
  LogOut,
  MoreHorizontal,
  User,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const getTimeRemaining = (endTime) => {
  if (!endTime) return "N/A";
  const total = Date.parse(endTime) - Date.parse(new Date());
  if (total <= 0) return "Ended";
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h remaining`;
};

// Stat Card
const StatCard = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
};

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
const SellerDashboard = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        const myItems = (data.items || []).filter(
          (item) => item.createdBy === user?._id
        );
        setAuctions(myItems);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchStats();
  }, [user?._id]);

  const stats = useMemo(() => {
    const totalRevenue = auctions.reduce(
      (acc, curr) => acc + (Number(curr.currentBid) || 0),
      0
    );
    const liveItems = auctions.filter((a) => a.status === "Live");

    const allBids = auctions.flatMap((item) =>
      (item.bids || []).map((bid) => ({
        ...bid,
        itemTitle: item.title,
        bidderName: bid.bidderName || bid.userName || "User",
        bidAmount: Number(bid.bidAmount || bid.amount || 0),
        bidTime: bid.createdAt || item.createdAt,
      }))
    );

    const days = [...Array(7)]
      .map((_, i) => dayjs().subtract(i, "day").format("ddd"))
      .reverse();
    const chartMap = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
    auctions.forEach((a) => {
      const d = dayjs(a.createdAt).format("ddd");
      if (chartMap[d] !== undefined) chartMap[d]++;
    });

    return {
      totalRevenue,
      liveCount: liveItems.length,
      activeListings: liveItems,
      recentBids: [...allBids]
        .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
        .slice(0, 5),
      chartData: days.map((d) => ({ name: d, count: chartMap[d] })),
    };
  }, [auctions]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Gavel size={16} />
          </div>
          <span className="font-bold text-indigo-900 text-lg tracking-tight">Auction</span>
        </div>

        {/* Seller badge */}
        <div className="mx-4 mt-4 mb-2 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={14} className="text-indigo-600" />
          <div>
            <p className="text-[11px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-bold text-indigo-700 truncate">
              {user?.name || user?.email || "Seller"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 space-y-1">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={true}
            onClick={() => navigate("/seller-dashboard")}
          />
          <NavItem
            icon={List}
            label="My Inventory"
            active={false}
            onClick={() => navigate("/inventory")}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => { sessionStorage.clear(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-60 p-8 min-h-screen">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time performance overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Revenue"
            value={`NPR ${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={TrendingUp}
            color="indigo"
          />
          <StatCard
            label="Live Now"
            value={stats.liveCount || 0}
            icon={Gavel}
            color="emerald"
          />
          <StatCard
            label="Total Items"
            value={auctions.length || 0}
            icon={List}
            color="amber"
          />
        </div>

        {/* Chart + Recent Bids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-slate-700 mb-1">Listings This Week</p>
            <p className="text-xs text-slate-400 mb-5">Items listed per day over the last 7 days</p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <p className="text-sm font-semibold text-slate-700 mb-4">Latest Bids</p>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {stats.recentBids.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No bids yet.</p>
              )}
              {stats.recentBids.map((bid, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{bid.bidderName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{bid.itemTitle}</p>
                  </div>
                  <p className="text-sm font-bold text-indigo-600 flex-shrink-0">
                    NPR {(bid.bidAmount || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/bid-history")}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              View Full History
            </button>
          </div>
        </div>

        {/* Active Listings Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">Active Listings</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.activeListings.length} items currently live</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Item</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Bid</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Bids</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Time Left</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-10 text-sm">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && stats.activeListings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-10 text-sm">
                      No active listings.
                    </td>
                  </tr>
                )}
                {!loading &&
                  stats.activeListings.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image?.url}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                            alt={item.title}
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        NPR {(item.currentBid || item.startingBid || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-100">
                          {item.bids?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {getTimeRemaining(item.endTime)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;