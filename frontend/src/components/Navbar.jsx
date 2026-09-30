import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Ticket,
  Calendar,
  Monitor,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Briefcase,
  Users,
  Clock,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top tricolor header accent */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-amber-500"></div>
        <div className="w-1/3 bg-slate-100"></div>
        <div className="w-1/3 bg-emerald-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gov-700 via-indigo-900 to-gov-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Taluk Office
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Queue Management
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                Smart e-Seva Portal
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* Public Link */}
            <Link
              to="/display"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/display")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Monitor className="w-4 h-4 text-indigo-600" />
              Public Screen
            </Link>

            {/* Citizen Links */}
            {isAuthenticated && user?.role === "citizen" && (
              <>
                <Link
                  to="/citizen"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/citizen")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Ticket className="w-4 h-4 text-gov-600" />
                  My Token
                </Link>
                <Link
                  to="/citizen/take-token"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/citizen/take-token")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Ticket className="w-4 h-4 text-amber-600" />
                  Take Token
                </Link>
                <Link
                  to="/citizen/appointments"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/citizen/appointments")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Appointments
                </Link>
                <Link
                  to="/citizen/queue"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/citizen/queue")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  Live Queue
                </Link>
              </>
            )}

            {/* Officer Links */}
            {isAuthenticated && user?.role === "officer" && (
              <>
                <Link
                  to="/officer"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/officer")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Officer Desk
                </Link>
                <Link
                  to="/officer/queue"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive("/officer/queue")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  Department Queue
                </Link>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive("/admin")
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* Right Action: Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 rounded-lg shadow-xs hover:shadow transition-all"
                >
                  Citizen Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/display"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Public Screen
          </Link>

          {isAuthenticated && user?.role === "citizen" && (
            <>
              <Link
                to="/citizen"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                My Token & Queue
              </Link>
              <Link
                to="/citizen/take-token"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Take Walk-in Token
              </Link>
              <Link
                to="/citizen/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                My Appointments
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === "officer" && (
            <Link
              to="/officer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Officer Desk
            </Link>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-slate-500 font-medium">
                  Logged in as <strong className="text-slate-900">{user?.fullName}</strong> ({user?.role})
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-white bg-gov-700 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
