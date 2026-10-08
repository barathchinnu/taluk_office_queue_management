import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  User,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Landmark,
  FileCheck,
} from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Full name validation
    if (!formData.fullName.trim()) {
      setError(
        language === "ta"
          ? "தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்."
          : "Please enter your full name as per official records."
      );
      return;
    }

    // Phone validation (10 digits)
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      setError(
        language === "ta"
          ? "தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்."
          : "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError(
        language === "ta"
          ? "தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்."
          : "Please enter a valid email address."
      );
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError(
        language === "ta"
          ? "கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் கொண்டிருக்க வேண்டும்."
          : "Password must be at least 6 characters in length."
      );
      return;
    }

    // Confirm password check
    if (formData.password !== formData.confirmPassword) {
      setError(
        language === "ta"
          ? "கடவுச்சொற்கள் பொருந்தவில்லை. தயவுசெய்து சரிபார்க்கவும்."
          : "Passwords do not match. Please verify both fields."
      );
      return;
    }

    if (!formData.consent) {
      setError(
        language === "ta"
          ? "அரசு சேவை விதிமுறைகளை ஏற்கவும்."
          : "Please accept the portal terms to proceed with account creation."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await register({
        fullName: formData.fullName.trim(),
        phone: cleanedPhone,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: "citizen",
      });

      if (res.success) {
        setSuccess(
          language === "ta"
            ? "குடிமக்கள் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! திசைதிருப்புகிறது..."
            : "Citizen account successfully created! Redirecting to Citizen Portal..."
        );
        setTimeout(() => {
          navigate("/citizen");
        }, 1200);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          (language === "ta"
            ? "கணக்கு உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Unable to create account. Please verify details or try logging in.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Registration Card */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden">
          {/* Card Official Top Header */}
          <div className="bg-[#0b3b60] text-white px-6 py-5 text-center border-b border-[#082a45]">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-amber-300 mb-2 border border-white/20">
              <Landmark className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
              {language === "ta" ? "குடிமக்கள் கணக்கு உருவாக்கம்" : "Create Citizen Account"}
            </h2>
            <p className="text-xs text-slate-200 mt-1 max-w-md mx-auto">
              {language === "ta"
                ? "தமிழ்நாடு அரசு ஸ்மார்ட் சேவை இணையதளம் • நியமனங்கள் மற்றும் வரிசை டோக்கன்கள்"
                : "Tamil Nadu Government • Smart Government Service & Queue Portal"}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Feedback Alerts */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 2-Column Layout on Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
                  >
                    {language === "ta" ? "முழு பெயர்" : "Full Name"} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder={language === "ta" ? "எ.கா. பாரத் குமார்" : "e.g. Barath Kumar"}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === "ta"
                      ? "அரசு அடையாள அட்டையில் உள்ளவாறு உள்ளிடவும்"
                      : "Enter your full name as per Aadhaar / Voter ID"}
                  </span>
                </div>

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
                  >
                    {language === "ta" ? "மொபைல் எண்" : "Mobile Number"} *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold">
                      +91
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={10}
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-r-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === "ta" ? "10 இலக்க எண்" : "10-digit registered number"}
                  </span>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
                  >
                    {language === "ta" ? "மின்னஞ்சல் முகவரி" : "Email Address"} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === "ta" ? "சேவை அறிவிப்புகளுக்கு" : "For acknowledgement & updates"}
                  </span>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
                  >
                    {language === "ta" ? "கடவுச்சொல்" : "Password"} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === "ta" ? "குறைந்தது 6 எழுத்துக்கள்" : "Minimum 6 characters"}
                  </span>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
                  >
                    {language === "ta" ? "கடவுச்சொல்லை உறுதிசெய்க" : "Confirm Password"} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === "ta" ? "மேலே உள்ள கடவுச்சொல்லை மீண்டும் உள்ளிடவும்" : "Re-enter the exact same password"}
                  </span>
                </div>
              </div>

              {/* Citizen Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-[#0b3b60] focus:ring-[#0b3b60]"
                  />
                  <span>
                    {language === "ta"
                      ? "தமிழ்நாடு அரசு இ-சேவை மற்றும் வரிசை மேலாண்மை வழிகாட்டுதல்களை ஏற்றுக்கொள்கிறேன்."
                      : "I agree to the Smart Government Service Portal Terms of Use and Citizen Privacy Guidelines."}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg bg-[#0b3b60] hover:bg-[#082a45] text-white text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === "ta" ? "கணக்கு உருவாக்கப்படுகிறது..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "ta" ? "கணக்கை உருவாக்கு" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="pt-4 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                {language === "ta" ? "ஏற்கனவே கணக்கு உள்ளதா?" : "Already have an account?"}{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#0b3b60] hover:text-[#00809d] underline ml-1"
                >
                  {language === "ta" ? "உள்நுழைய" : "Login"}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security & Academic Disclaimer Footer Note */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official digital citizen registration demonstration portal</span>
          </p>
          <p className="text-[10px] text-slate-400">
            For academic and software demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
