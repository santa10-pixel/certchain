import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Search, Award, FileText, CheckCircle2, ArrowRight, Lock, Database, QrCode, Cpu } from "lucide-react";
import api from "../services/api";

export default function LandingPage() {
  const [stats, setStats] = useState({ totalIssued: 0, totalValid: 0 });

  useEffect(() => {
    // Optionally fetch public counts
    api.get("/certificates?limit=1").then((res) => {
      if (res.data?.count !== undefined) {
        setStats({ totalIssued: res.data.count, totalValid: res.data.count });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto text-center px-4 pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-8 animate-pulse">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Ethereum Smart Contract Secured & Verification System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Blockchain-Based Secure <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Academic Certificate Verification
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-10 leading-relaxed font-normal">
          Eliminate credential fraud with cryptographic immutability. Institutions anchor digital certificate hashes directly onto the blockchain, allowing employers and universities to instantly detect tampering or unauthorized modifications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/verify"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" /> Verify a Certificate
          </Link>
          <Link
            to="/admin/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-800 transition-all"
          >
            <Award className="w-4 h-4 text-indigo-400" /> University Admin Portal
          </Link>
          <Link
            to="/student/certificates"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            Student Portal →
          </Link>
        </div>
      </section>

      {/* Trust & Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">SHA-256 Immutability</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every certificate PDF has a unique SHA-256 cryptographic digest. Any alteration in a student's grade, name, or date produces an entirely different hash, triggering an instant tamper alert.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Smart Contract Trust</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Proof of authenticity is stored on an Ethereum smart contract. Only authorized university issuer wallets can register or revoke certificates, preventing central database tampering.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Instant QR Verification</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each generated certificate features an embedded QR code. Employers scan the document to query the smart contract in seconds without requiring manual paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How the Verification Pipeline Works</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A privacy-conscious architecture: private student records remain off-chain while mathematical proof of integrity is anchored permanently to the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
            <div className="text-3xl font-black text-indigo-500/30 font-mono">01</div>
            <h4 className="text-lg font-bold text-white">University Issues</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              The administrator enters student and degree data. The system generates an official PDF with QR code and calculates the 256-bit hash.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
            <div className="text-3xl font-black text-indigo-500/30 font-mono">02</div>
            <h4 className="text-lg font-bold text-white">Blockchain Anchoring</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              The hash and Certificate ID are submitted via smart contract transaction. The issuer address and timestamp are permanently inscribed on-chain.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
            <div className="text-3xl font-black text-indigo-500/30 font-mono">03</div>
            <h4 className="text-lg font-bold text-white">Public Verification</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Verifiers scan the QR code, enter the ID, or upload the PDF document. The system calculates the hash in real-time and validates authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/20 blur-[90px] pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Ready to verify an academic credential?</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Test the system by entering a certificate ID or uploading a sample PDF document to observe instant verification.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              Open Public Verifier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
