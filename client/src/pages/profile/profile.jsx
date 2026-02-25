import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, ArrowLeft, User, Mail, Shield,
  Heart, Clock, CheckCircle, Edit3,
  Camera, LogOut, LayoutGrid, BadgeCheck,
  Lock, Eye, EyeOff, Save, X,
} from "lucide-react";
import { toast } from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${colors[color]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color].split(" ")[0]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-xs font-semibold mt-0.5 opacity-70">{label}</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [stats, setStats] = useState({ savedItems: 0, totalBids: 0, wonAuctions: 0 });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, wishlistRes] = await Promise.all([
        api.get("/auth/profile").catch(() => null),
        api.get("/wishlist").catch(() => null),
      ]);
      const profileData  = profileRes?.data?.user || user;
      const wishlistData = wishlistRes?.data?.wishlist || [];
      setProfile(profileData);
      setForm({ name: profileData.name || "" });
      setStats((s) => ({ ...s, savedItems: wishlistData.length }));
    } catch {
      setProfile(user);
      setForm({ name: user.name || "" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) { toast.error("Name cannot be empty"); return; }
    try {
      setSaving(true);
      await api.put("/auth/profile", form);
      const updated = { ...userData, name: form.name };
      if (userData?.user) updated.user = { ...userData.user, ...form };
      sessionStorage.setItem("user", JSON.stringify(updated));
      setProfile((p) => ({ ...p, ...form }));
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current) { toast.error("Enter your current password"); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error("Passwords don't match"); return; }
    if (passwordForm.newPass.length < 6) { toast.error("Minimum 6 characters"); return; }
    try {
      setSavingPw(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.current,
        newPassword:     passwordForm.newPass,
      });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      toast.success("Password changed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setSavingPw(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/");
  };

  const displayName  = profile?.name  || user.name  || "User";
  const displayEmail = profile?.email || user.email || "";
  const isVerified   = profile?.isVerified ?? true;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "edit", label: "Edit Profile" },
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

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <div onClick={() => navigate("/user-dashboard")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight hidden sm:block">BidHub</span>
          </div>
          <div className="w-px h-5 bg-slate-200 hidden md:block" />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition px-2 py-1.5 rounded-lg hover:bg-slate-100">
              <ArrowLeft size={13} /> Back
            </button>
            <button onClick={handleLogout}
              className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          <aside className="space-y-4">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-indigo-500 to-blue-700" />
              <div className="px-5 pb-5 -mt-10">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-slate-700 uppercase">
                    {displayName.charAt(0)}
                  </div>
                </div>
                <h2 className="text-base font-black text-slate-900 leading-tight">{displayName}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-indigo-600">
                    <User size={9} /> Bidder
                  </span>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <BadgeCheck size={9} /> Verified
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Mail size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Shield size={12} className="text-slate-400 flex-shrink-0" />
                    <span>Bidder</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-100 p-2">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}>
                  {tab.label}
                  {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>

          </aside>

          <main className="space-y-5">

            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  <StatCard icon={Heart} label="Saved Items"  value={stats.savedItems} color="rose" />
                  <StatCard icon={CheckCircle} label="Won Auctions" value={stats.wonAuctions} color="emerald" />
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black text-slate-800">Account Information</h3>
                    <button onClick={() => setActiveTab("edit")}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", value: displayName },
                      { label: "Email Address", value: displayEmail },
                      { label: "Account Role", value: "Bidder" },
                      { label: "Verification", value: isVerified ? "Verified ✓" : "Pending" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-black text-slate-800 mb-4">Account Status</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Email Verified</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Shield size={14} className="text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600">Two-Factor Auth</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Edit Profile*/}
            {activeTab === "edit" && (
              <div className="space-y-5">

                {/* Personal Info */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-black text-slate-800 mb-1">Personal Information</h3>
                  <p className="text-xs text-slate-400 mb-5">Update your display name.</p>
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Lock size={10} /> Email cannot be changed
                      </p>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition">
                        {saving
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Save size={14} />}
                        Save Changes
                      </button>
                      <button onClick={() => { setForm({ name: displayName }); setActiveTab("overview"); }}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-xl transition">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">Security</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-black text-slate-800 mb-1">Change Password</h3>
                  <p className="text-xs text-slate-400 mb-5">Choose a strong password you haven't used before.</p>
                  <div className="space-y-4 max-w-lg">
                    {[
                      { key: "current", label: "Current Password", field: "current" },
                      { key: "new", label: "New Password", field: "newPass" },
                      { key: "confirm", label: "Confirm Password", field: "confirm" },
                    ].map(({ key, label, field }) => (
                      <div key={key}>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type={showPw[key] ? "text" : "password"}
                            value={passwordForm[field]}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, [field]: e.target.value }))}
                            className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                            placeholder="••••••••"
                          />
                          <button type="button"
                            onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                            {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleChangePassword} disabled={savingPw}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition">
                      {savingPw
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Lock size={14} />}
                      Update Password
                    </button>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;