"use client";

import { LiveBadge, nextStatus, OrderStatusBadge, TelegramBadge } from "@/components/orders-ui";
import DashboardShell from "@/components/DashboardShell";
import { usePlan } from "@/hooks/usePlan";
import { useOrders } from "@/hooks/useOrders";
import { formatDateTime, formatMMK, initialsOf, isToday, shortOrderId, timeAgo, todayLabel } from "@/lib/format";
import { type Order } from "@/lib/orders";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  Printer,
  Search,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Filter = "All" | "Pending" | "Processing" | "Completed";
const FILTERS: Filter[] = ["All", "Pending", "Processing", "Completed"];
const PAGE_SIZE = 10;


function downloadCsv(filename: string, rows: Order[]) {
  const header = ["Order ID", "Customer", "Telegram ID", "Items", "Total MMK", "Status", "Created"];
  const lines = rows.map(order =>
    [
      shortOrderId(order.id),
      order.customer_name ?? "",
      order.customer_telegram_id ?? "",
      order.items ?? "",
      order.total_amount,
      order.status,
      order.created_at,
    ]
      .map(cell => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [botsOnline, setBotsOnline] = useState<boolean | null>(null);

  const { orders, loading, error, connection, lastUpdated, updateStatus, sendTestOrder } = useOrders();
  const { account } = usePlan();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/telegram/status", { headers: { accept: "application/json" } })
      .then(res => res.json())
      .then(body => {
        if (!cancelled) setBotsOnline(Boolean(body?.connected));
      })
      .catch(() => {
        if (!cancelled) setBotsOnline(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesFilter = activeFilter === "All" || order.status === activeFilter;
      return matchesFilter;
    });
  }, [orders, activeFilter]);

  const tabCounts = useMemo(() => {
    const counts: Record<Filter, number> = { All: orders.length, Pending: 0, Processing: 0, Completed: 0 };
    for (const order of orders) {
      if (order.status === "Pending" || order.status === "Processing" || order.status === "Completed") {
        counts[order.status] += 1;
      }
    }
    return counts;
  }, [orders]);

  const stats = useMemo(() => {
    const todays = orders.filter(order => isToday(order.created_at));
    const revenue = todays.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    return {
      totalToday: todays.length,
      revenueToday: revenue,
      pendingCount: orders.filter(order => order.status === "Pending").length,
    };
  }, [orders]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedOrders = filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  const handleExport = () => {
    downloadCsv("wonhtan-lay-orders.csv", filteredOrders);
    toast("CSV export ပြီးပါပြီ", { description: `${filteredOrders.length} orders ကို download လုပ်လိုက်ပါပြီ။` });
  };

  return (
    <DashboardShell>
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <span>{todayLabel()}</span>
                <span className="size-1 rounded-full bg-slate-600" />
                <span className="text-emerald-300">Good morning, {account?.name?.split(" ")[0] || "May"}</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your shop at a glance<span className="text-indigo-300">.</span>
              </h2>
              <p className="mt-2 text-sm text-slate-500">ဒီနေ့ရဲ့ အော်ဒါနဲ့ လုပ်ဆောင်ချက်တွေကို တစ်နေရာတည်းမှာ ကြည့်ပါ။</p>
            </div>
            <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-600 active:scale-95 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300" onClick={handleTestOrder}>
              <Zap className="size-4" /> စမ်းသပ်အော်ဒါ ပို့ကြည့်မည်
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total orders today"
              burmese="ဒီနေ့ အော်ဒါစုစုပေါင်း"
              value={String(stats.totalToday)}
              icon={<ClipboardList className="size-4" />}
              iconStyle="bg-indigo-400/10 text-indigo-300"
            />
            <StatCard
              label="Revenue today"
              burmese="ဒီနေ့ ဝင်ငွေ"
              value={formatMMK(stats.revenueToday)}
              suffix="MMK"
              icon={<CreditCard className="size-4" />}
              iconStyle="bg-emerald-400/10 text-emerald-300"
            />
            <StatCard
              label="Pending orders"
              burmese="လုပ်ဆောင်ရန်ကျန် အော်ဒါ"
              value={String(stats.pendingCount)}
              icon={<FileCheck2 className="size-4" />}
              iconStyle="bg-amber-400/10 text-amber-300"
            />
            <StatCard
              label="Telegram bot"
              burmese="ချိတ်ဆက်ထားသော Bot"
              value={botsOnline === null ? "…" : botsOnline ? "Live" : "Offline"}
              icon={<Bot className="size-4" />}
              iconStyle="bg-cyan-400/10 text-cyan-300"
            />
          </section>

          <section className="dashboard-panel mt-6">
            <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-base font-semibold text-white">Recent orders</h3>
                  <LiveBadge connection={connection} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  လတ်တလော ဝင်လာတဲ့ အော်ဒါများ
                  {lastUpdated && (
                    <span className="ml-2 text-slate-600">· updated {lastUpdated.toLocaleTimeString()}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="dashboard-filter-button" onClick={handleExport}>
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.08] px-5 py-3 sm:px-6">
              {FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    activeFilter === filter
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                  }`}
                >
                  {filter}
                  <span className="ml-1.5 text-[10px] text-slate-600">{tabCounts[filter]}</span>
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
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Platform</th>
                    <th>Items</th>
                    <th>Total amount</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map(order => (
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
                              <span className="mt-0.5 block text-[10px] text-slate-500">ID {order.customer_telegram_id}</span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td>
                        <TelegramBadge />
                      </td>
                      <td>
                        <span className="block max-w-[155px] truncate text-xs text-slate-400" title={order.items ?? ""}>
                          {order.items || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-200">
                          {formatMMK(order.total_amount)} <span className="text-[10px] text-slate-500">MMK</span>
                        </span>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {nextStatus(order.status) && (
                            <button className="order-action" onClick={() => handleAdvance(order)}>
                              → {nextStatus(order.status)}
                            </button>
                          )}
                          <button className="order-action" onClick={() => setSelectedOrder(order)}>
                            View slip <ArrowUpRight className="size-3.5" />
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
              {!loading && filteredOrders.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <Search className="mx-auto size-7 text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">No orders in this view</p>
                  <button
                    onClick={() => {
                      setActiveFilter("All");
                    }}
                    className="mt-2 text-xs text-indigo-300 hover:text-indigo-200"
                  >
                    Show all orders
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 sm:px-6">
              <span className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-200">
                  {filteredOrders.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
                  {Math.min(safePage * PAGE_SIZE, filteredOrders.length)}
                </span>{" "}
                of {filteredOrders.length} orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="pagination-button"
                  disabled={safePage === 1}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1)
                  .slice(0, 5)
                  .map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`pagination-button ${pageNumber === safePage ? "pagination-active" : ""}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                <button
                  className="pagination-button"
                  disabled={safePage === pageCount}
                  onClick={() => setPage(Math.min(pageCount, safePage + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </section>
      {selectedOrder && <DeliverySlipModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </DashboardShell>
  );
}

function StatCard({
  label,
  burmese,
  value,
  suffix,
  icon,
  iconStyle,
}: {
  label: string;
  burmese: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  iconStyle: string;
}) {
  return (
    <article className="dashboard-stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1 text-[10px] text-slate-600">{burmese}</p>
        </div>
        <span className={`flex size-9 items-center justify-center rounded-xl ${iconStyle}`}>{icon}</span>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold tracking-tight text-white">{value}</span>
        {suffix && <span className="text-xs font-semibold text-slate-500">{suffix}</span>}
      </div>
    </article>
  );
}

function DeliverySlipModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const total = Number(order.total_amount) || 0;
  const statusLine =
    order.status === "Pending"
      ? "Awaiting verification"
      : order.status === "Processing"
        ? "Processing order"
        : "Completed";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery slip"
    >
      <div className="delivery-modal w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="font-display text-sm font-semibold text-white">Delivery slip preview</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">{shortOrderId(order.id)} · Ready to print</p>
          </div>
          <button className="dashboard-icon-button" onClick={onClose} aria-label="Close delivery slip">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4 sm:p-6">
          <div className="receipt-paper rounded-xl bg-white p-6 text-slate-800 shadow-xl sm:p-8">
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Bot className="size-4" />
                  </span>
                  <span className="font-display text-lg font-bold text-slate-900">WonHtan Lay</span>
                </div>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Delivery waybill
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-slate-900">{shortOrderId(order.id)}</p>
                <p className="mt-1 text-[10px] text-slate-500">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <div className="grid gap-5 border-b border-dashed border-slate-300 py-5 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Deliver to</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{order.customer_name || "Telegram customer"}</p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {order.customer_telegram_id != null ? `Telegram ID ${order.customer_telegram_id}` : "Via Telegram"}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Order status</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <Check className="size-3" /> {statusLine}
                </p>
                <p className="mt-3 text-[10px] text-slate-500">Via Telegram</p>
              </div>
            </div>
            <div className="py-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Items</p>
              <div className="mt-3 flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
                <span className="font-medium text-slate-700">{order.items || "—"}</span>
                <span className="font-bold text-slate-900">{formatMMK(total)} MMK</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>{formatMMK(total)} MMK</span>
              </div>
            </div>
            <div className="flex items-end justify-between border-t border-dashed border-slate-300 pt-5">
              <div>
                <div className="qr-placeholder">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <p className="mt-2 text-[9px] text-slate-400">Scan to track order</p>
              </div>
              <div className="text-right">
                <Truck className="ml-auto size-6 text-indigo-600" />
                <p className="mt-2 text-[10px] font-semibold text-slate-500">Thank you for shopping with us.</p>
                <p className="text-[10px] text-slate-400">ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါတယ်။</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] px-5 py-4">
          <button
            className="dashboard-filter-button"
            onClick={() => toast("Download started", { description: "Delivery slip PDF သည် demo mode ဖြစ်ပါသည်။" })}
          >
            <Download className="size-3.5" /> Download PDF
          </button>
          <button
            className="button-primary h-10 px-4 text-xs"
            onClick={() => toast("Print ready", { description: "Your delivery slip is ready to print." })}
          >
            <Printer className="size-3.5" /> Print slip
          </button>
        </div>
      </div>
    </div>
  );
}
