import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export default function AlertToast({ type = "info", message, onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-950/80 border-emerald-500/50 text-emerald-200",
    error: "bg-rose-950/80 border-rose-500/50 text-rose-200",
    warning: "bg-amber-950/80 border-amber-500/50 text-amber-200",
    info: "bg-indigo-950/80 border-indigo-500/50 text-indigo-200",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  return (
    <div
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-lg ${styles[type] || styles.info}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {icons[type] || icons.info}
        <div className="text-sm font-medium leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
