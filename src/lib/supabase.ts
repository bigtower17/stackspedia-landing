// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili d\'ambiente Supabase mancanti:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Presente' : '❌ Mancante');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Presente' : '❌ Mancante');
  
  // Durante il build, non crashare ma creare un client dummy
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is missing in production');
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
