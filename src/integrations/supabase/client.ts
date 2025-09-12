import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Em Lovable, não use VITE_* vars. Use os valores públicos diretamente.
const supabaseUrl = 'https://vixjenbmutjvlcmmrwdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeGplbmJtdXRqdmxjbW1yd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODEwMTMsImV4cCI6MjA3Mjc1NzAxM30.9ZEMIuVIev0_7dbeB0D97k0rq_5t9wgFLgd2q0gv7Jk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration.');
}

// Cria o cliente Supabase usando a chave pública e segura (anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
