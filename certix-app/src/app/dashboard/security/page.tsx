'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, Bug, History, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SecurityDashboard() {
  const router = useRouter();

  const handleReset = () => {
    if(confirm('This will wipe all credentials and local databases. Continue?')) {
      localStorage.clear();
      alert('Demo environment reset successfully.');
      router.push('/');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Security Laboratory</h2>
            <p className="text-slate-400">Monitor threats and run attack simulations on the demo environment.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Bug className="w-5 h-5" /> Attack Simulations
            </CardTitle>
            <CardDescription>Test the system's resilience against common vectors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <h4 className="font-semibold mb-2">Tampering Attack</h4>
              <p className="text-sm text-slate-400 mb-4">Generates a valid payload but alters a disclosed claim before verification.</p>
              <Button variant="outline" className="w-full" onClick={() => alert("Go to the Verifier portal, paste a payload, change any value, and click Verify to see this in action.")}>Simulate Tampering</Button>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <h4 className="font-semibold mb-2">Replay Attack</h4>
              <p className="text-sm text-slate-400 mb-4">Attempts to use the same cryptographic nonce twice.</p>
              <Button variant="outline" className="w-full" onClick={() => alert("Go to the Verifier portal, verify a payload, and then click Verify again immediately.")}>Simulate Replay</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <RefreshCcw className="w-5 h-5" /> Environment Controls
            </CardTitle>
            <CardDescription>Manage the local conference demonstration state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-red-900/50">
              <h4 className="font-semibold text-red-400 mb-2">Factory Reset</h4>
              <p className="text-sm text-slate-400 mb-4">Clear all local storage repositories, destroying all issued credentials, keys, and trust records.</p>
              <Button variant="destructive" className="w-full" onClick={handleReset}>Wipe Demo Database</Button>
            </div>
            
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 mt-4">
               <h4 className="font-semibold mb-2 flex items-center gap-2"><History className="w-4 h-4"/> Threat Audit Log</h4>
               <p className="text-sm text-slate-400 mb-2">Recent security events intercepted by the Verification Engine.</p>
               <div className="text-xs font-mono text-slate-500 border border-slate-800 p-2 rounded bg-slate-900">
                 No recent threats detected in this session.
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
