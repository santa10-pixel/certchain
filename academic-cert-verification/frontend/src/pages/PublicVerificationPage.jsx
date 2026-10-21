import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Search,
  Upload,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  ExternalLink,
  Download
} from "lucide-react";
import { verificationService, certificateService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import AlertToast from "../components/AlertToast";

export default function PublicVerificationPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("id"); // 'id' or 'file'
  const [certIdInput, setCertIdInput] = useState(routeId || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [computedFileHash, setComputedFileHash] = useState("");
  const [optionalCertId, setOptionalCertId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Auto-trigger verification if an ID is provided via route params (/verify/:id)
  useEffect(() => {
    if (routeId) {
      setCertIdInput(routeId);
      handleVerifyById(routeId);
    }
  }, [routeId]);

  const handleVerifyById = async (idToVerify) => {
    const id = (idToVerify || certIdInput).trim();
    if (!id) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await verificationService.verifyById(id);
      setResult(res);
    } catch (err) {
      // Backend returns 404 with structured JSON for NOT_FOUND
      setResult({
        success: false,
        status: "NOT_FOUND",
        message: "Certificate not found",
        details: {
          certificateId: id,
          verificationTimestamp: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only official PDF certificate files are accepted.");
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);

      // Pre-compute SHA-256 hash in browser using Web Crypto API for transparency!
      try {
        const hash = await verificationService.computeBrowserHash(file);
        setComputedFileHash(hash);
      } catch (err) {
        console.warn("Client hash pre-computation skipped:", err);
      }
    }
  };

  const handleVerifyByFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a certificate PDF file to verify.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await verificationService.verifyByFile(selectedFile, optionalCertId.trim());
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        status: "NOT_FOUND",
        message: "Certificate not found",
        details: {
          computedHash: computedFileHash,
          verificationTimestamp: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Render Result Banner & Details
  const renderResultSection = () => {
    if (!result) return null;

    const { status, message, details } = result;

    let bannerColor = "bg-emerald-950/40 border-emerald-500/50 text-emerald-300";
    let icon = <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />;

    if (status === "MODIFIED") {
      bannerColor = "bg-amber-950/40 border-amber-500/50 text-amber-300";
      icon = <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />;
    } else if (status === "REVOKED") {
      bannerColor = "bg-rose-950/40 border-rose-500/50 text-rose-300";
      icon = <XCircle className="w-8 h-8 text-rose-400 shrink-0" />;
    } else if (status === "NOT_FOUND") {
      bannerColor = "bg-slate-900 border-slate-700 text-slate-300";
      icon = <HelpCircle className="w-8 h-8 text-slate-400 shrink-0" />;
    }

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 mt-8">
        {/* Banner with Clear Result */}
        <div className={`p-6 rounded-3xl border flex items-start gap-4 shadow-xl ${bannerColor}`}>
          {icon}
          <div>
            <div className="text-xs uppercase font-mono tracking-wider opacity-80">Verification Result</div>
            <h2 className="text-2xl font-black tracking-tight mt-0.5 text-white">{message}</h2>
            <div className="text-xs mt-1 opacity-90">
              {status === "VALID" && "Cryptographic SHA-256 digest matches the immutable blockchain record. Document is authentic."}
              {status === "MODIFIED" && "The uploaded file's SHA-256 hash does NOT match the hash recorded on the blockchain. The document has been tampered with or modified."}
              {status === "REVOKED" && "This certificate was authentic but has been officially REVOKED by the issuing university authority."}
              {status === "NOT_FOUND" && "No certificate matching this identifier or cryptographic hash exists on the blockchain registry."}
            </div>
          </div>
        </div>

        {/* Detailed Verification Records Table */}
        {details && (
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Verification Audit Details</h3>
              <StatusBadge status={status} size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {details.studentName && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">Student Name</span>
                  <span className="text-white font-medium text-sm">{details.studentName}</span>
                </div>
              )}

              {details.courseName && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">Degree / Course</span>
                  <span className="text-white font-medium text-sm">{details.courseName}</span>
                </div>
              )}

              {details.universityName && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">University</span>
                  <span className="text-slate-200">{details.universityName}</span>
                </div>
              )}

              {details.certificateNumber && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">Certificate Number</span>
                  <span className="text-white font-mono">{details.certificateNumber}</span>
                </div>
              )}

              {details.issueDate && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">Issue Date</span>
                  <span className="text-slate-200">{details.issueDate}</span>
                </div>
              )}

              {details.verificationTimestamp && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase">Verification Timestamp</span>
                  <span className="text-slate-200">{new Date(details.verificationTimestamp).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Cryptographic Hashes & Blockchain Anchor Proof */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-3 break-all">
              {details.certificateHash && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans uppercase">On-Chain Anchored SHA-256 Hash:</span>
                  <span className="text-amber-300 font-semibold">{details.certificateHash}</span>
                </div>
              )}

              {details.uploadedFileHash && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans uppercase">Uploaded Document SHA-256 Hash:</span>
                  <span className={status === "MODIFIED" ? "text-rose-400 font-bold" : "text-emerald-400 font-semibold"}>
                    {details.uploadedFileHash}
                  </span>
                </div>
              )}

              {details.blockchainTxHash && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans uppercase">Blockchain Transaction Hash:</span>
                  <span className="text-emerald-400">{details.blockchainTxHash}</span>
                </div>
              )}

              {details.revocationReason && (
                <div className="text-rose-400">
                  <span className="text-slate-400 block text-[10px] font-sans uppercase">Revocation Reason:</span>
                  <span>{details.revocationReason}</span>
                </div>
              )}
            </div>

            {/* Download Original if available and valid */}
            {details.certificateId && status === "VALID" && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => certificateService.downloadPDF(details.certificateId)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Authentic PDF Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Public Certificate Verification</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Verify any academic certificate by entering its ID, scanning its QR code, or uploading the document PDF to detect tampering.
        </p>
      </div>

      {error && <AlertToast type="error" message={error} onClose={() => setError("")} />}

      {/* Verification Card with Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("id")}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "id"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Verify by Certificate ID / QR Link
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "file"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Upload Certificate PDF
          </button>
        </div>

        {/* Tab 1: Verify by Certificate ID */}
        {activeTab === "id" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyById();
            }}
            className="space-y-4 max-w-xl mx-auto pt-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Certificate Identifier or Serial Number</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CERT-NIT-2026-0042 or NIT-2026-0042"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Verifying Against Smart Contract..." : "Verify Certificate on Blockchain"}
            </button>
          </form>
        )}

        {/* Tab 2: Verify by PDF File Upload */}
        {activeTab === "file" && (
          <form onSubmit={handleVerifyByFile} className="space-y-4 max-w-xl mx-auto pt-2">
            <div className="p-6 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 text-center space-y-3">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
              <div className="text-xs text-slate-300 font-medium">
                {selectedFile ? selectedFile.name : "Select or drag & drop certificate PDF here"}
              </div>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {computedFileHash && (
                <div className="text-[11px] font-mono text-slate-400 text-left bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
                  <span className="text-slate-400 block font-sans text-[10px] uppercase">Calculated SHA-256 Digest:</span>
                  <span className="text-amber-300">{computedFileHash}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Claimed Certificate ID (Optional — for direct tamper detection)
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-NIT-2026-0042 (optional)"
                value={optionalCertId}
                onChange={(e) => setOptionalCertId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                If provided, the system compares the uploaded document's hash specifically against this ID's on-chain record to prove authenticity or flag tampering.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Comparing Document Hash On-Chain..." : "Calculate Hash & Verify Document"}
            </button>
          </form>
        )}
      </div>

      {/* Render the 4 Clear Results */}
      {renderResultSection()}
    </div>
  );
}
