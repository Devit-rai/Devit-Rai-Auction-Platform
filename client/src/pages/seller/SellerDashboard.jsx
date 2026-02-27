import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, List, TrendingUp, Gavel,
  LogOut, User, Shield, Clock, CheckCircle, XCircle,} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const getTimeRemaining = (endTime) => {
  if (!endTime) return "—";
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return "Ended";
  const d = Math.floor(total / 86400000),
    h = Math.floor((total / 3600000) % 24),
    m = Math.floor((total / 60000) % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
const fmt = (n) => "NPR " + Number(n || 0).toLocaleString();

const ApprovalBadge = ({ status }) => {
  const map = {
    Approved: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    Rejected: { cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
    Pending: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
  };
  const cfg = map[status] || map["Pending"];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}
    >
      <Icon size={11} />
      {status || "Pending"}
    </span>
  );
};
const StatusBadge = ({ status }) => {
  const map = {
    Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Ended: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}
    >
      {status === "Live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {status || "—"}
    </span>
  );
};
const StatCard = ({ label, value, icon: Icon, color = "indigo", sub }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      {Icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}
        >
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
  >
    <Icon size={16} className={active ? "text-indigo-600" : ""} />
    {label}
  </button>
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listFilter, setListFilter] = useState("all");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  const isMyAuction = (item) =>
    item.createdBy === user?._id || item.createdBy?._id === user?._id;

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        setAuctions((data.items || data || []).filter(isMyAuction));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id]);

  /* Realtime updates  */
  useEffect(() => {
    const onStatusUpdate = ({ auctionId, status }) => {
      setAuctions((prev) =>
        prev.map((a) => (a._id === auctionId ? { ...a, status } : a)),
      );
    };

    const onApproval = ({ auctionId, approvalStatus }) => {
      setAuctions((prev) =>
        prev.map((a) => (a._id === auctionId ? { ...a, approvalStatus } : a)),
      );
    };

    const onNewBid = ({ auctionId, currentBid, bidCount, bid }) => {
      setAuctions((prev) =>
        prev.map((a) => {
          if (a._id !== auctionId) return a;
          return {
            ...a,
            currentBid,
            bids: bid ? [...(a.bids || []), bid] : a.bids,
          };
        }),
      );
    };

    socket.on("auctionStatusUpdated", onStatusUpdate);
    socket.on("auctionApprovalChanged", onApproval);
    socket.on("newBidPlaced", onNewBid);

    return () => {
      socket.off("auctionStatusUpdated", onStatusUpdate);
      socket.off("auctionApprovalChanged", onApproval);
      socket.off("newBidPlaced", onNewBid);
    };
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = auctions.reduce(
      (s, a) => s + (Number(a.currentBid) || 0),
      0,
    );
    const allBids = auctions.flatMap((item) =>
      (item.bids || []).map((bid) => ({
        ...bid,
        itemTitle: item.title,
        bidderName: bid.bidderName || bid.userName || "User",
        bidAmount: Number(bid.bidAmount || bid.amount || 0),
        bidTime: bid.createdAt || item.createdAt,
      })),
    );
    const days = [...Array(7)]
      .map((_, i) => dayjs().subtract(i, "day").format("ddd"))
      .reverse();
    const chartMap = days.reduce((a, d) => ({ ...a, [d]: 0 }), {});
    auctions.forEach((a) => {
      const d = dayjs(a.createdAt).format("ddd");
      if (chartMap[d] !== undefined) chartMap[d]++;
    });
    return {
      totalRevenue,
      liveCount: auctions.filter((a) => a.status === "Live").length,
      pendingCount: auctions.filter(
        (a) => (a.approvalStatus || "Pending") === "Pending",
      ).length,
      rejectedCount: auctions.filter((a) => a.approvalStatus === "Rejected")
        .length,
      recentBids: [...allBids]
        .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
        .slice(0, 5),
      chartData: days.map((d) => ({ name: d, count: chartMap[d] })),
    };
  }, [auctions]);

  const tableAuctions = auctions.filter((a) => {
    if (listFilter === "all") return true;
    if (listFilter === "Pending")
      return (a.approvalStatus || "Pending") === "Pending";
    if (listFilter === "Approved") return a.approvalStatus === "Approved";
    if (listFilter === "Rejected") return a.approvalStatus === "Rejected";
    return a.status === listFilter;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">
      <aside className="w-56 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Gavel size={14} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">
            BidHub
          </span>
        </div>
        <div className="mx-3 mt-3 mb-1 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={13} className="text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-indigo-400 font-medium">
              Logged in as
            </p>
            <p className="text-xs font-black text-indigo-700 truncate">
              {user?.name || "Seller"}
            </p>
            <p className="text-[10px] text-indigo-500 font-semibold capitalize">
              Seller
            </p>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
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
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-56 p-7 min-h-screen">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-xl font-black text-slate-800">
              Seller Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time overview of your listings and bids
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard
            label="Total Revenue"
            value={fmt(stats.totalRevenue)}
            icon={TrendingUp}
            color="indigo"
          />
          <StatCard
            label="Live Now"
            value={stats.liveCount}
            icon={Gavel}
            color="emerald"
          />
          <StatCard
            label="Pending Approval"
            value={stats.pendingCount}
            icon={Clock}
            color="amber"
            sub="Awaiting admin review"
          />
          <StatCard
            label="Rejected"
            value={stats.rejectedCount}
            icon={XCircle}
            color="red"
            sub="Need attention"
          />
        </div>

        {stats.pendingCount > 0 && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
            <Clock size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">
                {stats.pendingCount} listing{stats.pendingCount > 1 ? "s" : ""}{" "}
                awaiting admin approval
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Your items will go live once an admin reviews and approves them.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-sm font-black text-slate-700 mb-0.5">
              Listings This Week
            </p>
            <p className="text-xs text-slate-400 mb-5">
              Items listed per day over the last 7 days
            </p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#grad)"
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
            <p className="text-sm font-black text-slate-700 mb-4">
              Latest Bids
            </p>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {stats.recentBids.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No bids yet.
                </p>
              ) : (
                stats.recentBids.map((bid, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {bid.bidderName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {bid.itemTitle}
                      </p>
                    </div>
                    <p className="text-xs font-black text-indigo-600 flex-shrink-0">
                      {fmt(bid.bidAmount)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/bid-history")}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition"
            >
              View Full History
            </button>
          </div>
        </div>

        {/* All Listings Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-700">My Listings</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {tableAuctions.length} of {auctions.length} items shown
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "All", value: "all", count: auctions.length },
                {
                  label: "Live",
                  value: "Live",
                  count: auctions.filter((a) => a.status === "Live").length,
                },
                {
                  label: "Upcoming",
                  value: "Upcoming",
                  count: auctions.filter((a) => a.status === "Upcoming").length,
                },
                {
                  label: "Ended",
                  value: "Ended",
                  count: auctions.filter((a) => a.status === "Ended").length,
                },
                {
                  label: "Pending",
                  value: "Pending",
                  count: stats.pendingCount,
                  highlight: "amber",
                },
                {
                  label: "Rejected",
                  value: "Rejected",
                  count: stats.rejectedCount,
                  highlight: "red",
                },
              ].map(({ label, value, count, highlight }) => (
                <button
                  key={value}
                  onClick={() => setListFilter(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${listFilter === value ? (highlight === "amber" ? "bg-amber-500 text-white border-amber-500" : highlight === "red" ? "bg-red-500 text-white border-red-500" : "bg-indigo-600 text-white border-indigo-600") : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {label}
                  <span
                    className={`text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${listFilter === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                  {[
                    "Item",
                    "Current Bid",
                    "Bids",
                    "Time Left",
                    "Status",
                    "Approval",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tableAuctions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-slate-400 py-12 text-xs"
                    >
                      No items in this category.
                    </td>
                  </tr>
                ) : (
                  tableAuctions.map((item) => {
                    const approval = item.approvalStatus || "Pending";
                    return (
                      <tr
                        key={item._id}
                        className={`border-b border-slate-50 transition ${approval === "Rejected" ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50/60"}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              {item.image?.url && (
                                <img
                                  src={item.image.url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {item.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-indigo-600 whitespace-nowrap">
                          {fmt(item.currentBid || item.startingBid)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-indigo-100">
                            {item.bids?.length || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {item.status === "Ended"
                            ? "—"
                            : getTimeRemaining(item.endTime)}
                        </td>
                        <td className="px-5 py-3.5">
                          {approval !== "Rejected" && (
                            <StatusBadge status={item.status} />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <ApprovalBadge status={approval} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
