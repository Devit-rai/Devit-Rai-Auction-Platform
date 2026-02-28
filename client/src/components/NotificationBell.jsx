// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2, Gavel, CheckCircle, XCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const typeConfig = {
  NEW_AUCTION: { icon: Gavel, bg: "bg-indigo-50", text: "text-indigo-600",  dot: "bg-indigo-500"  },
  AUCTION_APPROVED: { icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  AUCTION_REJECTED: { icon: XCircle, bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500" },
  AUTO_REJECTED: { icon: XCircle, bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500" },
  AUCTION_LIVE: { icon: Zap, bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  AUCTION_ENDED: { icon: Clock, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  NEW_BID: { icon: TrendingUp,  bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
};

const getConfig = (type) => typeConfig[type] || typeConfig["NEW_AUCTION"];

const getNavTarget = (notif) => {
  const { type, recipientRole } = notif;
  const auctionId = notif.auctionId ? notif.auctionId.toString() : null;

  if (recipientRole === "ADMIN") {
    return {
      path:  "/admin-dashboard",
      state: { tab: "auctions", openAuctionId: auctionId || null },
    };
  }

  if (recipientRole === "SELLER") {
    return {
      path:  "/inventory",
      state: { openAuctionId: auctionId || null },
    };
  }

  if (recipientRole === "USER") {
    if (auctionId) {
      return { path: `/auction/${auctionId}`, state: {} };
    }
    return { path: "/auctions", state: {} };
  }

  return { path: "/", state: {} };
};

/* Single notification row */
const NotifRow = ({ notif, onRead, onNavigate }) => {
  const cfg  = getConfig(notif.type);
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!notif.isRead) onRead(notif._id);
    onNavigate(notif);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 border-b border-slate-50 last:border-0 ${!notif.isRead ? "bg-indigo-50/30" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
        <Icon size={14} className={cfg.text} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-bold leading-snug ${!notif.isRead ? "text-slate-800" : "text-slate-600"}`}>
            {notif.title}
          </p>
          {!notif.isRead && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
          )}
        </div>
        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
          {notif.message}
        </p>
        <p className="text-[10px] text-slate-300 mt-1 font-medium">
          {dayjs(notif.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
};

/* NotificationBell */
const NotificationBell = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll } = useNotifications();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavigate = (notif) => {
    const { path, state } = getNavTarget(notif);
    setOpen(false);
    navigate(path, { state: { ...state, _ts: Date.now() } });
  };

  return (
    <div ref={ref} className={`relative ${className}`}>

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
        title="Notifications"
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-[299]" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-[300] flex flex-col overflow-hidden"
            style={{ animation: "dropIn .18s cubic-bezier(.22,1,.36,1)", maxHeight: "480px" }}
          >
            <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-slate-600" />
                <p className="text-xs font-black text-slate-800">Notifications</p>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    <CheckCheck size={11} /> All read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <Bell size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">All caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotifRow
                    key={n._id}
                    notif={n}
                    onRead={markAsRead}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex-shrink-0 border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;