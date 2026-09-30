import { describe, expect, it } from "vitest";
import { insertOrder, isOrderStatus, listOrders, updateOrderStatus } from "./orders";

type QueryResult = { data: unknown; error: { message: string } | null };

function fakeClient(handler: (table: string, op: string, payload?: unknown) => QueryResult) {
  return {
    from(table: string) {
      return {
        insert(payload: unknown) {
          return {
            select() {
              return {
                single: async () => handler(table, "insert", payload),
              };
            },
          };
        },
        select() {
          return {
            order() {
              return {
                limit: async () => handler(table, "select"),
              };
            },
          };
        },
        update(payload: unknown) {
          return {
            eq() {
              return {
                select() {
                  return {
                    single: async () => handler(table, "update", payload),
                  };
                },
              };
            },
          };
        },
      };
    },
  } as any;
}

const row = {
  id: "order-1",
  customer_name: "May",
  customer_telegram_id: 999,
  items: "Cica Toner × 2",
  total_amount: 26000,
  status: "Pending",
  created_at: "2026-09-29T00:00:00.000Z",
};

describe("isOrderStatus", () => {
  it("accepts only the three supported statuses", () => {
    expect(isOrderStatus("Pending")).toBe(true);
    expect(isOrderStatus("Processing")).toBe(true);
    expect(isOrderStatus("Completed")).toBe(true);
    expect(isOrderStatus("pending")).toBe(false);
    expect(isOrderStatus("Paid")).toBe(false);
    expect(isOrderStatus(null)).toBe(false);
  });
});

describe("insertOrder", () => {
  it("inserts with Pending default and returns the row", async () => {
    let seen: unknown = null;
    const client = fakeClient((table, op, payload) => {
      seen = { table, op, payload };
      return { data: row, error: null };
    });

    const order = await insertOrder(
      { customer_name: "May", customer_telegram_id: 999, items: "Cica Toner × 2", total_amount: 26000 },
      client,
    );
    expect(order).toEqual(row);
    expect(seen).toMatchObject({
      table: "orders",
      op: "insert",
      payload: expect.objectContaining({ status: "Pending", total_amount: 26000 }),
    });
  });

  it("wraps Supabase errors", async () => {
    const client = fakeClient(() => ({ data: null, error: { message: "violates row-level security" } }));
    await expect(insertOrder({ items: "x" }, client)).rejects.toThrow("Supabase order insert failed");
  });
});

describe("listOrders", () => {
  it("returns newest-first rows", async () => {
    const client = fakeClient(() => ({ data: [row], error: null }));
    await expect(listOrders(10, client)).resolves.toEqual([row]);
  });
});

describe("updateOrderStatus", () => {
  it("updates and returns the row", async () => {
    const client = fakeClient(() => ({ data: { ...row, status: "Completed" }, error: null }));
    const order = await updateOrderStatus("order-1", "Completed", client);
    expect(order.status).toBe("Completed");
  });
});
