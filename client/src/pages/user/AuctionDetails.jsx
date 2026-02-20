import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket";
import {
  Timer,
  ArrowLeft,
  History,
  Loader2,
  Trophy,
  Gavel,
} from "lucide-react";

/* Countdown Timer */
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
      const pad = (num) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return <span className="font-mono font-bold">{timeLeft}</span>;
};

/* Main Component */
const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idRef = useRef(id);
  useEffect(() => {
    idRef.current = id;
  }, [id]);

  /* Fetch Auction Details */
  const fetchDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      setItem(data.auctionItem);
    } catch {
      setStatus({ type: "error", msg: "Failed to load auction." });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  /* Socket real-time updates */
  useEffect(() => {
    if (!id) return;

    const joinRoom = () => socket.emit("joinAuction", id);
    joinRoom();
    socket.on("connect", joinRoom);

    const handleBidUpdate = (data) => {
      if (String(data.auctionId) !== String(idRef.current)) return;

      setItem((prev) => {
        if (!prev) return prev;

        const incoming = data.newBid; // { userId, userName, amount, timestamp }

        const existingIndex = prev.bids.findIndex(
          (b) => String(b.userId) === String(incoming.userId),
        );

        let updatedBids;
        if (existingIndex !== -1) {
          // Replace full bid object so userName is always correct
          updatedBids = prev.bids.map((b, i) =>
            i === existingIndex ? { ...incoming } : b,
          );
        } else {
          updatedBids = [{ ...incoming }, ...prev.bids];
        }

        updatedBids.sort((a, b) => b.amount - a.amount);

        return {
          ...prev,
          currentBid: data.currentBid,
          bids: updatedBids,
        };
      });
    };

    const handleStatusUpdate = (data) => {
      if (String(data.auctionId) === String(idRef.current)) {
        setItem((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    };

    socket.on("bidUpdate", handleBidUpdate);
    socket.on("auctionStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("auctionStatusUpdated", handleStatusUpdate);
      socket.emit("leaveAuction", id);
    };
  }, [id]);

  /*  Place Bid */
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const amount = parseFloat(bidAmount);
    const currentPrice = Number(item?.currentBid || item?.startingBid);

    if (isNaN(amount) || amount <= currentPrice) {
      return setStatus({
        type: "error",
        msg: `Bid must exceed NPR ${currentPrice.toLocaleString()}`,
      });
    }

    try {
      setIsSubmitting(true);
      await api.post(`/bids/${id}`, { amount });
      setBidAmount("");
      setStatus({ type: "success", msg: "Bid placed!" });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Failed to place bid.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );

  if (!item)
    return (
      <div className="p-10 text-center font-medium text-slate-500">
        Auction not found.
      </div>
    );

  const sortedBids = [...(item.bids || [])].sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <nav className="px-6 lg:px-16 py-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Listings
        </button>
      </nav>

      <main className="px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-3 border shadow-sm">
            <img
              src={item.image?.url}
              alt={item.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
          </div>

          {/* Bidding History */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Bidding History
            </h3>

            <div className="space-y-2">
              {sortedBids.length > 0 ? (
                sortedBids.slice(0, 5).map((bid, idx) => (
                  <div
                    key={`${bid.userId}-${bid.amount}`}
                    className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                      idx === 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-transparent"
                    }`}
                  >
                    {/* ✅ Always real name from DB — no "You (pending...)" ever */}
                    <p className="font-semibold">{bid.userName}</p>
                    <p className="font-bold text-blue-600">
                      NPR {Number(bid.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-slate-400 border rounded-xl">
                  No bids yet. Be the first!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h1 className="text-2xl font-bold">{item.title}</h1>

          {/* Current Price */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <p className="text-sm text-slate-400">Current Price</p>
            <p className="text-2xl font-bold text-blue-600">
              NPR {Number(item.currentBid || item.startingBid).toLocaleString()}
            </p>
          </div>

          {/* Countdown */}
          {item.endTime && item.status === "Live" && (
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-2 text-sm text-slate-500">
              <Timer size={16} className="text-blue-600" />
              Ends in:{" "}
              <CountdownTimer
                endTime={item.endTime}
                onEnd={() =>
                  setItem((prev) =>
                    prev ? { ...prev, status: "Ended" } : prev,
                  )
                }
              />
            </div>
          )}

          {/* Bid Form */}
          {item.status === "Live" && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Gavel size={18} /> Place Your Bid
              </h3>

              <form onSubmit={handlePlaceBid} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Amount (min: NPR{" "}
                    {(
                      Number(item.currentBid || item.startingBid) + 1
                    ).toLocaleString()}
                    )
                  </label>
                  <input
                    type="number"
                    required
                    min={Number(item.currentBid || item.startingBid) + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`> ${Number(
                      item.currentBid || item.startingBid,
                    ).toLocaleString()}`}
                    className="w-full bg-slate-800 rounded-xl py-3 px-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {status.msg && (
                  <div
                    className={`text-xs px-3 py-2 rounded-lg ${
                      status.type === "error"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {status.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Placing...
                    </>
                  ) : (
                    <>
                      <Gavel size={16} /> PLACE BID
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Ended */}
          {item.status === "Ended" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <Trophy size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-amber-700">Auction Ended</p>
              {item.winner && (
                <p className="text-sm text-amber-600 mt-1">
                  Won by{" "}
                  <span className="font-semibold">{item.winner.userName}</span>{" "}
                  for NPR {Number(item.winner.amount).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Upcoming */}
          {item.status === "Upcoming" && (
            <div className="bg-slate-100 border rounded-2xl p-5 text-center text-slate-500 text-sm">
              This auction hasn't started yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuctionDetails;
