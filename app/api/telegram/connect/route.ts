import { insertOrder } from "@/lib/orders";
import { TELEGRAM_UNREACHABLE_DESCRIPTION } from "@/lib/telegram";
import { connectTelegramWithToken } from "@/lib/telegram-poll";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Polling-based connect: validates the token with Telegram's getMe, drops
 * any webhook, then starts a getUpdates loop. Works without a public URL —
 * the server only needs outbound internet access to api.telegram.org.
 */
export async function POST(request: Request) {
  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body?.token === "string" ? body.token.trim() : "";
  } catch {
    token = "";
  }

  try {
    const result = await connectTelegramWithToken(token, { insertOrderFn: insertOrder });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error_code: result.status, description: result.description },
        { status: result.status },
      );
    }

    const bot = result.bot;
    return NextResponse.json({
      ok: true,
      mode: "polling",
      bot,
      description: bot.username
        ? `Connected to @${bot.username} via polling. No public URL required.`
        : "Connected via polling. No public URL required.",
    });
  } catch (error) {
    console.error("[Telegram] connect request failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, error_code: 502, description: TELEGRAM_UNREACHABLE_DESCRIPTION },
      { status: 502 },
    );
  }
}
