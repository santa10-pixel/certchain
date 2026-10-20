import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const DEFAULT_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

class SupabaseManager {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  public init(customUrl?: string, customKey?: string) {
    if (typeof window === 'undefined') return;

    const url = customUrl || localStorage.getItem('certix_supabase_url') || DEFAULT_URL;
    const key = customKey || localStorage.getItem('certix_supabase_key') || DEFAULT_KEY;

    if (url && key) {
      try {
        this.client = createClient(url, key);
        this.isConfigured = true;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.client = null;
      this.isConfigured = false;
    }
  }

  public getClient(): SupabaseClient | null {
    if (!this.client && typeof window !== 'undefined') {
      this.init();
    }
    return this.client;
  }

  public getStatus(): { isConnected: boolean; url: string | null } {
    if (typeof window === 'undefined') return { isConnected: false, url: null };
    const url = localStorage.getItem('certix_supabase_url') || DEFAULT_URL || null;
    return {
      isConnected: this.isConfigured && !!this.client,
      url,
    };
  }

  public saveConfig(url: string, key: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('certix_supabase_url', url);
    localStorage.setItem('certix_supabase_key', key);
    this.init(url, key);
  }

  public clearConfig() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('certix_supabase_url');
    localStorage.removeItem('certix_supabase_key');
    this.client = null;
    this.isConfigured = false;
  }
}

export const supabaseManager = new SupabaseManager();
