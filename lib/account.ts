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

export type Shop = {
  id: string;
  name: string;
  phone: string;
  /** KPay QR code image as a (downscaled) data URL. */
  kpayQr?: string;
};

export type Account = {
  name: string;
  /** Name of the active shop ("" when the user has not added a shop yet). Kept in sync with `shops`. */
  shop: string;
  /** All shops owned by this account. */
  shops?: Shop[];
  activeShopId?: string;
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
export const ACCOUNT_EVENT = "wl:account-changed";

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
    const phone = parsed.phone;
    let shops: Shop[] = Array.isArray(parsed.shops)
      ? parsed.shops.filter((item): item is Shop => !!item && typeof item.id === "string" && typeof item.name === "string")
      : [];
    // Accounts created before multi-shop support only have a `shop` name.
    if (shops.length === 0 && typeof parsed.shop === "string" && parsed.shop.trim()) {
      shops = [{ id: "shop-1", name: parsed.shop.trim(), phone }];
    }
    const active = shops.find(item => item.id === parsed.activeShopId) ?? shops[0];
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      shop: active?.name ?? "",
      shops,
      activeShopId: active?.id,
      phone,
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
    window.dispatchEvent(new Event(ACCOUNT_EVENT));
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

/** Password must contain at least one English letter and at least one digit. */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d)/;
export const PASSWORD_COMPLEXITY_MESSAGE = "Password တွင် အင်္ဂလိပ်စာလုံးနှင့် ကိန်းဂဏန်း အနည်းဆုံး တစ်လုံးစီ ပါဝင်ရပါမည်";

export function isPasswordComplex(password: string): boolean {
  return PASSWORD_COMPLEXITY_REGEX.test(password);
}

/** The shop currently selected in the dashboard header (null when none created yet). */
export function getActiveShop(account: Account | null): Shop | null {
  if (!account?.shops?.length) return null;
  return account.shops.find(item => item.id === account.activeShopId) ?? account.shops[0];
}

export type ShopInput = { name: string; phone: string; kpayQr?: string };

function withShops(account: Account, shops: Shop[], activeShopId: string | undefined): Account {
  const active = shops.find(item => item.id === activeShopId) ?? shops[0];
  return { ...account, shops, activeShopId: active?.id, shop: active?.name ?? "" };
}

/** Pure: add a shop and make it the active one. */
export function addShopTo(account: Account, input: ShopInput, id: string = `shop-${Date.now().toString(36)}`): Account {
  const shop: Shop = { id, name: input.name.trim(), phone: input.phone, ...(input.kpayQr ? { kpayQr: input.kpayQr } : {}) };
  return withShops(account, [...(account.shops ?? []), shop], shop.id);
}

/** Pure: update an existing shop's details. */
export function updateShopIn(account: Account, shopId: string, input: ShopInput): Account {
  const shops = (account.shops ?? []).map(item =>
    item.id === shopId ? { ...item, name: input.name.trim(), phone: input.phone, kpayQr: input.kpayQr || undefined } : item,
  );
  return withShops(account, shops, account.activeShopId);
}

/** Pure: switch the active shop. */
export function setActiveShopIn(account: Account, shopId: string): Account {
  return withShops(account, account.shops ?? [], shopId);
}

export function addShop(input: ShopInput): Account | null {
  const account = readStorage();
  if (!account) return null;
  const updated = addShopTo(account, input);
  writeStorage(updated);
  return updated;
}

export function updateShop(shopId: string, input: ShopInput): Account | null {
  const account = readStorage();
  if (!account) return null;
  const updated = updateShopIn(account, shopId, input);
  writeStorage(updated);
  return updated;
}

export function setActiveShop(shopId: string): Account | null {
  const account = readStorage();
  if (!account) return null;
  const updated = setActiveShopIn(account, shopId);
  writeStorage(updated);
  return updated;
}
