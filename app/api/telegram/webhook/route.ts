import { processIncomingMessage, type TelegramUpdate } from "@/lib/telegram";
import { getTelegramToken } from "@/lib/telegram-poll";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Telegram webhook receiver.
 * Set it with BotFather's token via:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<PUBLIC_URL>/api/telegram/webhook
 *
 * Every incoming text message becomes a Pending order in Supabase.
 * Always answers HTTP 200 so Telegram never retries the delivery.
 */
export async function POST(request: Request) {
  let update: TelegramUpdate | null = null;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    // Malformed body — still acknowledge so Telegram drops it.
    return NextResponse.json({ ok: true });
  }

  const token = getTelegramToken();
  if (!token) {
    console.warn("[Telegram] Webhook received without a configured bot token.");
    return NextResponse.json({ ok: true });
  }

  // processIncomingMessage never throws; insert/reply failures are logged.
  await processIncomingMessage(token, update?.message);

  return NextResponse.json({ ok: true });
}
