/**
 * Demo account + plan store (localStorage).
 *
 * Keeps the plan chosen on the pricing page (`?plan=free|pro`) through
 * sign-up and checkout, so the dashboard can show Free vs Pro state.
 * NOTE: demo-grade persistence — a real backend (Supabase Auth + a
 * profiles/subscriptions table) should replace this before production.
 */

export type Plan = "free" | "pro";

export type Account = {
  name: string;
  shop: string;
  phone: string;
  /** Stored only for the demo sign-in check — never do this in production. */
  password: string;
  plan: Plan;
  /** True for Free accounts immediately; for Pro once checkout completes. */
  proUnlocked: boolean;
  createdAt: string;
};

export const PRO_PRICE_MMK = 15000;
export const ACCOUNT_KEY = "wl_account";

/** `?plan=pro` (any case) selects Pro, everything else falls back to Free. */
export function parsePlanParam(value: string | null | undefined): Plan {
  return typeof value === "string" && value.trim().toLowerCase() === "pro" ? "pro" : "free";
}

/** Badge line shown at the top of the sign-up form. */
export function planBadgeText(plan: Plan): string {
  if (plan === "pro") {
    return `Pro Plan (${PRO_PRICE_MMK.toLocaleString("en-US")} MMK / လ) အတွက် အကောင့်ဖွင့်နေသည်`;
  }
  return "Free Plan အတွက် အကောင့်ဖွင့်နေသည်";
}

function readStorage(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    if (!parsed || typeof parsed.phone !== "string") return null;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      shop: typeof parsed.shop === "string" ? parsed.shop : "",
      phone: parsed.phone,
      password: typeof parsed.password === "string" ? parsed.password : "",
      plan: parsed.plan === "pro" ? "pro" : "free",
      proUnlocked: parsed.proUnlocked === true || parsed.plan !== "pro",
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeStorage(account: Account): void {
  try {
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // Storage unavailable (private mode) — the flow still works in-memory
    // for this page, it just won't survive a refresh.
  }
}

export function getAccount(): Account | null {
  return readStorage();
}

export function saveAccount(account: Account): void {
  writeStorage(account);
}

/** Mark the stored Pro account as paid/unlocked. Returns the updated account. */
export function unlockPro(): Account | null {
  const account = readStorage();
  if (!account) return null;
  const updated: Account = { ...account, plan: "pro", proUnlocked: true };
  writeStorage(updated);
  return updated;
}

/** Where a signed-in account should land: unpaid Pro goes to checkout. */
export function landingRouteFor(account: Account): string {
  return account.plan === "pro" && !account.proUnlocked ? "/checkout?plan=pro" : "/dashboard";
}
