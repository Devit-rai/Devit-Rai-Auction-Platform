import React, { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, X,
  Image as ImageIcon, Gavel, LayoutDashboard,
  List as ListIcon, LogOut, Shield, CheckCircle,
  XCircle, Clock, AlertCircle, ArrowUpRight,
  TrendingUp, Users, Calendar, Tag, Layers, Package,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket";
import { toast } from "react-hot-toast";

const fmt = (n) => "NPR " + Number(n || 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const getTimeRemaining = (endTime) => {
  if (!endTime) return "—";
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return "Ended";
  const d = Math.floor(total / 86400000);
  const h = Math.floor((total / 3600000) % 24);
  const m = Math.floor((total / 60000) % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
    <Icon size={15} className={active ? "text-indigo-600" : ""} />
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Ended: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {status === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status || "—"}
    </span>
  );
};

const ApprovalBadge = ({ status }) => {
  const map = {
    Approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    Rejected: { cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle    },
    Pending: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock      },
  };
  const cfg  = map[status] || map["Pending"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <Icon size={11} />
      {status || "Pending"}
    </span>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition placeholder:text-slate-400";

const AuctionDetailPanel = ({ auctionId, onClose, onEdit, onDelete, onRepublished }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRepublish, setShowRepublish] = useState(false);
  const [repTimes, setRepTimes] = useState({ startTime: "", endTime: "" });
  const [republishing, setRepublishing] = useState(false);

  const loadData = () => {
    if (!auctionId) return;
    setLoading(true);
    setData(null);
    api.get(`/auctions/${auctionId}`)
      .then(({ data: res }) => setData(res))
      .catch(() => toast.error("Failed to load auction details"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [auctionId]);

  const handleRepublish = async (e) => {
    e.preventDefault();
    if (!repTimes.startTime || !repTimes.endTime)
      return toast.error("Please fill in both times");
    setRepublishing(true);
    try {
      await api.put(`/auctions/republish/${auctionId}`, repTimes);
      toast.success("Auction resubmitted for approval!");
      setShowRepublish(false);
      onRepublished?.();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to republish");
    } finally {
      setRepublishing(false);
    }
  };

  const a = data?.auctionItem;
  const bidders = data?.bidders || [];
  const approval = a?.approvalStatus || "Pending";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200]" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full w-[460px] bg-white shadow-2xl z-[250] flex flex-col"
        style={{ animation: "slideIn .22s cubic-bezier(.22,1,.36,1)" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Gavel size={14} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Listing Details</p>
              <p className="text-[10px] text-slate-400">Your auction information</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
            <X size={15} />
          </button>
        </div>

        {/* Republish sub-panel */}
        {showRepublish && (
          <div className="flex-shrink-0 border-b border-slate-100 bg-amber-50 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={13} className="text-amber-600" />
                <p className="text-xs font-black text-amber-800">Set New Auction Times</p>
              </div>
              <button onClick={() => setShowRepublish(false)}
                className="text-amber-400 hover:text-amber-600 transition"><X size={13} /></button>
            </div>
            <form onSubmit={handleRepublish} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Start Time</label>
                  <input type="datetime-local" required
                    value={repTimes.startTime}
                    onChange={(e) => setRepTimes((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400 transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">End Time</label>
                  <input type="datetime-local" required
                    value={repTimes.endTime}
                    onChange={(e) => setRepTimes((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400 transition" />
                </div>
              </div>
              <button type="submit" disabled={republishing}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition">
                {republishing
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resubmitting...</>
                  : <><RefreshCw size={12} /> Resubmit for Approval</>}
              </button>
            </form>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !a ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Failed to load</div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Hero image */}
              <div className="rounded-2xl overflow-hidden border border-slate-100 relative">
                <img src={a.image?.url} alt={a.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{a.category}</p>
                  <h2 className="text-sm font-black text-white leading-tight">{a.title}</h2>
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {approval !== "Rejected" && <StatusBadge status={a.status} />}
                  <ApprovalBadge status={approval} />
                </div>
              </div>

              {/* Approval notice */}
              {approval === "Pending" && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock size={13} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-amber-700">Awaiting admin review — updates here automatically.</p>
                </div>
              )}
              {approval === "Rejected" && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <XCircle size={13} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-700">Rejected by admin — edit and resubmit below to request re-review.</p>
                </div>
              )}
              {approval === "Approved" && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">Approved — live at scheduled start time.</p>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: "Current Bid", value: fmt(a.currentBid || a.startingBid), color: "text-indigo-600 bg-indigo-50" },
                  { icon: Users, label: "Total Bids",  value: a.bids?.length || 0,                color: "text-emerald-600 bg-emerald-50" },
                  { icon: Clock, label: "Time Left",   value: getTimeRemaining(a.endTime),        color: "text-amber-600 bg-amber-50" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mx-auto mb-1.5`}>
                      <Icon size={13} />
                    </div>
                    <p className="text-sm font-black text-slate-800">{value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</p>
                <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                  {[
                    { icon: Tag, label: "Starting Bid", value: fmt(a.startingBid) },
                    { icon: Layers, label: "Condition", value: a.condition },
                    { icon: Calendar, label: "Start Time", value: fmtDateTime(a.startTime) },
                    { icon: Calendar, label: "End Time", value: fmtDateTime(a.endTime) },
                    { icon: Package, label: "Listed", value: fmtDate(a.createdAt) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon size={12} />
                        <span className="text-[11px] font-semibold">{label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
                  {a.description || "—"}
                </p>
              </div>

              {/* Bid history */}
              {bidders.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bid History</p>
                    <span className="text-[10px] font-bold text-slate-400">{bidders.length} bids</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    {bidders.map((bid, i) => (
                      <div key={i}
                        className={`flex items-center justify-between px-4 py-2.5 ${i < bidders.length - 1 ? "border-b border-slate-50" : ""} ${i === 0 ? "bg-emerald-50/50" : ""}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">{bid.userName || "Bidder"}</p>
                            {bid.createdAt && <p className="text-[10px] text-slate-400">{fmtDateTime(bid.createdAt)}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-black ${i === 0 ? "text-emerald-600" : "text-slate-600"}`}>{fmt(bid.amount)}</p>
                          {i === 0 && <p className="text-[9px] text-emerald-500 font-bold">Highest</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <TrendingUp size={18} className="text-slate-200 mb-1.5" />
                  <p className="text-xs text-slate-400 font-medium">No bids yet</p>
                </div>
              )}

            </div>
          )}
        </div>

        {a && (
          <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-white">
            {approval === "Rejected" ? (
              <div className="space-y-2">
                <button
                  onClick={() => { onEdit(a); onClose(); }}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2.5 rounded-xl transition border border-indigo-200">
                  <Edit size={13} /> Edit &amp; Resubmit
                </button>
                <button
                  onClick={() => { onDelete(a._id); onClose(); }}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition border border-red-200">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ) : a.status === "Upcoming" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { onEdit(a); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2.5 rounded-xl transition border border-indigo-200">
                  <Edit size={13} /> Edit Listing
                </button>
                <button
                  onClick={() => { onDelete(a._id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition border border-red-200">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ) : (
              /* Live or Ended — delete only */
              <button
                onClick={() => { onDelete(a._id); onClose(); }}
                className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition border border-red-200">
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const List = () => {
  const navigate = useNavigate();
  const [auctions,  setAuctions]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]  = useState(null);
  const [deleteId, setDeleteId]  = useState(null);
  const [deleting, setDeleting]  = useState(false);
  const [detailId, setDetailId]  = useState(null);
  const [panelKey, setPanelKey]  = useState(0);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;
  const isMyAuction = (item) => item.createdBy === user?._id || item.createdBy?._id === user?._id;

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auctions/all");
      const mine = (data.items || data || []).filter(isMyAuction);
      setAuctions(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) { console.error("Fetch error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAuctions(); }, []);

  useEffect(() => {
    const onStatusUpdate = ({ auctionId, status }) =>
      setAuctions((prev) => prev.map((a) => a._id === auctionId ? { ...a, status } : a));

    const onApproval = ({ auctionId, approvalStatus }) => {
      // Update the table row badge immediately
      setAuctions((prev) => prev.map((a) => a._id === auctionId ? { ...a, approvalStatus } : a));
      setDetailId((current) => {
        if (current === auctionId) {
          setPanelKey((k) => k + 1);
        }
        return current;
      });
    };

    const onNewBid = ({ auctionId, currentBid }) =>
      setAuctions((prev) => prev.map((a) => a._id === auctionId ? { ...a, currentBid } : a));

    socket.on("auctionStatusUpdated", onStatusUpdate);
    socket.on("auctionApprovalChanged", onApproval);
    socket.on("newBidPlaced", onNewBid);
    return () => {
      socket.off("auctionStatusUpdated", onStatusUpdate);
      socket.off("auctionApprovalChanged", onApproval);
      socket.off("newBidPlaced", onNewBid);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/auctions/${deleteId}`);
      setAuctions((p) => p.filter((a) => a._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally { setDeleting(false); }
  };

  const liveCount = auctions.filter((a) => a.status === "Live").length;
  const pendingCount = auctions.filter((a) => (a.approvalStatus || "Pending") === "Pending").length;
  const rejectedCount = auctions.filter((a) => a.approvalStatus === "Rejected").length;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-900">

      {/* Detail panel */}
      {detailId && (
        <AuctionDetailPanel
          key={panelKey}
          auctionId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(item) => { setEditItem(item); setShowModal(true); }}
          onDelete={(id) => setDeleteId(id)}
          onRepublished={fetchAuctions}
        />
      )}

      <aside className="w-56 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-50">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Gavel size={14} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">BidHub</span>
        </div>
        <div className="mx-3 mt-3 mb-1 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={13} className="text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-black text-indigo-700 truncate">{user?.name || "Seller"}</p>
            <p className="text-[10px] text-indigo-500 font-semibold capitalize">Seller</p>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={false} onClick={() => navigate("/seller-dashboard")} />
          <NavItem icon={ListIcon} label="My Inventory" active={true}  onClick={() => navigate("/inventory")} />
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => { sessionStorage.clear(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-56 p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-800">My Inventory</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your auction listings</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live updates
            </span>
            <button onClick={() => { setEditItem(null); setShowModal(true); }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-100">
              <Plus size={14} /> New Auction
            </button>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
            <Clock size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">
              {pendingCount} listing{pendingCount > 1 ? "s" : ""} awaiting admin approval — will go live once reviewed.
            </p>
          </div>
        )}
        {rejectedCount > 0 && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-700">
              {rejectedCount} listing{rejectedCount > 1 ? "s" : ""} rejected — please review and resubmit.
            </p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Live", value: liveCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label: "Pending", value: pendingCount, cls: "bg-amber-50 text-amber-700 border-amber-100" },
            { label: "Rejected", value: rejectedCount, cls: "bg-red-50 text-red-600 border-red-100" },
            { label: "Total", value: auctions.length, cls: "bg-slate-100 text-slate-600 border-slate-200" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`rounded-xl px-4 py-3 border flex items-center justify-between ${cls}`}>
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-xl font-black">{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                  {["Product", "Price", "Status", "Approval", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : auctions.length === 0 ? (
                  <tr><td colSpan={5} className="py-14 text-center text-slate-400 text-xs">No auctions yet. Create your first one!</td></tr>
                ) : (
                  auctions.map((item) => {
                    const approval = item.approvalStatus || "Pending";
                    return (
                      <tr key={item._id}
                        onClick={() => setDetailId(item._id)}
                        className={`border-b border-slate-50 transition cursor-pointer group ${approval === "Rejected" ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-indigo-50/30"}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              {item.image?.url && <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[200px] group-hover:text-indigo-700 transition-colors">{item.title}</p>
                              <p className="text-[10px] text-slate-400">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-indigo-600 whitespace-nowrap">
                          NPR {(item.currentBid || item.startingBid || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {approval !== "Rejected" && <StatusBadge status={item.status} />}
                        </td>
                        <td className="px-5 py-3.5"><ApprovalBadge status={approval} /></td>
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetailId(item._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition" title="View Details">
                              <ArrowUpRight size={14} />
                            </button>
                            {(item.status === "Upcoming" || item.approvalStatus === "Rejected") && (
                              <button onClick={() => { setEditItem(item); setShowModal(true); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition" title="Edit">
                                <Edit size={14} />
                              </button>
                            )}
                            <button onClick={() => setDeleteId(item._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create / Edit Model */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800">{editItem ? "Edit Auction" : "Create New Auction"}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editItem ? "Update your listing details" : "Fill in the details to submit for approval"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditItem(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition"><X size={15} /></button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <AuctionForm item={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} onSuccess={fetchAuctions} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 p-6">
            <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={19} className="text-red-500" />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-1">Delete Auction</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">This will permanently remove the listing. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [error, setError] = useState("");
  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    if (imageFile) data.append("image", imageFile);
    try {
      if (item?._id) {
        await api.put(`/auctions/${item._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const res = await api.post("/auctions/new", data, { headers: { "Content-Type": "multipart/form-data" } });
        socket.emit("newAuctionSubmitted", { auction: res.data.auctionItem });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "All fields and image are required");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">{error}</div>
      )}
      {!item && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Clock size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">New listings are submitted for admin approval before going live.</p>
        </div>
      )}
      <Field label="Title">
        <input type="text" required placeholder="Item name" value={formData.title} className={inputCls} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select required value={formData.category} className={inputCls} onChange={(e) => set("category", e.target.value)}>
            <option value="">Select...</option>
            {["Electronics","Art","Vehicles","Fashion","Jewelry","Furniture","Sports","Watches"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Condition">
          <select required value={formData.condition} className={inputCls} onChange={(e) => set("condition", e.target.value)}>
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea required placeholder="Describe the item..." value={formData.description}
          className={`${inputCls} h-24 resize-none`} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Field label="Starting Price (NPR)">
        <input type="number" required placeholder="0" value={formData.startingBid}
          className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          onChange={(e) => set("startingBid", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Time">
          <input type="datetime-local" required value={formData.startTime} className={inputCls} onChange={(e) => set("startTime", e.target.value)} />
        </Field>
        <Field label="End Time">
          <input type="datetime-local" required value={formData.endTime} className={inputCls} onChange={(e) => set("endTime", e.target.value)} />
        </Field>
      </div>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer">
        <input type="file" id="img-inventory" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
        <label htmlFor="img-inventory" className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <ImageIcon size={17} className="text-indigo-500" />
          </div>
          {imageFile ? (
            <span className="text-xs font-bold text-indigo-600 truncate max-w-[220px]">{imageFile.name}</span>
          ) : item?.image?.url ? (
            <span className="text-xs text-slate-500">Image uploaded — click to replace</span>
          ) : (
            <>
              <span className="text-xs font-bold text-slate-600">Click to upload image</span>
              <span className="text-[11px] text-slate-400">PNG, JPG up to 10 MB</span>
            </>
          )}
        </label>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition">Cancel</button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm shadow-indigo-100 disabled:opacity-50">
          {loading ? "Saving..." : item ? "Save Changes" : "Submit for Approval"}
        </button>
      </div>
    </form>
  );
};

export default List;