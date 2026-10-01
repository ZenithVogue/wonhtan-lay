"use client";

import DashboardShell from "@/components/DashboardShell";
import { getAccount, saveAccount } from "@/lib/account";
import { BILLING_TIERS, formatPlanPrice, PLAN_META, PLAN_RANK, type Plan } from "@/lib/plans";
import { ArrowUpRight, BadgeCheck, Building2, Check, CreditCard, Crown, Phone, Store, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "billing" | "profile";

const TIER_ICONS: Record<Plan, typeof Zap> = { free: BadgeCheck, basic: Zap, pro: Crown, enterprise: Building2 };

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("billing");
  const [account, setAccount] = useState(() => getAccount());
  const plan: Plan = account?.plan ?? "free";
  const currentRank = PLAN_RANK[plan];

  const changePlan = (tier: Plan) => {
    if (!account) {
      router.push("/sign-up");
      return;
    }
    if (tier === plan) return;
    if (tier === "enterprise") {
      toast("Enterprise အတွက် ဆက်သွယ်ပါ", {
        description: "အဖွဲ့နဲ့ ဆွေးနွေးပြီး သင့်အတွက် သင့်တော်တဲ့ စျေးနှုန်းကို ရယူပါ။",
      });
      return;
    }
    if (tier === "free") return; // Not offered on the billing table.
    if (PLAN_RANK[tier] > currentRank) {
      // Upgrade — always goes through KPay / WavePay checkout.
      router.push(`/checkout?plan=${tier}`);
      return;
    }
    // Downgrade (demo): applies immediately, no proration in demo mode.
    const updated = { ...account, plan: tier, proUnlocked: true };
    saveAccount(updated);
    setAccount(updated);
    toast(`${PLAN_META[tier].name} Plan ကို ပြောင်းပြီးပါပြီ`, {
      description: "Demo mode ဖြစ်သောကြောင့် ချက်ချင်း သက်ရောက်သွားပါတယ်။",
    });
    window.location.reload();
  };

  return (
    <DashboardShell title="Settings" titleMyanmar="ဆက်တင်များ">
      <div className="mb-7">
        <p className="dashboard-label">SETTINGS</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          ဆက်တင်များ <span className="text-indigo-300">(Settings)</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">အကောင့်အချက်အလက်နဲ့ Subscription Plan ကို စီမံပါ။</p>
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {(
          [
            { id: "billing", label: "Billing / Subscription", icon: CreditCard },
            { id: "profile", label: "Profile", icon: UserRound },
          ] as const
        ).map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
              tab === item.id
                ? "bg-indigo-500/20 text-indigo-200 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]"
                : "text-slate-500 hover:text-white"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "billing" ? (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">လက်ရှိ Plan</p>
                <p className="mt-1 font-display text-lg font-bold text-white">
                  {PLAN_META[plan].name} Plan
                  <span className="ml-2 rounded-full bg-emerald-400/10 px-2.5 py-1 align-middle text-[10px] font-bold text-emerald-300">
                    Active
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {account
                ? `${account.shop || "ဆိုင်အမည် မရှိသေးပါ"} · ${account.phone}`
                : "အကောင့်မရှိသေးပါ — Plan ရွေးပြီး အကောင့်ဖွင့်ပါ။"}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {BILLING_TIERS.map(tier => {
              const meta = PLAN_META[tier];
              const Icon = TIER_ICONS[tier];
              const isCurrent = tier === plan;
              const isUpgrade = PLAN_RANK[tier] > currentRank;
              const featured = tier === "pro";
              return (
                <article
                  key={tier}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    featured
                      ? "border-emerald-300/30 bg-gradient-to-b from-emerald-400/[0.08] to-transparent shadow-[0_0_50px_rgba(16,185,129,0.12)]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-950">
                      Popular
                    </div>
                  )}
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      featured ? "bg-emerald-300/10 text-emerald-300" : "bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">{meta.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{meta.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold tracking-tight text-white">
                      {formatPlanPrice(tier)}
                    </span>
                    {meta.unit && <span className="text-xs text-slate-500">{meta.unit}</span>}
                  </div>
                  <div className="my-5 h-px bg-white/[0.08]" />
                  <ul className="flex-1 space-y-3">
                    {meta.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5 text-[13px] text-slate-300">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => changePlan(tier)}
                    disabled={isCurrent}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                      isCurrent
                        ? "cursor-default border border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                        : featured || isUpgrade
                          ? "bg-indigo-500 text-white hover:bg-indigo-400"
                          : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="size-4" /> လက်ရှိအသုံးပြုနေသည်
                      </>
                    ) : tier === "enterprise" ? (
                      <>
                        အဖွဲ့နဲ့ ဆက်သွယ်မည် <ArrowUpRight className="size-4" />
                      </>
                    ) : isUpgrade ? (
                      <>
                        {meta.name} ကို Upgrade မည် <ArrowUpRight className="size-4" />
                      </>
                    ) : (
                      <>{meta.name} ကို ပြောင်းမည်</>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-center text-xs text-slate-600">
            Upgrade လုပ်ရင် KPay / WavePay Checkout ကို ပို့ပေးပါမယ်။ Downgrade က Demo mode မှာ ချက်ချင်းသက်ရောက်ပါတယ်။
          </p>
        </>
      ) : (
        <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {account ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-emerald-400 font-display text-lg font-bold text-white">
                  {(account.name || "?").slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-white">{account.name || "အမည်မရှိသေးပါ"}</p>
                  <p className="text-xs text-slate-500">
                    {PLAN_META[plan].name} Plan · {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-slate-950/50 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <Store className="size-3.5" /> ဆိုင်နာမည်
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{account.shop || "—"}</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-slate-950/50 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <Phone className="size-3.5" /> ဖုန်းနံပါတ်
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-semibold text-white">{account.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <UserRound className="mx-auto size-8 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">အကောင့်မရှိသေးပါ</p>
              <Link href="/sign-up" className="button-primary mt-5">
                အကောင့်ဖွင့်မည်
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
