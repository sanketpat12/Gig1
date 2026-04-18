import { createClient } from '@supabase/supabase-js';

// We attempt to read from environment variables first
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback directly to the hardcoded keys since deployment blocked your .env file
const supabaseUrl = envUrl || 'https://mymycgyiunajcbnwyoaf.supabase.co';
const supabaseAnonKey = envAnonKey || 'sb_publishable_baCK31OOHV-LfbtZFlsoEg_F91MErMx';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing! Please check your credentials.');
}

// Supabase can use the browser LockManager for auth session coordination.
// In this app it has been causing login/session restore hangs in some browsers,
// so we use a simple in-process lock instead.
const authLockNoOp = async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: authLockNoOp,
  },
});
