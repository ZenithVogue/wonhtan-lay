import { FormEvent, ReactNode, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Clipboard,
  ExternalLink,
  Info,
  KeyRound,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Store,
  Unlink,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";

const tokenPattern = /^\d{7,12}:[A-Za-z0-9_-]{20,}$/;

export default function BotConnections() {
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const connectBot = async (event: FormEvent) => {
    event.preventDefault();
    if (!token.trim()) {
      toast("Bot Token ထည့်ပေးပါ", { description: "BotFather ဆီက copy လုပ်ထားတဲ့ token ကို အောက်က box ထဲ ထည့်ပါ။" });
      return;
    }
    if (!tokenPattern.test(token.trim())) {
      toast("Token format မမှန်သေးပါ", { description: "123456789:ABCdef... ပုံစံဖြစ်ကြောင်း ပြန်စစ်ပေးပါ။" });
      return;
    }
    setConnecting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
    setConnecting(false);
    setConnected(true);
    setToken("");
    toast("Bot ချိတ်ဆက်ပြီးပါပြီ", { description: "သင့်ဆိုင်ရဲ့ Telegram အော်ဒါတွေကို ဝန်ထမ်းလေးက လက်ခံနိုင်ပါပြီ။", icon: <Check className="size-4 text-emerald-300" /> });
  };

  const disconnect = () => {
    setConnected(false);
    toast("Bot ချိတ်ဆက်မှု ဖြုတ်ပြီးပါပြီ", { description: "Bot အသစ်တစ်ခုကို အချိန်မရွေး ပြန်ချိတ်ဆက်နိုင်ပါတယ်။" });
  };

  return (
    <div className="bot-settings-shell min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-900 dark:text-white">
      <header className="dashboard-header !ml-0 lg:!pl-8"><div className="flex items-center gap-3"><a className="dashboard-menu inline-flex" href="/dashboard" aria-label="Back to dashboard"><ArrowLeft className="size-4" /></a><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span>Workspace</span><ChevronRight className="size-3" /><span>Settings</span><ChevronRight className="size-3" /><span className="font-medium text-slate-700 dark:text-slate-300">Bot Connections</span></div><h1 className="font-display text-base font-semibold text-slate-900 dark:text-slate-900 dark:text-white sm:hidden">Bot ချိတ်ဆက်ရန်</h1></div><div className="ml-auto flex items-center gap-3"><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" /> KPay Verified Shop</div><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300"><Store className="size-4" /></span></div></header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="max-w-2xl"><div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-400/20 dark:text-sky-300 dark:ring-sky-300/15"><Bot className="size-6" /></div><div className="dashboard-label">BOT CONNECTIONS</div><h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-white sm:text-4xl">သင့်ဆိုင်ရဲ့ Bot ကို<br /><span className="text-indigo-600 dark:text-indigo-400">ရိုးရိုးရှင်းရှင်း ချိတ်လိုက်ပါ</span></h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">နည်းပညာအတွေ့အကြုံ မလိုပါဘူး။ Telegram BotFather ဆီက token တစ်ခုကိုပဲ copy လုပ်ပြီး ဒီနေရာမှာ paste လုပ်ပေးရုံပါ။</p></div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-900 dark:text-white">Telegram Bot ချိတ်ဆက်ရန်</h3><p className="mt-1 text-xs text-slate-600 dark:text-slate-500">အောက်ပါအဆင့်တွေကို တစ်ဆင့်ချင်း လုပ်ဆောင်ပါ။</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"><Send className="size-4" /></span></div>
            <div className="mt-7 space-y-5">
              <SetupStep number="1" title="Telegram ကိုဖွင့်ပြီး @BotFather ကို ရှာပါ"><p>Telegram app ထဲမှာ <span className="rounded-md bg-sky-100 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">@BotFather</span> လို့ search လုပ်ပြီး official account ကိုဖွင့်ပါ။</p><button className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200" onClick={() => toast("Telegram ဖွင့်ရန်", { description: "သင့် device မှာ Telegram ကို ဖွင့်ပြီး @BotFather ကို ရှာပါ။" })}>Telegram ဖွင့်ရန် <ExternalLink className="size-3" /></button></SetupStep>
              <SetupStep number="2" title="Bot အသစ်ဖန်တီးပြီး API Token ကို copy လုပ်ပါ"><p>BotFather ထဲမှာ <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">/newbot</span> လို့ ပို့ပြီး အမည်ပေးပါ။ နောက်ဆုံးရလာတဲ့ <strong className="font-semibold text-slate-700 dark:text-slate-300">HTTP API Token</strong> ကို copy လုပ်ပါ။</p><div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800 dark:border-amber-300/15 dark:bg-amber-300/[0.06] dark:text-amber-100/70"><Info className="mt-0.5 size-3.5 shrink-0 text-amber-500 dark:text-amber-300" />Token ဆိုတာ password လိုပါပဲ။ အခြားသူတွေကို မမျှဝေဘဲ WonHtan Lay ထဲမှာပဲ ထည့်ပါ။</div></SetupStep>
              <SetupStep number="3" title="Token ကို အောက်မှာ paste လုပ်ပါ"><p>Copy လုပ်ထားတဲ့ token ကို ဒီ box ထဲ paste လုပ်ပြီး ချိတ်ဆက်ခလုတ်ကို နှိပ်ပါ။</p></SetupStep>
            </div>

            {!connected ? <form onSubmit={connectBot} className="mt-6 rounded-xl border border-indigo-300/15 bg-indigo-400/[0.06] p-4 sm:p-5"><label htmlFor="bot-token" className="flex items-center justify-between text-xs font-semibold text-slate-200"><span className="flex items-center gap-2"><KeyRound className="size-3.5 text-indigo-300" /> Telegram HTTP API Token</span><button type="button" className="tooltip-button" title="BotFather ရဲ့ message ထဲမှာ API Token ကို တွေ့ရပါမယ်။" aria-label="Where to find the token"><CircleHelp className="size-3.5" /></button></label><div className="relative mt-3"><input id="bot-token" type={showToken ? "text" : "password"} value={token} onChange={(event) => setToken(event.target.value)} placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..." className="bot-token-input" autoComplete="off" /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 hover:text-slate-300" onClick={() => setShowToken((value) => !value)}>{showToken ? "Hide" : "Show"}</button></div><p className="mt-2 text-[10px] leading-5 text-slate-500">Token ကို မသိသေးရင် <button type="button" className="font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => toast("Token ရှာရန်", { description: "BotFather → /newbot → HTTP API Token ကို copy လုပ်ပါ။" })}>ဒီနေရာမှာ လေ့လာပါ။</button></p><button className="button-primary mt-4 h-11 w-full" type="submit" disabled={connecting}>{connecting ? <><Loader2 className="size-4 animate-spin" /> ချိတ်ဆက်နေပါပြီ...</> : <><Link2 className="size-4" /> ဝန်ထမ်းလေး ချိတ်ဆက်မည် (Connect Bot)</>}</button></form> : <ConnectedCard onDisconnect={disconnect} />}
          </section>

          <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 sm:p-6"><div className="flex size-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300"><ShieldCheck className="size-5" /></div><h3 className="mt-5 font-display text-lg font-semibold text-slate-900 dark:text-white">သင့်အတွက် လုံခြုံစွာ ချိတ်ဆက်ပေးပါတယ်</h3><p className="mt-3 text-sm leading-6 text-slate-400">WonHtan Lay က သင့် Bot token ကို လုံခြုံစွာ သိမ်းဆည်းပြီး order လက်ခံဖို့အတွက်ပဲ အသုံးပြုပါတယ်။</p><div className="mt-5 space-y-3 text-xs text-slate-300"><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-300" /> Your token stays private</div><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-300" /> Disconnect အချိန်မရွေးလုပ်နိုင်</div><div className="flex items-center gap-2.5"><Check className="size-4 text-emerald-300" /> Setup ၅ မိနစ်အတွင်း ပြီးစီး</div></div></div><div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5"><div className="flex items-start gap-3"><MessageCircle className="mt-0.5 size-4 shrink-0 text-indigo-300" /><div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">အကူအညီလိုပါသလား?</h3><p className="mt-1 text-xs leading-5 text-slate-500">Token ရှာတဲ့နေရာ၊ bot name ပြောင်းတဲ့နေရာတွေကို support team က ကူညီပေးနိုင်ပါတယ်။</p><button className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => toast("Support team", { description: "မကြာခင် support ကို ဆက်သွယ်နိုင်ပါမယ်။" })}>Support ကို ဆက်သွယ်ရန် <ArrowRight className="size-3.5" /></button></div></div></div></aside>
        </div>
      </main>
    </div>
  );
}

function SetupStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <div className="relative flex gap-3.5"><div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-indigo-300/25 bg-indigo-400/10 font-display text-xs font-bold text-indigo-200">{number}</div><div className="min-w-0"><h4 className="text-sm font-semibold text-slate-200">{title}</h4><div className="mt-1 text-xs leading-6 text-slate-500">{children}</div></div></div>;
}

function ConnectedCard({ onDisconnect }: { onDisconnect: () => void }) {
  return <div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.06] p-4 sm:p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300"><Check className="size-4" /></span><div><p className="text-sm font-semibold text-slate-900 dark:text-white">Bot ချိတ်ဆက်ပြီးပါပြီ</p><p className="mt-0.5 text-[11px] text-emerald-300">Active / ချိတ်ဆက်ပြီးပါပြီ</p></div></div></div><span className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" /> Active</span></div><div className="my-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Telegram Bot</p><p className="mt-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-white">@your_shop_bot</p></div><div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Webhook status</p><p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><Webhook className="size-3.5" /> OK</p></div></div><p className="text-xs leading-5 text-slate-500">အခုကစပြီး Telegram မှာ ဝင်လာတဲ့ customer message တွေကို ဝန်ထမ်းလေးက အော်ဒါအဖြစ် အလိုအလျောက် မှတ်ပေးပါမယ်။</p><button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white" onClick={onDisconnect}><Unlink className="size-3.5" /> Disconnect / Token ပြောင်းမည်</button></div>;
}
