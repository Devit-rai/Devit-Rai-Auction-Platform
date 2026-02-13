import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gavel, LayoutDashboard, List, Gavel as AuctionIcon, 
  CheckCircle, BarChart3, Wallet, Plus, Search, 
  LogOut, User, Bell, TrendingUp, MoreVertical, Edit
} from "lucide-react";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Dynamic user data from session
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "Premium Seller";
  const userRole = (userData?.role || userData?.user?.role || "SELLER").replace("ROLE_", "");

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Gavel size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">AuctionPro</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{userRole}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={<List size={20}/>} label="My Listings" active={activeTab === "My Listings"} onClick={() => setActiveTab("My Listings")} />
          <SidebarItem icon={<AuctionIcon size={20}/>} label="Active Auctions" active={activeTab === "Active Auctions"} onClick={() => setActiveTab("Active Auctions")} />
          <SidebarItem icon={<CheckCircle size={20}/>} label="Sold Items" active={activeTab === "Sold Items"} onClick={() => setActiveTab("Sold Items")} />
          <SidebarItem icon={<BarChart3 size={20}/>} label="Analytics" active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} />
          <SidebarItem icon={<Wallet size={20}/>} label="Payments" active={activeTab === "Payments"} onClick={() => setActiveTab("Payments")} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        
        {/* Navbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-500 text-sm">Welcome back, {userName}.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search Listings..." className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100">
              <Plus size={18} /> <span className="hidden xs:block">Add New Auction</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Sales" value="NPR 1,250,000" trend="+12.5%" icon={<TrendingUp size={20}/>} />
          <StatCard label="Active Listings" value="24" trend="+2%" />
          <StatCard label="Avg Bid" value="NPR 15,400" trend="+5.4%" />
          <StatCard label="Items Sold" value="156" trend="+8%" />
        </div>

        {/* Listings Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg">Current Active Listings</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Current Bid</th>
                  <th className="px-6 py-4">Bidders</th>
                  <th className="px-6 py-4">Time Remaining</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <ListingRow name="DSLR Camera Kit Z1" cat="Electronics" sku="SKU-042" bid="NPR 85,000" bidders="18" time="02h 14m 05s" />
                <ListingRow name="Ergo-Pro Office Chair" cat="Furniture" sku="SKU-099" bid="NPR 14,500" bidders="6" time="1d 04h 22m" />
                <ListingRow name="Limited Edition Art Book" cat="Collectibles" sku="SKU-112" bid="NPR 3,200" bidders="32" time="00h 45m 12s" />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
      active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:bg-slate-50"
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, trend, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full">{trend}</span>
      </div>
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
    </div>
    {icon && <div className="absolute -right-2 -bottom-2 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity transform scale-150">{icon}</div>}
  </div>
);

const ListingRow = ({ name, cat, sku, bid, bidders, time }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          <AuctionIcon size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{name}</p>
          <p className="text-[10px] text-slate-500">{cat} • {sku}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-sm font-bold text-slate-900">{bid}</span>
    </td>
    <td className="px-6 py-4">
      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{bidders}</span>
    </td>
    <td className="px-6 py-4">
      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">⏱ {time}</span>
    </td>
    <td className="px-6 py-4">
      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
    </td>
  </tr>
);

export default SellerDashboard;