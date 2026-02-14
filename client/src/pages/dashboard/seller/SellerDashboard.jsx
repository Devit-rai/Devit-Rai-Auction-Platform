import React, { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, List, TrendingUp, Gavel, LogOut, MoreHorizontal, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from "dayjs";

// Helper to calculate time left
const getTimeRemaining = (endTime) => {
  const total = Date.parse(endTime) - Date.parse(new Date());
  if (total <= 0) return "Ended";
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h remaining`;
};

const StatCard = ({ label, value, badgeText, color, badgeIcon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      {badgeText && <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>{badgeText}</span>}
      {badgeIcon}
    </div>
    <span className="text-2xl font-black text-slate-900">{value}</span>
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
        const myItems = (data.items || []).filter(item => item.createdBy === user?._id);
        setAuctions(myItems);
      } catch (error) {
        console.error("Stats fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?._id]);

  const stats = useMemo(() => {
    const totalRevenue = auctions.reduce((acc, curr) => acc + (curr.currentBid || 0), 0);
    const liveItems = auctions.filter(a => a.status === "Live");
    const days = [...Array(7)].map((_, i) => dayjs().subtract(i, 'day').format('ddd')).reverse();
    const chartMap = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
    
    auctions.forEach(a => {
      const d = dayjs(a.createdAt).format('ddd');
      if (chartMap[d] !== undefined) chartMap[d]++;
    });

    return { 
      totalRevenue, 
      liveCount: liveItems.length,
      activeListings: liveItems,
      chartData: days.map(d => ({ name: d, count: chartMap[d] })) 
    };
  }, [auctions]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-5 flex items-center gap-2 border-b border-slate-50">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <Gavel size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight">AuctionPro</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1 mt-2">
          <button onClick={() => navigate("/seller-dashboard")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold bg-blue-600 text-white shadow-md text-sm">
            <LayoutDashboard size={18}/> Dashboard
          </button>
          <button onClick={() => navigate("/inventory")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 text-sm">
            <List size={18}/> My Inventory
          </button>
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button onClick={() => { sessionStorage.clear(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all">
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Analytics</h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Performance Overview</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Revenue" value={`NPR ${stats.totalRevenue.toLocaleString()}`} color="blue" />
          <StatCard label="Live Items" value={stats.liveCount} badgeText="Active" color="indigo" />
          <StatCard label="Total Items" value={auctions.length} badgeIcon={<TrendingUp size={14} className="text-green-500" />} />
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Listing Growth (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Active Listings Section --- */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
            <h3 className="text-slate-800 font-black text-lg tracking-tight">Active Listings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Current Bid</th>
                  <th className="px-6 py-4 text-center">Bidders</th>
                  <th className="px-6 py-4">Time Remaining</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                ) : stats.activeListings.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium">No active listings to display.</td></tr>
                ) : stats.activeListings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={item.image?.url} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm" alt="" />
                        <div>
                          <p className="text-slate-800 font-bold text-sm">{item.title}</p>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-blue-600 font-black text-sm">NPR {item.currentBid || item.startingBid}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black border border-blue-100">
                        {item.bids?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-600 text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg">
                        {getTimeRemaining(item.endTime)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreHorizontal size={20} />
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