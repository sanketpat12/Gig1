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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
