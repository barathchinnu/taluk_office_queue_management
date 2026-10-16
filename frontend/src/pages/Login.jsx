import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { authService } from "../services/api";
import PortalTitleBar from "../components/PortalTitleBar";
import {
  Building2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Landmark,
  KeyRound,
  Info,
  Smartphone,
} from "lucide-react";

// Helper to generate a realistic 5-character Captcha code
const generateCaptcha = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Login = () => {
  const { login, loginWithOtp } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "mobile_otp" | "email_otp" | "password"
  const [authMode, setAuthMode] = useState("mobile_otp");

  // Form fields
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

  // OTP flow state
  const [otpStep, setOtpStep] = useState(false); // false = enter contact, true = enter OTP
  const [otpValue, setOtpValue] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Refresh captcha
  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setOtpStep(false);
    setOtpValue("");
    setDevOtp("");
    setError("");
    setSuccessMsg("");
    refreshCaptcha();
  };

  // Quick switch role demo credentials in password mode
  const handleQuickRoleSelect = (role) => {
    if (role === "admin") {
      setEmail("admin@talukoffice.com");
      setPassword("admin123");
    } else if (role === "officer") {
      setEmail("officer@test.com");
      setPassword("officer123");
    } else {
      setEmail("citizen@test.com");
      setPassword("citizen123");
    }
    setError("");
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccessMsg("");

    // 1. Validation
    if (authMode === "mobile_otp") {
      const cleanMobile = mobile.replace(/\D/g, "");
      if (cleanMobile.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else if (authMode === "email_otp") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (!otpStep && captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Incorrect security captcha text. Please try again.");
      refreshCaptcha();
      return;
    }

    try {
      setLoading(true);
      const payload = authMode === "mobile_otp" ? { mobile: mobile.trim() } : { email: email.trim().toLowerCase() };
      const res = await authService.sendOtp(payload);

      if (res.success) {
        setOtpStep(true);
        setOtpValue("");
        setDevOtp(res.devOtp || "");
        setResendTimer(30);
        setSuccessMsg(
          authMode === "mobile_otp"
            ? `An SMS containing your 6-digit OTP has been sent to +91 ${mobile}. Please check your phone.`
            : `An OTP verification email has been sent to ${email}. Please check your inbox / spam.`
        );
      } else {
        setError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otpValue || otpValue.trim().length < 4) {
      setError("Please enter the OTP verification code.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        otp: otpValue.trim(),
        mobile: authMode === "mobile_otp" ? mobile.trim() : undefined,
        email: authMode === "email_otp" ? email.trim() : undefined,
        fullName: fullName.trim() || undefined,
      };

      const res = await loginWithOtp(payload);
      if (res.success) {
        redirectAfterLogin(res.user?.role);
      } else {
        setError(res.message || "Invalid OTP code.");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const identifier = email.trim();
    if (!identifier || !password) {
      setError("Please enter your registered Email/Mobile and Password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier, password);
      if (res.success) {
        redirectAfterLogin(res.user?.role);
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Password login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = (userRole) => {
    const from = location.state?.from?.pathname || location.state?.returnTo;
    if (from) {
      navigate(from, { replace: true });
    } else if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "officer") {
      navigate("/officer");
    } else {
      navigate("/citizen");
    }
  };

  const requestedServiceName = location.state?.serviceName;

  return (
    <div className="min-h-[85vh] bg-[#f4f7fa] flex flex-col justify-between">
      <div>
        {/* Center Authentication Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
            {/* Login Card Header */}
            <div className="bg-[#0b3b60] text-white p-6 text-center border-b border-[#082a45]">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-amber-300">
                <Landmark className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                Login to Citizen Portal
              </h1>
              <p className="text-xs text-slate-200 mt-1">
                Access Tamil Nadu Smart Government Services & Taluk Office Desks
              </p>
            </div>

            {/* Optional Banner if redirected from service modal to book token */}
            {requestedServiceName && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-semibold">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Please sign in to book your queue token for{" "}
                  <strong className="text-slate-900 font-bold">{requestedServiceName}</strong>.
                </span>
              </div>
            )}

            {/* Auth Method Navigation Tabs */}
            <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => handleModeChange("mobile_otp")}
                className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                  authMode === "mobile_otp"
                    ? "bg-white text-gov-800 border-gov-700 font-extrabold shadow-2xs"
                    : "border-transparent hover:bg-slate-200/70"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-gov-700" />
                <span>Mobile OTP</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("email_otp")}
                className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                  authMode === "email_otp"
                    ? "bg-white text-gov-800 border-gov-700 font-extrabold shadow-2xs"
                    : "border-transparent hover:bg-slate-200/70"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-gov-700" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("password")}
                className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                  authMode === "password"
                    ? "bg-white text-gov-800 border-gov-700 font-extrabold shadow-2xs"
                    : "border-transparent hover:bg-slate-200/70"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-gov-700" />
                <span>Password</span>
              </button>
            </div>

            {/* Login Card Form Body */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Alert Messages */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FLOW 1: MOBILE OTP */}
              {authMode === "mobile_otp" && (
                <>
                  {!otpStep ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number *
                        </label>
                        <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-gov-700 focus-within:border-transparent overflow-hidden bg-white">
                          <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 text-xs font-bold border-r border-slate-300">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            placeholder="Enter 10-digit mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          OTP will be sent to this number for instant authentication.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Citizen Name <span className="font-normal text-slate-400 lowercase">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-700 focus:border-transparent focus:outline-hidden bg-white"
                        />
                      </div>

                      {/* Captcha Section */}
                      <div className="pt-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Security Code *
                        </label>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="px-5 py-2.5 rounded-xl bg-slate-800 text-amber-300 font-mono text-lg font-black tracking-widest select-none shadow-inner border border-slate-700">
                            {captchaCode}
                          </div>
                          <button
                            type="button"
                            onClick={refreshCaptcha}
                            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Refresh security code"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="Enter security code shown above"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold uppercase tracking-wider focus:ring-2 focus:ring-gov-700 focus:border-transparent focus:outline-hidden bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || mobile.length !== 10}
                        className="w-full py-3 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Enter OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      {/* Real-time SMS Sent Notice Card */}
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <Smartphone className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                                SMS Dispatched to Mobile
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                5 Mins Validity
                              </span>
                            </div>
                            <p className="text-xs text-emerald-900 font-medium mt-1 leading-relaxed">
                              A 6-digit OTP verification code has been sent via SMS to:
                            </p>
                            <div className="text-base font-bold text-emerald-950 tracking-wide font-mono mt-0.5">
                              +91 {mobile}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-emerald-200/80 text-emerald-800">
                          <span>Please check your phone's SMS messages</span>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep(false);
                              setOtpValue("");
                            }}
                            className="text-gov-700 hover:text-gov-900 underline font-bold cursor-pointer"
                          >
                            Change Number
                          </button>
                        </div>
                      </div>

                      {/* Development Mode Helper Card (When real SMS gateway key is not yet set in .env) */}
                      {devOtp && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 animate-in fade-in shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                                Development Gateway OTP:
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtpValue(devOtp)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                            >
                              Auto-Fill OTP
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-800">Generated code:</span>
                            <span className="font-mono font-black text-xl text-slate-950 tracking-widest bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs">
                              {devOtp}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-800 leading-tight pt-1.5 border-t border-amber-200">
                            💡 <em>Note:</em> To receive physical SMS on your mobile handset, add your free Fast2SMS API key in <code className="bg-amber-100 font-mono font-bold px-1 rounded">backend/.env</code>.
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Enter 6-Digit OTP *
                          </label>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {otpValue.length}/6 digits
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="• • • • • •"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-3 text-center text-2xl font-mono font-black tracking-widest rounded-xl border-2 border-gov-700 focus:outline-hidden bg-white text-slate-900 shadow-inner"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 text-[11px]">
                          Didn't receive code?
                        </span>

                        {resendTimer > 0 ? (
                          <span className="text-slate-400 font-medium">
                            Resend in <strong>{resendTimer}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-gov-700 hover:underline font-bold cursor-pointer"
                          >
                            Resend New OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpValue.length < 6}
                        className="w-full py-3 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify & Login"}
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* FLOW 2: EMAIL OTP */}
              {authMode === "email_otp" && (
                <>
                  {!otpStep ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="citizen@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-700 focus:border-transparent focus:outline-hidden bg-white"
                        />
                      </div>

                      {/* Captcha */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Security Code *
                        </label>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="px-5 py-2.5 rounded-xl bg-slate-800 text-amber-300 font-mono text-lg font-black tracking-widest select-none shadow-inner border border-slate-700">
                            {captchaCode}
                          </div>
                          <button
                            type="button"
                            onClick={refreshCaptcha}
                            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="Enter security code"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold uppercase tracking-wider focus:ring-2 focus:ring-gov-700 focus:outline-hidden bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-3 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "Sending..." : "Send OTP to Email"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verify Email OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      {/* Real-time Email Sent Notice Card */}
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gov-700 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <Mail className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
                                Email Verification Dispatched
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                                5 Mins Validity
                              </span>
                            </div>
                            <p className="text-xs text-blue-900 font-medium mt-1 leading-relaxed">
                              A 6-digit OTP verification code has been dispatched to:
                            </p>
                            <div className="text-sm font-bold text-blue-950 tracking-wide font-mono mt-0.5 break-all">
                              {email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-blue-200/80 text-blue-800">
                          <span>Please check your inbox & spam folder</span>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep(false);
                              setOtpValue("");
                            }}
                            className="text-gov-700 hover:text-gov-900 underline font-bold cursor-pointer"
                          >
                            Change Email
                          </button>
                        </div>
                      </div>

                      {/* Development Mode Helper Card (When real email SMTP key is not yet set in .env) */}
                      {devOtp && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 animate-in fade-in shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                                Development Gateway OTP:
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtpValue(devOtp)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                            >
                              Auto-Fill OTP
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-800">Generated code:</span>
                            <span className="font-mono font-black text-xl text-slate-950 tracking-widest bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs">
                              {devOtp}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-800 leading-tight pt-1.5 border-t border-amber-200">
                            💡 <em>Note:</em> To deliver emails directly to Gmail/Outlook inboxes, configure SMTP credentials in <code className="bg-amber-100 font-mono font-bold px-1 rounded">backend/.env</code>.
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Enter 6-Digit OTP *
                          </label>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {otpValue.length}/6 digits
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="• • • • • •"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-3 text-center text-2xl font-mono font-black tracking-widest rounded-xl border-2 border-gov-700 focus:outline-hidden bg-white text-slate-900 shadow-inner"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 text-[11px]">
                          Didn't receive email? Check spam
                        </span>

                        {resendTimer > 0 ? (
                          <span className="text-slate-400 font-medium">
                            Resend in <strong>{resendTimer}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-gov-700 hover:underline font-bold cursor-pointer"
                          >
                            Resend New OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpValue.length < 6}
                        className="w-full py-3 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify & Login"}
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* FLOW 3: PASSWORD LOGIN */}
              {authMode === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {/* Demo Credential Quick Selector */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Demo Quick Credentials:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickRoleSelect("citizen")}
                        className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-gov-500 font-semibold text-slate-700 text-[11px] text-center"
                      >
                        Citizen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoleSelect("officer")}
                        className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-gov-500 font-semibold text-slate-700 text-[11px] text-center"
                      >
                        Officer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoleSelect("admin")}
                        className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-gov-500 font-semibold text-slate-700 text-[11px] text-center"
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email or Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. citizen@test.com or 9876543210"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-700 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-700 focus:outline-hidden bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-3 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "Signing in..." : "Login with Password"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Bottom Registration & Assistance Links */}
              <div className="pt-4 border-t border-slate-200 text-center space-y-2 text-xs">
                <p className="text-slate-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-gov-800 hover:text-gov-950 underline"
                  >
                    Create Citizen Account
                  </Link>
                </p>

                <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
                  <Link to="/track" className="hover:underline">
                    Track Application
                  </Link>
                  <span>•</span>
                  <Link to="/" className="hover:underline">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
