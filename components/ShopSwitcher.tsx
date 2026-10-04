"use client";

import { useAccount } from "@/hooks/usePlan";
import { addShop, getActiveShop, setActiveShop, updateShop, type Shop } from "@/lib/account";
import { Check, ChevronDown, ImagePlus, Phone, Plus, QrCode, Settings2, Store, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "@/lib/toast";
import { OPEN_SHOP_MODAL_EVENT, type OpenShopModalDetail } from "@/lib/shop-events";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ModalMode = { kind: "create"; first: boolean } | { kind: "edit"; shop: Shop };

const MAX_QR_FILE_BYTES = 5 * 1024 * 1024;

/** Read an image file and downscale it so it fits comfortably in localStorage. */
function readQrImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const max = 640;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas-unavailable"));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Header "Active shop" selector + the create / edit shop modal. */
export default function ShopSwitcher() {
  const account = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const shops = account?.shops ?? [];
  const activeShop = getActiveShop(account);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Allow the global command palette to open the shop modal.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenShopModalDetail>).detail;
      const current = getActiveShop(account);
      if (detail.kind === "create") {
        setModal({ kind: "create", first: !current });
        return;
      }
      const target = (detail.shopId ? account?.shops?.find(item => item.id === detail.shopId) : null) ?? current;
      setModal(target ? { kind: "edit", shop: target } : { kind: "create", first: true });
    };
    window.addEventListener(OPEN_SHOP_MODAL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SHOP_MODAL_EVENT, onOpen);
  }, [account]);

  const openModal = (mode: ModalMode) => {
    setMenuOpen(false);
    setModal(mode);
  };

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="shop-selector"
        onClick={() => setMenuOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span className="hidden text-left sm:block">
          <span className="block text-[10px] text-slate-500">Active shop</span>
          <span className="block max-w-[140px] truncate text-xs font-semibold text-white">
            {activeShop ? activeShop.name : "ဆိုင်မရှိသေးပါ"}
          </span>
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300 sm:hidden">
          <Store className="size-4" />
        </span>
        <ChevronDown className="size-3.5 text-slate-500" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900"
        >
          {!activeShop ? (
            <button type="button" role="menuitem" className={`${itemClass} font-semibold text-indigo-600 dark:text-indigo-300`} onClick={() => openModal({ kind: "create", first: true })}>
              <Plus className="size-3.5" /> + ဆိုင်အမည် ထည့်သွင်းရန် (Add your shop)
            </button>
          ) : (
            <>
              {shops.map(shop => {
                const active = shop.id === activeShop.id;
                return (
                  <button
                    key={shop.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setMenuOpen(false);
                      if (!active) {
                        setActiveShop(shop.id);
                        toast(`${shop.name} ကို ပြောင်းလိုက်ပါပြီ`);
                      }
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-900 transition dark:text-white ${
                      active ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`size-2 shrink-0 rounded-full ${active ? "bg-emerald-400" : "bg-slate-400"}`} />
                    <span className="min-w-0 flex-1 truncate">{shop.name}</span>
                    {active && <Check className="size-3.5 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
              <div className="my-1.5 h-px bg-slate-200 dark:bg-white/10" />
              <button type="button" role="menuitem" className={itemClass} onClick={() => openModal({ kind: "edit", shop: activeShop })}>
                <Settings2 className="size-3.5" /> ဆိုင်အချက်အလက် ပြင်ဆင်ရန်
              </button>
              <button type="button" role="menuitem" className={itemClass} onClick={() => openModal({ kind: "create", first: false })}>
                <Plus className="size-3.5" /> + ဆိုင်သစ် ထပ်မံထည့်သွင်းရန်
              </button>
            </>
          )}
        </div>
      )}

      <ShopModal mode={modal} defaultPhone={account?.phone ?? ""} onClose={() => setModal(null)} />
    </div>
  );
}

function ShopModal({ mode, defaultPhone, onClose }: { mode: ModalMode | null; defaultPhone: string; onClose: () => void }) {
  return (
    <Dialog open={mode !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {/* Remount the form for every open so its fields reset from the selected shop. */}
        {mode && <ShopForm key={mode.kind === "edit" ? mode.shop.id : `create-${mode.first}`} mode={mode} defaultPhone={defaultPhone} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ShopForm({ mode, defaultPhone, onClose }: { mode: ModalMode; defaultPhone: string; onClose: () => void }) {
  const editing = mode.kind === "edit";
  const [name, setName] = useState(editing ? mode.shop.name : "");
  const [phone, setPhone] = useState(editing ? mode.shop.phone : defaultPhone);
  const [qr, setQr] = useState<string | undefined>(editing ? mode.shop.kpayQr : undefined);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const title = editing
    ? "ဆိုင်အချက်အလက် ပြင်ဆင်ရန်"
    : mode.first
      ? "ဆိုင်အမည် ထည့်သွင်းရန်"
      : "ဆိုင်သစ် ထပ်မံထည့်သွင်းရန်";

  const pickFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("ပုံဖိုင်သာ တင်နိုင်ပါတယ်", { description: "JPG သို့မဟုတ် PNG ဖြင့် KPay QR ကို တင်ပါ။" });
      return;
    }
    if (file.size > MAX_QR_FILE_BYTES) {
      toast("ဖိုင်ကြီးလွန်းပါတယ်", { description: "၅ MB ထက်မကျော်သော ပုံကို ရွေးပါ။" });
      return;
    }
    try {
      setQr(await readQrImage(file));
    } catch {
      toast("ပုံကို ဖတ်မရပါ", { description: "တခြား ပုံတစ်ပုံ ထပ်ရွေးကြည့်ပါ။" });
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanName) {
      toast("ဆိုင်နာမည်ထည့်ပေးပါ", { description: "ဆိုင်အမည်ကို ဖြည့်ပါ။" });
      return;
    }
    if (!/^09\d{7,9}$/.test(cleanPhone)) {
      toast("ဖုန်းနံပါတ် မမှန်သေးပါ", { description: "09 နဲ့စတဲ့ ၉–၁၁ လုံးပါ နံပါတ်ကို ထည့်ပါ။" });
      return;
    }
    setBusy(true);
    const input = { name: cleanName, phone: cleanPhone, kpayQr: qr };
    const saved = editing ? updateShop(mode.shop.id, input) : addShop(input);
    setBusy(false);
    if (!saved) {
      toast("အကောင့်ရှာမတွေ့ပါ", { description: "ပြန်လည် Sign in ဝင်ပြီး ထပ်ကြိုးစားပါ။" });
      return;
    }
    toast(editing ? "ဆိုင်အချက်အလက် သိမ်းပြီးပါပြီ" : "ဆိုင်ထည့်သွင်းပြီးပါပြီ", { description: cleanName });
    onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <DialogTitle className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-xs text-slate-500">
          ဆိုင်အမည်၊ ဖုန်းနံပါတ်နှင့် KPay QR Code ကို ဖြည့်သွင်းပါ။
        </DialogDescription>
      </div>

      <label className="block">
        <span className="form-label">ဆိုင်နာမည်</span>
        <span className="relative block">
          <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-10" value={name} onChange={event => setName(event.target.value)} placeholder="ဥပမာ — May Fashion Shop" autoFocus />
        </span>
      </label>

      <label className="block">
        <span className="form-label">ဖုန်းနံပါတ်</span>
        <span className="relative block">
          <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-10" type="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="09XXXXXXXXX" />
        </span>
      </label>

      <div>
        <span className="form-label">KPay QR Code</span>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={event => { void pickFile(event.target.files?.[0]); event.target.value = ""; }} />
        {qr ? (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="KPay QR Code" className="size-24 rounded-lg border border-slate-200 bg-white object-contain dark:border-slate-700" />
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                <ImagePlus className="size-3.5" /> ပုံပြောင်းမည်
              </button>
              <button type="button" onClick={() => setQr(undefined)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-500 dark:text-red-400">
                <Trash2 className="size-3.5" /> ဖယ်ရှားမည်
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            <QrCode className="size-6" />
            KPay QR Code ပုံကို တင်ရန် နှိပ်ပါ
            <span className="text-[10px] text-slate-400">JPG, PNG · ၅ MB အထိ</span>
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          မလုပ်တော့ပါ
        </button>
        <button type="submit" disabled={busy} className="on-primary rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
          {editing ? "သိမ်းမည်" : "ထည့်သွင်းမည်"}
        </button>
      </div>
    </form>
  );
}
