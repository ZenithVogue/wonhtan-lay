"use client";

import DashboardShell from "@/components/DashboardShell";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang, TranslationKey } from "@/lib/i18n";
import { useAccount } from "@/hooks/usePlan";
import { saveAccount } from "@/lib/account";
import { BILLING_TIERS, planPriceFor, PLAN_META, PLAN_RANK, type BillingCycle, type Plan } from "@/lib/plans";
import { ArrowUpRight, BadgeCheck, Building2, Check, CreditCard, Crown, Languages, LogOut, Phone, Store, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "@/lib/toast";

type Tab = "billing" | "profile";

const TIER_ICONS: Record<Plan, typeof Zap> = { free: BadgeCheck, basic: Zap, pro: Crown, enterprise: Building2 };

export default function SettingsPage() {
  // useSearchParams needs a Suspense boundary for the production build.
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, setLang, t } = useLanguage();
  // The active tab lives in the URL (?tab=billing|profile) so links such as
  // the sidebar "Upgrade to Pro" button can open Billing / Subscription directly.
  const tab: Tab = searchParams.get("tab") === "profile" ? "profile" : "billing";
  const setTab = (next: Tab) => router.replace(`/dashboard/settings?tab=${next}`, { scroll: false });
  const account = useAccount();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const plan: Plan = account?.plan ?? "free";
  // Dynamic keys are built from known plan ids, so the cast is safe.
  const k = (key: string) => key as TranslationKey;
  const tagline = (p: Plan) => t(k(`plan.${p}.tagline`));
  const features = (p: Plan) => PLAN_META[p].features.map((_, i) => t(k(`plan.${p}.f${i + 1}`)));
  const priceLabel = (p: Plan) => {
    const price = planPriceFor(p, cycle);
    return price === null ? t("settings.price.custom") : price.toLocaleString("en-US");
  };
  const unitLabel = (p: Plan) =>
    PLAN_META[p].priceMMK === null ? "" : t(cycle === "yearly" ? "settings.unit.year" : "settings.unit.month");
  const currentRank = PLAN_RANK[plan];

  const changePlan = (tier: Plan) => {
    if (!account) {
      router.push("/sign-up");
      return;
    }
    if (tier === plan) return;
    if (tier === "enterprise") {
      toast(t("settings.toast.enterprise.title"), { description: t("settings.toast.enterprise.desc") });
      return;
    }
    if (tier === "free") return; // Not offered on the billing table.
    if (PLAN_RANK[tier] > currentRank) {
      // Upgrade — always goes through KPay / WavePay checkout.
      router.push(`/checkout?plan=${tier}&cycle=${cycle}`);
      return;
    }
    // Downgrade (demo): applies immediately, no proration in demo mode.
    const updated = { ...account, plan: tier, proUnlocked: true };
    saveAccount(updated);
    toast(t("settings.toast.switched.title", { name: PLAN_META[tier].name }), {
      description: t("settings.toast.switched.desc"),
    });
    window.location.reload();
  };

  const logout = () => {
    toast(t("settings.toast.logout.title"), { description: t("settings.toast.logout.desc") });
    router.push("/sign-in");
  };

  return (
    <DashboardShell>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {lang === "my" ? (
              <>
                {t("settings.heading")} <span className="text-indigo-300">(Settings)</span>
              </>
            ) : (
              t("settings.heading")
            )}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t("settings.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 active:scale-95 dark:text-red-400"
        >
          <LogOut className="size-4" /> {t("settings.logout")}
        </button>
      </div>

      <div role="tablist" aria-label="Settings sections" className="tab-list mb-6 flex w-fit max-w-full flex-wrap gap-1.5 rounded-2xl border p-1.5">
        {(
          [
            { id: "billing", label: t("settings.tab.billing"), icon: CreditCard },
            { id: "profile", label: t("settings.tab.profile"), icon: UserRound },
          ] as const
        ).map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`tab-trigger flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-semibold transition active:scale-[0.98] ${
              tab === item.id ? "tab-trigger-active" : ""
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "billing" ? (
        <>
          <div className="surface-card mb-6 flex flex-col gap-3 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{t("settings.currentPlan")}</p>
                <p className="mt-1 font-display text-lg font-bold text-white">
                  {t("settings.planName", { name: PLAN_META[plan].name })}
                  <span className="ml-2 rounded-full bg-emerald-400/10 px-2.5 py-1 align-middle text-[10px] font-bold text-emerald-300">
                    {t("settings.active")}
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {account
                ? `${account.shop || t("settings.banner.noShop")} · ${account.phone}`
                : t("settings.banner.noAccount")}
            </p>
          </div>

          <div className="mb-5 flex flex-col items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Billing cycle"
              className="tab-list inline-flex max-w-full flex-wrap items-stretch justify-center gap-1.5 rounded-2xl border p-1.5"
            >
              {(
                [
                  { id: "monthly", label: t("settings.cycle.monthly") },
                  { id: "yearly", label: t("settings.cycle.yearly") },
                ] as const
              ).map(option => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={cycle === option.id}
                  onClick={() => setCycle(option.id)}
                  className={`tab-trigger flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                    cycle === option.id ? "tab-trigger-active" : ""
                  }`}
                >
                  {option.label}
                  {option.id === "yearly" && (
                    <span className="tab-badge inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 text-[10px] font-bold leading-none">
                      {t("settings.cycle.badge")}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {cycle === "yearly" && (
              <p className="text-[11px] text-slate-500">{t("settings.cycle.note")}</p>
            )}
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
                      ? "surface-card-featured border-2 shadow-md"
                      : "surface-card border shadow-sm"
                  }`}
                >
                  {featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-950">
                      {t("settings.popular")}
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
                  <p className="mt-0.5 text-xs text-slate-500">{tagline(tier)}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold tracking-tight text-white">
                      {priceLabel(tier)}
                    </span>
                    {unitLabel(tier) && <span className="text-xs text-slate-500">{unitLabel(tier)}</span>}
                  </div>
                  <div className="my-5 h-px bg-white/[0.08]" />
                  <ul className="flex-1 space-y-3">
                    {features(tier).map(feature => (
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
                        : featured || isUpgrade || tier === "enterprise"
                          ? "on-primary pricing-cta-primary bg-indigo-500 text-white hover:bg-indigo-400"
                          : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="size-4" /> {t("settings.btn.current")}
                      </>
                    ) : tier === "enterprise" ? (
                      <>
                        {t("settings.btn.contact")} <ArrowUpRight className="size-4" />
                      </>
                    ) : isUpgrade ? (
                      <>
                        {t("settings.btn.upgrade", { name: meta.name })} <ArrowUpRight className="size-4" />
                      </>
                    ) : (
                      <>{t("settings.btn.switch", { name: meta.name })}</>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-center text-xs text-slate-600">
            {t("settings.disclaimer")}
          </p>
        </>
      ) : (
        <div className="max-w-2xl space-y-4">
          <div className="section-card max-w-2xl rounded-2xl border p-6 shadow-sm">
            {account ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-emerald-400 font-display text-lg font-bold text-white">
                    {(account.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-white">{account.name || t("settings.noName")}</p>
                    <p className="text-xs text-slate-500">
                      {t("settings.planName", { name: PLAN_META[plan].name })} · {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="profile-info-card rounded-xl border p-4">
                    <p className="profile-info-label flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                      <Store className="size-3.5" /> {t("settings.shopName")}
                    </p>
                    <p className="profile-info-value mt-1.5 text-sm font-semibold">{account.shop || t("settings.noShop")}</p>
                  </div>
                  <div className="profile-info-card rounded-xl border p-4">
                    <p className="profile-info-label flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                      <Phone className="size-3.5" /> {t("settings.phone")}
                    </p>
                    <p className="profile-info-value mt-1.5 font-mono text-sm font-semibold">{account.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <UserRound className="mx-auto size-8 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">{t("settings.noAccount")}</p>
                <Link href="/sign-up" className="button-primary mt-5">
                  {t("settings.createAccount")}
                </Link>
              </div>
            )}
          </div>
          <section className="section-card rounded-2xl border p-6 shadow-sm" aria-labelledby="language-heading">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
                <Languages className="size-5" />
              </span>
              <div>
                <h3 id="language-heading" className="font-display text-base font-bold text-white">
                  {t("settings.language.title")}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{t("settings.language.desc")}</p>
              </div>
            </div>
            <div role="radiogroup" aria-labelledby="language-heading" className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "my", flag: "🇲🇲", label: t("settings.language.my"), native: "မြန်မာဘာသာ" },
                  { id: "en", flag: "🇬🇧", label: t("settings.language.en"), native: "English" },
                ] as { id: Lang; flag: string; label: string; native: string }[]
              ).map(option => {
                const selected = lang === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setLang(option.id)}
                    className={`lang-option flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                      selected ? "lang-option-selected" : ""
                    }`}
                  >
                    <span className="lang-option-flag text-xl" aria-hidden="true">{option.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="lang-option-label block text-sm font-semibold">{option.label}</span>
                      <span className="lang-option-sub block text-[11px]">{option.native}</span>
                    </span>
                    {selected && <Check className="lang-option-check size-4" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
