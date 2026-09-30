import { insertOrder, isOrderStatus } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Test helper: simulates a Telegram webhook call by inserting an order
 * directly into Supabase, so database saving can be verified immediately
 * without touching Telegram.
 *
 *   GET  /api/telegram/test-order
 *   POST /api/telegram/test-order
 *        { "customer_name": "…", "customer_telegram_id": 123, "items": "…",
 *          "total_amount": 1000, "status": "Pending" }
 */
const DEFAULT_TEST_ORDER = {
  customer_name: "Test Customer",
  customer_telegram_id: 123456789,
  items: "Cica Toner × 2",
  total_amount: 26000,
  status: "Pending" as const,
};

async function createTestOrder(body: Record<string, unknown>) {
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

  const telegramIdRaw = body.customer_telegram_id;
  const telegramId =
    typeof telegramIdRaw === "number" && Number.isSafeInteger(telegramIdRaw)
      ? telegramIdRaw
      : typeof telegramIdRaw === "string" && telegramIdRaw.trim() !== "" && Number.isSafeInteger(Number(telegramIdRaw))
        ? Number(telegramIdRaw)
        : DEFAULT_TEST_ORDER.customer_telegram_id;

  const totalRaw = body.total_amount;
  const totalAmount =
    typeof totalRaw === "number" && Number.isFinite(totalRaw)
      ? totalRaw
      : typeof totalRaw === "string" && totalRaw.trim() !== "" && Number.isFinite(Number(totalRaw))
        ? Number(totalRaw)
        : DEFAULT_TEST_ORDER.total_amount;

  try {
    const order = await insertOrder({
      customer_name:
        typeof body.customer_name === "string" && body.customer_name.trim()
          ? body.customer_name
          : DEFAULT_TEST_ORDER.customer_name,
      customer_telegram_id: telegramId,
      items: typeof body.items === "string" && body.items ? body.items : DEFAULT_TEST_ORDER.items,
      total_amount: totalAmount,
      status: isOrderStatus(body.status) ? body.status : DEFAULT_TEST_ORDER.status,
    });
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("[Supabase] test-order insert failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        ok: false,
        error_code: 500,
        description: error instanceof Error ? error.message : "Failed to insert the test order.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return createTestOrder({});
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = ((await request.json()) as Record<string, unknown>) ?? {};
  } catch {
    body = {};
  }
  return createTestOrder(body);
}
