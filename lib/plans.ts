/**
 * Single source of truth for subscription plans.
 *
 * - Landing page shows the Pro tier only (conversion-focused).
 * - Sign-up accepts free|pro (`?plan=`).
 * - Checkout sells the paid tiers basic|pro (`?plan=`).
 * - Dashboard > Settings > Billing shows the full Basic/Pro/Enterprise table.
 *
 * To change a price or feature list, edit PLAN_META below — every surface
 * (landing, sign-up badge, checkout, billing, sidebar) reads from here.
 */

export type Plan = "free" | "basic" | "pro" | "enterprise";

export type PlanMeta = {
  name: string;
  /** Monthly price in MMK, or null for custom (Enterprise) pricing. */
  priceMMK: number | null;
  unit: string;
  tagline: string;
  features: string[];
};

export const PLAN_META: Record<Plan, PlanMeta> = {
  free: {
    name: "Free",
    priceMMK: 0,
    unit: "MMK / လ",
    tagline: "စမ်းကြည့်ရန်အတွက်",
    features: ["တစ်လလျှင် အော်ဒါ ၅၀", "Telegram Bot ၁ ခု ချိတ်ဆက်နိုင်", "Basic support"],
  },
  basic: {
    name: "Basic",
    priceMMK: 5000,
    unit: "MMK / လ",
    tagline: "ဆိုင်လေးတွေ စနစ်တကျစဖို့",
    features: [
      "တစ်လလျှင် အော်ဒါ ၅၀၀",
      "Telegram Bot ၁ ခု ချိတ်ဆက်နိုင်",
      "Delivery Slip Export (PDF)",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    priceMMK: 15000,
    unit: "MMK / လ",
    tagline: "ဆိုင်ကြီးထွားလာပြီဆိုရင်",
    features: [
      "အော်ဒါ အကန့်အသတ်မရှိ",
      "Auto Delivery Slip Export (PDF)",
      "KPay / Wave Slip Verifier",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    priceMMK: null,
    unit: "",
    tagline: "Brand ကြီးတွေအတွက်",
    features: [
      "အော်ဒါအကန့်အသတ်မရှိ + ဆိုင်ခွဲအများ",
      "Dedicated account manager",
      "Custom Bot flows + API",
      "SLA + Priority support",
    ],
  },
};

/** Ordered tiers for upgrade/downgrade comparison (higher = more premium). */
export const PLAN_RANK: Record<Plan, number> = { free: 0, basic: 1, pro: 2, enterprise: 3 };

/** Tiers shown on the post-authentication billing table. */
export const BILLING_TIERS: Plan[] = ["basic", "pro", "enterprise"];

export function isPlan(value: unknown): value is Plan {
  return value === "free" || value === "basic" || value === "pro" || value === "enterprise";
}

/** "15,000" / "5,000" / "0" / "Custom" */
export function formatPlanPrice(plan: Plan): string {
  const price = PLAN_META[plan].priceMMK;
  if (price === null) return "Custom";
  return price.toLocaleString("en-US");
}

/** Sign-up accepts free|pro only: `?plan=pro` (any case) selects Pro, everything else is Free. */
export function parsePlanParam(value: string | null | undefined): "free" | "pro" {
  return typeof value === "string" && value.trim().toLowerCase() === "pro" ? "pro" : "free";
}

/** Checkout sells paid tiers: `?plan=basic` selects Basic, everything else defaults to Pro. */
export function parseCheckoutPlan(value: string | null | undefined): "basic" | "pro" {
  return typeof value === "string" && value.trim().toLowerCase() === "basic" ? "basic" : "pro";
}

/** Badge line shown at the top of the sign-up form. */
export function planBadgeText(plan: "free" | "pro"): string {
  if (plan === "pro") {
    return `Pro Plan (${formatPlanPrice("pro")} MMK / လ) အတွက် အကောင့်ဖွင့်နေသည်`;
  }
  return "Free Plan အတွက် အကောင့်ဖွင့်နေသည်";
}
