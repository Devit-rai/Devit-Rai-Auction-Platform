import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Gavel,
  Search,
  LogOut,
  ChevronRight,
  Car,
  Palette,
  Home,
  Watch,
  Laptop,
  Gem,
  User,
  LayoutDashboard,
  ShoppingBag
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "Auction User";
  const rawRole = userData?.role || userData?.user?.role || "BIDDER";
  const userRole = rawRole.replace("ROLE_", "").toLowerCase();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Unified Navigation Bar */}
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

        <div className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => navigate("/user-dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600"
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => navigate("/auctions")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"
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
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-sm font-black text-slate-900 capitalize leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {userRole}
              </span>
            </div>
            {/* User Profile Trigger */}
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
              <User size={20} />
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-24 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />{" "}
            Market Active
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Bid Smarter.
            <br />
            <span className="text-blue-600">Win Faster.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md leading-relaxed font-medium">
            Welcome back,{" "}
            <span className="text-slate-900 font-bold capitalize">
              {userName}
            </span>
            . Discover high-value lots and track your winning bids in real-time.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => navigate("/auctions")}
              className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-2 transition-all shadow-xl shadow-slate-200 hover:-translate-y-1"
            >
              Enter Auction Hall <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Featured Card */}
        <div
          className="relative group cursor-pointer"
          onClick={() => navigate("/auctions")}
        >
          <div className="absolute -inset-4 bg-blue-500/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <div className="relative bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="h-96 overflow-hidden">
                <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]"
                alt="Featured"
                />
            </div>
            <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-white via-white/95 to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg w-fit mb-3">
                    Featured Item
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">
                    Premium Watch Collection
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    Current Bid
                  </p>
                  <p className="text-slate-900 text-3xl font-black">
                    NPR 5,000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 lg:px-24 pb-24">
        <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Browse Categories
            </h2>
            <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <CategoryBox icon={<Car size={28} />} label="Automotive" />
          <CategoryBox icon={<Palette size={28} />} label="Fine Art" />
          <CategoryBox icon={<Home size={28} />} label="Real Estate" />
          <CategoryBox icon={<Watch size={28} />} label="Watches" />
          <CategoryBox icon={<Laptop size={28} />} label="Tech" />
          <CategoryBox icon={<Gem size={28} />} label="Jewelry" />
        </div>
      </section>
    </div>
  );
};

const CategoryBox = ({ icon, label }) => (
  <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center gap-5 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer group hover:-translate-y-2 duration-300">
    <div className="text-slate-300 group-hover:text-blue-600 transition-all duration-300">
      {icon}
    </div>
    <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">
      {label}
    </span>
  </div>
);

export default UserDashboard;