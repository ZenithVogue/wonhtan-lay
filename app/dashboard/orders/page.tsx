"use client";

import EmptyState from "@/components/EmptyState";
import { LiveBadge, nextStatus, OrderStatusBadge, TelegramBadge } from "@/components/orders-ui";
import DashboardShell from "@/components/DashboardShell";
import { useSearchHandoff } from "@/hooks/useSearchHandoff";
import { useQuickAction } from "@/hooks/useQuickAction";
import { useAccount } from "@/hooks/usePlan";
import { downloadOrdersCsv, printOrdersPdf } from "@/lib/orders-export";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useOrders } from "@/hooks/useOrders";
import { formatDateTime, formatMMK, initialsOf, shortOrderId, timeAgo } from "@/lib/format";
import { type Order } from "@/lib/orders";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Search,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "@/lib/toast";

type Filter = "All" | "Pending" | "Processing" | "Completed";
const FILTERS: Filter[] = ["All", "Pending", "Processing", "Completed"];

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Filter>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useSearchHandoff("orders", term => {
    setQuery(term);
    setStatus("All");
  });

  const [orderModal, setOrderModal] = useState(false);
  const { orders, loading, error, connection, lastUpdated, updateStatus, sendTestOrder, createOrder } = useOrders();
  const account = useAccount();

  // Header "+ New → Create Manual Order" opens the modal here.
  useQuickAction("create-order", () => setOrderModal(true));

  const filteredOrders = useMemo(() => {
    const needle = query.toLowerCase();
    return orders.filter(order => {
      const matchesStatus = status === "All" || order.status === status;
      const haystack = `${shortOrderId(order.id)} ${order.customer_name ?? ""} ${order.items ?? ""}`.toLowerCase();
      return matchesStatus && haystack.includes(needle);
    });
  }, [orders, query, status]);

  const tabCounts = useMemo(() => {
    const counts: Record<Filter, number> = { All: orders.length, Pending: 0, Processing: 0, Completed: 0 };
    for (const order of orders) {
      if (order.status === "Pending" || order.status === "Processing" || order.status === "Completed") {
        counts[order.status] += 1;
      }
    }
    return counts;
  }, [orders]);

  const handleAdvance = async (order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    try {
      await updateStatus(order.id, next);
      toast(`Order moved to ${next}`, { description: `${shortOrderId(order.id)} · ${order.customer_name ?? "customer"}` });
    } catch (err) {
      toast("Status update failed", { description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const handleTestOrder = async () => {
    try {
      const order = await sendTestOrder();
      toast("Test order created", { description: `${shortOrderId(order.id)} saved to Supabase.` });
    } catch (err) {
      toast("Test order failed", { description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const exportLabel = [status === "All" ? "All orders" : status, query.trim() ? `search “${query.trim()}”` : ""].filter(Boolean).join(" · ");

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      toast("Export လုပ်စရာ အော်ဒါမရှိပါ", { description: "Filter ပြောင်းပါ (သို့) အော်ဒါအသစ်ထည့်ပါ။" });
      return;
    }
    downloadOrdersCsv("wonhtan-lay-orders.csv", filteredOrders);
    toast.success("CSV export ပြီးပါပြီ", { description: `${filteredOrders.length} orders ကို download လုပ်လိုက်ပါပြီ။` });
  };

  const handleExportPdf = () => {
    if (filteredOrders.length === 0) {
      toast("Export လုပ်စရာ အော်ဒါမရှိပါ", { description: "Filter ပြောင်းပါ (သို့) အော်ဒါအသစ်ထည့်ပါ။" });
      return;
    }
    try {
      printOrdersPdf(filteredOrders, { shopName: account?.shop || undefined, filterLabel: exportLabel });
      toast("PDF အဆင်သင့်ပါ", { description: "Print window မှာ “Save as PDF” ကို ရွေးပါ။" });
    } catch {
      toast.error("PDF မထုတ်နိုင်ပါ", { description: "Browser က print window ကို ပိတ်ထားနိုင်ပါတယ်။" });
    }
  };

  const handleCreateOrder = async (input: { customer_name?: string; items: string; total_amount: number }) => {
    try {
      const order = await createOrder(input);
      toast.success("အော်ဒါအသစ် ဖန်တီးပြီးပါပြီ", { description: `${shortOrderId(order.id)} · ${order.customer_name ?? "customer"}` });
      setOrderModal(false);
    } catch (err) {
      toast.error("အော်ဒါ မဖန်တီးနိုင်ပါ", { description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  return (
    <DashboardShell>
          <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  အော်ဒါများ <span className="text-indigo-300">(Orders)</span>
                </h2>
                <LiveBadge connection={connection} />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                သင့်ဆိုင်ရဲ့ အော်ဒါအားလုံးကို တစ်နေရာတည်းမှာ ရှာဖွေ၊ စစ်ဆေးပြီး delivery slip ထုတ်ပါ။
                {lastUpdated && (
                  <span className="ml-2 text-xs text-slate-600">· updated {lastUpdated.toLocaleTimeString()}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="on-primary inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                onClick={() => setOrderModal(true)}
              >
                <Plus className="size-4" /> Manual အော်ဒါ
              </button>
              <ExportMenu count={filteredOrders.length} onCsv={handleExportCsv} onPdf={handleExportPdf} />
              <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-600 active:scale-95 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300" onClick={handleTestOrder}>
                <Zap className="size-4" /> စမ်းသပ်အော်ဒါ ပို့ကြည့်မည်
              </button>
            </div>
          </div>

          <section className="dashboard-panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-white/[0.08] p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className="dashboard-search w-full pl-9"
                  placeholder="Customer name, order ID, or items"
                  aria-label="Search orders"
                />
              </div>
            </div>
            <div role="tablist" aria-label="Order status filters" className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.08] px-5 py-3 sm:px-6">
              {FILTERS.map(filter => (
                <button
                  key={filter}
                  role="tab"
                  aria-selected={status === filter}
                  onClick={() => setStatus(filter)}
                  className={`filter-tab inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs transition active:scale-95 ${
                    status === filter ? "filter-tab-active font-bold" : "font-medium"
                  }`}
                >
                  {filter === "All" ? "All Orders" : filter}
                  <span className="filter-count inline-flex shrink-0 items-center justify-center text-center text-xs font-semibold leading-none">{tabCounts[filter]}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs leading-5 text-rose-200 sm:mx-6">
                {error} Check <span className="font-mono">.env.local</span> (Supabase keys) and the RLS policies in
                <span className="font-mono"> supabase/migrations/002_orders_spec_alignment.sql</span>.
              </div>
            )}

            <div className="dashboard-table-wrap">
              <table className="dashboard-table orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items &amp; Total</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-xs font-medium text-indigo-300">{shortOrderId(order.id)}</span>
                        <span className="mt-1 block text-[10px] text-slate-600">{timeAgo(order.created_at)}</span>
                      </td>
                      <td>
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                            {initialsOf(order.customer_name)}
                          </span>
                          <span>
                            <span className="block text-xs font-medium text-slate-200">
                              {order.customer_name || "Telegram customer"}
                            </span>
                            {order.customer_telegram_id != null && (
                              <span className="mt-0.5 block text-[10px] text-slate-500">
                                Telegram ID {order.customer_telegram_id}
                              </span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="block max-w-[180px] truncate text-xs text-slate-300" title={order.items ?? ""}>
                          {order.items || "—"}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-slate-200">
                          {formatMMK(order.total_amount)} <span className="text-[10px] text-slate-500">MMK</span>
                        </span>
                      </td>
                      <td>
                        <TelegramBadge />
                      </td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {nextStatus(order.status) && (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              onClick={() => handleAdvance(order)}
                            >
                              → {nextStatus(order.status)}
                            </button>
                          )}
                          <button
                            className="on-primary inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <FileText className="size-3.5" /> Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm text-slate-400">Loading orders…</p>
                </div>
              )}
              {!loading && orders.length === 0 && (
                <EmptyState
                  compact
                  icon={ClipboardList}
                  title="အော်ဒါ မရှိသေးပါ"
                  description="Telegram Bot ကနေ customer တွေ မှာယူတဲ့အခါ ဒီမှာ အလိုအလျောက် ပေါ်လာပါမယ်။ ကိုယ်တိုင်လည်း အော်ဒါထည့်နိုင်ပါတယ်။"
                  primary={{ label: "+ ပထမဆုံး အော်ဒါ ဖန်တီးရန်", onClick: () => setOrderModal(true) }}
                  secondary={{ label: "Bot အား Telegram နှင့် ချိတ်ဆက်ရန်", href: "/dashboard/bot-settings" }}
                />
              )}
              {!loading && orders.length > 0 && filteredOrders.length === 0 && (
                <EmptyState
                  compact
                  icon={Search}
                  title="အော်ဒါ မတွေ့ပါ"
                  description="ရှာဖွေတဲ့ စကားလုံး (သို့) status filter နဲ့ ကိုက်ညီတဲ့ အော်ဒါမရှိပါ။"
                  primary={{ label: "Filter အားလုံး ဖယ်ရှားရန်", onClick: () => { setQuery(""); setStatus("All"); } }}
                />
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4">
              <span className="text-[11px] text-slate-600">
                Showing <span className="text-slate-400">{filteredOrders.length}</span> of {orders.length} orders
              </span>
              <span className="text-[11px] text-slate-500">
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Updated just now"}
              </span>
            </div>
          </section>
      <ManualOrderModal open={orderModal} onClose={() => setOrderModal(false)} onSubmit={handleCreateOrder} />
      {selectedOrder && <WaybillModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </DashboardShell>
  );
}

function WaybillModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const total = Number(order.total_amount) || 0;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery slip"
    >
      <div className="waybill-modal w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              Printable waybill
            </p>
            <h2 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">Delivery Slip Preview</h2>
          </div>
          <button
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-5 sm:p-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:p-7">
            <div className="flex flex-col gap-4 border-b-2 border-indigo-600 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Truck className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">WonHtan Lay Express Slip</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">KPay Verified Shop</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">{shortOrderId(order.id)}</p>
                <p className="mt-1 text-[10px] text-slate-500">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Receiver</p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {order.customer_name || "Telegram customer"}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {order.customer_telegram_id != null ? `Telegram ID ${order.customer_telegram_id}` : "Via Telegram"}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Status</p>
                <span className="mt-2 inline-flex items-center gap-1.5">
                  <OrderStatusBadge status={order.status} />
                </span>
                <p className="mt-3 text-[10px] text-slate-500">Via Telegram</p>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-2.5">Item</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-3 font-medium">{order.items || "—"}</td>
                    <td className="px-3 py-3 text-right">{formatMMK(total)} MMK</td>
                  </tr>
                  <tr className="border-t-2 border-indigo-200 bg-indigo-50 dark:border-indigo-400/20 dark:bg-indigo-400/10">
                    <td className="px-3 py-3 text-right font-bold">Total amount</td>
                    <td className="px-3 py-3 text-right font-bold text-indigo-700 dark:text-indigo-300">
                      {formatMMK(total)} MMK
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5 text-center text-[10px] text-slate-500">
              ကျေးဇူးတင်ပါတယ်။ WonHtan Lay နဲ့ အော်ဒါကို စနစ်တကျ ပို့ဆောင်ပါ။
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => window.print()}
          >
            <Printer className="size-4" /> Print Slip / PDF
          </button>
          <button className="button-primary justify-center" onClick={onClose}>
            <Check className="size-4" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportMenu({ count, onCsv, onPdf }: { count: number; onCsv: () => void; onPdf: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element | null)?.closest?.("[data-export-menu]")) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative" data-export-menu>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        <Download className="size-4" /> Export <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900">
          <p className="px-3 pb-1.5 pt-1 text-[10px] text-slate-500">လက်ရှိ filter ထဲက {count} orders ကို export လုပ်မည်</p>
          <button type="button" role="menuitem" onClick={() => pick(onCsv)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <FileSpreadsheet className="size-4 shrink-0 text-emerald-500" />
            <span><span className="block font-semibold">CSV (Excel)</span><span className="block text-[10px] text-slate-500">.csv ဖိုင် download</span></span>
          </button>
          <button type="button" role="menuitem" onClick={() => pick(onPdf)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <FileText className="size-4 shrink-0 text-red-500" />
            <span><span className="block font-semibold">PDF</span><span className="block text-[10px] text-slate-500">Print window မှာ “Save as PDF” ရွေးပါ</span></span>
          </button>
        </div>
      )}
    </div>
  );
}

function ManualOrderModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { customer_name?: string; items: string; total_amount: number }) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {open && <ManualOrderForm onClose={onClose} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

function ManualOrderForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: { customer_name?: string; items: string; total_amount: number }) => Promise<void> }) {
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.trim()) {
      toast("ပစ္စည်းအမည် ထည့်ပေးပါ", { description: "ဥပမာ — Cica Toner × 2" });
      return;
    }
    const amount = Number(total);
    if (total.trim() === "" || !Number.isFinite(amount) || amount < 0) {
      toast("စုစုပေါင်းငွေပမာဏ မမှန်ပါ", { description: "MMK ဂဏန်းတစ်ခု ထည့်ပါ။" });
      return;
    }
    setBusy(true);
    await onSubmit({ customer_name: customer.trim() || undefined, items: items.trim(), total_amount: amount });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <DialogTitle className="font-display text-lg font-bold text-slate-900 dark:text-white">Manual အော်ဒါဖန်တီးရန်</DialogTitle>
        <DialogDescription className="mt-1 text-xs text-slate-500">Telegram ကနေ မဝင်တဲ့ အော်ဒါတွေကို ကိုယ်တိုင်ထည့်ပါ။</DialogDescription>
      </div>
      <label className="block">
        <span className="form-label">Customer အမည် <span className="font-normal text-slate-500">(မဖြည့်လည်းရပါသည်)</span></span>
        <input className="form-input" value={customer} onChange={event => setCustomer(event.target.value)} placeholder="ဥပမာ — May Thu" autoFocus />
      </label>
      <label className="block">
        <span className="form-label">ပစ္စည်းများ</span>
        <textarea className="form-input min-h-20 resize-none" value={items} onChange={event => setItems(event.target.value)} placeholder="ဥပမာ — Cica Toner × 2, Lip Tint Set × 1" />
      </label>
      <label className="block">
        <span className="form-label">စုစုပေါင်း (MMK)</span>
        <input className="form-input" type="number" min="0" inputMode="numeric" value={total} onChange={event => setTotal(event.target.value)} placeholder="39000" />
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">မလုပ်တော့ပါ</button>
        <button type="submit" disabled={busy} className="on-primary rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? "ခဏစောင့်ပါ..." : "ဖန်တီးမည်"}</button>
      </div>
    </form>
  );
}
