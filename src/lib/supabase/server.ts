import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

/**
 * Erstellt einen Supabase-Client für das Backend (z.B. API-Routen).
 *
 * Achtung: Dieser Client nutzt den SERVICE_ROLE_KEY, um RLS zu umgehen.
 * Er darf NIEMALS im Client-Code (Browser) verwendet werden, da er volle
 * Admin-Rechte auf die Datenbank hat.
 */
export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
