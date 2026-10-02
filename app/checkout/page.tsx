"use client";

import { getAccount, unlockPlan } from "@/lib/account";
import { formatPlanPriceFor, parseBillingCycle, parseCheckoutPlan, PLAN_META } from "@/lib/plans";
import { ArrowLeft, BadgeCheck, Check, Crown, Loader2, ShieldCheck, Smartphone, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

type Method = "kpay" | "wave";

const METHODS: Record<Method, { label: string; burmese: string; account: string }> = {
  kpay: { label: "KBZPay", burmese: "KPay နဲ့ ချေမည်", account: "09 000 111 222" },
  wave: { label: "WavePay", burmese: "WavePay နဲ့ ချေမည်", account: "09 000 333 444" },
};

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = parseCheckoutPlan(searchParams.get("plan"));
  const cycle = parseBillingCycle(searchParams.get("cycle"));
  const meta = PLAN_META[target];
  const isPro = target === "pro";

  const [method, setMethod] = useState<Method>("kpay");
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [ready, setReady] = useState(false);

  // Demo guard: checkout needs an account first; already-paid accounts skip it.
  useEffect(() => {
    const account = getAccount();
    if (!account) {
      router.replace("/sign-up");
      return;
    }
    if (account.plan === target && account.proUnlocked) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [isPro, router, target]);

  // After a successful payment, the plan unlocks and the dashboard opens.
  useEffect(() => {
    if (!paid) return;
    const timer = window.setTimeout(() => router.replace("/dashboard"), 2200);
    return () => window.clearTimeout(timer);
  }, [paid, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const active = METHODS[method];
  const price = `${formatPlanPriceFor(target, cycle)} MMK`;
  const accent = isPro ? "amber" : "sky";

  const confirmPaid = async () => {
    setVerifying(true);
    // Demo verification delay — a real integration would confirm with the
    // payment provider / slip OCR before unlocking.
    await new Promise(resolve => window.setTimeout(resolve, 1600));
    unlockPlan(target);
    setVerifying(false);
    setPaid(true);
    toast(`${meta.name} Plan ပွင့်သွားပါပြီ`, {
      description: "ငွေချေမှု အောင်မြင်ပါသည်။ Dashboard ကို ပို့ပေးပါမယ်။",
    });
  };

  if (paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <BadgeCheck className="size-8" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">{meta.name} Features ပွင့်သွားပါပြီ</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
          {isPro
            ? "အော်ဒါ အကန့်အသတ်မရှိ၊ Delivery Slip Export နဲ့ Slip Verifier တို့ကို အသုံးပြုနိုင်ပါပြီ။"
            : "တစ်လအော်ဒါ ၅၀၀၊ Delivery Slip Export တို့ကို အသုံးပြုနိုင်ပါပြီ။"}{" "}
          Dashboard ကို ပို့ပေးနေပါတယ်...
        </p>
        <Link href="/dashboard" className="button-primary mt-6">
          Dashboard ကို သွားမည်
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Link
        href="/dashboard/settings"
        className="mb-6 inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="size-3.5" /> နောက်သို့ ပြန်သွားမည်
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="border-b border-white/[0.07] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 items-center justify-center rounded-xl ${
                isPro ? "bg-amber-300/15 text-amber-300" : "bg-sky-400/15 text-sky-300"
              }`}
            >
              {isPro ? <Crown className="size-5" /> : <Zap className="size-5" />}
            </span>
            <div>
              <p className="font-display text-base font-bold">{meta.name} Plan — ငွေချေရန်</p>
              <p className="text-[11px] text-slate-400">KPay / WavePay နဲ့ လစဉ်ကြေး ပေးသွင်းပါ</p>
            </div>
          </div>
          <div
            className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-3 ${
              accent === "amber"
                ? "border-amber-300/25 bg-amber-300/10"
                : "border-sky-300/25 bg-sky-300/10"
            }`}
          >
            <span className={`text-xs font-semibold ${accent === "amber" ? "text-amber-200" : "text-sky-200"}`}>
              {meta.name} Plan · {cycle === "yearly" ? "၁ နှစ်" : "၁ လ"}
            </span>
            <span className={`font-display text-lg font-bold ${accent === "amber" ? "text-amber-200" : "text-sky-200"}`}>
              {price}
            </span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(METHODS) as Method[]).map(key => (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                  method === key
                    ? "border-indigo-400/60 bg-indigo-400/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                {key === "kpay" ? <Smartphone className="size-4" /> : <Wallet className="size-4" />}
                {METHODS[key].label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-center">
            <p className="text-xs font-semibold text-slate-300">{active.burmese}</p>
            <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-4">
              <div className="qr-placeholder !size-40">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <p className="mt-4 font-mono text-sm font-bold tracking-wider text-white">{active.account}</p>
            <p className="mt-1 text-[11px] text-slate-400">ငွေပမာဏ — {price} အတိအကျ လွှဲပေးပါ</p>
          </div>

          <button onClick={confirmPaid} disabled={verifying} className="button-primary h-12 w-full">
            {verifying ? (
              <>
                <Loader2 className="size-4 animate-spin" /> ငွေလွှဲကို စစ်ဆေးနေပါတယ်...
              </>
            ) : (
              <>
                <Check className="size-4" /> ငွေလွှဲပြီးပါပြီ
              </>
            )}
          </button>

          <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Demo mode ဖြစ်သောကြောင့် တကယ့်ငွေမဖြတ်ပါ။ ခလုတ်နှိပ်တာနဲ့ {meta.name} Features တွေ
            အလိုအလျောက် ပွင့်သွားပါမယ်။
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
