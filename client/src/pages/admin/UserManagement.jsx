// src/pages/admin/UserManagement.jsx
import React, { useState } from "react";
import { Search, CheckCircle, XCircle, RefreshCw, Ban, UserCheck } from "lucide-react";
import { fmtDate, StatusBadge, PageHeader, MiniStat, FilterSelect, LoadingRows } from "./adminShared";

const UserManagement = ({ users, loading, adminId, onRefresh, onConfirm }) => {
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const activeUsers = users.filter((u) => u.status === "Active" && u._id !== adminId).length;
  const sellerCount = users.filter((u) => u.roles?.includes("SELLER") && u._id !== adminId).length;
  const suspendedCount = users.filter((u) => (u.status === "Suspended" || u.status === "Banned") && u._id !== adminId).length;

  const filtered = users.filter((u) => {
    if (u._id === adminId) return false;
    const q = userSearch.toLowerCase();
    return (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      && (userFilter === "all" || u.roles?.includes(userFilter) || u.status === userFilter);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered users`}
        action={
          <button onClick={onRefresh} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <MiniStat label="Active"    value={activeUsers}    color="emerald" />
        <MiniStat label="Sellers"   value={sellerCount}    color="indigo"  />
        <MiniStat label="Suspended" value={suspendedCount} color="red"     />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition" />
        </div>
        <FilterSelect value={userFilter} onChange={setUserFilter} options={[
          { label: "All Users",  value: "all"       },
          { label: "Buyers",     value: "USER"      },
          { label: "Sellers",    value: "SELLER"    },
          { label: "Active",     value: "Active"    },
          { label: "Suspended",  value: "Suspended" },
          { label: "Banned",     value: "Banned"    },
        ]} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                {["User","Role","Joined","Email Verified","Status","Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={6} /> :
                filtered.length === 0 ?
                  <tr><td colSpan={6} className="text-center text-slate-400 py-12 text-xs">No users found.</td></tr> :
                  filtered.map((u) => (
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
                          : <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400"><XCircle size={12} /> Pending</span>}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {u.status !== "Active" && (
                            <button title="Activate" onClick={() => onConfirm({ type: "activateUser", id: u._id, name: u.name })}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"><UserCheck size={14} /></button>
                          )}
                          {u.status === "Active" && (
                            <button title="Suspend" onClick={() => onConfirm({ type: "suspendUser", id: u._id, name: u.name })}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"><XCircle size={14} /></button>
                          )}
                          {u.status !== "Banned" && (
                            <button title="Ban permanently" onClick={() => onConfirm({ type: "banUser", id: u._id, name: u.name })}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"><Ban size={14} /></button>
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
  );
};

export default UserManagement;