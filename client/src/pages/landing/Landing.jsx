import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gavel, ShieldCheck, Zap, Globe, ArrowRight, TrendingUp, LogOut, User as UserIcon } from 'lucide-react';
import api from '../../api/axios';

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); // Clears HTTP-only cookie
      localStorage.removeItem('user'); // Clears local state
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- Navigation --- */}
      <nav className="flex items-center justify-between px-8 lg:px-24 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Gavel size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter">AUCTION</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition">Explore</a>
          <a href="#" className="hover:text-blue-600 transition">How it Works</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <UserIcon size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-700">{user.name.split(' ')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              
              <button 
                onClick={() => navigate('/signup')}
                className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-black transition-all shadow-xl shadow-slate-200"
              >
                Join Now
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="px-8 lg:px-24 pt-16 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <TrendingUp size={14} /> The Future of Bidding
          </div>
          <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Collect the <br /> 
            <span className="text-blue-600">Unattainable.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
            A premium marketplace for rare watches, fine art, and digital assets. 
            Experience real-time bidding with verified sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group">
              Start Bidding <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-slate-100 hover:bg-slate-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all">
              View Live Auctions
            </button>
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="bg-slate-900 py-32 px-8 lg:px-24 rounded-[60px] mx-4 text-white">
        <div className="grid md:grid-cols-3 gap-16">
          <FeatureCard 
            icon={<ShieldCheck className="text-blue-400" size={32} />}
            title="Verified Authenticity"
            desc="Every item on our platform undergoes a rigorous multi-step verification process by experts."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-400" size={32} />}
            title="Instant Bidding"
            desc="Our ultra-low latency engine ensures you never miss a bid. Real-time updates across all devices."
          />
          <FeatureCard 
            icon={<Globe className="text-emerald-400" size={32} />}
            title="Global Access"
            desc="Secure shipping and insurance for items bought from anywhere in the world."
          />
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-32 px-8 text-center">
        <h2 className="text-5xl font-black mb-6">Ready to find something <span className="text-blue-600">unique?</span></h2>
        <p className="text-slate-500 max-w-xl mx-auto mb-10 text-lg">
          Join thousands of sellers and buyers in the world's most trusted auction marketplace.
        </p>
        <button 
          onClick={() => navigate(user ? '/auctions' : '/signup')}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-blue-200"
        >
          {user ? 'Explore Auctions' : 'Create Your Account'}
        </button>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="space-y-4">
    <div className="mb-6">{icon}</div>
    <h3 className="text-2xl font-bold">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Landing;