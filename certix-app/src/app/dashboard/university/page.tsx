'use client';

import { CredentialService } from '@/lib/services/CredentialService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus2, CheckCircle2, XCircle } from 'lucide-react';

export default function UniversityDashboard() {
  const [credentials, setCredentials] = useState<any[]>([]);

  useEffect(() => {
    const srv = new CredentialService();
    setCredentials(srv.getWallet());
  }, []);

  const handleRevoke = (id: string) => {
    if(confirm('Are you sure you want to revoke this credential? This cannot be undone.')) {
      const srv = new CredentialService();
      srv.revoke(id);
      setCredentials(srv.getWallet());
      alert(`Revoked ${id}`);
    }
  };

  const activeCount = credentials.filter(c => c.status === 'ACTIVE').length;
  const revokedCount = credentials.filter(c => c.status === 'REVOKED').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">University Overview</h2>
          <p className="text-slate-400">VIT Chennai Issuer Dashboard</p>
        </div>
        <Link href="/dashboard/university/issue">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <FilePlus2 className="mr-2 h-4 w-4" /> Issue Credential
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credentials.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{revokedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Recent Credentials</CardTitle>
          <CardDescription>Latest credentials anchored to the local demo chain.</CardDescription>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg">
              <p className="text-slate-400 mb-4">No credentials issued yet.</p>
              <Link href="/dashboard/university/issue">
                <Button variant="outline">Issue your first credential</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.slice().reverse().map(c => (
                  <TableRow key={c.id} className="border-slate-800">
                    <TableCell className="font-mono text-xs text-indigo-400">{c.id}</TableCell>
                    <TableCell>{c.record.name}</TableCell>
                    <TableCell>{c.record.prog}</TableCell>
                    <TableCell>
                      {c.status === 'ACTIVE' ? (
                        <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">ACTIVE</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">REVOKED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === 'ACTIVE' && (
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(c.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
