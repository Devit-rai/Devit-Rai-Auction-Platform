import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Gavel, Mail, Lock, ArrowLeft, Eye, EyeOff,
  CheckCircle, RotateCcw, ChevronDown, KeyRound,
} from "lucide-react";
import { toast } from "react-hot-toast";

const OtpDropdown = ({ value, onChange, onVerify, onResend, countdown, loading }) => {
  const clean = (value || "").replace(/[^0-9]/g, "").slice(0, 6);
  const filled = clean.length;

  return (
    <div className="mt-3 rounded-2xl border-2 border-indigo-200 overflow-hidden"
      style={{ animation: "dropDown 0.18s ease-out" }}>
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
        <Mail size={13} className="text-white" />
        <p className="text-xs font-bold text-white">Enter the 6-digit code sent to your email</p>
      </div>

      <div className="bg-indigo-50 p-5 space-y-4">

        <div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="e.g. 123456"
            value={clean}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            maxLength={6}
            autoFocus
            className="w-full px-4 py-4 text-center text-2xl font-black tracking-[0.5em] bg-white border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition text-indigo-700 placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
          />
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${(filled / 6) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right mt-1 font-medium">{filled}/6 digits</p>
        </div>

        {/* Verify button */}
        <button
          type="button"
          onClick={onVerify}
          disabled={loading || filled < 6}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><CheckCircle size={14} /> Verify OTP</>}
        </button>

        {/* Resend */}
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            disabled={countdown > 0 || loading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <RotateCcw size={11} />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

      </div>
    </div>
  );
};

const StrengthBar = ({ password }) => {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  const levels = [
    { label: "Too weak",  bar: "bg-red-400", text: "text-red-500" },
    { label: "Weak", bar: "bg-amber-400", text: "text-amber-500" },
    { label: "Fair", bar: "bg-blue-400", text: "text-blue-500" },
    { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
  ];
  const { label, bar, text } = levels[Math.min(score, 3)];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? bar : "bg-slate-100"}`} />
        ))}
      </div>
      <p className={`text-[11px] font-bold ${text}`}>{label}</p>
    </div>
  );
};

const ForgetPassword = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
  const loggedInEmail = userData?.user?.email || userData?.email || "";

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [email, setEmail] = useState(loggedInEmail);
  const isLoggedIn = !!loggedInEmail;

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* Send OTP */
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const targetEmail = isLoggedIn ? loggedInEmail : email.trim().toLowerCase();
    if (!targetEmail) return toast.error("Email address is required");
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email: targetEmail });
      toast.success("OTP sent to your email!");
      setOtpSent(true);
      setCountdown(60);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* Verify OTP  */
  const handleVerifyOtp = () => {
    const clean = (otp || "").replace(/[^0-9]/g, "");
    if (clean.length !== 6) return toast.error("Please enter all 6 digits");
    setVerifiedCode(clean);
    setOtpVerified(true);
    setOtpSent(false);
    toast.success("Code accepted! Now set your new password.");
  };

  /* Resend OTP */
  const handleResend = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("Enter a new password");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    const targetEmail = isLoggedIn ? loggedInEmail : email.trim().toLowerCase();

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email: targetEmail,
        code: verifiedCode,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully!");
      navigate(isLoggedIn ? "/profile" : "/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      toast.error(msg);
      // OTP expired/wrong — re-show OTP entry
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("code")) {
        setOtpVerified(false);
        setOtpSent(true);
        setOtp("");
        setVerifiedCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  const pwMatch = confirmPassword && confirmPassword === newPassword;
  const pwMismatch = confirmPassword && confirmPassword !== newPassword;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4 py-10 font-sans">

      {/* Logo */}
      <button onClick={() => navigate(isLoggedIn ? "/user-dashboard" : "/")}
        className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
          <Gavel size={17} className="text-white" />
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tight">BidHub</span>
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8">

          {/* Back */}
          <button
            onClick={() => isLoggedIn ? navigate(-1) : navigate("/login")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition mb-7 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            {isLoggedIn ? "Back to profile" : "Back to login"}
          </button>

          {/* Header */}
          <div className="mb-7">
            <div className="w-14 h-14 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-sm text-slate-400 mt-1.5">
              {isLoggedIn
                ? "Reset the password for your account."
                : "Enter your email to receive a reset code."}
            </p>
          </div>

          {!otpVerified && (
            <div className="space-y-4">

              {/* Email field */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                {isLoggedIn ? (
                  /* Locked to logged-in email */
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{loggedInEmail}</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full flex-shrink-0">
                      Your account
                    </span>
                  </div>
                ) : (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                  />
                )}
              </div>

              {/* Send / Resend OTP button */}
              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-100">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    : <>Send OTP <Mail size={14} /></>}
                </button>
              ) : (
                /* OTP sent indicator */
                <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">OTP sent to your email</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1">
                    <RotateCcw size={10} />
                    {countdown > 0 ? `${countdown}s` : "Resend"}
                  </button>
                </div>
              )}
              {otpSent && (
                <OtpDropdown
                  value={otp}
                  onChange={setOtp}
                  onVerify={handleVerifyOtp}
                  onResend={handleResend}
                  countdown={countdown}
                  loading={loading}
                />
              )}

            </div>
          )}

          {otpVerified && (
            <form onSubmit={handleResetPassword} className="space-y-5">

              {/* Verified badge */}
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-1">
                <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-700">Identity verified — set your new password</p>
              </div>

              {/* New password */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoFocus
                    className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={newPassword} />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full px-4 py-3 pr-11 bg-slate-50 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none transition border-2 ${
                      pwMatch    ? "border-emerald-400 bg-emerald-50/30"
                      : pwMismatch ? "border-red-300 bg-red-50/20"
                                  : "border-slate-200 focus:border-indigo-400"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwMatch && <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1"><CheckCircle size={11} /> Passwords match</p>}
                {pwMismatch && <p className="text-[11px] text-red-500 font-bold mt-1.5">Passwords do not match</p>}
              </div>

              {/* Requirements */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                {[
                  ["At least 8 characters",         newPassword.length >= 8],
                  ["At least one uppercase letter",  /[A-Z]/.test(newPassword)],
                  ["At least one number",            /\d/.test(newPassword)],
                  ["At least one special character", /[^a-zA-Z0-9]/.test(newPassword)],
                ].map(([txt, met]) => (
                  <div key={txt} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition ${met ? "bg-emerald-100" : "bg-slate-200"}`}>
                      {met
                        ? <CheckCircle size={10} className="text-emerald-600" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block" />}
                    </div>
                    <span className={`text-xs transition ${met ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>{txt}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                  : <><Lock size={14} /> Reset Password</>}
              </button>

              <p className="text-center text-xs text-slate-400">
                Wrong code?{" "}
                <button type="button"
                  onClick={() => { setOtpVerified(false); setOtpSent(true); setOtp(""); setVerifiedCode(""); }}
                  className="font-bold text-indigo-600 hover:underline">
                  Re-enter OTP
                </button>
              </p>
            </form>
          )}

        </div>

        {!isLoggedIn && (
          <p className="text-center text-xs text-slate-400 mt-5">
            Remember your password?{" "}
            <button onClick={() => navigate("/login")} className="font-bold text-indigo-600 hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;