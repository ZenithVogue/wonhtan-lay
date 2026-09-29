import { listOrders } from "@/lib/orders";
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
