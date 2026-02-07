import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, Mail, Lock, Briefcase, Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['USER'], 
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, roles: [role] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      localStorage.setItem('tempEmail', formData.email); // Store for verify page
      navigate('/verify');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#e2e8f0,_#ffffff)]">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

        <div className="p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2">Join the marketplace and start exploring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Select Your Account Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'USER', label: 'Buyer', icon: User },
                  { id: 'SELLER', label: 'Seller', icon: Briefcase },
                  { id: 'ADMIN', label: 'Admin', icon: ShieldAlert },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      formData.roles.includes(role.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <role.icon size={22} />
                    <span className="text-xs font-bold uppercase tracking-wider">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input name="name" type="text" required onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Alex Doe" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input name="email" type="email" required onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="alex@example.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input name="password" type={showPass ? "text" : "password"} required minLength={8} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input name="confirmPassword" type="password" required onChange={handleChange} className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 transition-all ${error.includes('match') ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'}`} placeholder="••••••••" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;