import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const Verify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  
  // Notification State for the Pop-out
  const [notification, setNotification] = useState({ show: false, msg: '', type: '' });

  const email = localStorage.getItem('tempEmail') || 'your email';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to trigger the pop-out message
  const triggerNotify = (msg, type) => {
    setNotification({ show: true, msg, type });
    // Hide after 4 seconds
    setTimeout(() => setNotification({ ...notification, show: false }), 4000);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const verificationCode = otp.join('');
    try {
      const res = await api.post('/auth/verify-email', { email, verificationCode });
      
      triggerNotify(res.data.message || "Email verified successfully!", "success");
      
      // Navigate after a delay to let them see the pop-out
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      triggerNotify(err.response?.data?.message || "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      setTimer(59);
      triggerNotify("A new code has been sent to your email", "success");
    } catch (err) {
      triggerNotify("Failed to resend code.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- POP-OUT HEADER NOTIFICATION --- */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${
        notification.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          notification.type === 'success' 
            ? 'bg-white border-green-100 text-green-700' 
            : 'bg-white border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm tracking-tight">{notification.msg}</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative z-10">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
        <div className="p-8 lg:p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Mail size={40} />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify email</h2>
          <p className="text-slate-500 mt-3 px-4">
            Sent to <span className="font-semibold text-slate-800 italic">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div className="flex justify-center gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify Account"}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50">
            <button 
              onClick={handleResend}
              disabled={timer > 0}
              className={`mt-2 font-bold flex items-center justify-center gap-2 mx-auto transition-colors ${timer > 0 ? 'text-slate-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <RefreshCcw size={16} className={timer > 0 ? '' : 'animate-spin-slow'} />
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;