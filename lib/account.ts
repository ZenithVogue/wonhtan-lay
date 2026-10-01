/**
 * Demo account store (localStorage).
 *
 * Sign-up creates a plan-agnostic account (Free). The stored plan/unlock
 * fields are only touched later by the dashboard billing flow.
 * NOTE: demo-grade persistence — a real backend (Supabase Auth + a
 * profiles/subscriptions table) should replace this before production.
 */

import { PLAN_META, type Plan } from "./plans";

export type { Plan };

export type Account = {
  name: string;
  shop: string;
  phone: string;
  /** Stored only for the demo sign-in check — never do this in production. */
  password: string;
  plan: Plan;
  /** True for Free accounts immediately; for paid tiers once checkout completes. */
  proUnlocked: boolean;
  createdAt: string;
};

export const PRO_PRICE_MMK = PLAN_META.pro.priceMMK ?? 15000;
export const ACCOUNT_KEY = "wl_account";

function normalizePlan(value: unknown): Plan {
  return value === "free" || value === "basic" || value === "pro" || value === "enterprise"
    ? value
    : "free";
}

function readStorage(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    if (!parsed || typeof parsed.phone !== "string") return null;
    const plan = normalizePlan(parsed.plan);
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      shop: typeof parsed.shop === "string" ? parsed.shop : "",
      phone: parsed.phone,
      password: typeof parsed.password === "string" ? parsed.password : "",
      plan,
      proUnlocked: plan === "free" ? true : parsed.proUnlocked === true,
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

/** Mark the stored account as paid for the given tier. Returns the updated account. */
export function unlockPlan(plan: "basic" | "pro"): Account | null {
  const account = readStorage();
  if (!account) return null;
  const updated: Account = { ...account, plan, proUnlocked: true };
  writeStorage(updated);
  return updated;
}

/** Backwards-compatible alias — Pro unlock. */
export function unlockPro(): Account | null {
  return unlockPlan("pro");
}

/** Where a signed-in account should land: unpaid paid-tiers resume at checkout. */
export function landingRouteFor(account: Account): string {
  if ((account.plan === "pro" || account.plan === "basic") && !account.proUnlocked) {
    return `/checkout?plan=${account.plan}`;
  }
  return "/dashboard";
}
