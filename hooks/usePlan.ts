"use client";

import { getAccount, type Account } from "@/lib/account";
import { PLAN_META, type Plan } from "@/lib/plans";
import { useState } from "react";

export type PlanState = {
  account: Account | null;
  plan: Plan;
  /** Top tiers with completed payment (Pro or Enterprise). */
  isPro: boolean;
  /** Any paid tier with completed payment (Basic, Pro, Enterprise). */
  isPaid: boolean;
  /** Display label, e.g. "Pro Plan". */
  planLabel: string;
};

/**
 * Reads the demo account (plan + unlock state) from localStorage.
 * Lazy useState initializer so the value is correct on the very first
 * client render (dashboard pages render inside <ClientOnly>, so there is
 * no SSR pass to mismatch against).
 */
export function usePlan(): PlanState {
  const [account] = useState<Account | null>(() => getAccount());
  const plan: Plan = account?.plan ?? "free";
  const unlocked = account?.proUnlocked ?? false;
  return {
    account,
    plan,
    isPro: (plan === "pro" || plan === "enterprise") && unlocked,
    isPaid: plan !== "free" && unlocked,
    planLabel: `${PLAN_META[plan].name} Plan`,
  };
}
