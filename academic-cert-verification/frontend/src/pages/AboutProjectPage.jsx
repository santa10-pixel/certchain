import React from "react";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  FileCheck,
  Key,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Layers,
  CheckCircle2
} from "lucide-react";

export default function AboutProjectPage() {
  const securityFeatures = [
    {
      title: "SHA-256 Cryptographic Hashing",
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      desc: "Every certificate document is converted into a deterministic 256-bit cryptographic digest. The avalanche effect guarantees that modifying a single pixel or character completely alters the hash output, making tampering computationally detectable.",
    },
    {
      title: "Blockchain Proof of Authenticity",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: "The blockchain stores only the document hash, certificate ID, issuer wallet address, and timestamp. The full private certificate is never placed on-chain, ensuring student privacy and GDPR/FERPA compliance while maintaining absolute public verifiability.",
    },
    {
      title: "Wallet-Based University Authorization",
      icon: <Key className="w-5 h-5 text-amber-400" />,
      desc: "Smart contract operations (issueCertificate, revokeCertificate) are protected by cryptographic function modifiers. Only authorized university issuer Ethereum keypairs can sign valid transactions, preventing unauthorized credential injection.",
    },
    {
      title: "Role-Based Access & Password Hashing",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      desc: "University administrative routes are shielded using JSON Web Tokens (JWT) and high-work-factor bcrypt password hashing with salt rounds. Private keys remain strictly on the backend server and are never exposed to clients.",
    },
    {
      title: "Duplicate Record Prevention",
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      desc: "Duplicate certificate IDs are prohibited at both the database level (UNIQUE constraints) and the smart contract level (require(certificates[id].issueTimestamp == 0)). Once issued, an ID cannot be re-used.",
    },
    {
      title: "On-Chain Certificate Revocation",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      desc: "When an institution revokes an erroneous or fraudulent credential, the smart contract's state is permanently updated. Any future verification attempt immediately returns 'Certificate has been revoked', preserving a tamper-evident audit trail.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> System Architecture & Security Specification
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Blockchain-Based Secure Academic Certificate Verification
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          A conference-ready decentralised trust architecture addressing paper credential counterfeiting, unauthorized degree tampering, and slow verification bureaucracies.
        </p>
      </div>

      {/* Core Principle Alert */}
      <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/40 flex items-start gap-4">
        <CheckCircle2 className="w-7 h-7 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-slate-300">
          <h4 className="font-bold text-white text-base">Privacy-Conscious Off-Chain Storage Principle</h4>
          <p className="leading-relaxed">
            A common misconception in blockchain development is storing full student identity documents directly inside smart contracts. In this system, <strong>no private personal data (PII) is stored on the public blockchain</strong>. Instead, the Ethereum smart contract acts exclusively as an immutable verification anchor storing cryptographic SHA-256 hashes. Verifiers compare candidate documents against this mathematical proof of existence.
          </p>
        </div>
      </div>

      {/* Security Architecture Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Security & Cryptographic Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-base">{f.title}</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Layers */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 space-y-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white">Multi-Tier System Architecture</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-mono text-[11px] font-bold uppercase block">Layer 1</span>
            <h4 className="font-bold text-white text-sm">Presentation Layer</h4>
            <p className="text-slate-400 leading-relaxed">
              React with Vite and Tailwind CSS. Provides intuitive, role-based interfaces for University Administrators, Students, and Public Verifiers. Includes QR code scanner and client-side SHA-256 calculation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-purple-400 font-mono text-[11px] font-bold uppercase block">Layer 2</span>
            <h4 className="font-bold text-white text-sm">Application & Service Layer</h4>
            <p className="text-slate-400 leading-relaxed">
              Node.js with Express.js. Handles administrative JWT authentication, high-resolution certificate PDF generation, dynamic QR encoding, file integrity hashing, and audit logging.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-mono text-[11px] font-bold uppercase block">Layer 3</span>
            <h4 className="font-bold text-white text-sm">Blockchain Trust Layer</h4>
            <p className="text-slate-400 leading-relaxed">
              Solidity smart contract (<code className="text-indigo-300">AcademicCertificateRegistry</code>) deployed on Ethereum / Hardhat EVM. Stores immutable proof of authenticity, handles issuer access control, and records revocations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
