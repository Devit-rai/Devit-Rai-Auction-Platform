import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Image, ChevronLeft, Search } from "lucide-react";
import api from "../api/axios";
import { socket } from "../api/socket";

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
];
const avatarColor = (name = "?") => COLORS[name.charCodeAt(0) % COLORS.length];

const getRoleMeta = (roles = []) => {
  const r = roles.map((x) => x.toLowerCase());
  if (r.includes("admin"))  return { label: "Admin", cls: "bg-violet-100 text-violet-700" };
  if (r.includes("seller")) return { label: "Seller", cls: "bg-emerald-100 text-emerald-700" };
  return { label: "Bidder", cls: "bg-indigo-100 text-indigo-700" };
};

const isAdmin  = (u) => u?.roles?.some((r) => r.toLowerCase() === "admin");
const isSeller = (u) => u?.roles?.some((r) => r.toLowerCase() === "seller");

const Avatar = ({ name = "?", online = false, size = "md", img }) => {
  const color = avatarColor(name);
  const sz = size === "sm" ? "w-8 h-8 text-xs"
           : size === "xs" ? "w-7 h-7 text-[10px]"
           : "w-10 h-10 text-sm";
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sz} ${color} rounded-full flex items-center justify-center font-black uppercase select-none overflow-hidden`}>
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : name[0]}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

const StoryBubble = ({ u, online, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 flex-shrink-0 group" style={{ minWidth: 58 }}>
    <div className={`p-0.5 rounded-full transition-all ${online ? "bg-gradient-to-tr from-emerald-400 to-indigo-500" : "bg-slate-200"}`}>
      <div className="bg-white rounded-full p-0.5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black uppercase text-sm overflow-hidden ${avatarColor(u.name)}`}>
          {u.profileImage?.url
            ? <img src={u.profileImage.url} alt={u.name} className="w-full h-full object-cover" />
            : u.name[0]}
        </div>
      </div>
    </div>
    <span className="text-[9px] font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors truncate w-full text-center">
      {u.name.split(" ")[0]}
    </span>
    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full -mt-0.5 ${online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
      {online ? "Online" : "Offline"}
    </span>
  </button>
);

