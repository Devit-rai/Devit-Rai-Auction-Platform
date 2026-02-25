import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, ArrowLeft, User, Mail, Shield,
  Heart, CheckCircle, Edit3, BadgeCheck,
  Lock, Save, X, LogOut,
  Calendar, KeyRound, ShieldCheck,
  ChevronRight, Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, accent }) => {
  const styles = {
    rose:    "bg-rose-50 border-rose-100 text-rose-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    indigo:  "bg-indigo-50 border-indigo-100 text-indigo-600",
    amber:   "bg-amber-50 border-amber-100 text-amber-600",
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${styles[accent]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles[accent].split(" ")[0]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-xs font-semibold mt-0.5 opacity-60">{label}</p>
      </div>
    </div>
  );
};

const Section = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
  const sessionUser = userData?.user || userData || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [savedItems, setSavedItems]   = useState(0);
  const [wonAuctions, setWonAuctions] = useState(0);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, wishlistRes, bidsRes] = await Promise.all([
        api.get("/auth/profile").catch(() => null),
        api.get("/wishlist").catch(() => null),
        api.get("/bids/my-bids").catch(() => null),         
      ]);
      const p = profileRes?.data?.user || sessionUser;
      const w = wishlistRes?.data?.wishlist || [];
      // Count auctions where current user is the highest bidder AND auction has ended
      const allBids = bidsRes?.data?.bids || bidsRes?.data || [];
      const won = Array.isArray(allBids)
        ? allBids.filter((b) => b.isWinner === true || b.status === "won").length
        : 0;
      setProfile(p);
      setForm({ name: p.name || "" });
      setSavedItems(w.length);
      setWonAuctions(won);
    } catch {
      setProfile(sessionUser);
      setForm({ name: sessionUser.name || "" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name cannot be empty");
    try {
      setSaving(true);
      const res = await api.put("/auth/profile", { name: form.name.trim() });
      const updated = res.data?.user || { ...profile, name: form.name.trim() };
      setProfile(updated);
      // Sync session storage
      const next = { ...userData };
      if (next.user) next.user = { ...next.user, name: updated.name };
      else next.name = updated.name;
      sessionStorage.setItem("user", JSON.stringify(next));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/");
  };

  const name = profile?.name || sessionUser.name || "User";
  const email = profile?.email || sessionUser.email || "";
  const verified  = profile?.isVerified ?? false;
  const status = profile?.status     || "Active";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";
  const roles     = profile?.roles || sessionUser.roles || ["user"];
  const isSeller  = roles.includes("seller") || roles.includes("Seller");
  const roleLabel = isSeller ? "Seller" : "Bidder";

  const TABS = [
    { id: "overview", icon: User,  label: "Overview" },
    { id: "edit",     icon: Edit3, label: "Edit Profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Gavel size={20} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <div onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-400">
            <span className="text-slate-600 font-semibold">My Profile</span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          <aside className="space-y-4">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md shadow-indigo-100">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-black text-slate-900 truncate leading-tight">{name}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSeller ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        <User size={8} /> {roleLabel}
                      </span>
                      {verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          <BadgeCheck size={8} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 border ${
                    status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Mail size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                    <span>Joined {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <ShieldCheck size={12} className="text-slate-400 flex-shrink-0" />
                    <span>{verified ? "Verified account" : "Unverified"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab nav */}
            <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeTab === id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}>
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} className={activeTab === id ? "text-indigo-600" : "text-slate-400"} />
                    {label}
                  </span>
                  {activeTab === id && <ChevronRight size={13} className="text-indigo-400" />}
                </button>
              ))}

              <div className="h-px bg-slate-100 my-2" />

              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </aside>

          <main className="space-y-5 min-w-0">

            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Heart}        label="Saved Items"   value={savedItems} accent="rose" />
                  <StatCard icon={CheckCircle}  label="Won Auctions"  value={wonAuctions} accent="emerald" />
                </div>

                {/* Account Info */}
                <Section
                  title="Account Information"
                  subtitle="Your personal details"
                  action={
                    <button onClick={() => setActiveTab("edit")}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition">
                      <Edit3 size={11} /> Edit
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Full Name",     value: name },
                      { label: "Email Address", value: email },
                      { label: "Account Role",  value: roleLabel },
                      { label: "Member Since",  value: memberSince },
                      { label: "Verification",  value: verified ? "Verified ✓" : "Not verified" },
                      { label: "Status",        value: status },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Account Status */}
                <Section title="Account Status" subtitle="Security and verification">
                  <div className="space-y-2.5">
                    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      verified ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle size={14} className={verified ? "text-emerald-600" : "text-amber-500"} />
                        <span className={`text-xs font-semibold ${verified ? "text-emerald-700" : "text-amber-700"}`}>
                          Email Verification
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        verified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        {verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Shield size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Two-Factor Auth</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Account Type</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSeller ? "bg-violet-100 text-violet-600" : "bg-indigo-100 text-indigo-600"
                      }`}>{roleLabel}</span>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {/* ════ EDIT PROFILE TAB ════ */}
            {activeTab === "edit" && (
              <div className="space-y-5">

                {/* Personal Info */}
                <Section title="Personal Information" subtitle="Update your display name">
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Lock size={10} /> Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Account Role</label>
                      <input
                        type="text"
                        value={roleLabel}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200">
                        {saving
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Save size={14} />}
                        Save Changes
                      </button>
                      <button onClick={() => { setForm({ name }); setActiveTab("overview"); }}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-xl transition">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </Section>

                {/* ── Security divider ── */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                    <ShieldCheck size={11} /> Security
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Forgot / Reset Password card */}
                <Section
                  title="Password"
                  subtitle="Change or reset your account password"
                  action={
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <KeyRound size={15} className="text-indigo-500" />
                    </div>
                  }
                >
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Reset via Email OTP</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        We'll send a 6-digit code to <span className="font-semibold text-slate-600">{email}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/forget-password")}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200 flex-shrink-0 ml-4">
                      <Lock size={12} /> Reset Password
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-slate-400" />
                    You will be asked to verify your email with an OTP before setting a new password.
                  </p>
                </Section>

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;