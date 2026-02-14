import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import { Gavel,User, Search, Timer, ArrowRight, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";

const Auction = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "Auction User";
  const rawRole = userData?.role || userData?.user?.role || "BIDDER";
  const userRole = rawRole.replace("ROLE_", "").toLowerCase();

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        // Supporting both array formats based on common backend patterns
        const items = data.items || data || [];
        const liveItems = items.filter((item) => item.status === "Live");
        setAuctions(liveItems);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveAuctions();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const filteredAuctions = auctions.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Refined Navigation Bar */}
      <nav className="flex items-center justify-between px-6 lg:px-24 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate("/user-dashboard")}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
            <Gavel size={22} className="text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Auction<span className="text-blue-600">Pro</span>
          </span>
        </div>

        {/* Updated Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => navigate("/user-dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600"
          >
            <ShoppingBag size={18} /> Live Auctions
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              className="bg-slate-100 border-none rounded-2xl py-2.5 pl-11 pr-4 w-48 lg:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-sm font-black text-slate-900 capitalize leading-tight">{userName}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{userRole}</span>
            </div>
            {/* User Profile Trigger */}
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
              <User size={20} />
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="px-6 lg:px-24 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> Live Now
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Current Listings</h1>
            <p className="text-slate-500 font-medium mt-1">Real-time bidding on premium assets.</p>
          </div>
          
          <div className="text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
            Showing {filteredAuctions.length} Active Items
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Syncing Market Data</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gavel size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No active auctions</h3>
            <p className="text-slate-400 mt-2 font-medium">Check back later for new items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAuctions.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
              >
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={item.image?.url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={item.title}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-white/50 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Live</span>
                  </div>
                </div>

                <div className="p-7">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Timer size={14} />
                      <span className="text-[10px] font-black uppercase">Active</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-5 group-hover:text-blue-600 transition-colors truncate">
                    {item.title}
                  </h3>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Bid</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-slate-400">NPR</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {item.currentBid || item.startingBid}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/auction/${item._id}`)}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn shadow-xl shadow-slate-200 hover:shadow-blue-200"
                  >
                    View details
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Auction;