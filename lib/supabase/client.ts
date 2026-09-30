import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "./url";

/**
 * Browser-side Supabase client for the dashboard's realtime subscription.
 * Only NEXT_PUBLIC_* vars are inlined into browser bundles, so the dashboard
 * requires NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * When missing, callers fall back to polling /api/orders instead.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key || key.includes("PASTE_")) return null;

  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return browserClient;
}
