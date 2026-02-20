import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Gavel,
  LayoutDashboard,
  List as ListIcon,
  LogOut,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Nav Item
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      active
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    <Icon size={16} className={active ? "text-indigo-600" : ""} />
    {label}
  </button>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const map = {
    Live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Ended: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || map["Ended"]}`}>
      {status}
    </span>
  );
};

// Form Field
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition placeholder:text-slate-400";

// Main Component
const List = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auctions/all");
      const myItems = (data.items || []).filter(
        (item) => item.createdBy === user?._id
      );
      setAuctions(myItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuctions(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this auction?")) return;
    try {
      await api.delete(`/auctions/${id}`);
      setAuctions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const liveCount = auctions.filter(a => a.status === "Live").length;
  const pendingCount = auctions.filter(a => a.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Gavel size={16} />
          </div>
          <span className="font-bold text-indigo-900 text-lg tracking-tight">Auction</span>
        </div>

        <div className="mx-4 mt-4 mb-2 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={14} className="text-indigo-600" />
          <div>
            <p className="text-[11px] text-indigo-400 font-medium">
              Logged in as
            </p>
            <p className="text-xs font-bold text-indigo-700 truncate">
              {user?.name || user?.email || "User"}
            </p>
            <p className="text-[11px] text-indigo-500 font-semibold capitalize">
              {user?.role || "Seller"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={false} onClick={() => navigate("/seller-dashboard")} />
          <NavItem icon={ListIcon} label="My Inventory" active={true} onClick={() => navigate("/inventory")} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => { sessionStorage.clear(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Inventory</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your auction listings</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-100"
          >
            <Plus size={15} /> New Auction
          </button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Live</span>
            <span className="text-xl font-bold">{liveCount}</span>
          </div>
          <div className="bg-amber-50 text-amber-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Pending</span>
            <span className="text-xl font-bold">{pendingCount}</span>
          </div>
          <div className="bg-slate-100 text-slate-600 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-xl font-bold">{auctions.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Product</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Price</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : auctions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    No auctions yet. Create your first one!
                  </td>
                </tr>
              ) : (
                auctions.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image?.url}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          alt={item.title}
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      NPR {(item.currentBid || item.startingBid || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditItem(item); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editItem ? "Edit Auction" : "Create New Auction"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditItem(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <AuctionForm
                item={editItem}
                onClose={() => { setShowModal(false); setEditItem(null); }}
                onSuccess={fetchAuctions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Auction Form
const AuctionForm = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    description: item?.description || "",
    category: item?.category || "",
    condition: item?.condition || "New",
    startingBid: item?.startingBid || "",
    startTime: item?.startTime || "",
    endTime: item?.endTime || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);
    try {
      if (item?._id) {
        await api.put(`/auctions/${item._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/auctions/new", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "All fields and image are required");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Field label="Title">
        <input
          type="text"
          required
          placeholder="Item name"
          value={formData.title}
          className={inputCls}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select
            required
            value={formData.category}
            className={inputCls}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Electronics">Electronics</option>
            <option value="Art">Art</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Fashion">Fashion</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Furniture">Furniture</option>
            <option value="Sports">Sports</option>
          </select>
        </Field>
        <Field label="Condition">
          <select
            required
            value={formData.condition}
            className={inputCls}
            onChange={(e) => set("condition", e.target.value)}
          >
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          required
          placeholder="Describe the item..."
          value={formData.description}
          className={`${inputCls} h-24 resize-none`}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <Field label="Starting Price (NPR)">
        <input
          type="number"
          required
          placeholder="0"
          value={formData.startingBid}
          className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          onChange={(e) => set("startingBid", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Time">
          <input
            type="datetime-local"
            required
            value={formData.startTime}
            className={inputCls}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </Field>
        <Field label="End Time">
          <input
            type="datetime-local"
            required
            value={formData.endTime}
            className={inputCls}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </Field>
      </div>

      {/* Image Upload */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer">
        <input
          type="file"
          id="img-inventory"
          className="hidden"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <label htmlFor="img-inventory" className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <ImageIcon size={18} className="text-indigo-500" />
          </div>
          {imageFile ? (
            <span className="text-sm font-semibold text-indigo-600 truncate max-w-[220px]">{imageFile.name}</span>
          ) : item?.image?.url ? (
            <span className="text-sm text-slate-500">Image uploaded — click to replace</span>
          ) : (
            <>
              <span className="text-sm font-semibold text-slate-600">Click to upload image</span>
              <span className="text-xs text-slate-400">PNG, JPG up to 10MB</span>
            </>
          )}
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-sm shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? "Saving..." : item ? "Save Changes" : "Create Auction"}
        </button>
      </div>
    </form>
  );
};

export default List;