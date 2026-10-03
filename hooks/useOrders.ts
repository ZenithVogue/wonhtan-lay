"use client";

import { type Order, type OrderStatus } from "@/lib/orders";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

export type OrdersConnection = "live" | "polling" | "unconfigured" | "error";

async function fetchOrdersViaApi(): Promise<Order[]> {
  const response = await fetch("/api/orders", { headers: { accept: "application/json" } });
  const body = (await response.json().catch(() => ({}))) as { ok?: boolean; orders?: Order[]; description?: string };
  if (!response.ok || body.ok !== true || !Array.isArray(body.orders)) {
    throw new Error(body.description || `Orders request failed with HTTP ${response.status}.`);
  }
  return body.orders;
}

/**
 * Orders data hook with realtime updates.
 *
 * 1. Loads the initial list (browser Supabase client, else /api/orders).
 * 2. Subscribes to postgres_changes for instant INSERT/UPDATE/DELETE.
 * 3. Falls back to polling /api/orders when realtime is unavailable
 *    (missing NEXT_PUBLIC_* keys, blocked websocket, RLS misconfiguration).
 */
export function useOrders(pollIntervalMs = 5000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<OrdersConnection>("polling");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error: queryError } = await supabase
        .from("orders")
        .select("id, customer_name, customer_telegram_id, items, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (queryError) throw new Error(`Supabase orders query failed: ${queryError.message}`);
      setOrders((data ?? []) as Order[]);
    } else {
      setOrders(await fetchOrdersViaApi());
    }
    setLastUpdated(new Date());
    setError(null);
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollTimer.current = setInterval(() => {
      refresh().catch(err => {
        setError(err instanceof Error ? err.message : "Failed to refresh orders.");
        setConnection("error");
      });
    }, pollIntervalMs);
  }, [pollIntervalMs, refresh, stopPolling]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await refresh();
        if (cancelled) return;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load orders.");
        setConnection(getSupabaseBrowserClient() ? "error" : "unconfigured");
        setLoading(false);
        return;
      }
      if (cancelled) return;
      setLoading(false);

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        // No browser keys — poll the server API instead.
        setConnection("polling");
        startPolling();
        return;
      }

      const channel = supabase
        .channel("orders-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, payload => {
          if (cancelled) return;
          setLastUpdated(new Date());
          if (payload.eventType === "INSERT") {
            const row = payload.new as Order;
            setOrders(current => (current.some(o => o.id === row.id) ? current : [row, ...current]));
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as Order;
            setOrders(current => current.map(o => (o.id === row.id ? row : o)));
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string };
            if (old?.id) setOrders(current => current.filter(o => o.id !== old.id));
          }
        })
        .subscribe(status => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            setConnection("live");
            setError(null);
            stopPolling();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            // Realtime unavailable (often RLS or the table missing from the
            // supabase_realtime publication) — poll instead.
            setConnection("polling");
            startPolling();
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    })().catch(() => {
      // Errors are handled inside; this guards the floating promise.
    });

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [refresh, startPolling, stopPolling]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    const previous = orders;
    setOrders(current => current.map(o => (o.id === id ? { ...o, status } : o)));
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; order?: Order; description?: string };
      if (!response.ok || body.ok !== true || !body.order) {
        throw new Error(body.description || `Update failed with HTTP ${response.status}.`);
      }
      setOrders(current => current.map(o => (o.id === id ? body.order! : o)));
      setLastUpdated(new Date());
      return body.order;
    } catch (err) {
      setOrders(previous);
      throw err;
    }
  }, [orders]);

  const sendTestOrder = useCallback(async () => {
    const response = await fetch("/api/telegram/test-order", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({}),
    });
    const body = (await response.json().catch(() => ({}))) as { ok?: boolean; order?: Order; description?: string };
    if (!response.ok || body.ok !== true || !body.order) {
      throw new Error(body.description || `Test order failed with HTTP ${response.status}.`);
    }
    const order = body.order;
    setOrders(current => (current.some(o => o.id === order.id) ? current : [order, ...current]));
    setLastUpdated(new Date());
    return order;
  }, []);

  const createOrder = useCallback(async (input: { customer_name?: string; items: string; total_amount: number }) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json().catch(() => ({}))) as { ok?: boolean; order?: Order; description?: string };
    if (!response.ok || body.ok !== true || !body.order) {
      throw new Error(body.description || `Create order failed with HTTP ${response.status}.`);
    }
    const order = body.order;
    setOrders(current => (current.some(o => o.id === order.id) ? current : [order, ...current]));
    setLastUpdated(new Date());
    return order;
  }, []);

  return { orders, loading, error, connection, lastUpdated, refresh, updateStatus, sendTestOrder, createOrder };
}
