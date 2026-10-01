"use client";

import { useState, type ReactNode } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  CreditCard,
  Facebook,
  FileCheck2,
  FileText,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  PackageCheck,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const features = [
  {
    icon: Bot,
    eyebrow: "AUTOMATE THE BUSYWORK",
    title: "24/7 Auto Order Taking",
    burmese: "အော်ဒါ အလိုအလျောက် မှတ်ပေးခြင်း",
    description:
      "ဝယ်သူ မေးတဲ့အချိန်တိုင်း ပြန်ဖြေပြီး အော်ဒါအသေးစိတ်ကို မှားယွင်းမှုမရှိအောင် စနစ်တကျ မှတ်ပေးပါတယ်။",
    accent: "indigo",
  },
  {
    icon: FileText,
    eyebrow: "READY IN SECONDS",
    title: "Instant Delivery Slip Generator",
    burmese: "Deli Slip စက္ကန့်ပိုင်းအတွင်း ထုတ်ပေးခြင်း",
    description:
      "မှာယူထားတဲ့အချက်အလက်ကို တစ်ချက်နှိပ်ရုံနဲ့ delivery slip အဖြစ် ပြောင်းပြီး ပို့ဆောင်ဖို့ အသင့်ပါ။",
    accent: "emerald",
  },
  {
    icon: ScanLine,
    eyebrow: "VERIFY WITH CONFIDENCE",
    title: "KPay / Wave Slip OCR Verification",
    burmese: "ငွေလွှဲ စလစ် အတု/အစစ် စစ်ပေးခြင်း",
    description:
      "ငွေလွှဲစလစ်ကို AI က ဖတ်ရှုပြီး amount၊ အချိန်နဲ့ လွှဲပို့သူအချက်အလက်တွေကို မြန်မြန်စစ်ပေးပါတယ်။",
    accent: "amber",
  },
  {
    icon: LayoutDashboard,
    eyebrow: "SEE THE WHOLE PICTURE",
    title: "Merchant Order Management Dashboard",
    burmese: "စာရင်းဇယား စနစ်တကျ ထိန်းချုပ်နိုင်ခြင်း",
    description:
      "အော်ဒါတိုင်းကို status တစ်ခုတည်းနဲ့ ကြည့်၊ ရှာ၊ စီမံနိုင်တဲ့ dashboard တစ်ခုတည်းမှာ ထိန်းချုပ်ပါ။",
    accent: "cyan",
  },
];

const plans = [
  {
    name: "Free",
    label: "စမ်းကြည့်ရန်အတွက်",
    price: "0",
    unit: "MMK / လ",
    description: "စနစ်တကျ စတင်ဖို့ လိုအပ်တာအားလုံး",
    features: ["တစ်လလျှင် အော်ဒါ ၅၀", "Telegram Bot ၁ ခု ချိတ်ဆက်နိုင်", "Basic support"],
    featured: false,
  },
  {
    name: "Pro",
    label: "ဆိုင်ကြီးထွားလာပြီဆိုရင်",
    price: "15,000",
    unit: "MMK / လ",
    description: "အော်ဒါများတဲ့ဆိုင်တွေအတွက် ပိုမိုမြန်ဆန်စေမယ့် toolkit",
    features: [
      "အော်ဒါ အကန့်အသတ်မရှိ",
      "Auto Delivery Slip Export (PDF)",
      "KPay / Wave Slip Verifier",
      "Priority support",
    ],
    featured: true,
  },
];

type FooterModal = "about" | "help" | "status" | "privacy" | "terms" | null;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function actionToast(message: string) {
  toast(message, {
    description: "WonHtan Lay demo မှာ ဒီ feature ကို မကြာခင် အသုံးပြုနိုင်ပါမယ်။",
    icon: <Sparkles className="size-4 text-emerald-300" />,
  });
}

