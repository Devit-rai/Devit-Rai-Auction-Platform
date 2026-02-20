import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, UserPlus, Trophy, ChevronRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      setUser(userObj);

      const role = getRole(userObj);
      if (role === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [navigate]);

  const handleAuthAction = () => {
    if (user) {
      // Logic to determine dashboard based on role
      const userRole = Array.isArray(user.roles) ? user.roles[0] : user.role;
      if (userRole === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 lg:px-24 py-5 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Gavel size={18} />
          </div>
          <span className="text-xl font-bold text-indigo-900 tracking-tight">
            Auction
          </span>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:opacity-90 transition"
        >
          Log In/Sign Up
        </button>
      </nav>

      {/* --- Hero Section --- */}
      <section className="px-6 lg:px-24 pt-12 pb-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Auction Platform. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Win Faster.
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md">
            Experience the thrill of live auctions, find unique items, and
            secure the best deals in real-time.
          </p>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-100 hover:scale-105 transition">
              Start Bidding →
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://autoimage.capitalone.com/cms/Auto/assets/images/1405-hero-how-to-buy-a-car-at-auction.jpg"
              alt="Auction"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* --- Featured Live Auctions --- */}
      <section id="auctions" className="px-6 lg:px-24 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Live Auctions</h2>
            <p className="text-slate-400">Discover rare finds ending soon.</p>
          </div>
          <button className="text-indigo-600 font-bold flex items-center gap-1 text-sm">
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <AuctionCard
            img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"
            title="Vintage Watch"
            price="NPR 12,500"
            bids="45"
            time="02h 15m 30s"
          />
          <AuctionCard
            img="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600"
            title="Rare Painting"
            price="NPR 45,000"
            bids="12"
            time="05h 10m 00s"
          />
          <AuctionCard
            img="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=600"
            title="Classic Car"
            price="NPR 2,500,000"
            bids="89"
            time="21h 05m 10s"
          />
        </div>
      </section>

      {/* --- How It Works --- */}
      <section className="px-6 lg:px-24 py-20 text-center bg-white">
        <h2 className="text-3xl font-bold mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Step
            icon={<UserPlus />}
            step="1"
            title="Register"
            desc="Create your account to start your journey."
          />
          <Step
            icon={<Gavel />}
            step="2"
            title="Bid"
            desc="Place your bids on items you love."
          />
          <Step
            icon={<Trophy />}
            step="3"
            title="Win"
            desc="Win the auction and claim your item."
          />
        </div>
      </section>
    </div>
  );
};

// Sub-components
const AuctionCard = ({ img, title, price, bids, time }) => (
  <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
    <div className="relative rounded-2xl overflow-hidden mb-4">
      <img
        src={img}
        alt={title}
        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <div className="flex justify-between text-xs text-slate-400 mt-1 mb-4">
      <p>
        Current Bid: <span className="font-bold text-slate-700">{price}</span>
      </p>
      <p>
        Bids: <span className="font-bold text-slate-700">{bids}</span>
      </p>
    </div>
    <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm transition">
      Place Bid
    </button>
  </div>
);

const Step = ({ icon, step, title, desc }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6 relative">
      {React.cloneElement(icon, { size: 28 })}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
        {step}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-[200px]">{desc}</p>
  </div>
);

export default Landing;
