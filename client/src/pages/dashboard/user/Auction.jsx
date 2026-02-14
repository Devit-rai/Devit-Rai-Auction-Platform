import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { 
  Gavel, User, Search, ArrowRight, LogOut, 
  LayoutDashboard, ShoppingBag, Heart, X, ChevronDown, 
  Filter, RotateCcw, PackageSearch 
} from "lucide-react";
import { toast } from "react-hot-toast";

const Auction = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Live"); 
  const [conditionFilter, setConditionFilter] = useState("All");
  const [minPrice, setMinPrice] = useState(0); // added min price
  const [maxPrice, setMaxPrice] = useState(2000000); // increased default max

  // wishlist states
  const [wishlist, setWishlist] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // user data extraction
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "Auction User";
  const rawRole = userData?.role || userData?.user?.role || "BIDDER";
  const userRole = rawRole.replace("ROLE_", "").toLowerCase();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [auctionRes, wishlistRes] = await Promise.all([
        api.get("/auctions/all"),
        api.get("/wishlist")
      ]);
      setAuctions(auctionRes.data.items || auctionRes.data || []);
      setWishlist(wishlistRes.data.wishlist || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to sync market data");
    } finally {
      setLoading(false);
    }
  };

  // logic handlers 
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const toggleWishlist = async (e, auctionId) => {
    e.stopPropagation(); 
    const isFavorited = wishlist.some(fav => fav.auctionItem._id === auctionId);
    try {
      if (isFavorited) {
        await api.delete(`/wishlist/${auctionId}`);
        setWishlist(prev => prev.filter(item => item.auctionItem._id !== auctionId));
        toast.success("Removed from favorites");
      } else {
        await api.post(`/wishlist/${auctionId}`);
        const addedItem = auctions.find(a => a._id === auctionId);
        setWishlist(prev => [{ auctionItem: addedItem }, ...prev]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const resetFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setConditionFilter("All");
    setMinPrice(0);
    setMaxPrice(2000000);
    setSearchTerm("");
  };

  // filtering logic 
  const filteredAuctions = auctions.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "All" || item.condition === conditionFilter;
    
    const price = item.currentBid || item.startingBid;
    const matchesPrice = price >= minPrice && price <= maxPrice;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition && matchesPrice;
  });

  const categories = ["All", ...new Set(auctions.map(a => a.category))];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      
      {/* favorites sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[100] transition-transform duration-500 ease-in-out border-l border-slate-200 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Heart className="fill-pink-500 text-pink-500" size={20} /> My Favorites
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {wishlist.length === 0 ? (
              <div className="text-center py-20">
                <Heart size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-bold text-sm">No favorites saved</p>
              </div>
            ) : (
              wishlist.map((fav) => (
                <div key={fav.auctionItem._id} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <img src={fav.auctionItem.image?.url} className="w-14 h-14 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs truncate text-slate-800">{fav.auctionItem.title}</h4>
                    <p className="text-blue-600 font-black text-[11px] mt-0.5">NPR {fav.auctionItem.currentBid || fav.auctionItem.startingBid}</p>
                    <div className="flex gap-3 mt-1.5">
                        <button onClick={() => navigate(`/auction/${fav.auctionItem._id}`)} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600">View</button>
                        <button onClick={(e) => toggleWishlist(e, fav.auctionItem._id)} className="text-[10px] font-black uppercase text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[95]" onClick={() => setIsSidebarOpen(false)} />}

      {/* navigation bar */}
      <nav className="flex items-center justify-between px-6 lg:px-24 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/user-dashboard")}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
            <Gavel size={22} className="text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Auction<span className="text-blue-600">Pro</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <button onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-500 transition-all relative"
          >
            <Heart size={20} className={wishlist.length > 0 ? "fill-pink-500 text-pink-500" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] flex items-center justify-center rounded-full ring-2 ring-white font-black">
                {wishlist.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-sm font-black text-slate-900 capitalize leading-tight">{userName}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{userRole}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
              <User size={20} />
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="px-6 lg:px-24 py-12">
        {/* title & filter toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> Live Now
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Current Listings</h1>
            <p className="text-slate-500 font-medium mt-1">Showing {filteredAuctions.length} matching items.</p>
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${isFilterOpen ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter size={18} />
            {isFilterOpen ? 'Hide Filters' : 'Advanced Filters'}
            <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* collapsible filter container */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFilterOpen ? 'max-h-[600px] mb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-slate-400">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-slate-400">Auction Status</label>
              <div className="flex gap-2">
                {["Live", "Upcoming", "All"].map(status => (
                  <button 
                    key={status} 
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${statusFilter === status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-slate-400">Condition</label>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100">
                <option value="All">Any Condition</option>
                <option value="New">Brand New</option>
                <option value="Used">Pre-owned</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>

            {/* updated price filter section */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase text-slate-400">Min Price (NPR)</label>
                  <span className="text-xs font-black text-blue-600">{minPrice.toLocaleString()}</span>
                </div>
                <input type="range" min="0" max="1000000" step="5000" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase text-slate-400">Max Price (NPR)</label>
                  <span className="text-xs font-black text-blue-600">{maxPrice.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="2000000" step="10000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
                <button onClick={resetFilters} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 mt-4 hover:opacity-70 transition-opacity"><RotateCcw size={12}/> Reset All Filters</button>
              </div>
            </div>

          </div>
        </div>

        {/* auction listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Syncing Market Data</p>
          </div>
        ) : filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAuctions.map((item) => (
              <div key={item._id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:border-blue-200 hover:shadow-2xl transition-all duration-500 relative">
                
                <button 
                  onClick={(e) => toggleWishlist(e, item._id)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/50 hover:scale-110 transition-transform"
                >
                  <Heart size={18} className={wishlist.some(fav => fav.auctionItem._id === item._id) ? "fill-pink-500 text-pink-500" : "text-slate-400"} />
                </button>

                <div className="h-56 relative overflow-hidden">
                  <img src={item.image?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-white/50 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{item.status}</span>
                  </div>
                </div>

                <div className="p-7">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.condition || 'Active'}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-5 group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Bid</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xs font-bold text-slate-400">NPR</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{(item.currentBid || item.startingBid).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/auction/${item._id}`)}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn shadow-xl shadow-slate-200"
                  >
                    View details <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <PackageSearch size={48} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-900">No items match your criteria</h3>
            <p className="text-slate-500 font-medium mt-2">Try clearing filters or checking other categories.</p>
            <button onClick={resetFilters} className="mt-8 text-sm font-black text-blue-600 hover:underline flex items-center gap-2">
               <RotateCcw size={14} /> Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Auction;