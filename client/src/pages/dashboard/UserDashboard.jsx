import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Gavel, Search, LogOut, ChevronRight, 
  Car, Palette, Home, Watch, Laptop, Gem, User 
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  
  // Get user data from session
  const userData = JSON.parse(sessionStorage.getItem("user"));
  
  // Extract Name and Role
  const userName = userData?.user?.name || userData?.name || "Auction User";
  const rawRole = userData?.role || userData?.user?.role || "BIDDER";
  const userRole = rawRole.replace("ROLE_", "").toLowerCase();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- White Navbar --- */}
      <nav className="flex items-center justify-between px-6 lg:px-24 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Gavel size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">AuctionPro</span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link to="/" className="text-blue-600">Home</Link>
          <button className="hover:text-blue-600 transition">Auctions</button>
          <button className="hover:text-blue-600 transition">Categories</button>
          <button className="hover:text-blue-600 transition">About</button>
        </div>

        {/* Right: Search, User Info, and Logout */}
        <div className="flex items-center gap-4">
          
          {/* 1. Search Bar */}
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search auctions..." 
              className="bg-slate-100 border-none rounded-full py-2.5 pl-11 pr-4 w-48 lg:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          {/* 2. Logged In User Name & Role */}
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900 capitalize leading-tight">
              {userName}
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              {userRole}
            </span>
          </div>

          {/* 3. Profile Icon Circle */}
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
            <User size={20} />
          </div>

          {/* 4. Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="px-6 lg:px-24 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> Live Now
          </div>
          <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
            Bid Smarter.<br />
            <span className="text-blue-600">Win Faster.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md leading-relaxed">
            Welcome back, <span className="text-slate-900 font-semibold capitalize">{userName}</span>. Browse exclusive lots and manage your active bids from your personal dashboard.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-200 hover:translate-x-1">
              Browse Auctions <ChevronRight size={18} />
            </button>
            
          </div>
        </div>

        {/* Featured Visual Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-blue-600/10 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition"></div>
          <div className="relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800" 
              className="w-full h-80 object-cover group-hover:scale-105 transition duration-700" 
              alt="Featured Watch"
            />
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Lot #102</p>
                    <h3 className="text-2xl font-bold text-slate-900">Classic Luxury Watch</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Current Bid</p>
                    <p className="text-slate-900 text-2xl font-black">NPR 12,500</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Categories Grid --- */}
      <section className="px-6 lg:px-24 pb-20">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-10 tracking-tight">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <CategoryBox icon={<Car size={26} />} label="Automotive" />
          <CategoryBox icon={<Palette size={26} />} label="Fine Art" />
          <CategoryBox icon={<Home size={26} />} label="Real Estate" />
          <CategoryBox icon={<Watch size={26} />} label="Watches" />
          <CategoryBox icon={<Laptop size={26} />} label="Tech" />
          <CategoryBox icon={<Gem size={26} />} label="Jewelry" />
        </div>
      </section>
    </div>
  );
};

const CategoryBox = ({ icon, label }) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group">
    <div className="text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
      {icon}
    </div>
    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 uppercase tracking-tighter transition-colors">{label}</span>
  </div>
);

export default UserDashboard;