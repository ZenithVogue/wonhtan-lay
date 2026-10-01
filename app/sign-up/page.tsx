"use client";

import { landingRouteFor, saveAccount, type Account } from "@/lib/account";
import { ArrowLeft, Bot, Loader2, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [shop, setShop] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanShop = shop.trim();
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanName) {
      toast("နာမည်ထည့်ပေးပါ", { description: "အကောင့်အတွက် သင့်နာမည်ကို ဖြည့်ပါ။" });
      return;
    }
    if (!cleanShop) {
      toast("ဆိုင်နာမည်ထည့်ပေးပါ", { description: "Dashboard မှာ ပြမယ့် ဆိုင်နာမည်ကို ဖြည့်ပါ။" });
      return;
    }
    if (!/^09\d{7,9}$/.test(cleanPhone)) {
      toast("ဖုန်းနံပါတ် မမှန်သေးပါ", { description: "09 နဲ့စတဲ့ ၉–၁၁ လုံးပါ နံပါတ်ကို ထည့်ပါ။" });
      return;
    }
    if (password.length < 6) {
      toast("Password တိုလွန်းပါတယ်", { description: "အနည်းဆုံး စာလုံး ၆ လုံး ထားပေးပါ။" });
      return;
    }

    setSubmitting(true);
    const account: Account = {
      name: cleanName,
      shop: cleanShop,
      phone: cleanPhone,
      password,
      plan: "free",
      proUnlocked: true,
      createdAt: new Date().toISOString(),
    };
    saveAccount(account);
    toast("အကောင့်ဖွင့်ပြီးပါပြီ", { description: "Dashboard ကို ဖွင့်ပေးပါမယ်။" });
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
            <p className="font-display text-base font-bold">အကောင့်ဖွင့်ရန်</p>
            <p className="text-[11px] text-slate-400">ဝန်ထမ်းလေးနဲ့ ၁ မိနစ်အတွင်း စတင်ပါ</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-6 sm:px-8">
          <label className="block">
            <span className="form-label">သင့်နာမည်</span>
            <span className="relative mt-1.5 block">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                className="form-input pl-9"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="ဥပမာ — May Thu"
                autoComplete="name"
              />
            </span>
          </label>

          <label className="block">
            <span className="form-label">ဆိုင်နာမည်</span>
            <span className="relative mt-1.5 block">
              <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                className="form-input pl-9"
                value={shop}
                onChange={event => setShop(event.target.value)}
                placeholder="ဥပမာ — May Fashion Shop"
                autoComplete="organization"
              />
            </span>
          </label>

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
              placeholder="အနည်းဆုံး ၆ လုံး"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" disabled={submitting} className="button-primary h-12 w-full">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> ခဏစောင့်ပါ...
              </>
            ) : (
              "အကောင့်သစ်ဖွင့်မည်"
            )}
          </button>
        </form>

        <p className="border-t border-white/[0.07] px-6 py-4 text-center text-xs text-slate-400 sm:px-8">
          အကောင့်ရှိပြီးသားလား?{" "}
          <Link href="/sign-in" className="font-semibold text-indigo-300 hover:text-indigo-200">
            ဝင်ရောက်မည် (Sign in)
          </Link>
        </p>
      </div>
    </div>
  );
}
