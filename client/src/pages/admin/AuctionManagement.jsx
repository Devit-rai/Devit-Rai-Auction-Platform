import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Gavel, Search, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, ArrowUpRight, TrendingUp, Package, Calendar,
  User, Tag, Layers, Users, Clock, X,
} from "lucide-react";
import {
  fmt, fmtDate, fmtDateTime, getTimeRemaining,
  StatusBadge, PageHeader, MiniStat, FilterSelect, LoadingRows,
} from "./adminShared";

const AuctionDetailPanel = ({ auctionId, onClose, onApprove, onReject, onForceClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;
    setLoading(true);
    setData(null);
    api.get(`/admin/auctions/${auctionId}`)
      .then(({ data: res }) => setData(res))
      .catch(() => toast.error("Failed to load auction details"))
      .finally(() => setLoading(false));
  }, [auctionId]);

  const a = data?.auction;
  const bidders = data?.bidders || [];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200]" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-[250] flex flex-col"
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
              <p className="text-xs font-black text-slate-800">Auction Details</p>
              <p className="text-[10px] text-slate-400">Full listing information</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
            <X size={15} />
          </button>
        </div>

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

              {/* Hero */}
              <div className="rounded-2xl overflow-hidden border border-slate-100 relative">
                <img src={a.image?.url} alt={a.title} className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{a.category}</p>
                  <h2 className="text-base font-black text-white leading-tight">{a.title}</h2>
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <StatusBadge status={a.status} />
                  <StatusBadge status={a.approvalStatus || "Pending"} />
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: "Current Bid", value: fmt(a.currentBid || a.startingBid), color: "text-indigo-600 bg-indigo-50" },
                  { icon: Users, label: "Total Bids",  value: a.bids?.length || 0, color: "text-emerald-600 bg-emerald-50" },
                  { icon: Clock, label: "Time Left",   value: getTimeRemaining(a.endTime), color: "text-amber-600 bg-amber-50" },
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
              <div className="space-y-3">
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

              {/* Seller */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Seller</p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                    {a.createdBy?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">{a.createdBy?.name || "—"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{a.createdBy?.email || "—"}</p>
                  </div>
                  <User size={13} className="text-slate-300 flex-shrink-0" />
                </div>
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
                      <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i < bidders.length - 1 ? "border-b border-slate-50" : ""} ${i === 0 ? "bg-emerald-50/50" : ""}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">{bid.userName || "User"}</p>
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

        {/* Footer */}
        {a && (
          <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-white">
            <div className="flex gap-2">
              {a.approvalStatus !== "Approved" && (
                <button onClick={() => { onApprove(a._id, a.title); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition">
                  <CheckCircle size={13} /> Approve
                </button>
              )}
              {a.approvalStatus !== "Rejected" && (
                <button onClick={() => { onReject(a._id, a.title); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition border border-red-200">
                  <XCircle size={13} /> Reject
                </button>
              )}
              {a.status === "Live" && (
                <button onClick={() => { onForceClose(a._id, a.title); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold py-2.5 rounded-xl transition border border-amber-200">
                  <AlertTriangle size={13} /> Force Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const AuctionManagement = ({
  auctions, loading, onRefresh, onConfirm,
  detailId, setDetailId, detailRefreshKey, setDetailRefreshKey,
}) => {
  const [auctionSearch, setAuctionSearch] = useState("");
  const [auctionFilter, setAuctionFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const liveCount = auctions.filter((a) => a.status === "Live").length;
  const pendingCount = auctions.filter((a) => a.approvalStatus === "Pending").length;
  const endedCount = auctions.filter((a) => a.status === "Ended").length;

  const filtered = auctions.filter((a) => {
    const q = auctionSearch.toLowerCase();
    return (!q || a.title?.toLowerCase().includes(q) || a.createdBy?.name?.toLowerCase().includes(q))
      && (auctionFilter === "all" || a.status === auctionFilter)
      && (approvalFilter === "all" || a.approvalStatus === approvalFilter);
  });

  return (
    <>
      {/* Detail panel */}
      {detailId && (
        <AuctionDetailPanel
          key={detailRefreshKey}
          auctionId={detailId}
          onClose={() => { setDetailId(null); setDetailRefreshKey(0); }}
          onApprove={(id, title) => onConfirm({ type: "approve", id, title })}
          onReject={(id, title)  => onConfirm({ type: "reject",  id, title })}
          onForceClose={(id, title) => onConfirm({ type: "forceClose", id, title })}
        />
      )}

      <div className="space-y-5">
        <PageHeader
          title="Auction Management"
          subtitle={`${auctions.length} total · ${pendingCount} pending approval`}
          action={
            <button onClick={onRefresh} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
              <RefreshCw size={13} /> Refresh
            </button>
          }
        />

        <div className="grid grid-cols-3 gap-4">
          <MiniStat label="Live" value={liveCount} color="emerald" />
          <MiniStat label="Pending" value={pendingCount} color="amber"   />
          <MiniStat label="Ended" value={endedCount} color="slate"   />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={auctionSearch} onChange={(e) => setAuctionSearch(e.target.value)}
              placeholder="Search by title or seller..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition" />
          </div>
          <FilterSelect value={auctionFilter} onChange={setAuctionFilter} options={[
            { label: "All Statuses", value: "all" }, { label: "Live", value: "Live" },
            { label: "Upcoming", value: "Upcoming" }, { label: "Ended", value: "Ended" },
          ]} />
          <FilterSelect value={approvalFilter} onChange={setApprovalFilter} options={[
            { label: "All Approvals", value: "all" }, { label: "Pending", value: "Pending" },
            { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" },
          ]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  {["Item","Seller","Current Bid","Bids","Time Left","Status","Approval","Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={8} /> :
                  filtered.length === 0 ?
                    <tr><td colSpan={8} className="text-center text-slate-400 py-12 text-xs">No auctions found.</td></tr> :
                    filtered.map((a) => (
                      <tr key={a._id}
                        onClick={() => setDetailId(a._id)}
                        className="border-b border-slate-50 hover:bg-indigo-50/30 transition cursor-pointer group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              {a.image?.url && <img src={a.image.url} alt={a.title} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px] group-hover:text-indigo-700 transition-colors">{a.title}</p>
                              <p className="text-[10px] text-slate-400">{a.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">{a.createdBy?.name || "—"}</td>
                        <td className="px-5 py-3.5 text-xs font-bold text-slate-800 whitespace-nowrap">{fmt(a.currentBid || a.startingBid)}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">{a.bids?.length || 0}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">{getTimeRemaining(a.endTime)}</td>
                        <td className="px-5 py-3.5">{a.approvalStatus !== "Rejected" && <StatusBadge status={a.status} />}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={a.approvalStatus || "Pending"} /></td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {a.approvalStatus !== "Approved" && (
                              <button title="Approve" onClick={() => onConfirm({ type: "approve", id: a._id, title: a.title })}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"><CheckCircle size={14} /></button>
                            )}
                            {a.approvalStatus !== "Rejected" && (
                              <button title="Reject" onClick={() => onConfirm({ type: "reject", id: a._id, title: a.title })}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"><XCircle size={14} /></button>
                            )}
                            {a.status === "Live" && (
                              <button title="Force Close" onClick={() => onConfirm({ type: "forceClose", id: a._id, title: a.title })}
                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"><AlertTriangle size={14} /></button>
                            )}
                            <button title="View Details" onClick={() => setDetailId(a._id)}
                              className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 transition"><ArrowUpRight size={14} /></button>
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
    </>
  );
};

export default AuctionManagement;