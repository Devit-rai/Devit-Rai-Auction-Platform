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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const List = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auctions/all");
      const myItems = (data.items || []).filter(
        (item) => item.createdBy === user?._id,
      );
      setAuctions(
        myItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
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
      setAuctions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

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
          <button
            onClick={() => navigate("/seller-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 text-sm transition-all"
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => navigate("/inventory")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold bg-blue-600 text-white shadow-md text-sm transition-all"
          >
            <ListIcon size={18} /> My Inventory
          </button>
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 p-4 lg:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              My Inventory
            </h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
              Manage your products
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={18} /> New Auction
          </button>
        </header>

        {/* Inventory Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  </td>
                </tr>
              ) : (
                auctions.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 group transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={item.image?.url}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {item.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black">
                      NPR {item.currentBid || item.startingBid}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${item.status === "Live" ? "bg-green-50 text-green-600 border-green-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
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

      {/* Full Field Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                Create New Auction
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <AuctionForm
                onClose={() => setShowModal(false)}
                onSuccess={fetchAuctions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Form Component with All Fields ---
const AuctionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "New",
    startingBid: "",
    startTime: "",
    endTime: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      await api.post("/auctions/new", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error: All fields and image are required",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Title
        </label>
        <input
          type="text"
          required
          placeholder="Item name"
          className="w-full bg-slate-50 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            Category
          </label>
          <select
            required
            className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none"
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option value="Electronics">Electronics</option>
            <option value="Art">Art</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Fashion">Fashion</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            Condition
          </label>
          <select
            required
            className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none"
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
          >
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Description
        </label>
        <textarea
          required
          placeholder="Item description..."
          className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none h-24 resize-none"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Starting Price (NPR)
        </label>
        <input
          type="number"
          required
          placeholder="0.00"
          className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) =>
            setFormData({ ...formData, startingBid: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            required
            className="w-full bg-slate-50 rounded-xl p-3 text-xs"
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            End Time
          </label>
          <input
            type="datetime-local"
            required
            className="w-full bg-slate-50 rounded-xl p-3 text-xs"
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
          />
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-100 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
        <input
          type="file"
          required
          id="img-inventory"
          className="hidden"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <label
          htmlFor="img-inventory"
          className="cursor-pointer text-[11px] font-bold text-slate-500 flex flex-col items-center gap-1"
        >
          <ImageIcon size={20} className="text-blue-500" />
          {imageFile ? (
            <span className="text-blue-600 truncate max-w-[200px]">
              {imageFile.name}
            </span>
          ) : (
            "Choose Product Image"
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-50 shadow-lg shadow-blue-100"
      >
        {loading ? "Processing..." : "Create Auction"}
      </button>
    </form>
  );
};

export default List;
