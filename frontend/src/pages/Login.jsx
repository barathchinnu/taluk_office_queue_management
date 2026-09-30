import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Lock,
  Mail,
  ShieldCheck,
  Briefcase,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const [activeTab, setActiveTab] = useState("citizen"); // citizen, officer, admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError("");
    if (role === "admin") {
      setEmail("admin@talukoffice.com");
      setPassword("admin123");
    } else if (role === "officer") {
      setEmail("officer@test.com");
      setPassword("officer123");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await login(email, password);

      if (res.success) {
        const userRole = res.user.role;
        const from = location.state?.from?.pathname;

        if (from) {
          navigate(from, { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "officer") {
          navigate("/officer");
        } else {
          navigate("/citizen");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-gov-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Taluk Office Sign In
          </h2>
          <p className="text-xs text-slate-500">
            Secure single-window authentication for citizens & revenue officers
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleTabChange("citizen")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "citizen"
                ? "bg-white text-gov-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Citizen
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("officer")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "officer"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Officer
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "admin"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Quick Demo Pre-fill Pill */}
        {activeTab !== "citizen" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-900">
              Demo
            </span>
            <span>
              Pre-filled credentials for {activeTab === "admin" ? "Taluk Administrator" : "Revenue Officer (OFF002)"}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In as {activeTab.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have a citizen account?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
