import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Gavel, Users, LayoutDashboard, LogOut, Search,
  CheckCircle, XCircle, Clock, ChevronDown,
  Shield, RefreshCw, AlertTriangle, Ban, UserCheck,
} from "lucide-react";

const fmt = (n) => "NPR " + Number(n || 0).toLocaleString();

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

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

// Status Badge
const StatusBadge = ({ status }) => {
  const map = {
    Live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Upcoming: "bg-amber-50 text-amber-700 border border-amber-200",
    Ended: "bg-slate-100 text-slate-500 border border-slate-200",
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Suspended: "bg-red-50 text-red-600 border border-red-200",
    Banned: "bg-rose-100 text-rose-700 border border-rose-300",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Rejected: "bg-red-50 text-red-600 border border-red-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
};
const ConfirmModal = ({ open, title, desc, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <h3 className="text-sm font-black text-slate-800 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">{desc}</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 text-xs font-bold text-white py-2.5 rounded-xl transition ${confirmColor || "bg-red-500 hover:bg-red-600"}`}>
            {confirmLabel}
          </button>
        </div>
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

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-xl font-black text-slate-800">{title}</h1>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, color, icon, loading }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        {loading
          ? <div className="h-7 w-10 bg-slate-100 rounded animate-pulse mb-1" />
          : <p className="text-2xl font-black text-slate-800">{value}</p>
        }
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    slate: "text-slate-500 bg-slate-100 border-slate-200",
    red: "text-red-500 bg-red-50 border-red-100",
  };
  return (
    <div className={`rounded-xl px-4 py-3 border flex items-center justify-between ${colorMap[color]}`}>
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-xl font-black">{value}</span>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 text-xs text-slate-600 pl-3 pr-7 py-2 rounded-xl focus:outline-none focus:border-indigo-400 transition cursor-pointer font-medium">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

const LoadingRows = ({ cols }) => (
  <>
    {[...Array(4)].map((_, i) => (
      <tr key={i} className="border-b border-slate-50">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-5 py-3.5">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingAuctions, setLoadingA]  = useState(false);
  const [loadingUsers, setLoadingU] = useState(false);

  // Filters
  const [auctionSearch, setAuctionSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [auctionFilter, setAuctionFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const [confirm, setConfirm] = useState(null);
  const fetchAuctions = useCallback(async () => {
    setLoadingA(true);
    try {
      const { data } = await api.get("/admin/auctions");
      setAuctions(data.auctions || []);
    } catch {
      toast.error("Failed to load auctions");
    } finally {
      setLoadingA(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingU(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingU(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
  }, [fetchAuctions, fetchUsers]);

  // Auction Actions 
  const handleApproval = async (id, approvalStatus) => {
    try {
      await api.put(`/admin/auctions/${id}/approval`, { approvalStatus });
      setAuctions((p) => p.map((a) => a._id === id ? { ...a, approvalStatus } : a));
      toast.success(`Auction ${approvalStatus.toLowerCase()}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleForceClose = async (id) => {
    try {
      await api.put(`/admin/auctions/${id}/force-close`);
      setAuctions((p) => p.map((a) => a._id === id ? { ...a, status: "Ended", isProcessed: true } : a));
      toast.success("Auction force closed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  //  User Actions
  const handleUserStatus = async (id, status) => {
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      setUsers((p) => p.map((u) => u._id === id ? { ...u, status } : u));
      toast.success(`User ${status.toLowerCase()}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    navigate("/");
  };

  const sessionData = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const adminId = sessionData?.user?._id || sessionData?._id || null;

  // Derived stats
  const liveCount = auctions.filter((a) => a.status === "Live").length;
  const pendingCount = auctions.filter((a) => a.approvalStatus === "Pending").length;
  const activeUsers = users.filter((u) => u.status === "Active" && u._id !== adminId).length;
  const sellerCount = users.filter((u) => u.roles?.includes("SELLER") && u._id !== adminId).length;
  const suspendedCount = users.filter((u) => (u.status === "Suspended" || u.status === "Banned") && u._id !== adminId).length;

  //  Filtered lists
  const filteredAuctions = auctions.filter((a) => {
    const q = auctionSearch.toLowerCase();
    const matchSearch = !q || a.title?.toLowerCase().includes(q) || a.createdBy?.name?.toLowerCase().includes(q);
    const matchStatus = auctionFilter === "all" || a.status === auctionFilter;
    const matchApproval = approvalFilter === "all"  || a.approvalStatus === approvalFilter;
    return matchSearch && matchStatus && matchApproval;
  });

  const filteredUsers = users.filter((u) => {
    if (u._id === adminId) return false; // hide self
    const q = userSearch.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchFilter =
      userFilter === "all" ||
      u.roles?.includes(userFilter) ||
      u.status === userFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Gavel size={14} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">BidHub</span>
        </div>

        {/* Admin badge */}
        <div className="mx-3 mt-3 mb-1 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={13} className="text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-black text-indigo-700">Administrator</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <NavItem icon={<LayoutDashboard size={15} />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <NavItem icon={<Gavel size={15} />} label="Auction Management" active={activeTab === "auctions"} onClick={() => setActiveTab("auctions")} />
          <NavItem icon={<Users size={15} />} label="User Management" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-7 min-h-screen">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <PageHeader title="Overview" subtitle="Platform summary at a glance" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Live Auctions" value={liveCount} color="emerald" icon={<Gavel size={17} />} loading={loadingAuctions} />
              <StatCard label="Pending Approval" value={pendingCount} color="amber" icon={<Clock size={17} />} loading={loadingAuctions} />
              <StatCard label="Bidders" value={activeUsers}  color="indigo" icon={<Users size={17} />} loading={loadingUsers}    />
              <StatCard label="Sellers" value={sellerCount}  color="purple" icon={<Shield size={17} />} loading={loadingUsers}    />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Recent auctions */}
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Recent Auctions</h3>
                  <button onClick={() => setActiveTab("auctions")}
                    className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {loadingAuctions
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                            <div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/2" />
                          </div>
                        </div>
                      ))
                    : auctions.slice(0, 5).map((a) => (
                        <div key={a._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            {a.image?.url && <img src={a.image.url} alt={a.title} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                            <p className="text-[10px] text-slate-400">{a.createdBy?.name || "—"} · {fmtDate(a.createdAt)}</p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Recent users */}
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Recent Users</h3>
                  <button onClick={() => setActiveTab("users")}
                    className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {loadingUsers
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                            <div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/2" />
                          </div>
                        </div>
                      ))
                    : users.slice(0, 5).map((u) => (
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
                      ))
                  }
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("auctions")}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition">
                  <Gavel size={13} /> Manage Auctions
                  {pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
                  )}
                </button>
                <button onClick={() => setActiveTab("users")}
                  className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
                  <Users size={13} /> Manage Users
                  {suspendedCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{suspendedCount}</span>
                  )}
                </button>
                <button onClick={() => { fetchAuctions(); fetchUsers(); toast.success("Refreshed"); }}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition">
                  <RefreshCw size={13} /> Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auction Management */}
        {activeTab === "auctions" && (
          <div className="space-y-5">
            <PageHeader
              title="Auction Management"
              subtitle={`${auctions.length} total · ${pendingCount} pending approval`}
              action={
                <button onClick={fetchAuctions}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                  <RefreshCw size={13} /> Refresh
                </button>
              }
            />

            <div className="grid grid-cols-3 gap-4">
              <MiniStat label="Live" value={liveCount} color="emerald" />
              <MiniStat label="Pending" value={pendingCount} color="amber"   />
              <MiniStat label="Ended" value={auctions.filter(a => a.status === "Ended").length} color="slate"   />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={auctionSearch} onChange={(e) => setAuctionSearch(e.target.value)}
                  placeholder="Search by title or seller..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition" />
              </div>
              <FilterSelect value={auctionFilter} onChange={setAuctionFilter} options={[
                { label: "All Statuses", value: "all"},
                { label: "Live", value: "Live" },
                { label: "Upcoming", value: "Upcoming" },
                { label: "Ended", value: "Ended"},
              ]} />
              <FilterSelect value={approvalFilter} onChange={setApprovalFilter} options={[
                { label: "All Approvals", value: "all"      },
                { label: "Pending", value: "Pending"  },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
              ]} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                      {["Item", "Seller", "Current Bid", "Bids", "Time Left", "Status", "Approval", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAuctions
                      ? <LoadingRows cols={8} />
                      : filteredAuctions.length === 0
                      ? <tr><td colSpan={8} className="text-center text-slate-400 py-12 text-xs">No auctions found.</td></tr>
                      : filteredAuctions.map((a) => (
                          <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                  {a.image?.url && <img src={a.image.url} alt={a.title} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px]">{a.title}</p>
                                  <p className="text-[10px] text-slate-400">{a.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">{a.createdBy?.name || "—"}</td>
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-800 whitespace-nowrap">{fmt(a.currentBid || a.startingBid)}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">{a.bids?.length || 0}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">{getTimeRemaining(a.endTime)}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                            <td className="px-5 py-3.5"><StatusBadge status={a.approvalStatus || "Pending"} /></td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {/* Approve */}
                                {a.approvalStatus !== "Approved" && (
                                  <button title="Approve"
                                    onClick={() => setConfirm({ type: "approve", id: a._id, title: a.title })}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition">
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                {/* Reject */}
                                {a.approvalStatus !== "Rejected" && (
                                  <button title="Reject"
                                    onClick={() => setConfirm({ type: "reject", id: a._id, title: a.title })}
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                                    <XCircle size={14} />
                                  </button>
                                )}
                                {/* Force close */}
                                {a.status === "Live" && (
                                  <button title="Force Close"
                                    onClick={() => setConfirm({ type: "forceClose", id: a._id, title: a.title })}
                                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition">
                                    <AlertTriangle size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User management */}
        {activeTab === "users" && (
          <div className="space-y-5">
            <PageHeader
              title="User Management"
              subtitle={`${users.length} registered users`}
              action={
                <button onClick={fetchUsers}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                  <RefreshCw size={13} /> Refresh
                </button>
              }
            />

            <div className="grid grid-cols-3 gap-4">
              <MiniStat label="Active" value={activeUsers} color="emerald" />
              <MiniStat label="Sellers" value={sellerCount} color="indigo"/>
              <MiniStat label="Suspended" value={suspendedCount} color="red"/>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition" />
              </div>
              <FilterSelect value={userFilter} onChange={setUserFilter} options={[
                { label: "All Users", value: "all"},
                { label: "Buyers", value: "USER"},
                { label: "Sellers", value: "SELLER"},
                { label: "Active", value: "Active"},
                { label: "Suspended", value: "Suspended" },
                { label: "Banned", value: "Banned"},
              ]} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                      {["User", "Role", "Joined", "Email Verified", "Status", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers
                      ? <LoadingRows cols={6} />
                      : filteredUsers.length === 0
                      ? <tr><td colSpan={6} className="text-center text-slate-400 py-12 text-xs">No users found.</td></tr>
                      : filteredUsers.map((u) => (
                          <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                                  {u.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                u.roles?.includes("ADMIN")  ? "bg-purple-50 text-purple-700 border border-purple-200" :
                                u.roles?.includes("SELLER") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {u.roles?.includes("ADMIN") ? "ADMIN" : u.roles?.includes("SELLER") ? "SELLER" : "BUYER"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                            <td className="px-5 py-3.5">
                              {u.isVerified
                                ? <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle size={12} /> Verified</span>
                                : <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400"><XCircle size={12} /> Pending</span>
                              }
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {/* Activate */}
                                {u.status !== "Active" && (
                                  <button title="Activate"
                                    onClick={() => setConfirm({ type: "activateUser", id: u._id, name: u.name })}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition">
                                    <UserCheck size={14} />
                                  </button>
                                )}
                                {/* Suspend */}
                                {u.status === "Active" && (
                                  <button title="Suspend"
                                    onClick={() => setConfirm({ type: "suspendUser", id: u._id, name: u.name })}
                                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition">
                                    <XCircle size={14} />
                                  </button>
                                )}
                                {/* Ban */}
                                {u.status !== "Banned" && (
                                  <button title="Ban permanently"
                                    onClick={() => setConfirm({ type: "banUser", id: u._id, name: u.name })}
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                                    <Ban size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === "approve"? "Approve Auction":
          confirm?.type === "reject"? "Reject Auction":
          confirm?.type === "forceClose"? "Force Close Auction" :
          confirm?.type === "suspendUser"? "Suspend User":
          confirm?.type === "banUser"? "Ban User":
          "Activate User"
        }
        desc={
          confirm?.type === "approve"? `Approve "${confirm.title}"? It will go live at its scheduled start time.`  :
          confirm?.type === "reject"? `Reject "${confirm.title}"? The seller will not be able to run this auction.` :
          confirm?.type === "forceClose"? `Force close "${confirm.title}"? This will immediately end the auction.`:
          confirm?.type === "suspendUser"? `Suspend "${confirm.name}"? They won't be able to bid or list items.`:
          confirm?.type === "banUser"? `Permanently ban "${confirm.name}"? This is a serious action.`:
          `Reactivate account for "${confirm?.name}"?`
        }
        confirmLabel={
          confirm?.type === "approve" ? "Approve":
          confirm?.type === "reject" ? "Reject" :
          confirm?.type === "forceClose" ? "Force Close" :
          confirm?.type === "suspendUser" ? "Suspend":
          confirm?.type === "banUser" ? "Ban User":
          "Activate"
        }
        confirmColor={
          confirm?.type === "approve" || confirm?.type === "activateUser"
            ? "bg-emerald-500 hover:bg-emerald-600"
            : confirm?.type === "banUser"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-red-500 hover:bg-red-600"
        }
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