/**
 * One-shot hand-off of a "quick action" (opened from the header "+ New" menu) to
 * the page that implements it. Stored in sessionStorage so it survives the
 * client-side navigation, and announced with an event when the page is already open.
 */

export type QuickAction = "add-product" | "create-order";

const KEY = "wl_quick_action";
export const QUICK_ACTION_EVENT = "wl:quick-action";

export function sendQuickAction(action: QuickAction): void {
  try {
    window.sessionStorage.setItem(KEY, action);
  } catch {
    // sessionStorage unavailable — the page opens without the modal.
  }
  window.dispatchEvent(new Event(QUICK_ACTION_EVENT));
}

/** Returns (and clears) a pending quick action if it matches `action`. */
export function takeQuickAction(action: QuickAction): boolean {
  try {
    if (window.sessionStorage.getItem(KEY) !== action) return false;
    window.sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
