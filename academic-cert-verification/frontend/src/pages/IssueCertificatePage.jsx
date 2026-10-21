import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FilePlus,
  ShieldCheck,
  Upload,
  Download,
  QrCode,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { certificateService } from "../services/api";
import AlertToast from "../components/AlertToast";

export default function IssueCertificatePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_name: "",
    student_id: "",
    course_name: "",
    university_name: "National Institute of Technology",
    certificate_type: "Bachelor of Technology Degree",
    issue_date: new Date().toISOString().split("T")[0],
    graduation_date: "2026-05-15",
    certificate_number: "",
  });

  const [customFile, setCustomFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported for certificate upload.");
        return;
      }
      setCustomFile(file);
      setError("");
    }
  };

  const handleFillSample = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      student_name: "Santhosh Kumar R",
      student_id: `22BCE${randomNum}`,
      course_name: "Bachelor of Technology in Computer Science & Engineering",
      university_name: "National Institute of Technology",
      certificate_type: "Degree of Bachelor of Technology",
      issue_date: new Date().toISOString().split("T")[0],
      graduation_date: "2026-05-20",
      certificate_number: `NIT-2026-${randomNum}`,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const postData = new FormData();
      Object.keys(formData).forEach((key) => {
        postData.append(key, formData[key]);
      });

      if (customFile) {
        postData.append("certificateFile", customFile);
      }

      const res = await certificateService.issue(postData);
      setSuccessResult(res.certificate);
    } catch (err) {
      setError(err.message || "Failed to issue certificate on blockchain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={handleFillSample}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-Fill Realistic Sample Data
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-indigo-400" /> Issue & Anchor Academic Certificate
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            This operation writes the certificate's cryptographic SHA-256 digest to the Ethereum smart contract. Private student data is preserved in secure off-chain storage.
          </p>
        </div>

        {error && <AlertToast type="error" message={error} onClose={() => setError("")} />}

        {successResult ? (
          /* Success Screen */
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Certificate Anchored Successfully!</h3>
                <p className="text-xs text-emerald-300">
                  The document hash has been mined on the blockchain and the official PDF certificate was generated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Certificate ID:</span>
                <span className="text-indigo-400 font-bold text-sm">{successResult.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Certificate Number:</span>
                <span className="text-white">{successResult.certificateNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Student Name:</span>
                <span className="text-white font-sans font-medium">{successResult.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Blockchain Tx Hash:</span>
                <span className="text-emerald-400 truncate block" title={successResult.blockchainTxHash}>
                  {successResult.blockchainTxHash}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">SHA-256 Document Hash:</span>
                <span className="text-amber-300 truncate block" title={successResult.certificateHash}>
                  {successResult.certificateHash}
                </span>
              </div>
            </div>

            {/* QR Code and Download Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
              {(successResult.qrDataUrl || successResult.qr_code) && (
                <div className="text-center shrink-0">
                  <img
                    src={successResult.qrDataUrl || successResult.qr_code}
                    alt="Certificate QR Code"
                    className="w-28 h-28 rounded-lg bg-white p-1 shadow-md mx-auto"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Verification QR Code</span>
                </div>
              )}
              <div className="space-y-3 w-full">
                <div className="text-xs text-slate-300">
                  The generated certificate PDF contains official university seal, signatures, and this QR code embedded for instant scan-to-verify functionality.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => certificateService.downloadPDF(successResult.id || successResult)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Official PDF Certificate
                  </button>
                  <Link
                    to={`/verify/${encodeURIComponent(successResult.id)}`}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" /> Test Public Verification
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessResult(null);
                      handleFillSample();
                    }}
                    className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    + Issue Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Issuance Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Student Full Name *</label>
                <input
                  type="text"
                  name="student_name"
                  required
                  placeholder="e.g. Santhosh Kumar"
                  value={formData.student_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Student Registration ID *</label>
                <input
                  type="text"
                  name="student_id"
                  required
                  placeholder="e.g. 22BCE1234"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Course / Degree Program *</label>
                <input
                  type="text"
                  name="course_name"
                  required
                  placeholder="e.g. Bachelor of Technology in Computer Science & Engineering"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">University / Institution Name *</label>
                <input
                  type="text"
                  name="university_name"
                  required
                  placeholder="e.g. National Institute of Technology"
                  value={formData.university_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Certificate Type *</label>
                <input
                  type="text"
                  name="certificate_type"
                  required
                  placeholder="e.g. Degree Certificate, Diploma, Distinction"
                  value={formData.certificate_type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Issue Date *</label>
                <input
                  type="date"
                  name="issue_date"
                  required
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Graduation Date *</label>
                <input
                  type="date"
                  name="graduation_date"
                  required
                  value={formData.graduation_date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Unique Certificate Number / Serial *</label>
                <input
                  type="text"
                  name="certificate_number"
                  required
                  placeholder="e.g. NIT-2026-0042"
                  value={formData.certificate_number}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-[11px] text-slate-400">Must be unique across the university registry.</p>
              </div>
            </div>

            {/* Optional Custom File Upload */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-400" /> Custom Certificate PDF (Optional)
              </label>
              <p className="text-[11px] text-slate-400">
                Leave empty to have the system automatically generate a professional, print-ready PDF certificate with the embedded QR code. Or upload an existing PDF document.
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {customFile && (
                <div className="text-xs text-indigo-300">Selected file: {customFile.name} ({(customFile.size / 1024).toFixed(1)} KB)</div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Generating PDF, Calculating Hash & Anchoring On-Chain..." : "Inscribe & Anchor on Blockchain"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
