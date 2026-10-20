import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Search,
  Download,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ShieldCheck,
  FileText
} from "lucide-react";
import { certificateService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import AlertToast from "../components/AlertToast";

export default function StudentCertificatesPage() {
  const [studentId, setStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await certificateService.getAll({
        studentId: studentId.trim(),
        search: studentId.trim(),
      });
      setCertificates(res.certificates || []);
    } catch (err) {
      setError(err.message || "Failed to search student certificates.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id) => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(id)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Student Credential Portal</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Access your tamper-proof academic credentials, retrieve your blockchain proofs, and generate shareable verification links for employers.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            required
            placeholder="Enter Student Registration ID (e.g. 22BCE1234 or Student Name)..."
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-semibold transition-all shadow-md shrink-0"
        >
          {loading ? "Searching..." : "Find My Certificates"}
        </button>
      </form>

      {error && <AlertToast type="error" message={error} onClose={() => setError("")} />}

      {/* Results */}
      {searched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Found {certificates.length} certificate(s) for query "{studentId}"</span>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-sm space-y-2">
              <p>No certificates found matching that Registration ID.</p>
              <p className="text-xs text-slate-400">
                Tip: Check your student ID format or ask the university administrator to issue your credential.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-indigo-500/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        {cert.id}
                      </span>
                      <StatusBadge status={cert.status} size="sm" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{cert.student_name}</h3>
                      <p className="text-xs text-slate-300 mt-0.5">{cert.course_name}</p>
                      <p className="text-[11px] text-slate-400">{cert.university_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Issued</span>
                        <span className="text-slate-200">{cert.issue_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Graduated</span>
                        <span className="text-slate-200">{cert.graduation_date}</span>
                      </div>
                    </div>

                    {cert.tx_hash && (
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 truncate">
                        <span className="text-slate-400 block text-[10px] font-sans uppercase">On-Chain Tx:</span>
                        <span className="text-emerald-400" title={cert.tx_hash}>{cert.tx_hash}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={certificateService.getDownloadUrl(cert.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Download Certificate PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>

                      <button
                        onClick={() => handleCopy(cert.id)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                        title="Copy Public Verification Link"
                      >
                        {copiedId === cert.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === cert.id ? "Copied" : "Copy Link"}
                      </button>

                      {cert.qr_path && (
                        <button
                          onClick={() => setSelectedQR(cert.qr_path.startsWith("http") ? cert.qr_path : `http://localhost:5001${cert.qr_path}`)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                          title="Display QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-400" /> QR
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/certificates/${encodeURIComponent(cert.id)}`}
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Full Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="font-bold text-white text-base">Certificate Verification QR</h3>
            <img src={selectedQR} alt="QR Code" className="w-48 h-48 rounded-xl bg-white p-2 mx-auto shadow-lg" />
            <p className="text-xs text-slate-400">
              Present this QR code to an employer or verifier for instant on-chain verification.
            </p>
            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
