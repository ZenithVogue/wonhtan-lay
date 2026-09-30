"use client";

import type { OrdersConnection } from "@/hooks/useOrders";
import { ORDER_STATUSES } from "@/lib/orders";

const STATUS_STYLES: Record<string, string> = {
  Pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  Processing: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  Completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "border-slate-400/25 bg-slate-400/10 text-slate-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/** Next status in the Pending → Processing → Completed flow (null when done). */
export function nextStatus(status: string): (typeof ORDER_STATUSES)[number] | null {
  if (status === "Pending") return "Processing";
  if (status === "Processing") return "Completed";
  return null;
}

const CONNECTION_COPY: Record<OrdersConnection, { dot: string; label: string }> = {
  live: { dot: "bg-emerald-300", label: "Live · realtime" },
  polling: { dot: "bg-amber-300", label: "Polling · auto-refresh" },
  unconfigured: { dot: "bg-slate-500", label: "Supabase not configured" },
  error: { dot: "bg-rose-400", label: "Connection error" },
};

export function LiveBadge({ connection }: { connection: OrdersConnection }) {
  const copy = CONNECTION_COPY[connection];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
      <span className={`size-1.5 rounded-full ${copy.dot} ${connection === "live" ? "animate-pulse" : ""}`} />
      {copy.label}
    </span>
  );
}

export function TelegramBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
      <span className="flex size-6 items-center justify-center rounded-md bg-sky-400/10">
        <span className="text-[11px]">➤</span>
      </span>
      Telegram
    </span>
  );
}