function featureStyles(accent: string) {
  const styles = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20",
      line: "bg-indigo-500",
      category: "text-indigo-600 dark:text-indigo-300",
      glow: "from-indigo-500/10",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
      line: "bg-emerald-500",
      category: "text-emerald-600 dark:text-emerald-300",
      glow: "from-emerald-500/10",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
      line: "bg-amber-500",
      category: "text-amber-600 dark:text-amber-300",
      glow: "from-amber-500/10",
    },
    cyan: {
      icon: "bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20",
      line: "bg-sky-500",
      category: "text-sky-600 dark:text-sky-300",
      glow: "from-sky-500/10",
    },
  } as const;
  return styles[accent as keyof typeof styles] ?? styles.indigo;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerModal, setFooterModal] = useState<FooterModal>(null);
  const { theme, toggleTheme } = useTheme();
  const lightMode = theme === "light";

  const navigate = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <div className={lightMode ? "light-mode min-h-screen" : "min-h-screen"}>
      <div className="page-surface min-h-screen overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_80%_0%,rgba(73,81,220,0.16),transparent_27%),radial-gradient(circle_at_5%_28%,rgba(16,185,129,0.07),transparent_24%)]" />
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:56px_56px]" />

        <header className="relative z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <div className="container flex h-[76px] items-center justify-between">
            <button className="group flex items-center gap-3 text-left" onClick={() => navigate("top")} aria-label="Go to top">
              <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-emerald-400 shadow-[0_8px_30px_rgba(78,84,220,0.38)]">
                <Bot className="relative z-10 size-5 text-white" strokeWidth={2.4} />
                <span className="absolute -bottom-5 -left-2 size-9 rounded-full bg-white/20 blur-md transition-transform duration-300 group-hover:translate-x-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-[16px] font-bold tracking-tight text-white">WonHtan Lay</span>
                <span className="mt-1 block text-[11px] font-medium tracking-[0.13em] text-slate-400">ဝန်ထမ်းလေး</span>
              </span>
            </button>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
              <button onClick={() => navigate("features")} className="nav-link">Features</button>
              <button onClick={() => navigate("pricing")} className="nav-link">Pricing</button>
              <button onClick={() => navigate("demo")} className="nav-link">Demo</button>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <button
                className="icon-button"
                onClick={() => toggleTheme?.()}
                aria-label={lightMode ? "Use dark mode" : "Use light mode"}
                aria-pressed={lightMode}
              >
                {lightMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </button>
              <button className="button-ghost" onClick={() => { window.location.href = "/sign-in"; }}>Sign In <ArrowUpRight className="size-4" /></button>
            </div>

            <button className="icon-button md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation menu">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="container flex flex-col gap-2">
                <button onClick={() => navigate("features")} className="mobile-nav-link">Features <ChevronRight className="size-4" /></button>
                <button onClick={() => navigate("pricing")} className="mobile-nav-link">Pricing <ChevronRight className="size-4" /></button>
                <button onClick={() => navigate("demo")} className="mobile-nav-link">Demo <ChevronRight className="size-4" /></button>
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white" onClick={() => { window.location.href = "/sign-in"; }}>Sign In <ArrowUpRight className="size-4" /></button>
              </div>
            </div>
          )}
        </header>

        <main id="top" className="relative z-10">
          <section className="container grid items-center gap-14 pb-20 pt-16 sm:pt-24 lg:grid-cols-[0.93fr_1.07fr] lg:gap-10 lg:pb-28 lg:pt-24">
            <div className="max-w-[680px]">
              <div className="eyebrow-pill mb-7 w-fit animate-fade-up"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" /> မြန်မာနိုင်ငံက Online Shop တွေအတွက်</div>
              <h1 className="font-display text-[clamp(2.2rem,5vw,4.25rem)] font-bold leading-[1.12] tracking-[-0.045em] text-slate-900 animate-fade-up [animation-delay:80ms] dark:text-white [animation-delay:80ms]">
                သင့်ဆိုင်အတွက်<br /><span className="text-indigo-600 dark:text-indigo-400">၂၄ နာရီ မနားတမ်း</span><br />အလုပ်လုပ်ပေးမယ့် ဝန်ထမ်းလေး
              </h1>
              <p className="mt-7 max-w-[570px] text-[16px] leading-8 text-slate-400 animate-fade-up [animation-delay:140ms] sm:text-[17px]">
                Facebook နဲ့ Telegram shop တွေအတွက် အော်ဒါလက်ခံခြင်း၊ KPay/Wave စလစ်စစ်ခြင်းနဲ့ delivery slip ထုတ်ပေးခြင်းတွေကို အလိုအလျောက် လုပ်ဆောင်ပေးမယ့် သင့်ရဲ့ digital worker ပါ။
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-fade-up [animation-delay:200ms]">
                <button className="button-primary" onClick={() => { window.location.href = "/sign-up"; }}>အခမဲ့ စတင်မည် <ArrowRight className="size-4" /></button>
                <button className="button-secondary" onClick={() => navigate("demo")}><PlayIcon /> Bot Demo စမ်းသပ်ရန်</button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500 animate-fade-up [animation-delay:260ms]">
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-emerald-400" /> Setup ၅ မိနစ်အတွင်း</span>
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-emerald-400" /> Card မလိုပါ</span>
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-emerald-400" /> မြန်မာလို support</span>
              </div>
            </div>

            <div id="demo" className="relative mx-auto w-full max-w-[650px] animate-fade-up [animation-delay:160ms]">
              <div className="absolute -left-8 top-16 size-32 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute -right-6 bottom-12 size-40 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-2 pb-4 sm:px-3">
                  <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Bot className="size-4" /></span><span className="text-sm font-semibold text-white">WonHtan Lay <span className="font-normal text-slate-500">/ order assistant</span></span></div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" /> Live</span>
                </div>
                <div className="grid gap-3 pt-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="hero-incoming rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Incoming message</span><span className="rounded-md bg-sky-400/10 px-2 py-1 text-[10px] text-sky-300">Telegram</span></div>
                    <div className="flex items-start gap-2.5"><span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"><Send className="size-3.5" /></span><div className="rounded-2xl rounded-tl-md bg-slate-200 px-3.5 py-3 text-[12px] leading-5 text-slate-700 dark:bg-slate-700 dark:text-slate-200">မင်္ဂလာပါရှင့်။<br />Cica Toner ၂ ဘူး<br />ရန်ကုန်မြို့တွင်း ပို့ပေးပါနော်။<span className="mt-2 block text-[10px] text-slate-500 dark:text-slate-400">10:42 AM</span></div></div>
                    <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-slate-500"><span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><Check className="size-3" /></span> Message understood</div>
                  </div>
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Order slip</span><span className="flex items-center gap-1 rounded-md bg-emerald-300/10 px-2 py-1 text-[10px] text-emerald-300"><CircleCheck className="size-3" /> Ready</span></div>
                    <div className="border-b border-dashed border-slate-200 pb-3 dark:border-slate-700"><div className="flex items-center justify-between"><span className="text-[13px] font-semibold text-slate-900 dark:text-white">#WH-10428</span><span className="text-[10px] text-slate-500">Today, 10:42</span></div><span className="mt-1 block text-[11px] text-slate-600 dark:text-slate-400">New customer order</span></div>
                    <div className="space-y-2.5 py-3 text-[11px]"><div className="flex justify-between text-slate-700 dark:text-slate-300"><span>Cica Toner × 2</span><span>24,000</span></div><div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Delivery fee</span><span>2,000</span></div><div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-[12px] font-semibold text-slate-900 dark:border-slate-700 dark:text-white"><span>Total</span><span className="text-emerald-700 dark:text-emerald-300">26,000 MMK</span></div></div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-2 text-[10px] text-slate-400"><span className="size-1.5 rounded-full bg-amber-300" /> Waiting for payment slip</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-indigo-300/10 bg-indigo-400/[0.06] py-3 text-[11px] text-indigo-200"><Sparkles className="size-3.5" /> Incoming message <ArrowRight className="size-3" /> Order slip ready <span className="text-slate-500">in 3 sec</span></div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:flex"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Zap className="size-4" /></span><span><span className="block text-[10px] uppercase tracking-wider text-slate-500">This month</span><span className="text-sm font-semibold text-slate-900 dark:text-white">1,284 orders automated</span></span></div>
            </div>
          </section>

          <section className="container pb-24 pt-2 sm:pb-32">
            <div className="flex flex-col gap-4 border-y border-white/[0.08] py-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Built for the way you sell online</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-400"><span className="flex items-center gap-2"><MessageCircle className="size-4 text-sky-400" /> Messenger</span><span className="flex items-center gap-2"><Send className="size-4 text-sky-300" /> Telegram</span><span className="flex items-center gap-2"><CreditCard className="size-4 text-emerald-300" /> KPay / Wave</span></div>
            </div>
          </section>

          <section id="features" className="container scroll-mt-20 pb-24 sm:pb-36">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:h-fit"><div className="section-kicker"><span className="size-1.5 rounded-full bg-emerald-300" /> Everything you need</div><h2 className="section-title mt-5">သင့်ဆိုင်ကို<br /><span className="text-indigo-600 dark:text-indigo-400">ပိုမြန်အောင်</span> လုပ်ပါ</h2><p className="section-copy mt-5">အော်ဒါတစ်ခုချင်းစီကို လိုက်မှတ်နေတဲ့အချိန်တွေကို လျှော့ပြီး၊ သင့် customer နဲ့ business ကို ပိုအာရုံစိုက်ပါ။</p><button className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:gap-3 dark:text-emerald-300" onClick={() => navigate("pricing")}>စတင်အသုံးပြုရန် <ArrowRight className="size-4" /></button></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => { const Icon = feature.icon; const styles = featureStyles(feature.accent); return <article key={feature.title} className="feature-card group rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80" style={{ animationDelay: `${index * 60}ms` }}><div className={`mb-8 flex size-12 items-center justify-center rounded-2xl ${styles.icon}`}><Icon className="size-5 transition-transform duration-300 group-hover:scale-110" /></div><div className="mb-3 flex items-center gap-2"><span className={`size-1.5 animate-pulse rounded-full ${styles.line}`} /><span className={`text-[11px] font-bold uppercase tracking-widest ${styles.category}`}>{feature.eyebrow}</span></div><h3 className="mt-3 mb-1 font-display text-xl font-bold leading-snug text-slate-900 dark:text-white">{feature.title}</h3><p className="mb-3 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">{feature.burmese}</p><p className="text-xs font-normal leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p><div className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t ${styles.glow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} /></article>; })}
              </div>
            </div>
          </section>

          <section className="container pb-24 sm:pb-36">
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-10 dark:border-slate-800 dark:bg-slate-900/80 sm:px-12 sm:py-14"><div className="absolute -right-20 -top-32 size-72 rounded-full bg-indigo-100 blur-3xl dark:bg-indigo-400/10" /><div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="section-kicker"><Sparkles className="size-3.5 text-emerald-700 dark:text-emerald-300" /> Your new digital worker</div><h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-slate-900 dark:text-white sm:text-4xl">သင့်ဆိုင်အတွက် အလုပ်အကျိုးဆောင်ပေးမယ့် ဝန်ထမ်းလေးကို အခမဲ့ စတင်ခေါ်ယူလိုက်ပါ။</h2></div><button className="button-primary w-full sm:w-fit" onClick={() => { window.location.href = "/sign-up"; }}>အခမဲ့ စတင်မည် <ArrowRight className="size-4" /></button></div></div>
          </section>

          <section id="pricing" className="container scroll-mt-20 pb-24 sm:pb-36">
            <div className="mx-auto max-w-2xl text-center"><div className="section-kicker justify-center"><span className="size-1.5 rounded-full bg-emerald-300" /> Simple pricing</div><h2 className="section-title mt-5">သင့်ဆိုင်နဲ့ <span className="gradient-text">အတူတူကြီးထွားမယ်</span></h2><p className="section-copy mx-auto mt-5">Free နဲ့ အခမဲ့ စတင်ပြီး၊ ဆိုင်ကြီးထွားလာတဲ့အခါ Pro features တွေကို ရယူလိုက်ပါ။</p></div>
            <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
              {plans.map((plan) => <article key={plan.name} className={plan.featured ? "pricing-card pricing-card-featured pricing-card-glow" : "pricing-card"}>{plan.featured && <div className="absolute right-5 top-5 rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-950">Popular</div>}<div className="flex items-start justify-between"><div><div className="font-display text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</div><div className="mt-1 text-sm text-slate-600 dark:text-slate-500">{plan.label}</div></div>{plan.featured ? <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"><Zap className="size-5" /></span> : <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-400"><Store className="size-5" /></span>}</div><div className="mt-8 flex items-end gap-2"><span className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{plan.price}</span><span className="mb-1 text-sm text-slate-600 dark:text-slate-500">{plan.unit}</span></div><p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">{plan.description}</p><div className="my-7 h-px bg-slate-200 dark:bg-white/[0.08]" /><ul className="space-y-4">{plan.features.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"><Check className={`mt-0.5 size-4 shrink-0 ${plan.featured ? "text-emerald-700 dark:text-emerald-300" : "text-indigo-700 dark:text-indigo-300"}`} />{item}</li>)}</ul><button className={plan.featured ? "button-primary mt-8 w-full" : "button-secondary mt-8 w-full"} onClick={() => { window.location.href = "/sign-up"; }}>{plan.name === "Free" ? "အခမဲ့ စတင်မည်" : "Pro နဲ့ စတင်မည်"} <ArrowRight className="size-4" /></button></article>)}
            </div>
            <p className="mt-7 text-center text-xs text-slate-500">KPay / WavePay နဲ့ ပေးချေနိုင်ပါတယ်။ အချိန်မရွေး Dashboard › Settings › Billing ကနေ plan ပြောင်းနိုင်ပါတယ်။</p>
          </section>

          <section className="container pb-24 sm:pb-32"><div className="grid items-center gap-8 border-t border-slate-200 pt-10 dark:border-slate-800 sm:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-300" /> Local sellers အတွက် ယုံကြည်စိတ်ချရတဲ့ အလုပ်ဖော်</div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-500">သင့်ရဲ့ customer data နဲ့ order information တွေကို လုံခြုံစွာ ထိန်းသိမ်းထားပြီး မြန်မာ online commerce အတွက် ရိုးရှင်းစွာ တည်ဆောက်ထားပါတယ်။</p></div><a href="https://t.me/wonhtanlay_community" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950">အဖွဲ့နဲ့ စကားပြောမယ် <ArrowUpRight className="size-4" /></a></div></section>
        </main>

        <footer className="relative z-10 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <div className="container py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-emerald-400">
                    <Bot className="size-4 text-white" />
                  </span>
                  <span className="font-display font-bold text-slate-900 dark:text-white">WonHtan Lay</span>
                </div>
                <p className="mt-5 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-500">
                  မြန်မာ online shop owner တွေအတွက် မနားတမ်း အလုပ်လုပ်ပေးမယ့် ဝန်ထမ်းလေး။
                </p>
                <div className="mt-5 flex gap-2">
                  <button className="social-button" onClick={() => actionToast("Facebook")} aria-label="Facebook"><Facebook className="size-4" /></button>
                  <button className="social-button" onClick={() => actionToast("Telegram")} aria-label="Telegram"><Send className="size-4" /></button>
                  <button className="social-button" onClick={() => actionToast("Messenger")} aria-label="Messenger"><MessageCircle className="size-4" /></button>
                </div>
              </div>
              <FooterColumn title="Product" links={["Features", "Pricing", "Demo"]} onClick={(link) => navigate(link.toLowerCase())} />
              <FooterColumn
                title="Support"
                links={["Help Center", "Talk to us", "Status"]}
                onClick={(link) => setFooterModal(link === "Help Center" ? "help" : link === "Status" ? "status" : null)}
              />
              <FooterColumn
                title="Company"
                links={["About WonHtan Lay", "Privacy", "Terms"]}
                onClick={(link) => setFooterModal(link === "About WonHtan Lay" ? "about" : link === "Privacy" ? "privacy" : "terms")}
              />
            </div>
            <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-600 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 WonHtan Lay. All rights reserved.</span>
              <span>Made for Myanmar sellers, with care.</span>
            </div>
          </div>
        </footer>

        <Dialog open={footerModal !== null} onOpenChange={(open) => !open && setFooterModal(null)}>
          <DialogContent
            showCloseButton={false}
            className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-w-2xl"
          >
            <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5 pr-16 text-left dark:border-slate-700 dark:bg-slate-900 sm:px-8">
              <DialogTitle className="font-display text-xl font-bold leading-snug text-slate-900 dark:text-white">
                {footerModal === "about" && "About WonHtan Lay (ဝန်ထမ်းလေး အကြောင်း)"}
                {footerModal === "help" && "Help Center (အကူအညီ)"}
                {footerModal === "status" && "System Status (စနစ်အခြေအနေ)"}
                {footerModal === "privacy" && "Privacy (ကိုယ်ရေးအချက်အလက် လုံခြုံရေး)"}
                {footerModal === "terms" && "Terms of Service (အသုံးပြုမှု စည်းမျဉ်းများ)"}
              </DialogTitle>
              <DialogClose
                aria-label="Close dialog"
                className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-200"
              >
                <X className="size-5" />
              </DialogClose>
            </DialogHeader>

            <div className="space-y-5 px-6 py-6 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:px-8">
              {footerModal === "about" && (
                <p>
                  WonHtan Lay ရဲ့ ရည်ရွယ်ချက်ကတော့ မြန်မာနိုင်ငံရှိ Online Shop ပိုင်ရှင်များ အချိန်ကုန် သက်သာပြီး Order များကို ၂၄ နာရီ မနားတမ်း စနစ်တကျ လက်ခံနိုင်စေရန်ဖြစ်ပါသည်။ Facebook နှင့် Telegram Shop များအတွက် အော်ဒါလက်ခံခြင်း၊ KPay/WavePay Slip စစ်ဆေးခြင်း၊ Delivery Slip ထုတ်ပေးခြင်းများကို အလိုအလျောက် အမှားအယွင်းမရှိ ပြုလုပ်ပေးသော Digital Assistant ဖြစ်ပါသည်။
                </p>
              )}

              {footerModal === "help" && (
                <>
                  <p>အောက်ပါ လမ်းညွှန်အဆင့်များအတိုင်း လုပ်ဆောင်ပြီး WonHtan Lay ကို စတင်အသုံးပြုနိုင်ပါတယ်။</p>
                  <div className="grid gap-3">
                    <GuideCard icon={<Bot className="size-5" />} title="Telegram Bot ချိတ်ဆက်နည်း">
                      Telegram မှာ BotFather ကိုဖွင့်ပြီး bot အသစ်တစ်ခု ဖန်တီးပါ။ ရရှိလာတဲ့ bot token ကို Dashboard ရဲ့ Integrations မှာ ထည့်သွင်းပြီး ဆိုင်ရဲ့ Telegram group/channel ကို ချိတ်ဆက်ကာ စမ်းသပ်စာတစ်စောင် ပို့ကြည့်ပါ။
                    </GuideCard>
                    <GuideCard icon={<CreditCard className="size-5" />} title="KPay / WavePay Slip စစ်ဆေးနည်း">
                      Order တစ်ခုကို ရွေးပြီး customer ပေးပို့ထားတဲ့ ငွေလွှဲစလစ်ကို တင်ပါ။ စနစ်က စလစ်ထဲက ငွေပမာဏနဲ့ အချက်အလက်တွေကို ဖတ်ပြပေးပါမယ်။ အတည်မပြုနိုင်တဲ့ စလစ်များကို ငွေလက်ခံစာရင်းနဲ့ ထပ်မံတိုက်စစ်ပါ။
                    </GuideCard>
                    <GuideCard icon={<FileCheck2 className="size-5" />} title="Order များ Export ထုတ်နည်း">
                      Dashboard ရဲ့ Orders စာမျက်နှာကိုသွားပြီး လိုအပ်တဲ့ ရက်စွဲ သို့မဟုတ် အခြေအနေကို စစ်ထုတ်ပါ။ Export ကိုနှိပ်ပြီး delivery slip များကို PDF အဖြစ် ရယူနိုင်ပါတယ်။
                    </GuideCard>
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">မေးလေ့ရှိသော မေးခွန်းများ</h3>
                    <details className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                      <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-200">Bot ကို ချိတ်ဆက်ပြီးနောက် အလုပ်မလုပ်ရင် ဘာလုပ်ရမလဲ?</summary>
                      <p className="pt-2">Bot token မှန်ကန်မှု၊ Bot ကို group ထဲထည့်ထားမှုနဲ့ ခွင့်ပြုချက်များကို စစ်ဆေးပြီး ပြန်လည်စမ်းသပ်ပါ။</p>
                    </details>
                    <details className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                      <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-200">Slip စစ်ဆေးမှုကို အမြဲတမ်း ကိုယ်တိုင်စစ်ဖို့ လိုပါသလား?</summary>
                      <p className="pt-2">မသေချာသော သို့မဟုတ် အချက်အလက်မပြည့်စုံသော ရလဒ်များကို ငွေလက်ခံမှုနှင့် အမြဲထပ်မံတိုက်စစ်ပါ။</p>
                    </details>
                  </div>
                </>
              )}

              {footerModal === "status" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08]">
                    <p className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-200">
                      <span aria-hidden="true">🟢</span> All Systems Operational
                    </p>
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200/75">လက်ရှိတွင် ဝန်ဆောင်မှုအားလုံး ပုံမှန်လည်ပတ်နေပါသည်။</p>
                  </div>
                  <div className="space-y-3">
                    {["Bot Engine", "Database", "Auto Slip Verifier"].map((service) => (
                      <div key={service} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{service}</span>
                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><CircleCheck className="size-4" /> Online</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ဤအခြေအနေသည် လက်ရှိပြသထားသော ဝန်ဆောင်မှု status ဖြစ်ပါသည်။</p>
                </div>
              )}

              {footerModal === "privacy" && (
                <div className="space-y-4">
                  <p>ဆိုင်ပိုင်ရှင်နှင့် customer များ၏ အော်ဒါအချက်အလက်များကို တင်းကျပ်စွာ ကာကွယ်ထိန်းသိမ်းရန်နှင့် encryption ဖြင့် လုံခြုံစေရန် WonHtan Lay ၏ ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ ရည်ရွယ်ချက်ထားရှိပါသည်။ အချက်အလက်များကို ဝန်ဆောင်မှုပေးရန် လိုအပ်သည့်အတိုင်းသာ အသုံးပြုသင့်ပြီး ခွင့်ပြုချက်မရှိဘဲ မျှဝေခြင်းမပြုရပါ။</p>
                  <div>
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">သိမ်းဆည်းခြင်းနှင့် အသုံးပြုခြင်း</h3>
                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>အော်ဒါအချက်အလက်များကို order စီမံခန့်ခွဲခြင်းနှင့် delivery slip ပြုလုပ်ခြင်းအတွက်သာ အသုံးပြုပါ။</li>
                      <li>ဆိုင်ပိုင်ရှင်သည် customer အချက်အလက်များကို လိုအပ်သည့်ကာလအတွင်းသာ ထိန်းသိမ်းပြီး မလိုအပ်တော့ပါက ဖျက်ပစ်နိုင်ပါသည်။</li>
                      <li>အကောင့် သို့မဟုတ် ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ မေးခွန်းများအတွက် Telegram support ကို ဆက်သွယ်နိုင်ပါသည်။</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/[0.08] dark:text-amber-100">
                    လုံခြုံရေး အသိပေးချက် — လက်ရှိ demo သည် account အချက်အလက်အချို့ကို browser ၏ local storage ထဲတွင် သိမ်းဆည်းပြီး encryption မလုပ်ထားပါ။ ထို့ကြောင့် အမှန်တကယ် customer သို့မဟုတ် ငွေပေးချေမှု အချက်အလက်များကို demo တွင် မထည့်ပါနှင့်။ Production ဝန်ဆောင်မှုတွင် encryption နှင့် လုံခြုံရေးထိန်းချုပ်မှုများ အတည်ပြုပြီးမှသာ အကာအကွယ်ပေးထားကြောင်း အတည်ပြုနိုင်ပါသည်။
                  </div>
                </div>
              )}

              {footerModal === "terms" && (
                <div className="space-y-4">
                  <p>WonHtan Lay ကို အသုံးပြုခြင်းဖြင့် အောက်ပါ အခြေခံစည်းမျဉ်းများကို လိုက်နာရန် သဘောတူပါသည်။</p>
                  <section>
                    <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">ဝန်ဆောင်မှု အသုံးပြုခြင်း</h3>
                    <p>ဆိုင်နှင့် အော်ဒါအချက်အလက်များကို မှန်ကန်စွာ ထည့်သွင်းပါ။ ဝန်ဆောင်မှုကို ဥပဒေနှင့် မညီသော လုပ်ငန်းများ၊ လိမ်လည်မှုများ သို့မဟုတ် အခြားသူများ၏ အခွင့်အရေးကို ချိုးဖောက်ရန် အသုံးမပြုရပါ။</p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">ငွေပေးချေမှုနှင့် အစီအစဉ်</h3>
                    <p>အခမဲ့အစီအစဉ်နှင့် အခပေးအစီအစဉ်များတွင် ကန့်သတ်ချက်နှင့် လုပ်ဆောင်ချက်များ ကွာခြားနိုင်ပါသည်။ အခပေးအစီအစဉ် အသုံးပြုမှုကို အတည်ပြုထားသော ငွေပေးချေမှု ပြီးဆုံးပြီးမှသာ စတင်နိုင်ပါသည်။</p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">ဝန်ဆောင်မှုနှင့် ပြင်ဆင်မှုများ</h3>
                    <p>စနစ်ကို ပိုမိုကောင်းမွန်စေရန် လုပ်ဆောင်ချက်များ၊ စျေးနှုန်းများနှင့် စည်းမျဉ်းများကို အချိန်နှင့်အမျှ ပြင်ဆင်နိုင်ပါသည်။ စလစ်စစ်ဆေးမှုအပါအဝင် အလိုအလျောက် ရလဒ်များကို လိုအပ်သည့်အခါ ကိုယ်တိုင်ပြန်လည်စစ်ဆေးရန် အသုံးပြုသူတွင် တာဝန်ရှိပါသည်။</p>
                  </section>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ဤစာမျက်နှာတွင် အခြေခံသတ်မှတ်ချက်များကိုသာ ဖော်ပြထားပါသည်။ မေးခွန်းများရှိပါက Telegram support ကို ဆက်သွယ်ပါ။</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function GuideCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <span className="text-indigo-600 dark:text-indigo-300">{icon}</span>{title}
      </h3>
      <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">{children}</p>
    </section>
  );
}

function PlayIcon() {
  return <span className="flex size-5 items-center justify-center rounded-full border border-slate-500 text-[9px]">▶</span>;
}

function FooterColumn({ title, links, onClick }: { title: string; links: string[]; onClick: (link: string) => void }) {
  const linkClass = "inline-block w-fit cursor-pointer text-left text-sm text-slate-600 transition-all duration-200 hover:text-indigo-600 active:scale-95 active:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:active:text-indigo-300 dark:focus-visible:ring-offset-slate-950";
  const sectionIds: Record<string, string> = { Features: "features", Pricing: "pricing", Demo: "demo" };

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-5 flex flex-col items-start gap-3">
        {links.map((link) => {
          if (link === "Talk to us") {
            return (
              <a key={link} href="https://t.me/wonhtanlay_community" target="_blank" rel="noopener noreferrer" className={linkClass}>
                {link}
              </a>
            );
          }

          const sectionId = sectionIds[link];
          if (sectionId) {
            return (
              <a
                key={link}
                href={`#${sectionId}`}
                onClick={(event) => {
                  event.preventDefault();
                  onClick(link);
                }}
                className={linkClass}
              >
                {link}
              </a>
            );
          }

          return (
            <button key={link} type="button" onClick={() => onClick(link)} className={linkClass}>
              {link}
            </button>
          );
        })}
      </div>
    </div>
  );
}
