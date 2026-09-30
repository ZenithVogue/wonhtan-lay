import { disconnectTelegram } from "@/lib/telegram-poll";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  disconnectTelegram();
  return NextResponse.json({ ok: true, description: "Telegram bot disconnected." });
}
