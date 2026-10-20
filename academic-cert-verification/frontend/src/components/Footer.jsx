import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Blockchain-Based Secure Academic Certificate Verification System
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A conference-grade, tamper-evident decentralized framework enabling universities to issue cryptographically anchored academic credentials that students can share and employers can verify online or offline with zero counterfeit risk.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <Lock className="w-3.5 h-3.5" /> SHA-256 Proof of Authenticity • Privacy-Preserving Off-Chain Storage
            </div>
          </div>

          {/* Col 2: Verification Portal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Verification</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/verify" className="hover:text-indigo-400 transition-colors">
                  Verify by Certificate ID
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-indigo-400 transition-colors">
                  Upload Certificate PDF
                </Link>
              </li>
              <li>
                <Link to="/student/certificates" className="hover:text-indigo-400 transition-colors">
                  Student Credential Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: University Admin & System */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Administration</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin/login" className="hover:text-indigo-400 transition-colors">
                  Administrator Login
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-indigo-400 transition-colors">
                  Issuer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors">
                  Architecture & Security Model
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Academic Certificate Registry. Built with Ethereum Smart Contracts.</div>
          <div className="mt-2 sm:mt-0 font-mono text-slate-400">Hardhat EVM • Ethers.js v6 • SQLite • Node Express</div>
        </div>
      </div>
    </footer>
  );
}
