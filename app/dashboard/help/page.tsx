"use client";

import DashboardShell from "@/components/DashboardShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate, type TranslationKey } from "@/lib/i18n";
import { TELEGRAM_CHANNEL_URL, TELEGRAM_COMMUNITY_URL } from "@/lib/support";
import { ArrowUpRight, Bot, FileCheck2, Megaphone, Rocket, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

type GuideId = "g1" | "g2" | "g3" | "g4";

/** Non-text guide config; every visible string comes from the i18n dictionary (`help.<id>.*`). */
const GUIDES: { id: GuideId; icon: LucideIcon; tone: string; stepCount: number; href: string }[] = [
  { id: "g1", icon: Rocket, tone: "bg-indigo-400/10 text-indigo-300", stepCount: 4, href: "/dashboard" },
  { id: "g2", icon: Bot, tone: "bg-sky-400/10 text-sky-300", stepCount: 4, href: "/dashboard/bot-settings" },
  { id: "g3", icon: ShoppingBag, tone: "bg-emerald-400/10 text-emerald-300", stepCount: 3, href: "/dashboard/products" },
  { id: "g4", icon: FileCheck2, tone: "bg-amber-400/10 text-amber-300", stepCount: 3, href: "/dashboard/slip-verifier" },
];

const LINKS: { id: "community" | "channel"; href: string; icon: LucideIcon }[] = [
  { id: "community", href: TELEGRAM_COMMUNITY_URL, icon: Users },
  { id: "channel", href: TELEGRAM_CHANNEL_URL, icon: Megaphone },
];

export default function HelpPage() {
  const { lang, t } = useLanguage();
  // Dynamic keys are built from known ids, so the cast is safe.
  const k = (key: string) => key as TranslationKey;

  return (
    <DashboardShell>
      <div className="mb-7">
        <p className="dashboard-label">{t("help.label")}</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("help.title")}
          {lang === "my" && <span className="text-indigo-300"> (Help &amp; Support)</span>}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{t("help.subtitle")}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Telegram support">
        {LINKS.map(item => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card group flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition active:scale-[0.99]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
              <item.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold text-white">{t(k(`help.${item.id}.title`))}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{t(k(`help.${item.id}.desc`))}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                {t(k(`help.${item.id}.cta`))} <ArrowUpRight className="size-3.5" />
              </span>
            </span>
          </a>
        ))}
      </section>

      <div className="mb-4 mt-10">
        <p className="dashboard-label">{t("help.guide.label")}</p>
        <h3 className="mt-2 font-display text-xl font-bold text-white">{t("help.guide.heading")}</h3>
      </div>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="User guide">
        {GUIDES.map((guide, index) => (
          <article key={guide.id} className="surface-card flex flex-col rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`flex size-10 items-center justify-center rounded-xl ${guide.tone}`}>
                <guide.icon className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {t("help.guide.step", { n: index + 1 })}
                  {/* Burmese UI keeps the English name as a secondary label. */}
                  {lang === "my" && ` · ${translate("en", k(`help.${guide.id}.title`))}`}
                </p>
                <h4 className="font-display text-base font-bold text-white">{t(k(`help.${guide.id}.title`))}</h4>
              </div>
            </div>
            <ol className="mt-4 flex-1 space-y-2.5">
              {Array.from({ length: guide.stepCount }, (_, i) => i + 1).map(n => (
                <li key={n} className="flex items-start gap-3 text-[13px] leading-6 text-slate-300">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/15 text-[10px] font-bold text-indigo-300">
                    {n}
                  </span>
                  {t(k(`help.${guide.id}.s${n}`))}
                </li>
              ))}
            </ol>
            <Link
              href={guide.href}
              className="guide-link-button mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition active:scale-95"
            >
              {t(k(`help.${guide.id}.cta`))} <ArrowUpRight className="size-3.5" />
            </Link>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
