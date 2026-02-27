// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket";
import { toast } from "react-hot-toast";
import {
  Gavel, Users, LayoutDashboard, LogOut,
  Shield, RefreshCw, Clock, ArrowUpRight, XCircle,
} from "lucide-react";
import { fmtDate, StatusBadge, ConfirmModal } from "./adminShared";
import AuctionManagement from "./AuctionManagement";
import UserManagement from "./UserManagement";

const StatCard = ({ label, value, color, icon, loading }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div>
        {loading ? <div className="h-7 w-10 bg-slate-100 rounded animate-pulse mb-1" /> : <p className="text-2xl font-black text-slate-800">{value}</p>}
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}>
    <span className={active ? "text-indigo-600" : ""}>{icon}</span>
    {label}
  </button>
);

const NewListingToast = ({ auction, onClose }) => (
  <div className="flex items-start gap-3 bg-white border border-indigo-200 rounded-xl shadow-xl px-4 py-3 w-[300px]" style={{ borderLeft: "3px solid #6366f1" }}>
    <div className="w-8 h-8 rounded-lg overflow-hidden bg-indigo-50 flex-shrink-0 flex items-center justify-center mt-0.5">
      {auction?.image?.url ? <img src={auction.image.url} alt="" className="w-full h-full object-cover" /> : <Gavel size={13} className="text-indigo-500" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">New Listing Submitted</p>
      <p className="text-xs text-slate-700 font-medium truncate">{auction?.title || "New auction"}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">Awaiting your approval</p>
    </div>
    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition flex-shrink-0"><XCircle size={14} /></button>
  </div>
);

/* ── AdminDashboard  */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingAuctions, setLoadingA] = useState(false);
  const [loadingUsers, setLoadingU] = useState(false);
  const [newListingToasts, setNewListingToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const sessionData = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const adminId = sessionData?.user?._id || sessionData?._id || null;

  const fetchAuctions = useCallback(async () => {
    setLoadingA(true);
    try {
      const { data } = await api.get("/admin/auctions");
      setAuctions(data.auctions || []);
    } catch { toast.error("Failed to load auctions"); }
    finally { setLoadingA(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingU(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoadingU(false); }
  }, []);

  useEffect(() => { fetchAuctions(); fetchUsers(); }, [fetchAuctions, fetchUsers]);

  /* Sockets */
  useEffect(() => {
    const onStatusUpdate = ({ auctionId, status, startTime, endTime }) =>
      setAuctions((p) => p.map((a) => a._id === auctionId ? { ...a, status, startTime, endTime } : a));

    const onNewAuction = (auction) => {
      setAuctions((p) => {
        const exists = p.find((a) => a._id === auction._id);
        if (exists) return p.map((a) => a._id === auction._id ? { ...a, ...auction } : a);
        return [auction, ...p];
      });
      const toastId = `${auction._id}-${Date.now()}`;
      setNewListingToasts((p) => [...p, { ...auction, toastId }]);
      setTimeout(() => setNewListingToasts((p) => p.filter((t) => t.toastId !== toastId)), 6000);
      setDetailId((cur) => { if (cur === auction._id) setDetailRefreshKey((k) => k + 1); return cur; });
    };

    const onNewBid = ({ auctionId, amount }) =>
      setAuctions((p) => p.map((a) => a._id !== auctionId ? a : {
        ...a, currentBid: amount, bids: [...(a.bids || []), { amount, createdAt: new Date() }],
      }));

    const onApprovalChanged = ({ auctionId, approvalStatus }) => {
      setAuctions((p) => p.map((a) => a._id === auctionId ? { ...a, approvalStatus } : a));
      setDetailId((cur) => { if (cur === auctionId) setDetailRefreshKey((k) => k + 1); return cur; });
    };

    socket.on("auctionStatusUpdated", onStatusUpdate);
    socket.on("newAuctionSubmitted", onNewAuction);
    socket.on("newBidPlaced", onNewBid);
    socket.on("auctionApprovalChanged", onApprovalChanged);
    return () => {
      socket.off("auctionStatusUpdated", onStatusUpdate);
      socket.off("newAuctionSubmitted", onNewAuction);
      socket.off("newBidPlaced", onNewBid);
      socket.off("auctionApprovalChanged", onApprovalChanged);
    };
  }, []);

  const handleApproval = async (id, approvalStatus) => {
    try {
      await api.put(`/admin/auctions/${id}/approval`, { approvalStatus });
      setAuctions((p) => p.map((a) => a._id === id ? { ...a, approvalStatus } : a));
      socket.emit("adminApprovalUpdated", { auctionId: id, approvalStatus });
      toast.success(`Auction ${approvalStatus.toLowerCase()}`);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleForceClose = async (id) => {
    try {
      await api.put(`/admin/auctions/${id}/force-close`);
      setAuctions((p) => p.map((a) => a._id === id ? { ...a, status: "Ended", isProcessed: true } : a));
      toast.success("Auction force closed");
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleUserStatus = async (id, status) => {
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      setUsers((p) => p.map((u) => u._id === id ? { ...u, status } : u));
      toast.success(`User ${status.toLowerCase()}`);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleLogout = () => { sessionStorage.removeItem("user"); localStorage.removeItem("user"); navigate("/"); };

  /* Counts */
  const liveCount = auctions.filter((a) => a.status === "Live").length;
  const pendingCount = auctions.filter((a) => a.approvalStatus === "Pending").length;
  const activeUsers = users.filter((u) => u.status === "Active" && u._id !== adminId).length;
  const sellerCount = users.filter((u) => u.roles?.includes("SELLER") && u._id !== adminId).length;
  const suspendedCount = users.filter((u) => (u.status === "Suspended" || u.status === "Banned") && u._id !== adminId).length;

  /* Confirm config */
  const cfgMap = {
    approve: { title: "Approve Auction", desc: `Approve "${confirm?.title}"? It will go live at its scheduled start time.`,   label: "Approve",     color: "bg-emerald-500 hover:bg-emerald-600" },
    reject: { title: "Reject Auction", desc: `Reject "${confirm?.title}"? The seller will not be able to run this auction.`, label: "Reject",      color: "bg-red-500 hover:bg-red-600" },
    forceClose: { title: "Force Close Auction", desc: `Force close "${confirm?.title}"? This will immediately end the auction.`,     label: "Force Close", color: "bg-red-500 hover:bg-red-600" },
    suspendUser:  { title: "Suspend User", desc: `Suspend "${confirm?.name}"? They won't be able to bid or list items.`,        label: "Suspend",     color: "bg-red-500 hover:bg-red-600" },
    banUser: { title: "Ban User", desc: `Permanently ban "${confirm?.name}"? This is a serious action.`,               label: "Ban User",    color: "bg-rose-600 hover:bg-rose-700" },
    activateUser: { title: "Activate User", desc: `Reactivate account for "${confirm?.name}"?`,                                  label: "Activate",    color: "bg-emerald-500 hover:bg-emerald-600" },
  };
  const cfg = confirm ? cfgMap[confirm.type] : null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans flex">

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {newListingToasts.map((t) => (
          <div key={t.toastId} className="pointer-events-auto" style={{ animation: "toastIn .3s cubic-bezier(.22,1,.36,1)" }}>
            <NewListingToast auction={t} onClose={() => setNewListingToasts((p) => p.filter((x) => x.toastId !== t.toastId))} />
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(10px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center"><Gavel size={14} className="text-white" /></div>
          <span className="font-black text-slate-900 text-sm tracking-tight">BidHub</span>
        </div>
        <div className="mx-3 mt-3 mb-1 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={13} className="text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-black text-indigo-700">Administrator</p>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <NavItem icon={<LayoutDashboard size={15} />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")}/>
          <NavItem icon={<Gavel size={15} />} label="Auction Management" active={activeTab === "auctions"} onClick={() => setActiveTab("auctions")} />
          <NavItem icon={<Users size={15} />} label="User Management" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-7 min-h-screen">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-800">Overview</h1>
                <p className="text-xs text-slate-400 mt-0.5">Platform summary — updates in real-time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Live Auctions" value={liveCount} color="emerald" icon={<Gavel size={17} />} loading={loadingAuctions} />
              <StatCard label="Pending Approval" value={pendingCount} color="amber" icon={<Clock size={17} />} loading={loadingAuctions} />
              <StatCard label="Bidders" value={activeUsers} color="indigo" icon={<Users size={17} />} loading={loadingUsers} />
              <StatCard label="Sellers" value={sellerCount} color="purple" icon={<Shield size={17} />} loading={loadingUsers} />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Recent Auctions */}
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Recent Auctions</h3>
                  <button onClick={() => setActiveTab("auctions")} className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {loadingAuctions ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                        <div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  )) : auctions.slice(0, 5).map((a) => (
                    <div key={a._id}
                      onClick={() => { setActiveTab("auctions"); setDetailId(a._id); }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition cursor-pointer group">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {a.image?.url && <img src={a.image.url} alt={a.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{a.title}</p>
                        <p className="text-[10px] text-slate-400">{a.createdBy?.name || "—"} · {fmtDate(a.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={a.approvalStatus === "Rejected" ? "Rejected" : a.status} />
                        <ArrowUpRight size={12} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Recent Users</h3>
                  <button onClick={() => setActiveTab("users")} className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {loadingUsers ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                        <div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  )) : users.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                        {u.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <StatusBadge status={u.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("auctions")} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition">
                  <Gavel size={13} /> Manage Auctions
                  {pendingCount > 0 && <span className="bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>}
                </button>
                <button onClick={() => setActiveTab("users")} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
                  <Users size={13} /> Manage Users
                  {suspendedCount > 0 && <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{suspendedCount}</span>}
                </button>
                <button onClick={() => {fetchAuctions(); fetchUsers(); toast.success("Refreshed"); }} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition">
                  <RefreshCw size={13} /> Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auction Management */}
        {activeTab === "auctions" && (
          <AuctionManagement
            auctions={auctions}
            loading={loadingAuctions}
            onRefresh={fetchAuctions}
            onConfirm={setConfirm}
            detailId={detailId}
            setDetailId={setDetailId}
            detailRefreshKey={detailRefreshKey}
            setDetailRefreshKey={setDetailRefreshKey}
          />
        )}

        {/* User Management */}
        {activeTab === "users" && (
          <UserManagement
            users={users}
            loading={loadingUsers}
            adminId={adminId}
            onRefresh={fetchUsers}
            onConfirm={setConfirm}
          />
        )}
      </main>

      {/* Global confirm model */}
      <ConfirmModal
        open={!!confirm}
        title={cfg?.title}
        desc={cfg?.desc}
        confirmLabel={cfg?.label}
        confirmColor={cfg?.color}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const c = confirm;
          setConfirm(null);
          if (c.type === "approve") await handleApproval(c.id, "Approved");
          if (c.type === "reject") await handleApproval(c.id, "Rejected");
          if (c.type === "forceClose") await handleForceClose(c.id);
          if (c.type === "suspendUser") await handleUserStatus(c.id, "Suspended");
          if (c.type === "banUser") await handleUserStatus(c.id, "Banned");
          if (c.type === "activateUser") await handleUserStatus(c.id, "Active");
        }}
      />
    </div>
  );
};

export default AdminDashboard;