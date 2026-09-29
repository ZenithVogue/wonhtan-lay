import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseServerClient } from "./supabase/server";

export const ORDER_STATUSES = ["Pending", "Processing", "Completed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Row shape of public.orders (see supabase/migrations/002_*). */
export type Order = {
  id: string;
  customer_name: string | null;
  customer_telegram_id: number | null;
  items: string | null;
  total_amount: number;
  status: string;
  created_at: string;
};

export type NewOrder = {
  customer_name?: string | null;
  customer_telegram_id?: number | null;
  items?: string | null;
  total_amount?: number;
  status?: OrderStatus;
};

type DbClient = Pick<SupabaseClient, "from">;

function resolveClient(client?: DbClient): DbClient {
  return client ?? requireSupabaseServerClient();
}

export async function insertOrder(input: NewOrder, client?: DbClient): Promise<Order> {
  const db = resolveClient(client);
  const { data, error } = await db
    .from("orders")
    .insert({
      customer_name: input.customer_name?.trim() ? input.customer_name.trim() : null,
      customer_telegram_id: input.customer_telegram_id ?? null,
      items: input.items ?? null,
      total_amount: input.total_amount ?? 0,
      status: input.status ?? "Pending",
    })
    .select("id, customer_name, customer_telegram_id, items, total_amount, status, created_at")
    .single();

  if (error) {
    throw new Error(`Supabase order insert failed: ${error.message}`);
  }
  return data as Order;
}

export async function listOrders(limit = 100, client?: DbClient): Promise<Order[]> {
  const db = resolveClient(client);
  const { data, error } = await db
    .from("orders")
    .select("id, customer_name, customer_telegram_id, items, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase orders query failed: ${error.message}`);
  }
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(id: string, status: OrderStatus, client?: DbClient): Promise<Order> {
  const db = resolveClient(client);
  const { data, error } = await db
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("id, customer_name, customer_telegram_id, items, total_amount, status, created_at")
    .single();

  if (error) {
    throw new Error(`Supabase order update failed: ${error.message}`);
  }
  return data as Order;
}
