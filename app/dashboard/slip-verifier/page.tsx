"use client";

import { DragEvent, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, ArrowRight, CalendarClock, Check, CloudUpload, Copy, FileCheck2, FileImage, Hash, Loader2, ScanLine, ShieldAlert, UserRound, Wallet } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { toast } from "@/lib/toast";
import { analyzeSlip, loadSeenSlips, rememberSlip, type SlipAnalysis, type SlipStatus } from "@/lib/slip";
import { formatMMK } from "@/lib/format";

const STATUS_UI: Record<SlipStatus, { title: string; burmese: string; badge: string; tone: "green" | "orange" | "red"; icon: typeof Check }> = {
  verified: { title: "Verified", burmese: "စလစ်စစ်မှန်ပါသည်", badge: "✅ Slip Verified", tone: "green", icon: Check },
  duplicate: { title: "Duplicate slip", burmese: "ထပ်နေသော စလစ်ဖြစ်နိုင်ပါသည်", badge: "⚠️ Duplicate", tone: "orange", icon: Copy },
  suspicious: { title: "Suspicious slip", burmese: "သံသယဖြစ်ဖွယ် စလစ်ဖြစ်ပါသည်", badge: "🚫 Suspicious", tone: "red", icon: ShieldAlert },
};

const TONES = {
  green: { card: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-400/[0.06]", hero: "border-emerald-300 bg-emerald-600 text-white dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100", pill: "bg-white/20 text-white dark:bg-emerald-400/15 dark:text-emerald-200", note: "border-emerald-200 bg-emerald-100/70 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300" },
  orange: { card: "border-orange-200 bg-orange-50/70 dark:border-orange-400/25 dark:bg-orange-400/[0.06]", hero: "border-orange-300 bg-orange-500 text-white dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-100", pill: "bg-white/20 text-white dark:bg-orange-400/15 dark:text-orange-200", note: "border-orange-200 bg-orange-100/70 text-orange-900 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-200" },
  red: { card: "border-red-200 bg-red-50/70 dark:border-red-400/25 dark:bg-red-400/[0.06]", hero: "border-red-300 bg-red-600 text-white dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-100", pill: "bg-white/20 text-white dark:bg-red-400/15 dark:text-red-200", note: "border-red-200 bg-red-100/70 text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200" },
} as const;

function ResultCard({ analysis, onReset }: { analysis: SlipAnalysis; onReset: () => void }) {
  const ui = STATUS_UI[analysis.status];
  const tone = TONES[ui.tone];
  const Icon = ui.icon;
  const { details } = analysis;
  const fields = [
    { label: "Transaction ID", value: details.transactionId, icon: Hash, mono: true },
    { label: "Amount", value: `${formatMMK(details.amount)} MMK`, icon: Wallet },
    { label: "Sender Name", value: details.sender, icon: UserRound },
    { label: "Date & Time", value: details.date, icon: CalendarClock },
  ];
  return (
    <div className="mt-7" role="status" aria-live="polite">
      <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm ${tone.hero}`}>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/10"><Icon className="size-7" /></span>
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${tone.pill}`}>{ui.badge}</span>
          <p className="mt-1.5 font-display text-xl font-bold leading-tight">{analysis.status === "verified" ? "Verified / " : `${ui.title} / `}{ui.burmese}</p>
        </div>
      </div>
      {analysis.reason && (
        <div className={`mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-5 ${tone.note}`}>
          {analysis.status === "suspicious" ? <ShieldAlert className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
          <span>{analysis.reason}</span>
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><field.icon className="size-3.5" /> {field.label}</p>
            <p className={`mt-1.5 break-all text-sm font-semibold text-slate-900 dark:text-white ${field.mono ? "font-mono" : ""}`}>{field.value}</p>
          </div>
        ))}
      </div>
      <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${analysis.status === "duplicate" ? TONES.orange.note : analysis.status === "verified" ? TONES.green.note : TONES.red.note}`}>
        {analysis.status === "verified" ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
        {analysis.status === "verified" ? "Duplicate check: No duplicate transaction found." : analysis.status === "duplicate" ? "Duplicate check: ဒီ transaction ကို အရင်က စစ်ဆေးပြီးပါပြီ။" : "Authenticity check: လက်ခံမလုပ်ခင် ကိုယ်တိုင် ထပ်မံစစ်ဆေးပါ။"}
      </div>
      <button className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 transition hover:gap-3 dark:text-indigo-300" onClick={onReset}>စလစ်အသစ် စစ်မည် <ArrowRight className="size-3.5" /></button>
    </div>
  );
}

export default function SlipVerifier() {
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<SlipAnalysis | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const verifyFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setVerifying(true);
    setResult(null);
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    const analysis = analyzeSlip({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type }, loadSeenSlips());
    // Only genuine slips are remembered, so a duplicate upload is caught next time.
    if (analysis.status === "verified") rememberSlip(analysis.fingerprint);
    setVerifying(false);
    setResult(analysis);
    if (analysis.status === "verified") toast.success("Slip verified", { description: "ငွေလွှဲစလစ်ကို အောင်မြင်စွာ စစ်ဆေးပြီးပါပြီ။" });
    else if (analysis.status === "duplicate") toast.warning("Duplicate slip", { description: "ဒီစလစ်ကို အရင်က စစ်ဆေးပြီးသားပါ။" });
    else toast.error("Suspicious slip", { description: "ဒီစလစ်ကို သံသယဖြစ်ဖွယ်အဖြစ် သတ်မှတ်ထားပါတယ်။" });
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); verifyFile(event.dataTransfer.files?.[0]); };

  return <DashboardShell>
    <div className="mb-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">KPay / Wave Slip Verification System</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">AI စနစ်ဖြင့် ငွေလွှဲစလစ် အတု/အစစ် အလိုအလျောက် စစ်ဆေးပေးသည့်စနစ်</p></div><div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300"><ScanLine className="size-4" /> OCR Engine Ready</div></div></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Interactive slip tester</p><h3 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">ငွေလွှဲစလစ် တင်ပြီး စစ်ကြည့်ပါ</h3><p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">KPay သို့မဟုတ် Wave Pay screenshot ကို ဒီနေရာမှာ တင်ပါ။</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300"><FileCheck2 className="size-5" /></span></div><div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => fileInput.current?.click()} className={`mt-7 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-400/10" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/70 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-indigo-400 dark:hover:bg-indigo-400/10"}`}><input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => verifyFile(event.target.files?.[0])} />{verifying ? <><Loader2 className="size-10 animate-spin text-indigo-600 dark:text-indigo-300" /><p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">စလစ်ကို စစ်ဆေးနေပါပြီ...</p><p className="mt-1 text-xs text-slate-500">OCR engine က စာလုံးနဲ့ ငွေပမာဏကို ဖတ်နေပါတယ်</p></> : fileName ? <><span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300"><FileImage className="size-7" /></span><p className="mt-4 max-w-xs truncate text-sm font-semibold text-slate-900 dark:text-white">{fileName}</p><p className="mt-1 text-xs text-indigo-600 dark:text-indigo-300">နောက်တစ်ကြိမ် စစ်ရန် click လုပ်ပါ</p></> : <><span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300"><CloudUpload className="size-7" /></span><p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Slip screenshot ကို ဆွဲချပါ</p><p className="mt-1 text-xs text-slate-500">သို့မဟုတ် click လုပ်ပြီး image file ရွေးပါ</p><span className="mt-5 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">JPG, PNG · 10MB အထိ</span></>}</div><div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/[0.06] dark:text-amber-100/80"><AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" /> Demo mode ဖြစ်သောကြောင့် upload လုပ်ပြီးနောက် sample verification result ကို ပြသပေးပါမယ်။</div></section>
      <section className={`rounded-2xl border p-5 shadow-sm transition sm:p-7 ${result ? TONES[STATUS_UI[result.status].tone].card : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}`}><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Verification results</p><h3 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">စစ်ဆေးမှုရလဒ်</h3></div></div>{result ? <ResultCard analysis={result} onReset={() => { setResult(null); setFileName(""); }} /> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800"><FileCheck2 className="size-7" /></span><p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">စစ်ဆေးမှုရလဒ် ဒီမှာပေါ်ပါမယ်</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Payment slip တစ်ခု upload လုပ်လိုက်တာနဲ့ amount၊ sender နဲ့ duplicate status ကို ဖော်ပြပေးပါမယ်။</p></div>}</section>
    </div>
  </DashboardShell>;
}

