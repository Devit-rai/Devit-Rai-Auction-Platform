
export const fmt = (n) => "NPR " + Number(n || 0).toLocaleString();
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const getTimeRemaining = (endTime) => {
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

export const StatusBadge = ({ status }) => {
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

export const ConfirmModal = ({ open, title, desc, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">{desc}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 text-xs font-bold text-white py-2.5 rounded-xl transition ${confirmColor || "bg-red-500 hover:bg-red-600"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-xl font-black text-slate-800">{title}</h1>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const MiniStat = ({ label, value, color }) => {
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

export const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 text-xs text-slate-600 pl-3 pr-7 py-2 rounded-xl focus:outline-none focus:border-indigo-400 transition cursor-pointer font-medium">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
);

export const LoadingRows = ({ cols }) => (
  <>{[...Array(4)].map((_, i) => (
    <tr key={i} className="border-b border-slate-50">
      {[...Array(cols)].map((_, j) => (
        <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
      ))}
    </tr>
  ))}</>
);