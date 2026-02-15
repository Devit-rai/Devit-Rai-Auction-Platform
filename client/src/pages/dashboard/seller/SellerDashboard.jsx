import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  List,
  TrendingUp,
  Gavel,
  LogOut,
  MoreHorizontal,
  User,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
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

const StatCard = ({ label, value, subValue, icon: Icon, color = "blue" }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      {Icon && (
        <Icon
          size={16}
          className={color === "blue" ? "text-blue-500" : "text-indigo-500"}
        />
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-black text-slate-900">{value}</span>
      {subValue && (
        <span className="text-[10px] text-slate-400 font-bold truncate">
          {subValue}
        </span>
      )}
    </div>
  </div>
);

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
          (item) => item.createdBy === user?._id,
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
      0,
    );
    const liveItems = auctions.filter((a) => a.status === "Live");

    const allBids = auctions.flatMap((item) =>
      (item.bids || []).map((bid) => ({
        ...bid,
        itemTitle: item.title,
        bidderName: bid.bidderName || bid.userName || "User",
        bidAmount: Number(bid.bidAmount || bid.amount || 0),
        bidTime: bid.createdAt || item.createdAt,
      })),
    );

    const highestBidObj =
      allBids.length > 0
        ? allBids.reduce((prev, current) =>
            prev.bidAmount > current.bidAmount ? prev : current,
          )
        : null;

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
      highestBid: highestBidObj,
      recentBids: [...allBids]
        .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
        .slice(0, 4),
      chartData: days.map((d) => ({ name: d, count: chartMap[d] })),
    };
  }, [auctions]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Gavel size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight">AuctionPro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => navigate("/seller-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-blue-600 text-white shadow-md text-sm transition-all"
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => navigate("/inventory")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 text-sm transition-all"
          >
            <List size={18} /> My Inventory
          </button>
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-all"
          >
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-8">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">
            Real-time Performance
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            label="Total Revenue"
            value={`NPR ${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatCard
            label="Live Now"
            value={stats.liveCount || 0}
            icon={Gavel}
          />
          <StatCard
            label="Total Items"
            value={auctions.length || 0}
            icon={List}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-w-0">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-[400px]">
            <h3 className="text-slate-800 font-black text-xl mb-6">
              Latest Bids
            </h3>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {stats.recentBids.map((bid, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <div className="truncate">
                      <p className="text-slate-800 font-bold text-sm truncate">
                        {bid.bidderName}
                      </p>
                      <p className="text-slate-400 text-[9px] font-black uppercase truncate">
                        {bid.itemTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-blue-600 font-black text-sm">
                      Rs. {(bid.bidAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/bid-history")}
              className="mt-6 w-full py-4 bg-slate-900 text-white text-xs font-black uppercase rounded-2xl"
            >
              History
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-slate-800 font-black text-xl">Active Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Current High</th>
                  <th className="px-8 py-5 text-center">Bids</th>
                  <th className="px-8 py-5">Time Left</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!loading &&
                  stats.activeListings.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5 flex items-center gap-4">
                        <img
                          src={item.image?.url}
                          className="w-12 h-12 rounded-xl object-cover"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">
                            {item.category}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-sm text-blue-600">
                        NPR{" "}
                        {(
                          item.currentBid ||
                          item.startingBid ||
                          0
                        ).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">
                          {item.bids?.length || 0}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-sm text-slate-600">
                        {getTimeRemaining(item.endTime)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <MoreHorizontal
                          size={20}
                          className="text-slate-300 ml-auto"
                        />
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
