import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import { Gavel, Search, Timer, ArrowRight, LogOut, User } from "lucide-react";

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
        const liveItems = (data.items || []).filter(
          (item) => item.status === "Live",
        );
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
    item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Navigation Bar  */}
      <nav className="flex items-center justify-between px-6 lg:px-24 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/user-dashboard")}
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            <Gavel size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            AuctionPro
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link
            to="/user-dashboard"
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Home
          </Link>
          <button
            onClick={() => navigate("/auctions")}
            className="text-blue-600 font-bold cursor-pointer"
          >
            Auctions
          </button>
          <button className="hover:text-blue-600 transition cursor-pointer">
            Categories
          </button>
          <button className="hover:text-blue-600 transition cursor-pointer">
            About
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search auctions..."
              className="bg-slate-100 border-none rounded-full py-2.5 pl-11 pr-4 w-48 lg:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-sm font-bold text-slate-900 capitalize leading-tight">
              {userName}
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              {userRole}
            </span>
          </div>

          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer hover:bg-slate-200 transition-colors">
            <User size={20} />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 lg:px-24 py-12">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />{" "}
            Live Market
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Active Auctions
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Browse live listings and place your bids in real-time.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
              Updating Market...
            </p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 py-24 text-center">
            <Gavel size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">
              No live auctions found at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAuctions.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="h-52 relative overflow-hidden">
                  <img
                    src={item.image?.url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.title}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/50">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {item.category}
                    </p>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Timer size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-tight">
                        Ends Soon
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 truncate">
                    {item.title}
                  </h3>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                      Mininum Bid
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      NPR {item.currentBid || item.startingBid}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/auction/${item._id}`)}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn"
                  >
                    View Details{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
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
