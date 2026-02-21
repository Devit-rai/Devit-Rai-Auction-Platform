import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gavel, ChevronRight, UserPlus, Trophy, Shield,
  Zap, Clock, Star, ArrowUpRight, Check,
  TrendingUp, Users, Package, Award, Heart,
} from "lucide-react";

const getRole = (userObj) => {
  if (!userObj) return null;
  const raw = userObj.role || userObj.user?.role || (Array.isArray(userObj.roles) ? userObj.roles[0] : null);
  return raw?.replace("ROLE_", "").toUpperCase();
};

const FEATURED = [
  {
    img:   "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600",
    title: "Vintage Timepiece",
    cat:   "Watches",
    price: "NPR 12,500",
    bids:  45,
    time:  "2h 15m",
  },
  {
    img:   "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600",
    title: "Abstract Oil Painting",
    cat:   "Fine Art",
    price: "NPR 45,000",
    bids:  12,
    time:  "5h 10m",
  },
  {
    img:   "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=600",
    title: "Classic Sports Car",
    cat:   "Vehicles",
    price: "NPR 25,00,000",
    bids:  89,
    time:  "21h 05m",
  },
];

const TESTIMONIALS = [
  {
    name:   "Arjun Shrestha",
    role:   "Collector",
    avatar: "A",
    color:  "bg-indigo-100 text-indigo-700",
    text:   "I won a rare antique piece I'd been hunting for years. The bidding process was smooth and completely transparent.",
    stars:  5,
  },
  {
    name:   "Priya Tamang",
    role:   "Seller",
    avatar: "P",
    color:  "bg-emerald-100 text-emerald-700",
    text:   "Listed my vintage jewelry collection and sold everything within 48 hours. The platform is incredibly easy to use.",
    stars:  5,
  },
  {
    name:   "Rohan Karki",
    role:   "Bidder",
    avatar: "R",
    color:  "bg-amber-100 text-amber-700",
    text:   "Real-time bidding is exhilarating. I've won 4 auctions so far and each experience has been seamless.",
    stars:  5,
  },
];

const STATS = [
  { icon: Package, value: "10,000+", label: "Items Auctioned",  color: "text-indigo-600 bg-indigo-50"  },
  { icon: Users,   value: "25,000+", label: "Active Bidders",   color: "text-emerald-600 bg-emerald-50" },
  { icon: Trophy,  value: "98%",     label: "Satisfaction Rate", color: "text-amber-600 bg-amber-50"    },
  { icon: Shield,  value: "100%",    label: "Verified Sellers",  color: "text-rose-600 bg-rose-50"      },
];

const FeaturedCard = ({ item, onCTA }) => (
  <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl transition-all duration-300 flex flex-col">
    <div className="relative h-52 overflow-hidden">
      <img src={item.img} alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
        </span>
      </div>

      {/* Bid count */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          {item.bids} bids
        </span>
      </div>
    </div>

    <div className="p-4 flex flex-col flex-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{item.cat}</p>
      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors mb-auto">{item.title}</h3>
      <div className="h-px bg-slate-100 my-3" />
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] text-slate-400">Current Bid</p>
          <p className="text-sm font-black text-slate-900">{item.price}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Time Left</p>
          <p className="text-xs font-bold text-slate-700">{item.time}</p>
        </div>
      </div>
      <button onClick={onCTA}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all group/btn">
        Place Bid <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  </div>
);

