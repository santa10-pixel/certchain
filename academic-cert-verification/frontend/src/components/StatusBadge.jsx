import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

export default function StatusBadge({ status, size = "md" }) {
  const norm = (status || "").toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  switch (norm) {
    case "VALID":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Authentic & Valid
        </span>
      );
    case "REVOKED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Revoked
        </span>
      );
    case "MODIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Modified / Tampered
        </span>
      );
    case "NOT_FOUND":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30 ${sizeClasses[size]}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Not Found
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses[size]}`}
        >
          {status}
        </span>
      );
  }
}
