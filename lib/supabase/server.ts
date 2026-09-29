import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "./url";

/**
 * Server-side Supabase client (API routes, polling loop).
 * Reads SUPABASE_URL / SUPABASE_ANON_KEY, falling back to the NEXT_PUBLIC_*
 * pair so a single set of values in .env.local is enough.
 */
export function getSupabaseUrl(): string {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return normalizeSupabaseUrl(raw);
}

export function getSupabaseAnonKey(): string {
  return (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}

export function isSupabaseConfigured(): boolean {
  const key = getSupabaseAnonKey();
  return Boolean(getSupabaseUrl() && key && !key.includes("PASTE_"));
}

let cachedClient: SupabaseClient | null = null;
let cachedFingerprint = "";

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key || key.includes("PASTE_")) return null;

  const fingerprint = `${url}::${key.slice(-8)}`;
  if (!cachedClient || cachedFingerprint !== fingerprint) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    cachedFingerprint = fingerprint;
  }
  return cachedClient;
}

export function requireSupabaseServerClient(): SupabaseClient {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local (see .env.example).",
    );
  }
  return client;
}
