import { insertOrder, type NewOrder, type Order } from "./orders";

export const TELEGRAM_TOKEN_PATTERN = /^\d{7,12}:[A-Za-z0-9_-]{20,}$/;
export const WELCOME_PREFIX = "မင်္ဂလာပါရှင်၊ ဝန်ထမ်းလေးမှ ကြိုဆိုပါတယ်။ သင်၏ စာကို လက်ခံရရှိပါသည်: ";
export const TELEGRAM_UNREACHABLE_DESCRIPTION =
  "Unable to reach Telegram servers. The server needs internet access to api.telegram.org — sandboxed or offline environments cannot connect.";

export function isValidTelegramTokenFormat(token: string): boolean {
  return TELEGRAM_TOKEN_PATTERN.test(token.trim());
}

export function getTelegramApiUrl(token: string, method: string): string {
  return `https://api.telegram.org/bot${token}/${method}`;
}

export type TelegramBotInfo = {
  id: number;
  username?: string;
  first_name?: string;
};

export type TelegramMessage = {
  chat?: { id?: number | string };
  from?: { id?: number | string; username?: string; first_name?: string };
  text?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

export class TelegramApiError extends Error {
  status: number;
  description: string;

  constructor(status: number, description: string) {
    super(description);
    this.name = "TelegramApiError";
    this.status = status;
    this.description = description;
  }
}

type FetchImpl = typeof fetch;

async function readTelegramPayload(response: Response): Promise<{ ok?: boolean; result?: any; description?: string }> {
  try {
    return (await response.json()) as { ok?: boolean; result?: any; description?: string };
  } catch {
    return {};
  }
}

/** Validate a bot token against Telegram. Throws TelegramApiError on rejection. */
export async function fetchTelegramBotInfo(token: string, fetchImpl: FetchImpl = fetch): Promise<TelegramBotInfo> {
  const response = await fetchImpl(getTelegramApiUrl(token, "getMe"), {
    method: "GET",
    headers: { accept: "application/json" },
  });
  const payload = await readTelegramPayload(response);

  if (!response.ok || payload.ok !== true || typeof payload.result?.id !== "number") {
    throw new TelegramApiError(response.status, payload.description || `Telegram getMe failed with HTTP ${response.status}.`);
  }
  return {
    id: payload.result.id,
    username: payload.result.username,
    first_name: payload.result.first_name,
  };
}

/** Best-effort webhook removal so getUpdates polling receives updates. */
export async function deleteTelegramWebhook(token: string, fetchImpl: FetchImpl = fetch): Promise<void> {
  try {
    await fetchImpl(`${getTelegramApiUrl(token, "deleteWebhook")}?drop_pending_updates=true`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
  } catch (error) {
    console.warn("[Telegram] deleteWebhook failed:", error instanceof Error ? error.message : error);
  }
}

export async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string,
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  const response = await fetchImpl(getTelegramApiUrl(token, "sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) {
    console.error("[Telegram] sendMessage failed:", await response.text().catch(() => ""));
  }
}

export type ExtractedOrder = {
  customerName: string;
  telegramId: number | null;
  chatId: number | string;
  text: string;
};

/**
 * Extract order fields from an incoming Telegram message.
 * Returns null when the update carries no usable message (e.g. edits,
 * stickers, service messages) so the caller can acknowledge and skip.
 */
export function extractOrderFromMessage(message: TelegramMessage | undefined | null): ExtractedOrder | null {
  const chatId = message?.chat?.id;
  if (chatId === undefined) return null;

  const sender = message?.from;
  const rawSenderId = sender?.id;
  const telegramId =
    typeof rawSenderId === "number"
      ? rawSenderId
      : typeof rawSenderId === "string" && rawSenderId.trim() !== "" && Number.isSafeInteger(Number(rawSenderId))
        ? Number(rawSenderId)
        : null;

  return {
    customerName: sender?.first_name || sender?.username || "Telegram customer",
    telegramId,
    chatId,
    text: typeof message?.text === "string" ? message.text : "",
  };
}

export type ProcessMessageDeps = {
  insertOrderFn?: (input: NewOrder) => Promise<Order>;
  fetchImpl?: FetchImpl;
};

export type ProcessMessageResult = {
  handled: boolean;
  order: Order | null;
  replyText: string | null;
};

/**
 * Handle one incoming Telegram message: persist a Pending order, then reply
 * to the customer. Never throws — failures are logged and reported in the
 * result so webhook callers can always answer Telegram with HTTP 200.
 */
export async function processIncomingMessage(
  token: string,
  message: TelegramMessage | undefined | null,
  deps: ProcessMessageDeps = {},
): Promise<ProcessMessageResult> {
  const extracted = extractOrderFromMessage(message);
  if (!extracted) {
    return { handled: false, order: null, replyText: null };
  }

  const insertFn = deps.insertOrderFn ?? insertOrder;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const replyText = `${WELCOME_PREFIX}${extracted.text}`;

  let order: Order | null = null;
  try {
    order = await insertFn({
      customer_name: extracted.customerName,
      customer_telegram_id: extracted.telegramId,
      items: extracted.text,
      total_amount: 0,
      status: "Pending",
    });
    console.log("[Supabase] Telegram order inserted successfully", {
      orderId: order.id,
      chatId: String(extracted.chatId),
      customerTelegramId: extracted.telegramId,
      customerName: extracted.customerName,
      items: extracted.text,
      status: "Pending",
    });
  } catch (error) {
    console.error("[Supabase] Telegram order insert failed:", error instanceof Error ? error.message : error);
  }

  try {
    await sendTelegramMessage(token, extracted.chatId, replyText, fetchImpl);
  } catch (error) {
    console.error("[Telegram] message reply failed:", error instanceof Error ? error.message : error);
  }

  return { handled: true, order, replyText };
}
