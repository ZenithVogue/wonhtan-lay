"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ArrowRight, Bot, Check, CircleHelp, ExternalLink, Info, KeyRound, Link2, Loader2, MessageCircle, Send, ShieldCheck, Unlink, Webhook } from "lucide-react";
import { toast } from "@/lib/toast";
import DashboardShell from "@/components/DashboardShell";

const tokenPattern = /^\d{7,12}:[A-Za-z0-9_-]{20,}$/;
const usernamePattern = /^[A-Za-z0-9_]{5,32}$/;

function normalizeBotUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

export default function BotConnections() {
  const [token, setToken] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Restore connection state from the server on page load (polling survives
  // page refreshes, since the loop runs on the server).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const statusResponse = await fetch("/api/telegram/status", { headers: { accept: "application/json" } });
        const statusResult = (await statusResponse.json()) as {
          connected?: boolean;
          bot?: { username?: string };
        };
        if (!cancelled && statusResult?.connected) {
          if (typeof statusResult.bot?.username === "string" && statusResult.bot.username) {
            setBotUsername(statusResult.bot.username);
          }
          setConnected(true);
        }
      } catch {
        // Server unreachable: stay on the disconnected form.
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectBot = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedUsername = normalizeBotUsername(botUsername);

    if (!token.trim()) {
      toast("Bot Token ထည့်ပေးပါ", { description: "BotFather ဆီက copy လုပ်ထားတဲ့ token ကို အောက်က box ထဲ ထည့်ပါ။" });
      return;
    }
    if (!tokenPattern.test(token.trim())) {
      toast("Token format မမှန်သေးပါ", { description: "123456789:ABCdef... ပုံစံဖြစ်ကြောင်း ပြန်စစ်ပေးပါ။" });
      return;
    }
    if (!normalizedUsername) {
      toast("Bot Username ထည့်ပေးပါ", { description: "BotFather ကပေးထားတဲ့ username ကို @ မပါဘဲ ထည့်ပါ။ ဥပမာ your_shop_bot" });
      return;
    }
    if (!usernamePattern.test(normalizedUsername)) {
      toast("Bot Username format မမှန်သေးပါ", { description: "စာလုံး၊ နံပါတ်နဲ့ underscore ၅–၃၂ လုံးသာ အသုံးပြုပါ။" });
      return;
    }

    setConnecting(true);
    try {
      const response = await fetch("/api/telegram/connect", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const responseText = await response.text();
      let telegramResult: { ok?: boolean; description?: string; bot?: { username?: string } } = {};
      try {
        telegramResult = JSON.parse(responseText) as typeof telegramResult;
      } catch {
        telegramResult = { ok: response.ok, description: responseText };
      }

      if (!response.ok || telegramResult.ok !== true) {
        throw new Error(telegramResult.description || "Telegram ချိတ်ဆက်မှု မအောင်မြင်ပါ။");
      }

      const connectedUsername =
        typeof telegramResult.bot?.username === "string" && telegramResult.bot.username
          ? telegramResult.bot.username
          : normalizedUsername;
      setBotUsername(connectedUsername);
      setConnected(true);
      setToken("");
      setShowToken(false);
      toast("Telegram Bot ချိတ်ဆက်မှု အောင်မြင်ပါသည်။", { description: `@${connectedUsername} ကို polling နဲ့ ချိတ်ဆက်ပြီးပါပြီ။ Public URL မလိုပါ။`, icon: <Check className="size-4 text-emerald-600 dark:text-emerald-300" /> });
    } catch (error) {
      toast("Telegram Bot ချိတ်ဆက်မှု မအောင်မြင်ပါ။", { description: error instanceof Error ? error.message : "Telegram server ကို မရောက်နိုင်ပါ။" });
    } finally {
      setConnecting(false);
    }
  };

  const previewConnected = () => {
    const normalizedUsername = normalizeBotUsername(botUsername);
    if (!normalizedUsername || !usernamePattern.test(normalizedUsername)) {
      toast("Bot Username ထည့်ပေးပါ", { description: "Connected preview ကို ကြည့်ရန် အရင်ဆုံး bot username ထည့်ပါ။" });
      return;
    }
    setBotUsername(normalizedUsername);
    setConnected(true);
  };

  const disconnect = async () => {
    try {
      await fetch("/api/telegram/disconnect", {
        method: "POST",
        headers: { accept: "application/json" },
      });
    } catch {
      // Server unreachable: still reset the local UI state.
    } finally {
      setConnected(false);
      toast("Bot ချိတ်ဆက်မှု ဖြုတ်ပြီးပါပြီ", { description: "Bot အသစ်တစ်ခုကို အချိန်မရွေး ပြန်ချိတ်ဆက်နိုင်ပါတယ်။" });
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl"><div className="dashboard-label">BOT CONNECTIONS</div><h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Bot ချိတ်ဆက်ရန် <span className="text-indigo-600 dark:text-indigo-400">(Bot Connections)</span></h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">Telegram သို့မဟုတ် Messenger Bot Token ကို ဖြည့်စွက်၍ ဝန်ထမ်းလေးကို စတင် အသုံးပြုပါ။ နည်းပညာအတွေ့အကြုံ မလိုဘဲ အဆင့်သုံးဆင့်နဲ့ စတင်နိုင်ပါတယ်။</p></div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Telegram Bot Setup</h3><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Telegram မှာ BotFather ကိုသုံးပြီး token တစ်ခု ရယူပါ။</p></div><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"><Send className="size-4" /></span></div>
            <div className="mt-7 space-y-5">
              <SetupStep number="1" title="Telegram တွင် @BotFather ကို ရှာပါ"><p>Telegram app ကိုဖွင့်ပြီး <span className="rounded-md bg-sky-100 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">@BotFather</span> ကို search လုပ်ပြီး official account ကိုဖွင့်ပါ။</p><button className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200" onClick={() => toast("Telegram ဖွင့်ရန်", { description: "Telegram ကို ဖွင့်ပြီး @BotFather ကို ရှာပါ။" })}>Telegram ဖွင့်ရန် <ExternalLink className="size-3" /></button></SetupStep>
              <SetupStep number="2" title="/newbot ဟု ရိုက်၍ Bot အသစ်ဆောက်ပါ"><p>BotFather ထဲမှာ <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">/newbot</span> ဟု ရိုက်ပြီး bot name နဲ့ username သတ်မှတ်ပါ။ ပြီးရင် <strong className="font-semibold text-slate-700 dark:text-slate-300">HTTP API Token</strong> နဲ့ username ကို ကူးယူပါ။</p><div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800 dark:border-amber-300/15 dark:bg-amber-300/[0.06] dark:text-amber-100/70"><Info className="mt-0.5 size-3.5 shrink-0 text-amber-500 dark:text-amber-300" />Token သည် password လိုပါပဲ။ အခြားသူများကို မမျှဝေဘဲ WonHtan Lay ထဲမှာပဲ ထည့်ပါ။</div></SetupStep>
              <SetupStep number="3" title="အောက်ပါ Box တွင် Token နှင့် Username ကို ထည့်သွင်းပါ"><p>BotFather ကပေးတဲ့ token နဲ့ username ကို အောက်က box တွေထဲ ထည့်ပြီး ဝန်ထမ်းလေးကို စတင်ချိတ်ဆက်ပါ။</p></SetupStep>
            </div>
            {!connected ? <form onSubmit={connectBot} className="mt-7 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-300/15 dark:bg-indigo-400/[0.06] sm:p-5"><label htmlFor="bot-token" className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><KeyRound className="size-3.5 text-indigo-600 dark:text-indigo-300" /> Telegram HTTP API Token</span><button type="button" className="tooltip-button" title="BotFather ရဲ့ message ထဲမှာ API Token ကို တွေ့ရပါမယ်။" aria-label="Where to find the token"><CircleHelp className="size-3.5" /></button></label><div className="relative mt-3"><input id="bot-token" type={showToken ? "text" : "password"} value={token} onChange={(event) => setToken(event.target.value)} placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..." className="bot-token-input" autoComplete="off" /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" onClick={() => setShowToken((value) => !value)}>{showToken ? "Hide" : "Show"}</button></div><label htmlFor="bot-username" className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"><Bot className="size-3.5 text-indigo-600 dark:text-indigo-300" /> Connected Bot Username</label><input id="bot-username" type="text" value={botUsername} onChange={(event) => setBotUsername(event.target.value)} placeholder="your_shop_bot" className="bot-token-input mt-3" autoComplete="off" spellCheck="false" /><p className="mt-2 text-[10px] leading-5 text-slate-600 dark:text-slate-500">BotFather ကပေးတဲ့ username ကို @ မပါဘဲ ထည့်ပါ။ ဥပမာ <span className="font-mono text-slate-700 dark:text-slate-300">your_shop_bot</span> — ချိတ်ဆက်ပြီးနောက် ဒီ username နဲ့ Telegram link ကို ဖန်တီးပေးပါမယ်။</p><p className="mt-1 text-[10px] leading-5 text-slate-600 dark:text-slate-500">Token ကို မသိသေးရင် <button type="button" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200" onClick={() => toast("Token ရှာရန်", { description: "BotFather → /newbot → HTTP API Token ကို copy လုပ်ပါ။" })}>ဒီနေရာမှာ လေ့လာပါ။</button></p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button className="button-primary h-11 flex-1" type="submit" disabled={connecting || checkingStatus}>{connecting ? <><Loader2 className="size-4 animate-spin" /> ချိတ်ဆက်နေပါပြီ...</> : <><Link2 className="size-4" /> ဝန်ထမ်းလေး စတင်ချိတ်ဆက်မည်</>}</button><button type="button" className="button-secondary h-11 sm:px-4" onClick={previewConnected}>Connected preview</button></div></form> : <ConnectedCard botUsername={botUsername} onDisconnect={disconnect} />}
          </section>

          <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><ShieldCheck className="size-5" /></div><h3 className="mt-5 font-display text-lg font-semibold text-slate-900 dark:text-white">လုံခြုံစွာ ချိတ်ဆက်ပေးပါတယ်</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">WonHtan Lay က သင့် Bot token ကို လုံခြုံစွာ သိမ်းဆည်းပြီး order လက်ခံဖို့အတွက်ပဲ အသုံးပြုပါတယ်။</p><div className="mt-5 space-y-3 text-xs text-slate-600 dark:text-slate-300"><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-600 dark:text-emerald-300" /> Your token stays private</div><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-600 dark:text-emerald-300" /> Disconnect အချိန်မရွေးလုပ်နိုင်</div><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-600 dark:text-emerald-300" /> Setup ၅ မိနစ်အတွင်း ပြီးစီး</div></div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><MessageCircle className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-300" /><div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">အကူအညီလိုပါသလား?</h3><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Token နဲ့ username ရှာတဲ့နေရာတွေကို support team က ကူညီပေးနိုင်ပါတယ်။</p><button className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200" onClick={() => toast("Support team", { description: "မကြာခင် support ကို ဆက်သွယ်နိုင်ပါမယ်။" })}>Support ကို ဆက်သွယ်ရန် <ArrowRight className="size-3.5" /></button></div></div></div></aside>
        </div>
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs leading-6 text-sky-900 dark:border-sky-300/15 dark:bg-sky-400/[0.06] dark:text-sky-100"><Info className="mt-1 size-4 shrink-0 text-sky-600 dark:text-sky-300" /><p>Bot Token သည် သင့်ဆိုင်၏ စာပြန်စနစ်ကိုသာ ထိန်းချုပ်ပြီး ကိုယ်ရေးအချက်အလက်များကို လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။</p></div>
      </div>
    </DashboardShell>
  );
}

function SetupStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <div className="relative flex gap-3.5"><div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 font-display text-xs font-bold text-indigo-700 dark:border-indigo-300/25 dark:bg-indigo-400/10 dark:text-indigo-200">{number}</div><div className="min-w-0"><h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{title}</h4><div className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-400">{children}</div></div></div>;
}

function ConnectedCard({ botUsername, onDisconnect }: { botUsername: string; onDisconnect: () => void }) {
  const telegramUrl = `https://t.me/${botUsername}`;

  return <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-300/20 dark:bg-emerald-400/[0.06] sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"><Check className="size-4" /></span><div><p className="text-sm font-semibold text-slate-900 dark:text-white">Bot ချိတ်ဆက်ပြီးပါပြီ</p><p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">● Active / ချိတ်ဆက်ပြီးပါပြီ</p></div></div><span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" /> Active</span></div><div className="my-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Bot Name</p><p className="mt-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white">@{botUsername}</p><a href={telegramUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 dark:border-sky-300/20 dark:bg-sky-300/10 dark:text-sky-300 dark:hover:bg-sky-300/15" aria-label={`Open @${botUsername} in Telegram`}><ExternalLink className="size-3.5" /> Open Bot in Telegram</a></div><div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Connection Status</p><p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><Webhook className="size-3.5" /> Polling Active — Public URL မလိုပါ</p></div></div><p className="text-xs leading-5 text-slate-600 dark:text-slate-400">ဝန်ထမ်းလေးက Telegram မှာ ဝင်လာတဲ့ customer message တွေကို အော်ဒါအဖြစ် အလိုအလျောက် မှတ်ပေးပါမယ်။</p><button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={onDisconnect}><Unlink className="size-3.5" /> Disconnect / Token ပြောင်းမည်</button></div>;
}
