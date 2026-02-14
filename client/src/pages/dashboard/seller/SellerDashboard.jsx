import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios"; 
import { 
  Gavel, LayoutDashboard, List, Plus, LogOut, Edit, Trash2, X, 
  Image as ImageIcon, Minus, ChevronRight
} from "lucide-react";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userName = userData?.user?.name || userData?.name || "Seller";

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auctions/all");
      const sortedItems = (data.items || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAuctions(sortedItems);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this auction?")) return;
    try {
      await api.delete(`/auctions/${id}`);
      setAuctions(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
      {/* --- Compact Sidebar --- */}
      <aside className="w-60 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-5 flex items-center gap-2 border-b border-slate-50">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <Gavel size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight">AuctionPro</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={<List size={18}/>} label="My List" active={activeTab === "My List"} onClick={() => setActiveTab("My List")} />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all">
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-60 p-4 lg:p-6">
        
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Seller Panel</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Welcome, {userName}</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={16} /> New Auction
          </button>
        </header>

        {/* --- Small Stat Boxes --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Items" value={auctions.length} badgeIcon={<Minus size={12} className="text-slate-300" />} />
          <StatCard label="Active" value={auctions.filter(a => a.status === "Live").length} badgeText="Live" color="blue" />
          <StatCard label="Upcoming" value={auctions.filter(a => a.status === "Upcoming").length} badgeText="Scheduled" color="indigo" />
        </div>

        {/* --- Table List --- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">Inventory List</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="p-10 text-center"><div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                ) : (
                  auctions.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image?.url} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shadow-sm" alt="" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900">NPR {item.currentBid || item.startingBid}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                          item.status === 'Live' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Create Auction</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
               <AuctionForm onClose={() => setShowModal(false)} onSuccess={fetchAuctions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Smaller Sub-Components ---

const StatCard = ({ label, value, badgeText, color, badgeIcon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden transition-transform hover:shadow-md">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      {badgeText && (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
          color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'
        }`}>
          {badgeText}
        </span>
      )}
      {badgeIcon && badgeIcon}
    </div>
    <span className="text-2xl font-black text-slate-900">{value}</span>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-sm ${
    active ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-slate-50"
  }`}>
    {icon} <span>{label}</span>
  </button>
);

const AuctionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ title: "", description: "", category: "", startingBid: "", startTime: "", endTime: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      await api.post("/auctions/new", data, { headers: { "Content-Type": "multipart/form-data" } });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</label>
        <input type="text" required className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
          onChange={e => setFormData({...formData, title: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
          <select required className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="">Select...</option>
            <option value="Electronics">Electronics</option>
            <option value="Art">Art</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Starting Price</label>
          <input type="number" required className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" 
            onChange={e => setFormData({...formData, startingBid: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input type="datetime-local" required className="w-full bg-slate-50 rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, startTime: e.target.value})} />
        <input type="datetime-local" required className="w-full bg-slate-50 rounded-xl p-3 text-xs" onChange={e => setFormData({...formData, endTime: e.target.value})} />
      </div>
      <div className="border-2 border-dashed border-slate-100 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
        <input type="file" required id="img" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
        <label htmlFor="img" className="cursor-pointer text-[11px] font-bold text-slate-500 flex flex-col items-center gap-1">
          <ImageIcon size={20} />
          {imageFile ? imageFile.name : "Choose Product Image"}
        </label>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-50 shadow-lg shadow-blue-100">
        {loading ? "Processing..." : "Create Auction"}
      </button>
    </form>
  );
};

export default SellerDashboard;