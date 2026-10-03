import { describe, expect, it } from "vitest";
import { buildOrdersReportHtml, escapeHtml, ordersToCsv } from "./orders-export";
import type { Order } from "./orders";

const order = (overrides: Partial<Order> = {}): Order => ({
  id: "abcdef12-0000-0000-0000-000000000000",
  customer_name: 'May "Thu"',
  customer_telegram_id: 42,
  items: "Cica Toner × 2",
  total_amount: 26000,
  status: "Pending",
  created_at: "2026-09-25T04:00:00.000Z",
  ...overrides,
});

describe("ordersToCsv", () => {
  it("starts with a BOM, has a header and escapes quotes", () => {
    const csv = ordersToCsv([order()]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe('"Order ID","Customer","Telegram ID","Items","Total MMK","Status","Created"');
    expect(lines[1]).toContain('"May ""Thu"""');
    expect(lines[1]).toContain('"26000"');
    expect(lines).toHaveLength(2);
  });
});

describe("buildOrdersReportHtml", () => {
  it("escapes HTML and totals the amounts", () => {
    const html = buildOrdersReportHtml([order({ customer_name: "<b>x</b>" }), order({ total_amount: 4000 })], { shopName: "A & B" });
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("A &amp; B");
    expect(html).toContain("30,000");
  });

  it("handles an empty list", () => {
    expect(buildOrdersReportHtml([])).toContain("No orders to export.");
  });

  it("escapeHtml covers quotes", () => {
    expect(escapeHtml(`"'<>&`)).toBe("&quot;'&lt;&gt;&amp;");
  });
});
