import { createClient } from '@supabase/supabase-js';

// FIX: Add type definitions for Vite's `import.meta.env` to resolve TypeScript errors.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

// Use environment variables for Supabase credentials
// Vite exposes env variables through `import.meta.env` on the client side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
