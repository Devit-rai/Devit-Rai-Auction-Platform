import React, { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BidHistory = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const user = userData?.user || userData;

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auctions/all");
        const myItems = (data.items || []).filter(item => item.createdBy === user?._id);
        
        const flattenedBids = myItems.flatMap(item => 
          (item.bids || []).map(bid => ({
            bidderName: bid.bidderName || bid.userName || "Anonymous",
            amount: Number(bid.bidAmount || bid.amount || 0),
            itemTitle: item.title,
            itemImage: item.image?.url,
            category: item.category,
            bidTime: bid.createdAt
          }))
        ).sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

        setBids(flattenedBids);
      } catch (err) {
        console.error("Error fetching bid history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchFullHistory();
  }, [user?._id]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm mb-6">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bid Activity</h1>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Bidder</th>
                  <th className="px-8 py-5">Auction Item</th>
                  <th className="px-8 py-5">Amount</th>
                  {/* Date column removed */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan="3" className="py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                ) : bids.length === 0 ? (
                  <tr><td colSpan="3" className="py-20 text-center text-slate-400 font-bold italic">No bids recorded yet.</td></tr>
                ) : bids.map((bid, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                          {bid.bidderName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{bid.bidderName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img src={bid.itemImage} className="w-10 h-10 rounded-lg object-cover bg-slate-100" alt="" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm truncate max-w-[250px]">{bid.itemTitle}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">{bid.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-blue-600 font-black text-sm">NPR {bid.amount.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidHistory;