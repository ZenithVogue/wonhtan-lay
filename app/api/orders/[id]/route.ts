import { isOrderStatus, updateOrderStatus } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Update an order's status: PATCH /api/orders/:id { "status": "Processing" } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error_code: 400, description: "Order id is required." }, { status: 400 });
  }

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

  let status: unknown = null;
  try {
    status = ((await request.json()) as { status?: unknown })?.status ?? null;
  } catch {
    status = null;
  }

  if (!isOrderStatus(status)) {
    return NextResponse.json(
      { ok: false, error_code: 400, description: "status must be one of: Pending, Processing, Completed." },
      { status: 400 },
    );
  }

  try {
    const order = await updateOrderStatus(id, status);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("[Supabase] order update failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        ok: false,
        error_code: 500,
        description: error instanceof Error ? error.message : "Failed to update the order.",
      },
      { status: 500 },
    );
  }
}
