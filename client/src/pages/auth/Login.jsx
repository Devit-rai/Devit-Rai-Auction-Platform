import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Fixed: Added the missing state variable
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getRole = (data) => {
    let role =
      data.role ||
      data.roles?.[0] ||
      data.authorities?.[0] ||
      data.user?.role ||
      data.user?.roles?.[0] ||
      data.user?.authorities?.[0];

    return role?.toString().replace("ROLE_", "").toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      const userData = res.data;

      sessionStorage.setItem("user", JSON.stringify(userData));

      // Extract role using your helper function
      const role = getRole(userData);

      if (role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (role === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#e2e8f0,_#ffffff)]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

        <div className="p-8 lg:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <LogIn className="text-white" size={30} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-bold bg-red-50 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group mt-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              {!loading && (
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