const UserRow = ({ u, online, onClick }) => {
  const role = getRoleMeta(u.roles);
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left group">
      <Avatar name={u.name} online={online} img={u.profileImage?.url} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{u.name}</p>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${role.cls}`}>{role.label}</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate">
          {u.lastMessage ? u.lastMessage : online ? "Online · tap to message" : "Tap to start a conversation"}
        </p>
      </div>
      {online && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
    </button>
  );
};

const SectionLabel = ({ label }) => (
  <div className="px-4 pt-3 pb-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const ChatBox = ({ currentUser }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [chatUsers, setChatUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const amAdmin  = isAdmin(currentUser);
  const amSeller = isSeller(currentUser);

  const headerTitle = amAdmin ? "Sellers" : amSeller ? "Messages" : "Sellers";

  const isOnline = (u) => onlineUsers.includes(u._id?.toString());

  /* socket */
  useEffect(() => {
    socket.on("getOnlineUsers", setOnlineUsers);
    socket.on("newMessage", (msg) => {
      const senderId = msg.senderId?._id || msg.senderId;
      if (selectedUser && senderId === selectedUser._id) {
        setMessages((p) => [...p, msg]);
      } else {
        setUnreadCount((c) => c + 1);
        fetchChatUsers();
      }
    });
    return () => {
      socket.off("getOnlineUsers", setOnlineUsers);
      socket.off("newMessage");
    };
  }, [selectedUser]);

  useEffect(() => {
    const handler = (e) => openWithUser(e.detail.user);
    window.addEventListener("openChatWith", handler);
    return () => window.removeEventListener("openChatWith", handler);
  }, []);

  const fetchChatUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/chat/users");
      setChatUsers(data.users || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/chat/unread-count");
      setUnreadCount(data.count || 0);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetchChatUsers();
    fetchUnread();
  }, [currentUser?._id]);

  const fetchMessages = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chat/messages/${userId}`);
      setMessages(data.messages || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (view === "chat") inputRef.current?.focus(); }, [view]);

  const openWithUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
    setView("chat");
    setOpen(true);
    fetchChatUsers();
  };

  const handleSend = async () => {
    if (!text.trim() && !image) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (image) formData.append("image", image);
      const { data } = await api.post(`/chat/send/${selectedUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((p) => [...p, data.message]);
      setText(""); setImage(null); setPreview(null);
      fetchChatUsers();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const goBack = () => {
    setView("list");
    setSelectedUser(null);
    setMessages([]);
    fetchChatUsers();
  };

  const filtered = chatUsers.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );
  const withConvo = filtered.filter((u) => u.hasConversation);
  const withoutConvo = filtered.filter((u) => !u.hasConversation);

  const newAdmins = withoutConvo.filter((u) => isAdmin(u));
  const newBidders = withoutConvo.filter((u) => !isAdmin(u));

  const storyUsers = [...chatUsers].sort((a, b) => {
    const aOn = isOnline(a), bOn = isOnline(b);
    if (aOn && !bOn) return -1;
    if (!aOn && bOn) return 1;
    return a.name.localeCompare(b.name);
  });

  const onlineCount = storyUsers.filter(isOnline).length;

  const emptyMsg = amAdmin
    ? { title: "No sellers found", sub: "Sellers will appear here" }
    : amSeller
    ? { title: "No conversations yet", sub: "Bidders and admins will appear here" }
    : { title: "No sellers found", sub: "Sellers will appear here" };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col items-end gap-3">

      {open && (
        <div className="w-[340px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80" style={{ height: 580 }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            {view === "chat" && selectedUser ? (
              <>
                <button onClick={goBack} className="text-white/80 hover:text-white transition">
                  <ChevronLeft size={18} />
                </button>
                <Avatar name={selectedUser.name} size="sm" online={isOnline(selectedUser)} img={selectedUser.profileImage?.url} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-tight">{selectedUser.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline(selectedUser) ? "bg-emerald-400" : "bg-slate-400"}`} />
                    <p className="text-[10px] text-indigo-200">{isOnline(selectedUser) ? "Online" : "Offline"}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={15} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white leading-tight">{headerTitle}</p>
                  <p className="text-[10px] text-indigo-200">
                    {onlineCount > 0 ? `${onlineCount} online now` : `${chatUsers.length} available`}
                  </p>
                </div>
              </>
            )}
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition ml-auto">
              <X size={16} />
            </button>
          </div>

          {/* List View */}
          {view === "list" && (
            <>
              {/* Story row */}
              {storyUsers.length > 0 && (
                <div className="px-3 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
                  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {storyUsers.map((u) => (
                      <StoryBubble key={u._id} u={u} online={isOnline(u)} onClick={() => openWithUser(u)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={amAdmin ? "Search sellers…" : amSeller ? "Search users…" : "Search sellers…"}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                      <MessageCircle size={18} className="text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{emptyMsg.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{emptyMsg.sub}</p>
                  </div>
                ) : (
                  <>
                    {withConvo.length > 0 && (
                      <>
                        <SectionLabel label="Recent Conversations" />
                        {withConvo.map((u) => (
                          <UserRow key={u._id} u={u} online={isOnline(u)} onClick={() => openWithUser(u)} />
                        ))}
                        {withoutConvo.length > 0 && <div className="h-px bg-slate-100 mx-4 my-1" />}
                      </>
                    )}

                    {amSeller ? (
                      <>
                        {newAdmins.length > 0 && (
                          <>
                            <SectionLabel label="Admins" />
                            {newAdmins.map((u) => (
                              <UserRow key={u._id} u={u} online={isOnline(u)} onClick={() => openWithUser(u)} />
                            ))}
                          </>
                        )}
                        {newBidders.length > 0 && (
                          <>
                            <SectionLabel label="Bidders" />
                            {newBidders.map((u) => (
                              <UserRow key={u._id} u={u} online={isOnline(u)} onClick={() => openWithUser(u)} />
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      withoutConvo.length > 0 && (
                        <>
                          <SectionLabel label={amAdmin ? "All Sellers" : "All Sellers"} />
                          {withoutConvo.map((u) => (
                            <UserRow key={u._id} u={u} online={isOnline(u)} onClick={() => openWithUser(u)} />
                          ))}
                        </>
                      )
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Chat View */}
          {view === "chat" && selectedUser && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 bg-slate-50/50">
                {loading ? (
                  <div className="flex justify-center pt-10">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center pb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                      <MessageCircle size={18} className="text-indigo-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">Start the conversation</p>
                    <p className="text-[10px] text-slate-400 mt-1">Say hello to {selectedUser.name}!</p>
                  </div>
                ) : messages.map((m, i) => {
                  const isMe = m.senderId === currentUser._id || m.senderId?._id === currentUser._id;
                  return (
                    <div key={m._id || i} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="w-6 flex-shrink-0">
                          {(i === 0 || messages[i - 1]?.senderId !== m.senderId) && (
                            <Avatar name={selectedUser.name} size="xs" img={selectedUser.profileImage?.url} />
                          )}
                        </div>
                      )}
                      <div className={`max-w-[72%] px-3.5 py-2.5 ${
                        isMe
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-md"
                          : "bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-200/80 shadow-sm"
                      }`}>
                        {m.image && <img src={m.image} alt="attachment" className="rounded-xl mb-2 max-w-full max-h-32 object-cover" />}
                        {m.text && <p className="text-xs leading-relaxed">{m.text}</p>}
                        <p className={`text-[9px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                          {fmtTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {preview && (
                <div className="px-3 py-2 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
                  <img src={preview} alt="preview" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                  <p className="text-[10px] text-slate-500 flex-1 truncate">{image?.name}</p>
                  <button onClick={() => { setImage(null); setPreview(null); }} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="px-3 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
                <button onClick={() => fileRef.current.click()} className="text-slate-400 hover:text-indigo-500 transition p-1.5 rounded-lg hover:bg-indigo-50">
                  <Image size={15} />
                </button>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 text-xs border border-slate-200 rounded-2xl px-3.5 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition bg-slate-50"
                />
                <button
                  onClick={handleSend}
                  disabled={(!text.trim() && !image) || sending}
                  className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center hover:shadow-md transition-all flex-shrink-0"
                >
                  {sending
                    ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send size={13} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-300/50 flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBox;