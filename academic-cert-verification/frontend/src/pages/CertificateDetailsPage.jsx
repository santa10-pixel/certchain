import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  XCircle,
  FileText,
  Lock,
  Cpu,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";
import { certificateService, authService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import AlertToast from "../components/AlertToast";

export default function CertificateDetailsPage() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isAuth = authService.isAuthenticated();

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await certificateService.getById(id);
      setCert(res.certificate);
      setChainData(res.blockchainVerification);
    } catch (err) {
      setError(err.message || "Failed to load certificate details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(cert.id)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    const reason = prompt("Enter official reason for revoking this certificate:");
    if (!reason || reason.trim() === "") return;

    try {
      await certificateService.revoke(cert.id, reason.trim());
      alert("Certificate has been revoked on the blockchain.");
      fetchDetails();
    } catch (err) {
      alert(`Revocation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading certificate record from registry...
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <AlertToast type="error" message={error || "Certificate not found."} />
        <Link to="/" className="text-xs text-indigo-400 hover:underline block text-center">
          ← Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={isAuth ? "/admin/certificates" : "/student/certificates"}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
        <StatusBadge status={cert.status} size="lg" />
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 block mb-1">
              Certificate Record #{cert.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {cert.student_name}
            </h1>
            <p className="text-sm text-slate-300 mt-1">{cert.course_name}</p>
            <p className="text-xs text-slate-400">{cert.university_name}</p>
          </div>

          {cert.qr_path && (
            <div className="text-center shrink-0">
              <img
                src={cert.qr_path.startsWith("http") ? cert.qr_path : `http://localhost:5001${cert.qr_path}`}
                alt="Verification QR"
                className="w-24 h-24 rounded-lg bg-white p-1 shadow-md mx-auto"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Verification QR</span>
            </div>
          )}
        </div>

        {/* Revocation Banner if revoked */}
        {cert.status === "REVOKED" && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <XCircle className="w-4 h-4" /> This certificate has been officially REVOKED
            </div>
            <div>Reason: {cert.revocation_reason || "Revoked by issuer"}</div>
            <div>Revocation Timestamp: {new Date(cert.revoked_at).toLocaleString()}</div>
          </div>
        )}

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Student Registration ID</span>
            <span className="text-white font-medium text-sm">{cert.student_id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Certificate Number</span>
            <span className="text-white font-mono font-medium text-sm">{cert.certificate_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Certificate Type</span>
            <span className="text-slate-200">{cert.certificate_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Issue Date</span>
            <span className="text-slate-200">{cert.issue_date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Graduation Date</span>
            <span className="text-slate-200">{cert.graduation_date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Record Creation</span>
            <span className="text-slate-200">{new Date(cert.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Cryptographic Proof Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> Cryptographic & Blockchain Verification Proof
          </h3>

          <div className="space-y-3 text-xs font-mono bg-slate-950 p-6 rounded-2xl border border-slate-800 break-all">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans mb-0.5">
                SHA-256 Document Hash (Proof of Authenticity)
              </span>
              <span className="text-amber-300 font-semibold">{cert.certificate_hash}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans mb-0.5">
                Ethereum Blockchain Transaction Hash
              </span>
              <span className="text-emerald-400">{cert.tx_hash || "Simulated / Off-chain"}</span>
            </div>

            {cert.issuer_address && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans mb-0.5">
                  Authorized University Issuer Wallet
                </span>
                <span className="text-slate-300">{cert.issuer_address}</span>
              </div>
            )}

            {chainData && (
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-indigo-300 font-sans text-xs">
                <Check className="w-4 h-4 text-emerald-400" />
                Live on-chain query confirmed on Ethereum smart contract.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap gap-3">
            <a
              href={certificateService.getDownloadUrl(cert.id)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Download Official PDF
            </a>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Copy Verification Link"}
            </button>

            <Link
              to={`/verify/${encodeURIComponent(cert.id)}`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" /> Open Verification View
            </Link>
          </div>

          {isAuth && cert.status === "VALID" && (
            <button
              onClick={handleRevoke}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              Revoke Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
