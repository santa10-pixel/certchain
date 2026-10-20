import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, ShieldCheck, UserCheck, GraduationCap, FileCheck, LogIn, LogOut, Menu, X, Info } from "lucide-react";
import { authService } from "../services/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Verify Certificate", path: "/verify", highlight: true },
    { name: "Student Portal", path: "/student/certificates" },
    { name: "About Project", path: "/about" },
  ];

  if (isAuth) {
    navLinks.push({ name: "Admin Dashboard", path: "/admin/dashboard" });
    navLinks.push({ name: "Issue Certificate", path: "/admin/issue" });
    navLinks.push({ name: "Certificate Registry", path: "/admin/certificates" });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-tight flex items-center gap-2">
                CertiX <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/30">Blockchain</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">Secure Academic Verification System</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-indigo-600 text-white shadow-sm"
                    : link.highlight
                    ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuth ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-800">
                <span className="text-xs text-slate-400 font-mono hidden lg:inline">
                  {currentUser?.email || "Admin"}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="ml-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
              >
                <LogIn className="w-4 h-4 text-indigo-400" /> Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-900 border-b border-slate-800">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuth ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout ({currentUser?.email})
            </button>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-400 hover:bg-slate-800"
            >
              Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
