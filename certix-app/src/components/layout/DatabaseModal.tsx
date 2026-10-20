'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, CheckCircle2, XCircle, RefreshCw, Cloud, Server } from 'lucide-react';
import { supabaseManager } from '@/lib/supabaseClient';
import { DatabaseService } from '@/lib/services/DatabaseService';

interface DatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

export function DatabaseModal({ open, onOpenChange, onStatusChange }: DatabaseModalProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<{ isConnected: boolean; url: string | null }>({ isConnected: false, url: null });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (open) {
      const current = supabaseManager.getStatus();
      setStatus(current);
      setUrl(localStorage.getItem('certix_supabase_url') || '');
      setKey(localStorage.getItem('certix_supabase_key') || '');
      setTestResult(null);
    }
  }, [open]);

  const handleTestAndSave = async () => {
    if (!url.trim() || !key.trim()) {
      alert('Please enter both Supabase URL and Anon Key.');
      return;
    }
    setTesting(true);
    setTestResult(null);

    const db = new DatabaseService();
    const result = await db.testConnection(url.trim(), key.trim());
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      supabaseManager.saveConfig(url.trim(), key.trim());
      setStatus({ isConnected: true, url: url.trim() });
      if (onStatusChange) onStatusChange();
    }
  };

  const handleDisconnect = () => {
    supabaseManager.clearConfig();
    setUrl('');
    setKey('');
    setStatus({ isConnected: false, url: null });
    setTestResult(null);
    if (onStatusChange) onStatusChange();
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    const db = new DatabaseService();
    await db.fetchFromCloud();
    await db.syncToCloud();
    setSyncing(false);
    alert('Synchronized credentials with Supabase Cloud Database!');
    if (onStatusChange) onStatusChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="w-5 h-5 text-indigo-400" />
            Database Settings & Cloud Sync
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            CertiX operates with a local-first repository by default. Connect a Supabase PostgreSQL instance for real-time cloud synchronization across devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            status.isConnected 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-3">
              {status.isConnected ? (
                <Cloud className="w-5 h-5 text-green-400" />
              ) : (
                <Server className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="font-semibold text-sm">
                  {status.isConnected ? 'Cloud Database Connected' : 'Local Storage Mode'}
                </div>
                <div className="text-xs text-slate-400">
                  {status.isConnected ? `Connected: ${status.url}` : 'Running on browser-local persistent storage'}
                </div>
              </div>
            </div>
            {status.isConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncNow} 
                disabled={syncing}
                className="border-green-500/30 hover:bg-green-500/20 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Supabase Project URL</Label>
              <Input
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-slate-950 border-slate-800 text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Supabase Anon Key (API Public Key)</Label>
              <Input
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="bg-slate-950 border-slate-800 text-sm font-mono"
              />
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-400 space-y-1">
            <div className="font-medium text-slate-300">SQL Schema Setup:</div>
            <div>To prepare your Supabase tables, run the included <span className="text-indigo-400 font-mono">certix_schema.sql</span> script in your Supabase SQL Editor.</div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {status.isConnected && (
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              Disconnect Cloud DB
            </Button>
          )}
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={handleTestAndSave}
            disabled={testing}
          >
            {testing ? 'Connecting...' : status.isConnected ? 'Update Credentials' : 'Connect & Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
