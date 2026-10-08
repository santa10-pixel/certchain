'use client';

import { useRole } from '@/lib/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut, Wallet, Building2, SearchCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const pathname = usePathname();

  if (role === 'HOME') {
    return <>{children}</>;
  }

  const getNavLinks = () => {
    switch (role) {
      case 'UNIVERSITY':
        return [
          { href: '/dashboard/university', label: 'Overview', icon: Building2 },
          { href: '/dashboard/university/issue', label: 'Issue', icon: ShieldCheck },
        ];
      case 'STUDENT':
        return [
          { href: '/dashboard/student', label: 'Wallet', icon: Wallet },
        ];
      case 'VERIFIER':
        return [
          { href: '/dashboard/verifier', label: 'Verify', icon: SearchCheck },
        ];
      case 'ADMIN':
        return [
          { href: '/dashboard/security', label: 'Security Center', icon: ShieldAlert },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
              <ShieldCheck className="w-6 h-6" />
              CertiX
            </div>
            
            <nav className="flex items-center gap-2">
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Demo Mode
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRole('HOME')} className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Switch Role
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
