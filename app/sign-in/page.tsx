"use client";

import { getAccount, landingRouteFor } from "@/lib/account";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanPhone = phone.replace(/[\s-]/g, "");
    const account = getAccount();
    if (!account || account.phone !== cleanPhone || account.password !== password) {
      toast("ဝင်ရောက်မှု မအောင်မြင်ပါ", {
        description: "ဖုန်းနံပါတ် (သို့) Password မှားနေပါတယ်။ အကောင့်အသစ်ဖွင့်ရန် အောက်ကလင့်ကို နှိပ်ပါ။",
      });
      return;
    }
    setSubmitting(true);
    toast(`ပြန်လည်ကြိုဆိုပါတယ်, ${account.name}`, { description: `${account.shop} ကို ဖွင့်ပေးပါမယ်။` });
    router.push(landingRouteFor(account));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="size-3.5" /> ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-6 py-5 sm:px-8">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-emerald-400">
            <Bot className="size-5 text-white" />
          </span>
          <div>
            <p className="font-display text-base font-bold">ပြန်လည် ဝင်ရောက်မည်</p>
            <p className="text-[11px] text-slate-400">သင့်ဆိုင်ရဲ့ Dashboard ကို ဖွင့်ပါ</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-6 sm:px-8">
          <label className="block">
            <span className="form-label">ဖုန်းနံပါတ်</span>
            <input
              className="form-input mt-1.5"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              placeholder="09XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          <label className="block">
            <span className="form-label">Password</span>
            <input
              className="form-input mt-1.5"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={submitting} className="button-primary h-12 w-full">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> ခဏစောင့်ပါ...
              </>
            ) : (
              "ဝင်ရောက်မည်"
            )}
          </button>
        </form>

        <p className="border-t border-white/[0.07] px-6 py-4 text-center text-xs text-slate-400 sm:px-8">
          အကောင့်မရှိသေးဘူးလား?{" "}
          <Link href="/sign-up?plan=free" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Free နဲ့ အကောင့်ဖွင့်မည်
          </Link>
        </p>
      </div>
    </div>
  );
}
