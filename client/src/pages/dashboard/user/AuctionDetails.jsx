import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  Gavel,
  Timer,
  ArrowLeft,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
      setLoading(true);
      const { data } = await api.get(`/auctions/${id}`);

      const detailedItem = {
        ...data.auctionItem,
        bids: data.bidders || [],
      };

      setItem(detailedItem);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Could not load auction details.",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id, fetchDetails]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const amount = parseFloat(bidAmount);
    const currentPrice = Number(
      item?.currentBid > 0 ? item.currentBid : item?.startingBid,
    );

    if (!amount || amount <= currentPrice) {
      return setStatus({
        type: "error",
        msg: `Bid must be higher than NPR ${currentPrice.toLocaleString()}`,
      });
    }

    try {
      setIsSubmitting(true);
      // Ensure this endpoint exists in your backend bidRouter
      await api.post(`/bids/place/${id}`, { amount });

      setStatus({ type: "success", msg: "Bid placed successfully!" });
      setBidAmount("");
      fetchDetails();
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Bidding failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">
          Loading Auction Details...
        </p>
      </div>
    );

  if (!item)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Item Not Found</h2>
        <p className="text-slate-500 mb-6">
          The auction you are looking for might have expired or been removed.
        </p>
        <button
          onClick={() => navigate("/auctions")}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          Back to Listings
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="px-6 lg:px-24 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Back to Listings
        </button>
      </nav>

      <main className="px-6 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image and History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm overflow-hidden">
            <img
              src={item.image?.url}
              alt={item.title}
              className="w-full h-[500px] object-cover rounded-[2rem] hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-200">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <History size={20} className="text-blue-600" /> Bidding History
            </h3>
            <div className="space-y-3">
              {item.bids && item.bids.length > 0 ? (
                item.bids.map((bid, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-700">
                        {bid.userName || "Anonymous Bidder"}
                      </span>
                    </div>
                    <span className="font-black text-blue-600">
                      NPR {Number(bid.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No bids have been placed yet. Be the first!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Information and Bidding Action */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
              {item.category} • {item.condition}
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight">
              {item.title}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black mb-1 uppercase tracking-widest">
                Current Price
              </p>
              <p className="text-2xl font-black text-blue-600">
                NPR{" "}
                {Number(item.currentBid || item.startingBid).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black mb-1 uppercase tracking-widest">
                Status
              </p>
              <div className="flex items-center gap-2 text-xl font-black text-orange-600">
                <Timer size={20} className="animate-pulse" /> {item.status}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20">
            <h3 className="text-xl font-bold mb-6">Place a Bid</h3>
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  NPR
                </span>
                <input
                  type="number"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. ${Number(item.currentBid || item.startingBid).toLocaleString()}`}
                  className="w-full bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-5 pl-16 pr-6 font-bold outline-none transition-all 
  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {status.msg && (
                <div
                  className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                    status.type === "error"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  <AlertCircle size={16} /> {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || item.status !== "Live"}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl flex items-center justify-center transition-all transform active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit Bid"
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">
                By bidding, you agree to our terms of service
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuctionDetails;
