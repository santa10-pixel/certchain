import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download, ExternalLink, ShieldAlert, RefreshCw, FileText } from "lucide-react";
import { certificateService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import AlertToast from "../components/AlertToast";

export default function CertificateListPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await certificateService.getAll(params);
      setCertificates(res.certificates || []);
    } catch (err) {
      setError(err.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleRevoke = async (id) => {
    const reason = prompt("Please enter the official reason for certificate revocation:");
    if (!reason || reason.trim() === "") return;

    try {
      await certificateService.revoke(id, reason.trim());
      alert(`Certificate '${id}' has been permanently revoked on the blockchain.`);
      fetchCertificates();
    } catch (err) {
      alert(`Revocation failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Certificate Registry</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, search, and manage all academic credentials anchored to the smart contract.
          </p>
        </div>
        <Link
          to="/admin/issue"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          + Issue New Certificate
        </Link>
      </div>

      {error && <AlertToast type="error" message={error} onClose={() => setError("")} />}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Student Name, ID, Certificate Number, or Course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="VALID">Valid Only</option>
            <option value="REVOKED">Revoked Only</option>
          </select>
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading certificate registry...</div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No certificates match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course / Degree</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-medium">
                      {cert.id}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        Doc #{cert.certificate_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{cert.student_name}</div>
                      <div className="text-slate-400 text-[11px]">ID: {cert.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate" title={cert.course_name}>
                      {cert.course_name}
                      <span className="block text-[10px] text-slate-400">{cert.university_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {cert.issue_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cert.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 shrink-0">
                      <Link
                        to={`/certificates/${encodeURIComponent(cert.id)}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => certificateService.downloadPDF(cert.id || cert)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download official PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      {cert.status === "VALID" && (
                        <button
                          onClick={() => handleRevoke(cert.id)}
                          className="px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Revoke certificate on blockchain"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
