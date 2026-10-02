"use client";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAccount } from "@/hooks/usePlan";
import { formatMMK, shortOrderId } from "@/lib/format";
import { type Order } from "@/lib/orders";
import { initialProducts } from "@/lib/products";
import { sendSearchHandoff } from "@/lib/search-handoff";
import { openShopModal } from "@/lib/shop-events";
import { ClipboardList, LayoutDashboard, Package, Plus, Settings2, ShoppingBag, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAX_ORDERS = 30;

const PAGES = [
  { label: "ပင်မစာမျက်နှာ (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
  { label: "အော်ဒါများ (Orders)", href: "/dashboard/orders", icon: ClipboardList },
  { label: "ပစ္စည်းစာရင်းများ (Products)", href: "/dashboard/products", icon: ShoppingBag },
  { label: "ဆက်တင်များ (Settings)", href: "/dashboard/settings", icon: Settings2 },
];

const itemClass =
  "gap-3 rounded-lg px-3 py-2.5 text-slate-700 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-700 dark:text-slate-200 dark:data-[selected=true]:bg-indigo-400/15 dark:data-[selected=true]:text-indigo-200";

const groupClass =
  "p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-slate-500";

/**
 * Global search / command palette (Ctrl+K / ⌘K). Searches Orders, Products and
 * Shop settings, plus quick page navigation. Controlled by the parent shell.
 */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const account = useAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersState, setOrdersState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  // Load orders lazily each time the palette opens (keeps every other page free of this request).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setOrdersState("loading");
    fetch("/api/orders", { headers: { accept: "application/json" } })
      .then(res => res.json())
      .then((body: { ok?: boolean; orders?: Order[] }) => {
        if (cancelled) return;
        if (body.ok === true && Array.isArray(body.orders)) {
          setOrders(body.orders.slice(0, MAX_ORDERS));
          setOrdersState("ready");
        } else {
          setOrdersState("failed");
        }
      })
      .catch(() => !cancelled && setOrdersState("failed"));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const run = (action: () => void) => {
    onOpenChange(false);
    // Let the dialog close first so focus returns cleanly before navigating / opening another modal.
    window.setTimeout(action, 0);
  };

  const goSearch = (href: string, scope: "orders" | "products", query: string) =>
    run(() => {
      router.push(href);
      sendSearchHandoff(scope, query);
    });

  const shops = account?.shops ?? [];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global search"
      description="Orders, ပစ္စည်းများနှင့် ဆိုင်အချက်အလက်များကို ရှာဖွေပါ"
      showCloseButton={false}
      className="border-slate-200 bg-white sm:max-w-xl dark:border-white/10 dark:bg-slate-900"
    >
      <CommandInput placeholder="Orders, ပစ္စည်း၊ ဆိုင်အချက်အလက် ရှာရန်..." className="text-slate-900 dark:text-white" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          <span className="text-slate-500">ရှာမတွေ့ပါ — တခြားစကားလုံးနဲ့ ထပ်ရှာကြည့်ပါ။</span>
        </CommandEmpty>

        <CommandGroup heading="Orders · အော်ဒါများ" className={groupClass}>
          {orders.map(order => {
            const id = shortOrderId(order.id);
            return (
              <CommandItem
                key={order.id}
                value={`order ${id} ${order.customer_name ?? ""} ${order.items ?? ""} ${order.status}`}
                onSelect={() => goSearch("/dashboard/orders", "orders", id)}
                className={itemClass}
              >
                <ClipboardList className="size-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {id} · {order.customer_name || "Customer"}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {order.items || "—"} · {formatMMK(order.total_amount)} MMK · {order.status}
                  </span>
                </span>
              </CommandItem>
            );
          })}
          {ordersState === "loading" && orders.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">အော်ဒါများ ရှာဖွေနေပါတယ်…</div>
          )}
          {ordersState === "failed" && (
            <div className="px-3 py-2 text-xs text-slate-500">အော်ဒါများကို မဖတ်နိုင်သေးပါ။</div>
          )}
        </CommandGroup>

        <CommandGroup heading="Products · ပစ္စည်းများ" className={groupClass}>
          {initialProducts.map(product => (
            <CommandItem
              key={product.id}
              value={`product ${product.name} ${product.category} ${product.command} ${product.description}`}
              onSelect={() => goSearch("/dashboard/products", "products", product.name)}
              className={itemClass}
            >
              <Package className="size-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{product.name}</span>
                <span className="block truncate text-[11px] text-slate-500">
                  {product.category} · {formatMMK(product.price)} MMK · {product.command}
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Shop settings · ဆိုင်အချက်အလက်" className={groupClass}>
          {shops.map(shop => (
            <CommandItem
              key={shop.id}
              value={`shop settings ${shop.name} ${shop.phone} ဆိုင်`}
              onSelect={() => run(() => openShopModal({ kind: "edit", shopId: shop.id }))}
              className={itemClass}
            >
              <Store className="size-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{shop.name}</span>
                <span className="block truncate text-[11px] text-slate-500">ဆိုင်အချက်အလက် ပြင်ဆင်ရန် · {shop.phone}</span>
              </span>
            </CommandItem>
          ))}
          <CommandItem
            value="add shop new ဆိုင်သစ် ထပ်မံထည့်သွင်းရန် ဆိုင်အမည် ထည့်သွင်းရန်"
            onSelect={() => run(() => openShopModal({ kind: "create" }))}
            className={itemClass}
          >
            <Plus className="size-4 shrink-0 text-slate-400" />
            <span className="text-sm font-medium">
              {shops.length ? "+ ဆိုင်သစ် ထပ်မံထည့်သွင်းရန်" : "+ ဆိုင်အမည် ထည့်သွင်းရန် (Add your shop)"}
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Pages · စာမျက်နှာများ" className={groupClass}>
          {PAGES.map(page => (
            <CommandItem key={page.href} value={`page go ${page.label}`} onSelect={() => run(() => router.push(page.href))} className={itemClass}>
              <page.icon className="size-4 shrink-0 text-slate-400" />
              <span className="text-sm font-medium">{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-[10px] text-slate-500 dark:border-white/10">
        <span>↑↓ ရွေးရန် · Enter ဖွင့်ရန် · Esc ပိတ်ရန်</span>
        <span>Ctrl / ⌘ + K</span>
      </div>
    </CommandDialog>
  );
}
