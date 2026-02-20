import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gavel,
  Users,
  LayoutDashboard,
  LogOut,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Shield,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AUCTIONS = [
  { id: 1, title: "Vintage Watch", category: "Accessories", seller: "Ram Thapa", currentBid: 12500, bids: 45, status: "live", endsAt: "2h 15m" },
  { id: 2, title: "Rare Painting", category: "Art", seller: "Sita Rai", currentBid: 45000, bids: 12, status: "live", endsAt: "5h 10m" },
  { id: 3, title: "Classic Car", category: "Vehicles", seller: "Hari KC", currentBid: 2500000, bids: 89, status: "live", endsAt: "21h 05m" },
  { id: 4, title: "Gold Necklace", category: "Jewelry", seller: "Mina Gurung", currentBid: 85000, bids: 30, status: "pending", endsAt: "—" },
  { id: 5, title: "Antique Table", category: "Furniture", seller: "Raju Panta", currentBid: 22000, bids: 8, status: "ended", endsAt: "—" },
  { id: 6, title: "Signed Jersey", category: "Sports", seller: "Binod Lama", currentBid: 9500, bids: 21, status: "ended", endsAt: "—" },
];

const MOCK_USERS = [
  { id: 1, name: "Ram Thapa", email: "ram@example.com", role: "SELLER", joined: "Jan 12, 2025", status: "active", auctions: 4 },
  { id: 2, name: "Sita Rai", email: "sita@example.com", role: "SELLER", joined: "Feb 3, 2025", status: "active", auctions: 2 },
  { id: 3, name: "Arjun Shrestha", email: "arjun@example.com", role: "BUYER", joined: "Mar 18, 2025", status: "active", auctions: 0 },
  { id: 4, name: "Priya Magar", email: "priya@example.com", role: "BUYER", joined: "Apr 5, 2025", status: "suspended", auctions: 0 },
  { id: 5, name: "Hari KC", email: "hari@example.com", role: "SELLER", joined: "May 20, 2025", status: "active", auctions: 1 },
  { id: 6, name: "Mina Gurung", email: "mina@example.com", role: "SELLER", joined: "Jun 1, 2025", status: "active", auctions: 1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => "NPR " + Number(n).toLocaleString();

const StatusBadge = ({ status }) => {
  const map = {
    live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    ended: "bg-slate-100 text-slate-500 border border-slate-200",
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    suspended: "bg-red-50 text-red-600 border border-red-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status]}`}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("auctions");
  const [auctionSearch, setAuctionSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [auctionFilter, setAuctionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Stats
  const liveCount = auctions.filter((a) => a.status === "live").length;
  const pendingCount = auctions.filter((a) => a.status === "pending").length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const sellerCount = users.filter((u) => u.role === "SELLER").length;

  // Filtered data
  const filteredAuctions = auctions.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(auctionSearch.toLowerCase()) ||
      a.seller.toLowerCase().includes(auctionSearch.toLowerCase());
    const matchFilter = auctionFilter === "all" || a.status === auctionFilter;
    return matchSearch && matchFilter;
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === "all" || u.role === userFilter || u.status === userFilter;
    return matchSearch && matchFilter;
  });

  const deleteAuction = (id) => setAuctions((prev) => prev.filter((a) => a.id !== id));
  const approveAuction = (id) => setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: "live" } : a));
  const toggleUserStatus = (id) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  const deleteUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Gavel size={16} />
          </div>
          <span className="font-bold text-indigo-900 text-lg tracking-tight">Auction</span>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-2 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Shield size={14} className="text-indigo-600" />
          <div>
            <p className="text-[11px] text-indigo-400 font-medium">Logged in as</p>
            <p className="text-xs font-bold text-indigo-700">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={16} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Gavel size={16} />}
            label="Auction Management"
            active={activeTab === "auctions"}
            onClick={() => setActiveTab("auctions")}
          />
          <NavItem
            icon={<Users size={16} />}
            label="User Management"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        {/* ── Overview / Stats ── */}
        {activeTab === "overview" && (
          <div>
            <PageHeader title="Overview" subtitle="Platform summary at a glance" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <StatCard label="Live Auctions" value={liveCount} color="emerald" icon={<Gavel size={18} />} />
              <StatCard label="Pending Approval" value={pendingCount} color="amber" icon={<Clock size={18} />} />
              <StatCard label="Active Users" value={activeUsers} color="indigo" icon={<Users size={18} />} />
              <StatCard label="Sellers" value={sellerCount} color="purple" icon={<Shield size={18} />} />
            </div>
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-sm text-slate-400 font-medium mb-4">Quick Navigation</p>
              <div className="flex gap-3">
                <button onClick={() => setActiveTab("auctions")} className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition flex items-center gap-2">
                  <Gavel size={14} /> Manage Auctions
                </button>
                <button onClick={() => setActiveTab("users")} className="bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition flex items-center gap-2">
                  <Users size={14} /> Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Auction Management ── */}
        {activeTab === "auctions" && (
          <div>
            <PageHeader
              title="Auction Management"
              subtitle={`${auctions.length} total auctions`}
              action={
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-100">
                  <Plus size={15} /> Add Auction
                </button>
              }
            />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <MiniStat label="Live" value={liveCount} color="emerald" />
              <MiniStat label="Pending" value={pendingCount} color="amber" />
              <MiniStat label="Ended" value={auctions.filter(a => a.status === "ended").length} color="slate" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-6 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={auctionSearch}
                  onChange={(e) => setAuctionSearch(e.target.value)}
                  placeholder="Search auctions or sellers..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition"
                />
              </div>
              <FilterSelect
                value={auctionFilter}
                onChange={setAuctionFilter}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Live", value: "live" },
                  { label: "Pending", value: "pending" },
                  { label: "Ended", value: "ended" },
                ]}
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Item</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Seller</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Bid</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Bids</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Ends In</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-slate-400 py-10 text-sm">No auctions found.</td></tr>
                  )}
                  {filteredAuctions.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.category}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{a.seller}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(a.currentBid)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{a.bids}</td>
                      <td className="px-5 py-3.5 text-slate-600">{a.endsAt}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {a.status === "pending" && (
                            <button
                              onClick={() => approveAuction(a.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Approve"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteAuction(a.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── User Management ── */}
        {activeTab === "users" && (
          <div>
            <PageHeader
              title="User Management"
              subtitle={`${users.length} registered users`}
              action={
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-100">
                  <Plus size={15} /> Add User
                </button>
              }
            />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <MiniStat label="Active" value={activeUsers} color="emerald" />
              <MiniStat label="Sellers" value={sellerCount} color="indigo" />
              <MiniStat label="Suspended" value={users.filter(u => u.status === "suspended").length} color="red" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-6 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition"
                />
              </div>
              <FilterSelect
                value={userFilter}
                onChange={setUserFilter}
                options={[
                  { label: "All Users", value: "all" },
                  { label: "Buyers", value: "BUYER" },
                  { label: "Sellers", value: "SELLER" },
                  { label: "Suspended", value: "suspended" },
                ]}
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Auctions</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-slate-400 py-10 text-sm">No users found.</td></tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.role === "SELLER" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{u.joined}</td>
                      <td className="px-5 py-3.5 text-slate-600">{u.auctions}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg transition ${u.status === "active" ? "text-amber-500 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                            title={u.status === "active" ? "Suspend" : "Activate"}
                          >
                            {u.status === "active" ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      active
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    <span className={active ? "text-indigo-600" : ""}>{icon}</span>
    {label}
  </button>
);

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, color, icon }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
    slate: "text-slate-500 bg-slate-100",
    red: "text-red-500 bg-red-50",
  };
  return (
    <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${colorMap[color]}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 text-sm text-slate-600 pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-400 transition cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

export default AdminDashboard;