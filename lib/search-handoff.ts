/**
 * One-shot hand-off of a search term from the global command palette to a page's
 * own search box. Stored in sessionStorage so it survives client-side navigation,
 * and announced with an event for when the target page is already open.
 */

export type SearchScope = "orders" | "products";

const KEY = "wl_search_handoff";
export const SEARCH_HANDOFF_EVENT = "wl:search-handoff";

type Handoff = { scope: SearchScope; query: string };

export function sendSearchHandoff(scope: SearchScope, query: string): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ scope, query } satisfies Handoff));
  } catch {
    // sessionStorage unavailable — the page just opens without a pre-filled query.
  }
  window.dispatchEvent(new Event(SEARCH_HANDOFF_EVENT));
}

/** Returns (and clears) a pending hand-off for `scope`, if any. */
export function takeSearchHandoff(scope: SearchScope): string | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Handoff>;
    if (parsed.scope !== scope || typeof parsed.query !== "string") return null;
    window.sessionStorage.removeItem(KEY);
    return parsed.query;
  } catch {
    return null;
  }
}
