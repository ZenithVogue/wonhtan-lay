"use client";

import { getAccount, type Account, type Plan } from "@/lib/account";
import { useState } from "react";

export type PlanState = {
  account: Account | null;
  plan: Plan;
  isPro: boolean;
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
  return { account, plan, isPro: plan === "pro" && (account?.proUnlocked ?? false) };
}
