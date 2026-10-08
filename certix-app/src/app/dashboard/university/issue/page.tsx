'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CredentialService } from '@/lib/services/CredentialService';
import { ShieldCheck, FilePlus2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IssueCredential() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', reg: '', prog: '', cgpa: '', skills: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const srv = new CredentialService();
      await srv.issueCredential(formData);
      alert('Credential Issued & Anchored Successfully!');
      router.push('/dashboard/university');
    } catch (err: any) {
      alert(`Error issuing credential: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/university" className="flex items-center text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-indigo-400" />
            Issue Academic Credential
          </CardTitle>
          <CardDescription>
            Enter the student details below. A cryptographic proof will be anchored to the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Santhosh Kumar" className="bg-slate-950 border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input required value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})} placeholder="e.g. 22BCE1234" className="bg-slate-950 border-slate-800" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Academic Program</Label>
              <Input required value={formData.prog} onChange={e => setFormData({...formData, prog: e.target.value})} placeholder="e.g. B.Tech Computer Science" className="bg-slate-950 border-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input required value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} placeholder="e.g. 9.0" className="bg-slate-950 border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label>Key Skills (comma separated)</Label>
                <Input required value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Solidity, Python" className="bg-slate-950 border-slate-800" />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              {loading ? 'Generating Proofs & Anchoring...' : 'Issue & Anchor Credential'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
