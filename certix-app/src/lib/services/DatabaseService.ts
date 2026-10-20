import { supabaseManager } from '../supabaseClient';
import { LocalStorageRepository } from '../repositories/LocalStorageRepository';
import { WalletCredential, TrustRecord } from '@/types';

export class DatabaseService {
  private walletRepo = new LocalStorageRepository<WalletCredential>('certix_wallet');
  private trustRepo = new LocalStorageRepository<TrustRecord>('certix_trust_chain');

  async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(url, key);
      const { error } = await testClient.from('certix_state').select('id').limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          return {
            success: true,
            message: 'Connected to Supabase! (Note: Run certix_schema.sql to create the certix_state table).',
          };
        }
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Successfully connected to Supabase cloud database!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  async syncToCloud(): Promise<boolean> {
    const client = supabaseManager.getClient();
    if (!client) return false;

    try {
      const credentials = this.walletRepo.getAll();
      const trustRecords = this.trustRepo.getAll();

      const statePayload = {
        credentials,
        trustRecords,
        syncedAt: new Date().toISOString(),
      };

      const { error } = await client
        .from('certix_state')
        .upsert({ id: 'global', state: statePayload, updated_at: new Date().toISOString() });

      if (error) {
        console.warn('Supabase syncToCloud error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Sync failed:', e);
      return false;
    }
  }

  async fetchFromCloud(): Promise<boolean> {
    const client = supabaseManager.getClient();
    if (!client) return false;

    try {
      const { data, error } = await client
        .from('certix_state')
        .select('state')
        .eq('id', 'global')
        .single();

      if (error || !data || !data.state) return false;

      const { credentials, trustRecords } = data.state;

      if (Array.isArray(credentials)) {
        // Merge or replace
        const local = this.walletRepo.getAll();
        const existingIds = new Set(local.map((c) => c.id));
        const merged = [...local];
        for (const c of credentials) {
          if (!existingIds.has(c.id)) {
            merged.push(c);
          }
        }
        this.walletRepo.saveAll(merged);
      }

      if (Array.isArray(trustRecords)) {
        const local = this.trustRepo.getAll();
        const existingIds = new Set(local.map((r) => r.id));
        const merged = [...local];
        for (const r of trustRecords) {
          if (!existingIds.has(r.id)) {
            merged.push(r);
          }
        }
        this.trustRepo.saveAll(merged);
      }

      return true;
    } catch (e) {
      console.warn('Fetch from Supabase failed:', e);
      return false;
    }
  }
}
