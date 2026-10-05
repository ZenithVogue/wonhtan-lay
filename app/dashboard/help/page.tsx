"use client";

import DashboardShell from "@/components/DashboardShell";
import { TELEGRAM_CHANNEL_URL, TELEGRAM_COMMUNITY_URL } from "@/lib/support";
import { ArrowUpRight, Bot, FileCheck2, Megaphone, Rocket, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

const GUIDES: {
  title: string;
  english: string;
  icon: LucideIcon;
  tone: string;
  steps: string[];
  href: string;
  cta: string;
}[] = [
  {
    title: "စတင်အသုံးပြုခြင်း",
    english: "Getting started",
    icon: Rocket,
    tone: "bg-indigo-400/10 text-indigo-300",
    steps: [
      "အကောင့်ဖွင့်ပြီး Sign in ဝင်ပါ။",
      "အပေါ်ညာထောင့် Active shop မှ “ဆိုင်အမည် ထည့်သွင်းရန်” ကိုနှိပ်ပြီး ဆိုင်အမည်၊ ဖုန်းနံပါတ်နှင့် KPay QR Code ထည့်ပါ။",
      "Dashboard မှာ ဒီနေ့ အော်ဒါနဲ့ ဝင်ငွေကို တစ်နေရာတည်းမှာ ကြည့်ပါ။",
      "“စမ်းသပ်အော်ဒါ ပို့ကြည့်မည်” ကိုနှိပ်ပြီး စနစ်အလုပ်လုပ်ပုံကို စမ်းကြည့်ပါ။",
    ],
    href: "/dashboard",
    cta: "Dashboard သို့သွားမည်",
  },
  {
    title: "Telegram Bot ချိတ်ဆက်ခြင်း",
    english: "Connect your Telegram bot",
    icon: Bot,
    tone: "bg-sky-400/10 text-sky-300",
    steps: [
      "Telegram ထဲက @BotFather ကို ဖွင့်ပြီး /newbot နဲ့ Bot အသစ်ဖန်တီးပါ။",
      "BotFather ပေးတဲ့ Bot Token နဲ့ Bot Username (@ မပါဘဲ) ကို copy ကူးပါ။",
      "Bot ချိတ်ဆက်ရန် စာမျက်နှာမှာ Token နဲ့ Username ကို ထည့်ပြီး Connect နှိပ်ပါ။",
      "Customer တွေ Bot ထဲမှာ မှာယူတဲ့ အော်ဒါတွေ Orders ထဲ အလိုအလျောက် ဝင်လာပါမယ်။",
    ],
    href: "/dashboard/bot-settings",
    cta: "Bot ချိတ်ဆက်ရန်",
  },
  {
    title: "ပစ္စည်းစာရင်း စီမံခြင်း",
    english: "Managing products",
    icon: ShoppingBag,
    tone: "bg-emerald-400/10 text-emerald-300",
    steps: [
      "Products / Menu စာမျက်နှာကို ဖွင့်ပါ။",
      "ပစ္စည်းအသစ်ထည့်ရန် ပစ္စည်းနာမည်၊ စျေးနှုန်း၊ အမျိုးအစားနှင့် command ကို ဖြည့်ပါ။",
      "စျေးနှုန်း ပြောင်းလိုရင် ပစ္စည်းကို ပြင်ဆင်ပြီး သိမ်းပါ။ မရောင်းတော့တာကို ဖျက်နိုင်ပါတယ်။",
    ],
    href: "/dashboard/products",
    cta: "ပစ္စည်းစာရင်းသို့",
  },
  {
    title: "ငွေလွှဲစလစ် စစ်ဆေးခြင်း",
    english: "Verifying payment slips",
    icon: FileCheck2,
    tone: "bg-amber-400/10 text-amber-300",
    steps: [
      "Slip Verifier စာမျက်နှာကို ဖွင့်ပါ။",
      "Customer ပို့ထားတဲ့ KPay / Wave Pay screenshot ကို တင်ပါ။",
      "ငွေပမာဏ၊ လွှဲသူ၊ ရက်စွဲနဲ့ Transaction ID ကို စစ်ဆေးပြီး ကိုက်ညီမှ အော်ဒါကို အတည်ပြုပါ။",
    ],
    href: "/dashboard/slip-verifier",
    cta: "Slip စစ်ရန်",
  },
];

const LINKS = [
  {
    title: "Telegram Community Group",
    description: "အခြား ဆိုင်ပိုင်ရှင်တွေနဲ့ မေးမြန်းဆွေးနွေးပြီး အဖွဲ့ကို တိုက်ရိုက်ဆက်သွယ်ပါ။",
    href: TELEGRAM_COMMUNITY_URL,
    icon: Users,
    cta: "Group ထဲဝင်မည်",
  },
  {
    title: "Telegram Channel",
    description: "Feature အသစ်များ၊ update များနှင့် အသိပေးချက်များကို အရင်ဆုံး ရယူပါ။",
    href: TELEGRAM_CHANNEL_URL,
    icon: Megaphone,
    cta: "Channel ကို Follow မည်",
  },
];

export default function HelpPage() {
  return (
    <DashboardShell>
      <div className="mb-7">
        <p className="dashboard-label">HELP &amp; SUPPORT</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          အကူအညီနှင့် လမ်းညွှန် <span className="text-indigo-300">(Help &amp; Support)</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">အသုံးပြုပုံ လမ်းညွှန်ကိုဖတ်ပြီး မေးစရာရှိရင် Telegram မှာ အဖွဲ့ကို ဆက်သွယ်ပါ။</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Telegram support">
        {LINKS.map(item => (
          <a
            key={item.title}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/40 hover:bg-white/[0.06] active:scale-[0.99]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
              <item.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold text-white">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                {item.cta} <ArrowUpRight className="size-3.5" />
              </span>
            </span>
          </a>
        ))}
      </section>

      <div className="mb-4 mt-10">
        <p className="dashboard-label">USER GUIDE</p>
        <h3 className="mt-2 font-display text-xl font-bold text-white">အသုံးပြုနည်း လမ်းညွှန်</h3>
      </div>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="User guide">
        {GUIDES.map((guide, index) => (
          <article key={guide.title} className="surface-card flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <span className={`flex size-10 items-center justify-center rounded-xl ${guide.tone}`}>
                <guide.icon className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Step {index + 1} · {guide.english}
                </p>
                <h4 className="font-display text-base font-bold text-white">{guide.title}</h4>
              </div>
            </div>
            <ol className="mt-4 flex-1 space-y-2.5">
              {guide.steps.map((step, stepIndex) => (
                <li key={step} className="flex items-start gap-3 text-[13px] leading-6 text-slate-300">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/15 text-[10px] font-bold text-indigo-300">
                    {stepIndex + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <Link
              href={guide.href}
              className="guide-link-button mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition active:scale-95"
            >
              {guide.cta} <ArrowUpRight className="size-3.5" />
            </Link>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
