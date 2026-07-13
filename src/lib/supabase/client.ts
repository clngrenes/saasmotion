import { createClient } from "@supabase/supabase-js";

/**
 * Erstellt einen Supabase-Client für das Frontend (Browser).
 *
 * Verwendet den "anon" public Key. Die Schreib-/Lese-Rechte werden durch
 * die RLS (Row Level Security) Policies der Supabase Datenbank gesteuert.
 * In unserem Fall nutzen wir diesen Client hauptsächlich für "Realtime" Subscriptions.
 */
export function getBrowserSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
