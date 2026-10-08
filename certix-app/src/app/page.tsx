'use client';

import { useRole } from '@/lib/contexts/RoleContext';
import { Building2, Wallet, SearchCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { setRole } = useRole();
  const router = useRouter();

  const handleRoleSelect = (role: any, path: string) => {
    setRole(role);
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>

        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to CertiX</h1>
          <p className="text-slate-400 text-sm">A secure platform for issuing and verifying academic credentials. Select your role to begin the demo.</p>
        </div>

        <div className="space-y-3 relative">
          <button 
            onClick={() => handleRoleSelect('UNIVERSITY', '/dashboard/university')}
            className="w-full text-left p-4 bg-slate-950/50 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 rounded-2xl transition-all flex items-center gap-4 group"
          >
            <div className="p-2 bg-slate-800 group-hover:bg-indigo-500 rounded-lg transition-colors">
              <Building2 className="text-indigo-400 group-hover:text-white w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-white">University</div>
              <div className="text-xs text-slate-500 group-hover:text-indigo-200">Issue credentials & manage batches</div>
            </div>
          </button>

          <button 
            onClick={() => handleRoleSelect('STUDENT', '/dashboard/student')}
            className="w-full text-left p-4 bg-slate-950/50 hover:bg-green-600 border border-slate-800 hover:border-green-500 rounded-2xl transition-all flex items-center gap-4 group"
          >
            <div className="p-2 bg-slate-800 group-hover:bg-green-500 rounded-lg transition-colors">
              <Wallet className="text-green-400 group-hover:text-white w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-white">Student</div>
              <div className="text-xs text-slate-500 group-hover:text-green-200">View wallet & share claims</div>
            </div>
          </button>

          <button 
            onClick={() => handleRoleSelect('VERIFIER', '/dashboard/verifier')}
            className="w-full text-left p-4 bg-slate-950/50 hover:bg-orange-600 border border-slate-800 hover:border-orange-500 rounded-2xl transition-all flex items-center gap-4 group"
          >
            <div className="p-2 bg-slate-800 group-hover:bg-orange-500 rounded-lg transition-colors">
              <SearchCheck className="text-orange-400 group-hover:text-white w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-white">Employer / Verifier</div>
              <div className="text-xs text-slate-500 group-hover:text-orange-200">Verify candidate authenticity</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleRoleSelect('ADMIN', '/dashboard/security')}
            className="w-full text-left p-4 bg-slate-950/50 hover:bg-red-600 border border-slate-800 hover:border-red-500 rounded-2xl transition-all flex items-center gap-4 group"
          >
            <div className="p-2 bg-slate-800 group-hover:bg-red-500 rounded-lg transition-colors">
              <ShieldAlert className="text-red-400 group-hover:text-white w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 group-hover:text-white">Security Admin</div>
              <div className="text-xs text-slate-500 group-hover:text-red-200">Monitor threats & run attacks</div>
            </div>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-xs text-slate-500">Conference Demo Mode — Local Trust Records</p>
        </div>
      </div>
    </div>
  );
}
