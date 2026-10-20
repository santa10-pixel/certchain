import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
  RefreshCw,
  ExternalLink,
  Search,
  AlertTriangle,
  User,
  GraduationCap
} from "lucide-react";
import { dashboardService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import AlertToast from "../components/AlertToast";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await dashboardService.getStats();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    totalIssued: 0,
    totalValid: 0,
    totalRevoked: 0,
    totalVerifications: 0,
  };

  const blockchain = data?.blockchainStatus;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">University Administration Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time credential lifecycle metrics, blockchain anchoring state, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/admin/issue"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <FilePlus className="w-4 h-4" /> Issue Certificate
          </Link>
        </div>
      </div>

      {error && <AlertToast type="error" message={error} onClose={() => setError("")} />}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Issued</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.totalIssued}</div>
          <div className="text-xs text-slate-400 mt-2">Registered in smart contract</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Valid & Active</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats.totalValid}</div>
          <div className="text-xs text-slate-400 mt-2">Passed on-chain integrity check</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Revoked</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">{stats.totalRevoked}</div>
          <div className="text-xs text-slate-400 mt-2">Permanently marked revoked</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Verifications</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.totalVerifications}</div>
          <div className="text-xs text-slate-400 mt-2">Public verification requests logged</div>
        </div>
      </div>

      {/* Blockchain Node Status Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            blockchain?.online ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Ethereum Smart Contract Status</h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                blockchain?.online ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${blockchain?.online ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                {blockchain?.online ? "Hardhat Node Online" : "Hardhat Node Offline"}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1 space-x-3">
              {blockchain?.online ? (
                <>
                  <span>Chain ID: {blockchain.chainId}</span>
                  <span>•</span>
                  <span>Block Height: #{blockchain.blockNumber}</span>
                  <span>•</span>
                  <span>Issuer Balance: {parseFloat(blockchain.issuerBalanceETH).toFixed(2)} ETH</span>
                </>
              ) : (
                <span>Ensure local hardhat node is running on port 8545: <code className="text-indigo-300">npx hardhat node</code></span>
              )}
            </div>
          </div>
        </div>

        {blockchain?.contractAddress && (
          <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 break-all md:text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Registry Contract:</span>
            <span className="text-indigo-400 font-bold">{blockchain.contractAddress}</span>
          </div>
        )}
      </div>

      {/* Grid: Recent Certificates & Verification Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Certificates (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recently Issued Certificates</h3>
            <Link to="/admin/certificates" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All ({stats.totalIssued}) →
            </Link>
          </div>

          {data?.recentCertificates?.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-400 text-sm">
              No certificates issued yet. Click "Issue Certificate" to anchor your first document on-chain!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-2">Certificate ID</th>
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">Course / Degree</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {data?.recentCertificates?.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 font-mono text-indigo-400 font-medium">
                        {cert.id}
                      </td>
                      <td className="py-3 px-2 text-white font-medium">
                        {cert.student_name}
                      </td>
                      <td className="py-3 px-2 text-slate-300 max-w-[150px] truncate">
                        {cert.course_name}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <Link
                          to={`/certificates/${encodeURIComponent(cert.id)}`}
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Activity Stream (1 Col) */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Verification Activity
          </h3>

          {data?.recentVerifications?.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No verification attempts recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentVerifications?.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 truncate max-w-[140px]">
                      {v.certificate_id}
                    </span>
                    <StatusBadge status={v.result} size="sm" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Method: {v.verification_method}</span>
                    <span>{new Date(v.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
