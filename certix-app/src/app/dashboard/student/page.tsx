'use client';

import { CredentialService } from '@/lib/services/CredentialService';
import { ShareService } from '@/lib/services/ShareService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, Share2, Lock, Copy } from 'lucide-react';
import { WalletCredential } from '@/types';

export default function StudentDashboard() {
  const [credentials, setCredentials] = useState<WalletCredential[]>([]);
  const [selectedCert, setSelectedCert] = useState<WalletCredential | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [disclosedKeys, setDisclosedKeys] = useState<string[]>(['name', 'prog']);
  const [payloadStr, setPayloadStr] = useState('');

  useEffect(() => {
    // In a real app, registrationNumber would come from auth context
    const srv = new CredentialService();
    setCredentials(srv.getWallet());
  }, []);

  const toggleKey = (key: string) => {
    setDisclosedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const generateShare = () => {
    if (!selectedCert) return;
    const payload = ShareService.generateSharePayload(selectedCert, disclosedKeys);
    setPayloadStr(JSON.stringify(payload));
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(payloadStr);
    alert('Payload copied! You can paste this in the Verifier portal.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
          <Wallet className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Wallet</h2>
          <p className="text-slate-400">View and selectively disclose your academic achievements.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {credentials.length === 0 ? (
          <div className="col-span-2 text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">Your wallet is empty.</p>
          </div>
        ) : (
          credentials.map(c => (
            <Card key={c.id} className="bg-slate-900 border-slate-800 flex flex-col">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{c.record.prog}</CardTitle>
                    <CardDescription>VIT Chennai</CardDescription>
                  </div>
                  {c.status === 'ACTIVE' ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                      <ShieldCheck className="w-3 h-3 mr-1" /> ACTIVE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">REVOKED</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Student</span><span>{c.record.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-xs">{c.id}</span></div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-800/50">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700" 
                  onClick={() => { setSelectedCert(c); setIsShareOpen(true); setPayloadStr(''); }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Selectively Disclose
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Share Credential</DialogTitle>
            <DialogDescription>
              Choose which claims to reveal. Unselected claims will be cryptographically hidden via ZK-commitments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedCert && ['name', 'reg', 'prog', 'cgpa', 'skills'].map(k => (
              <label key={k} className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-slate-900" 
                  checked={disclosedKeys.includes(k)}
                  onChange={() => toggleKey(k)}
                />
                <span className="capitalize font-medium text-slate-300">{k}</span>
                <span className="ml-auto text-xs text-slate-500">{selectedCert.record[k]}</span>
                {!disclosedKeys.includes(k) && <Lock className="w-3 h-3 text-amber-500" />}
              </label>
            ))}
          </div>

          {payloadStr ? (
            <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 relative">
              <pre className="text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap break-all h-32">
                {payloadStr}
              </pre>
              <Button size="sm" onClick={copyPayload} className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700">
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          ) : (
            <DialogFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={generateShare}>
                Generate Secure Payload
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
