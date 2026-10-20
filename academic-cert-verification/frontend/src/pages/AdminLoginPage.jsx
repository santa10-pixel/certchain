import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LogIn, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { authService } from "../services/api";
import AlertToast from "../components/AlertToast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(email.trim(), password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@university.edu");
    setPassword("Admin@Cert2026!");
    setError("");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">University Administrator Login</h2>
          <p className="text-slate-400 text-xs mt-1">Authenticate to access the certificate issuing portal and blockchain registry.</p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertToast type="error" message={error} onClose={() => setError("")} />
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>

        {/* 1-Click Demo Fill */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-Fill Demo Admin Credentials
          </button>
          <div className="text-[11px] text-slate-400 text-center mt-3">
            Default credentials: <span className="font-mono text-indigo-300">admin@university.edu</span> / <span className="font-mono text-indigo-300">Admin@Cert2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
