import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — throws clearly if env vars are missing.
// Server-side only: uses the service role key, which bypasses RLS.
// Never import this module from src/ (browser) code.
let _db: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (_db) return _db;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }
  _db = createClient(url, key, { auth: { persistSession: false } });
  return _db;
}
