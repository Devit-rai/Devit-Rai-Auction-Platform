import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../api/socket"; // ✅ use global socket
import { Timer, ArrowLeft, History, Loader2, Trophy, Gavel } from "lucide-react";

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

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Fetch Auction Details */
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

  /*SOCKET REALTIME */
  useEffect(() => {
    if (!id) return;

    // Join auction room
    socket.emit("joinAuction", id);

    // Listen for bid updates
    socket.on("bidUpdate", (data) => {
      if (data.auctionId !== id) return;

      setItem((prev) => {
        if (!prev) return prev;

        const updatedBids = [
          data.newBid,
          ...prev.bids.filter(
            (b) => b.userId !== data.newBid.userId
          ),
        ];

        return {
          ...prev,
          currentBid: data.currentBid,
          bids: updatedBids,
        };
      });
    });

    // Listen for status update
    socket.on("auctionStatusUpdated", (data) => {
      if (data.auctionId === id) {
        setItem((prev) =>
          prev ? { ...prev, status: data.status } : prev
        );
      }
    });

    return () => {
      socket.off("bidUpdate");
      socket.off("auctionStatusUpdated");
    };
  }, [id]);

  /* Place Bid */
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const amount = parseFloat(bidAmount);
    const currentPrice = Number(item?.currentBid || item?.startingBid);

    if (amount <= currentPrice) {
      return setStatus({
        type: "error",
        msg: `Must exceed NPR ${currentPrice.toLocaleString()}`,
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
        msg: err.response?.data?.message || "Error",
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
    return <div className="p-10 text-center font-medium">Auction not found.</div>;

  const sortedBids = [...(item.bids || [])].sort(
    (a, b) => b.amount - a.amount
  );

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
        {/* LEFT */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-3 border shadow-sm">
            <img
              src={item.image?.url}
              alt={item.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Bidding History
            </h3>

            <div className="space-y-2">
              {sortedBids.length > 0 ? (
                sortedBids.slice(0, 5).map((bid, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-3 rounded-xl border bg-slate-50"
                  >
                    <p className="font-semibold">{bid.userName}</p>
                    <p className="font-bold text-blue-600">
                      NPR {Number(bid.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-slate-400 border rounded-xl">
                  No bids yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5 space-y-6">
          <h1 className="text-2xl font-bold">{item.title}</h1>

          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <p className="text-sm text-slate-400">Current Price</p>
            <p className="text-xl font-bold text-blue-600">
              NPR {Number(item.currentBid || item.startingBid).toLocaleString()}
            </p>
          </div>

          {item.status === "Live" && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Gavel size={18} /> Quick Bid
              </h3>

              <form onSubmit={handlePlaceBid} className="space-y-3">
                <input
                  type="number"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-slate-800 rounded-xl py-3 px-4 text-sm"
                />

                {status.msg && (
                  <div className="text-xs">{status.msg}</div>
                )}

                <button
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 py-3 rounded-xl font-bold"
                >
                  {isSubmitting ? "Placing..." : "PLACE BID"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuctionDetails;