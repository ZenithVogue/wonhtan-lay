import { formatMMK, shortOrderId } from "./format";
import type { Order } from "./orders";

const CSV_HEADER = ["Order ID", "Customer", "Telegram ID", "Items", "Total MMK", "Status", "Created"];

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

/**
 * CSV text for the given orders. Prefixed with a UTF-8 BOM so Excel opens
 * Burmese text correctly instead of showing garbled characters.
 */
export function ordersToCsv(rows: Order[]): string {
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
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${[CSV_HEADER.map(csvCell).join(","), ...lines].join("\r\n")}`;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type OrdersReportMeta = { shopName?: string; filterLabel?: string; generatedAt?: Date };

/** Standalone, print-ready HTML report (printed / saved as PDF by the browser). */
export function buildOrdersReportHtml(rows: Order[], meta: OrdersReportMeta = {}): string {
  const generated = (meta.generatedAt ?? new Date()).toLocaleString();
  const total = rows.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
  const body = rows
    .map(
      order => `<tr>
  <td class="mono">${escapeHtml(shortOrderId(order.id))}</td>
  <td>${escapeHtml(order.customer_name || "Telegram customer")}</td>
  <td>${escapeHtml(order.items || "—")}</td>
  <td class="num">${escapeHtml(formatMMK(order.total_amount))}</td>
  <td>${escapeHtml(order.status)}</td>
  <td>${escapeHtml(new Date(order.created_at).toLocaleString())}</td>
</tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="my">
<head>
<meta charset="utf-8" />
<title>WonHtan Lay — Orders</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Noto Sans Myanmar", "Myanmar Text", "Padauk", system-ui, sans-serif; color: #0f172a; font-size: 11px; margin: 0; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #475569; margin-bottom: 14px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #eef2ff; color: #3730a3; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  tr { page-break-inside: avoid; }
  .mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
  .num { text-align: right; white-space: nowrap; }
  tfoot td { font-weight: 700; background: #eef2ff; }
  .empty { padding: 24px; text-align: center; color: #64748b; }
</style>
</head>
<body>
  <h1>WonHtan Lay — အော်ဒါစာရင်း (Orders)</h1>
  <div class="meta">
    ${meta.shopName ? `ဆိုင်: ${escapeHtml(meta.shopName)}<br />` : ""}
    ${meta.filterLabel ? `Filter: ${escapeHtml(meta.filterLabel)}<br />` : ""}
    Generated: ${escapeHtml(generated)} · ${rows.length} orders
  </div>
  ${
    rows.length === 0
      ? '<div class="empty">No orders to export.</div>'
      : `<table>
    <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th class="num">Total (MMK)</th><th>Status</th><th>Created</th></tr></thead>
    <tbody>
${body}
    </tbody>
    <tfoot><tr><td colspan="3">Total</td><td class="num">${escapeHtml(formatMMK(total))}</td><td colspan="2"></td></tr></tfoot>
  </table>`
  }
</body>
</html>`;
}

/** Browser: download a CSV file. */
export function downloadOrdersCsv(filename: string, rows: Order[]): void {
  const url = URL.createObjectURL(new Blob([ordersToCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Browser: open the browser's print dialog for the formatted report so it can be
 * saved as a PDF. Uses a hidden iframe (no popup blockers) and the browser's own
 * text engine, which shapes Burmese correctly.
 */
export function printOrdersPdf(rows: Order[], meta: OrdersReportMeta = {}): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    throw new Error("Print frame unavailable");
  }
  doc.open();
  doc.write(buildOrdersReportHtml(rows, meta));
  doc.close();
  const cleanup = () => window.setTimeout(() => iframe.remove(), 500);
  win.addEventListener("afterprint", cleanup);
  window.setTimeout(() => {
    win.focus();
    win.print();
  }, 250);
  // Fallback cleanup in case `afterprint` never fires.
  window.setTimeout(cleanup, 60_000);
}
