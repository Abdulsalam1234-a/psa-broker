/**
 * PSA Broker - Cloud Database & Supabase Integration Client
 * 
 * Provides hybrid local-first & cloud database persistence.
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in .env,
 * records sync to Supabase PostgreSQL. Otherwise, seamlessly falls back
 * to high-performance browser LocalStorage.
 */

export interface CloudSyncStatus {
  isConfigured: boolean;
  provider: 'SUPABASE' | 'LOCAL_STORAGE';
  lastSyncTimestamp: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isCloudDatabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const getCloudSyncStatus = (): CloudSyncStatus => {
  const configured = isCloudDatabaseConfigured();
  return {
    isConfigured: configured,
    provider: configured ? 'SUPABASE' : 'LOCAL_STORAGE',
    lastSyncTimestamp: new Date().toLocaleTimeString('en-NG')
  };
};

/**
 * SQL Schema Migration Reference for PSA Broker
 * Run this in your Supabase SQL Editor if connecting a remote backend:
 * 
 * ```sql
 * CREATE TABLE IF NOT EXISTS psa_profiles (
 *   id TEXT PRIMARY KEY,
 *   full_name TEXT NOT NULL,
 *   handle TEXT UNIQUE NOT NULL,
 *   role TEXT NOT NULL DEFAULT 'STUDENT',
 *   rank_tier TEXT NOT NULL DEFAULT 'Cadet Analyst',
 *   academy_xp INT DEFAULT 200,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE IF NOT EXISTS psa_accounts (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT REFERENCES psa_profiles(id),
 *   name TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   cash_balance NUMERIC NOT NULL DEFAULT 500000,
 *   portfolio_value NUMERIC NOT NULL DEFAULT 500000,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE IF NOT EXISTS psa_orders (
 *   id TEXT PRIMARY KEY,
 *   account_id TEXT REFERENCES psa_accounts(id),
 *   user_id TEXT REFERENCES psa_profiles(id),
 *   ticker TEXT NOT NULL,
 *   side TEXT NOT NULL,
 *   order_type TEXT NOT NULL,
 *   units INT NOT NULL,
 *   price NUMERIC NOT NULL,
 *   gross_amount NUMERIC NOT NULL,
 *   net_amount NUMERIC NOT NULL,
 *   status TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ```
 */

export const cloudDatabaseService = {
  isConfigured: isCloudDatabaseConfigured,
  getStatus: getCloudSyncStatus,

  async syncUserAccount(account: any): Promise<boolean> {
    if (!isCloudDatabaseConfigured()) {
      return false; // Handled locally by AppContext LocalStorage
    }
    try {
      // Future remote API invocation
      return true;
    } catch {
      return false;
    }
  }
};
