import { insertOrder, isOrderStatus, listOrders } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** List recent orders (newest first). Used by the dashboard fallback poller. */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error_code: 503,
        description: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local (see .env.example).",
      },
      { status: 503 },
    );
  }

  try {
    const orders = await listOrders(100);
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("[Supabase] orders query failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        ok: false,
        error_code: 500,
        description: error instanceof Error ? error.message : "Failed to load orders.",
      },
      { status: 500 },
    );
  }
}

/**
 * Create an order by hand (dashboard "Create Manual Order").
 *   POST /api/orders { customer_name?, items, total_amount, status? }
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error_code: 503,
        description: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local (see .env.example).",
      },
      { status: 503 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = (await request.json()) as unknown;
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    body = {};
  }

  const items = typeof body.items === "string" ? body.items.trim() : "";
  const total = typeof body.total_amount === "number" ? body.total_amount : Number(body.total_amount);
  const customer = typeof body.customer_name === "string" ? body.customer_name : null;
  const status = body.status === undefined ? "Pending" : body.status;

  if (!items) {
    return NextResponse.json({ ok: false, error_code: 400, description: "items is required." }, { status: 400 });
  }
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ ok: false, error_code: 400, description: "total_amount must be a non-negative number." }, { status: 400 });
  }
  if (!isOrderStatus(status)) {
    return NextResponse.json(
      { ok: false, error_code: 400, description: "status must be one of: Pending, Processing, Completed." },
      { status: 400 },
    );
  }

  try {
    const order = await insertOrder({ customer_name: customer, items, total_amount: total, status });
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("[Supabase] manual order insert failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, error_code: 500, description: error instanceof Error ? error.message : "Failed to create the order." },
      { status: 500 },
    );
  }
}
