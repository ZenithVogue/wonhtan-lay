/**
 * Normalize a Supabase project URL to its bare origin form.
 * Accepts copy-pasted values with trailing slashes or a `/rest/v1` suffix —
 * the client appends API paths itself, so those must be stripped.
 */
export function normalizeSupabaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}