const StepCard = ({ n, icon: Icon, title, desc, color }) => (
  <div className="relative flex flex-col items-center text-center">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 shadow-sm relative`}>
      <Icon size={22} className="text-white" />
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[11px] font-black text-slate-700 shadow-sm">
        {n}
      </div>
    </div>
    <h3 className="text-sm font-black text-slate-800 mb-1.5">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{desc}</p>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (saved) {
      const obj = JSON.parse(saved);
      setUser(obj);
      const role = getRole(obj);
      navigate(role === "SELLER" ? "/seller-dashboard" : "/user-dashboard");
    }
  }, [navigate]);

  const handleCTA = () => navigate(user ? "/user-dashboard" : "/login");

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-slate-900">

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gavel size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">BidHub</span>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "How It Works", href: "#how" },
              { label: "Auctions",     href: "#auctions" },
              { label: "Why BidHub",   href: "#why" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition">
                {label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/login")}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition rounded-lg hover:bg-slate-50">
              Log In
            </button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200">
              Get Started <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-10 items-center">

        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Auctions Running Now
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Auction Platform.<br />
            <span className="text-indigo-600">Bid Smarter.</span><br />
            <span className="text-slate-400">Win Faster.</span>
          </h1>

          <p className="text-slate-500 text-base leading-relaxed max-w-md">
            Experience the thrill of live auctions. Discover rare items, place real-time bids,
            and secure the best deals — all in one trusted platform.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleCTA}
              className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-slate-200 hover:-translate-y-0.5 group">
              Start Bidding <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-white text-slate-700 text-sm font-bold px-6 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition">
              <UserPlus size={14} /> Sign Up Free
            </button>
          </div>

        </div>

        {/* hero image card */}
        <div className="relative group">
          {/* Glow */}
          <div className="absolute -inset-3 bg-indigo-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />

          <div className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/60">
            <div className="h-80 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"
                alt="Featured Auction"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-[10px] mb-0.5">Watches · 45 bids</p>
                  <h3 className="text-white font-black text-xl leading-tight">Premium Watch Collection</h3>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-[10px]">Current Bid</p>
                  <p className="text-white font-black text-lg">NPR 12,500</p>
                </div>
              </div>
            </div>

            {/* Floating time badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
              <Clock size={12} className="text-red-500" />
              <span className="text-xs font-bold text-slate-800">2h 15m left</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-screen-xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="auctions" className="max-w-screen-xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Right Now
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Live Auctions</h2>
            <p className="text-slate-400 text-sm mt-1">Rare finds ending soon — don't miss out.</p>
          </div>
          <button onClick={handleCTA}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
            View All <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED.map((item, i) => (
            <FeaturedCard key={i} item={item} onCTA={handleCTA} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-y border-slate-200">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-2xl font-black text-slate-900">How It Works</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Get started in minutes. Register, bid, and win — it's that simple.</p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-7 left-[22%] right-[22%] h-px bg-slate-200 z-0" />

            {[
              { n: 1, icon: UserPlus, color: "bg-indigo-600", title: "Create Account",   desc: "Sign up for free in under 60 seconds. No credit card required." },
              { n: 2, icon: Gavel,    color: "bg-emerald-500", title: "Browse & Bid",    desc: "Explore hundreds of live auctions and place competitive real-time bids." },
              { n: 3, icon: Trophy,   color: "bg-amber-500",   title: "Win & Collect",   desc: "Win your item, complete secure payment, and enjoy full buyer protection." },
            ].map((s) => (
              <StepCard key={s.n} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why" className="max-w-screen-xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left image */}
          <div className="relative rounded-2xl overflow-hidden h-[400px] shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"
              alt="Why BidHub"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Floating stat card */}
            <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Most Trusted Auction Platform</p>
              </div>
            </div>
          </div>

          {/* Right features */}
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                The smarter way to<br />buy and sell at auction.
              </h2>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm">
                BidHub brings together verified sellers and serious buyers on a platform built for transparency, trust, and real-time excitement.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Shield,    color: "bg-emerald-50 text-emerald-600", title: "Verified Sellers Only",    desc: "Every seller is reviewed and verified before they can list." },
                { icon: Zap,       color: "bg-indigo-50 text-indigo-600",   title: "Real-Time Live Bidding",   desc: "Live countdowns and instant bid updates so you never miss a beat." },
                { icon: Heart,     color: "bg-rose-50 text-rose-600",       title: "Save & Watch Items",       desc: "Wishlist your favourite items and get notified before they end." },
                { icon: TrendingUp,color: "bg-amber-50 text-amber-600",     title: "Full Bid Transparency",    desc: "See complete bid history and pricing trends before committing." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Real Stories</p>
            <h2 className="text-2xl font-black text-slate-900">What Our Users Say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#F4F5F7] rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={12} fill="#f59e0b" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center font-black text-xs`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller */}
      <section className="max-w-screen-xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Buyer */}
          <div className="relative bg-indigo-600 rounded-2xl p-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 left-16 w-24 h-24 bg-indigo-500/40 rounded-full pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Gavel size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Ready to Bid?</h3>
              <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                Join thousands of bidders finding unique items at great prices every day.
              </p>
              <ul className="space-y-1.5 mb-6">
                {["Free to register", "Bid on 1,000+ items", "Secure payment guaranteed"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/80">
                    <Check size={12} className="text-emerald-300 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleCTA}
                className="flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-50 transition shadow-lg group">
                Start Bidding <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Seller CTA */}
          <div className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/3 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 left-16 w-24 h-24 bg-slate-800/60 rounded-full pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Award size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Sell Your Items</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                List your items for free and reach thousands of verified buyers actively bidding.
              </p>
              <ul className="space-y-1.5 mb-6">
                {["Free to list", "Reach 25,000+ buyers", "Instant payment on win"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <Check size={12} className="text-indigo-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-white text-slate-900 font-black text-sm px-6 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-lg group">
                Become a Seller <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                  <Gavel size={12} className="text-white" />
                </div>
                <span className="text-sm font-black text-slate-900">BidHub</span>
              </div>
              <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                Real-time auction marketplace. All listings verified and secured.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { heading: "Platform", links: ["How It Works", "Browse Auctions", "Sell Items"] },
                { heading: "Support",  links: ["Help Center", "Contact Us", "Terms & Privacy"] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">{heading}</p>
                  <div className="space-y-1.5">
                    {links.map((l) => (
                      <button key={l} className="block text-xs text-slate-400 hover:text-indigo-600 transition text-left">{l}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 mt-7 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">© 2025 BidHub. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["Terms", "Privacy", "Cookies"].map((l) => (
                <button key={l} className="text-[11px] text-slate-400 hover:text-indigo-600 transition">{l}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;