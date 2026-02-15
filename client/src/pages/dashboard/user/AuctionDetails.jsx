import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import io from "socket.io-client";
import { Timer, ArrowLeft, History, Loader2, Trophy, Gavel } from "lucide-react";

const SOCKET_URL = "http://localhost:8000";

const CountdownTimer = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft("00h 00m 00s");
        if (onEnd) onEnd();
        return;
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const pad = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return <span className="font-mono font-bold">{timeLeft}</span>;
};

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      setItem(data.auctionItem);
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to load auction." });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit("joinAuction", id);

    socket.on("bidUpdate", (data) => {
      setItem((prev) => {
        if (!prev) return prev;
        const otherBids = prev.bids.filter(b => b.userId !== data.newBid.userId);
        return {
          ...prev,
          currentBid: data.currentBid,
          bids: [data.newBid, ...otherBids]
        };
      });
    });

    socket.on("auctionStatusUpdated", (data) => {
      if (data.auctionId === id) {
        setItem(prev => prev ? { ...prev, status: data.status } : prev);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    const amount = parseFloat(bidAmount);
    const currentPrice = Number(item?.currentBid || item?.startingBid);

    if (amount <= currentPrice) {
      return setStatus({ type: "error", msg: `Must exceed NPR ${currentPrice.toLocaleString()}` });
    }

    try {
      setIsSubmitting(true);
      await api.post(`/bids/${id}`, { amount });
      setBidAmount("");
      setStatus({ type: "success", msg: "Bid placed!" });
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!item) return <div className="p-10 text-center font-medium">Auction not found.</div>;

  const sortedBids = [...(item.bids || [])].sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Reduced padding in Nav */}
      <nav className="px-6 lg:px-16 py-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Listings
        </button>
      </nav>

      {/* Main Grid: Reduced gap */}
      <main className="px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
            <img 
              src={item.image?.url} 
              alt={item.title} 
              className="w-full h-[400px] object-cover rounded-xl" 
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
              <History size={18} className="text-blue-600" /> Bidding History
            </h3>
            <div className="space-y-2">
              {sortedBids.length > 0 ? (
                sortedBids.slice(0, 5).map((bid, idx) => ( // Showing top 5 to keep it compact
                  <div key={idx} className={`flex justify-between items-center p-3 rounded-xl border ${idx === 0 ? "bg-blue-50/50 border-blue-100" : "bg-white border-slate-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {idx === 0 ? <Trophy size={14} /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{bid.userName}</p>
                        {idx === 0 && <span className="text-[9px] font-bold uppercase text-blue-600">Highest Bidder</span>}
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${idx === 0 ? "text-blue-600" : "text-slate-600"}`}>
                      NPR {Number(bid.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-slate-400 border border-dashed rounded-xl">No bids yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <section>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold uppercase mb-3 tracking-wider">
              {item.category} • {item.condition}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{item.title}</h1>
            <p className="text-sm text-slate-500 font-normal leading-relaxed line-clamp-3">{item.description}</p>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-tight">Current Price</p>
              <p className="text-lg font-bold text-blue-600">NPR {Number(item.currentBid || item.startingBid).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-tight">Time Left</p>
              <div className={`flex items-center gap-1.5 text-lg font-bold ${item.status === 'Live' ? 'text-orange-600' : 'text-slate-600'}`}>
                <Timer size={16} />
                {item.status === "Live" ? (
                  <CountdownTimer endTime={item.endTime} onEnd={() => setItem(prev => ({ ...prev, status: "Ended" }))} />
                ) : (
                  <span className="text-sm uppercase">{item.status}</span>
                )}
              </div>
            </div>
          </div>

          {item.status === "Live" ? (
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Gavel size={18} /> Quick Bid</h3>
              <form onSubmit={handlePlaceBid} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">NPR</span>
                  <input
                    type="number"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min. ${(Number(item.currentBid || item.startingBid) + 1).toLocaleString()}`}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
                {status.msg && <div className={`p-3 rounded-lg text-xs font-semibold ${status.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>{status.msg}</div>}
                <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "PLACE BID NOW"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {item.status === "Ended" ? "Auction Closed" : "Coming Soon"}
              </p>
              {item.status === "Ended" && item.winner && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Winner</p>
                  <p className="text-lg font-bold text-blue-600">{item.winner.userName}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuctionDetails;