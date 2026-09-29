import { insertOrder, type NewOrder, type Order } from "./orders";
import {
  deleteTelegramWebhook,
  fetchTelegramBotInfo,
  getTelegramApiUrl,
  isValidTelegramTokenFormat,
  processIncomingMessage,
  TelegramApiError,
  type TelegramBotInfo,
  type TelegramUpdate,
} from "./telegram";

/**
 * In-process Telegram polling (getUpdates long-polling).
 *
 * Works anywhere the server process stays alive (`next dev`, `next start`,
 * any VPS) with no public URL required. Not suitable for serverless
 * deployments where instances freeze between requests — use the webhook
 * route there instead.
 */

const POLL_TIMEOUT_SECONDS = 30;
const POLL_RETRY_DELAY_MS = 5000;

export type PollingStatus = {
  connected: boolean;
  mode: "polling" | null;
  bot: TelegramBotInfo | null;
  tokenConfigured: boolean;
  startedAt: string | null;
  lastPollAt: string | null;
  lastError: string | null;
};

type PollingDeps = {
  insertOrderFn?: (input: NewOrder) => Promise<Order>;
  fetchImpl?: typeof fetch;
};

const polling = {
  active: false,
  token: "",
  bot: null as TelegramBotInfo | null,
  offset: 0,
  lastError: "",
  lastPollAt: "",
  startedAt: "",
  timer: null as ReturnType<typeof setTimeout> | null,
  inFlight: false,
  deps: {} as PollingDeps,
};

let rememberedToken = "";

export function rememberTelegramToken(token: string): void {
  rememberedToken = token;
}

export function getTelegramToken(): string {
  return rememberedToken || process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

function scheduleNextPoll(delayMs: number): void {
  if (polling.timer) {
    clearTimeout(polling.timer);
    polling.timer = null;
  }
  if (!polling.active) return;
  polling.timer = setTimeout(() => {
    void runPoll();
  }, delayMs);
  polling.timer.unref?.();
}

async function runPoll(): Promise<void> {
  polling.timer = null;
  if (!polling.active || polling.inFlight) return;
  polling.inFlight = true;

  const fetchImpl = polling.deps.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(
      `${getTelegramApiUrl(polling.token, "getUpdates")}?offset=${polling.offset}&timeout=${POLL_TIMEOUT_SECONDS}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout((POLL_TIMEOUT_SECONDS + 15) * 1000),
      },
    );
    let payload: { ok?: boolean; result?: TelegramUpdate[]; description?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      // Non-JSON body — handled as a generic failure below.
    }

    if (response.status === 401 || payload.description === "Unauthorized") {
      polling.lastError = "Telegram rejected the bot token (401 Unauthorized). Reconnect with a valid token.";
      console.error(`[Telegram] ${polling.lastError}`);
      stopTelegramPolling();
      return;
    }

    if (!response.ok || payload.ok !== true || !Array.isArray(payload.result)) {
      polling.lastError = payload.description || `Telegram getUpdates failed with HTTP ${response.status}.`;
      console.error(`[Telegram] ${polling.lastError}`);
      scheduleNextPoll(POLL_RETRY_DELAY_MS);
      return;
    }

    for (const update of payload.result) {
      if (typeof update?.update_id === "number") {
        polling.offset = Math.max(polling.offset, update.update_id + 1);
      }
      if (update?.message) {
        await processIncomingMessage(polling.token, update.message, {
          insertOrderFn: polling.deps.insertOrderFn,
          fetchImpl,
        });
      }
    }

    polling.lastPollAt = new Date().toISOString();
    polling.lastError = "";
    scheduleNextPoll(0);
  } catch (error) {
    polling.lastError = error instanceof Error ? error.message : "Polling request failed.";
    console.error("[Telegram] polling request failed:", polling.lastError);
    scheduleNextPoll(POLL_RETRY_DELAY_MS);
  } finally {
    polling.inFlight = false;
  }
}

export function startTelegramPolling(token: string, bot: TelegramBotInfo | null, deps: PollingDeps = {}): void {
  stopTelegramPolling();
  polling.active = true;
  polling.token = token;
  polling.bot = bot;
  polling.offset = 0;
  polling.lastError = "";
  polling.startedAt = new Date().toISOString();
  polling.lastPollAt = "";
  polling.deps = deps;
  console.log(`[Telegram] Polling started${bot?.username ? ` for @${bot.username}` : ""}. No public URL required.`);
  scheduleNextPoll(0);
}

export function stopTelegramPolling(): void {
  polling.active = false;
  if (polling.timer) {
    clearTimeout(polling.timer);
    polling.timer = null;
  }
}

export function getTelegramPollingStatus(): PollingStatus {
  return {
    connected: polling.active,
    mode: polling.active ? "polling" : null,
    bot: polling.bot,
    tokenConfigured: Boolean(getTelegramToken()),
    startedAt: polling.startedAt || null,
    lastPollAt: polling.lastPollAt || null,
    lastError: polling.lastError || null,
  };
}

export function disconnectTelegram(): void {
  stopTelegramPolling();
  rememberedToken = "";
  polling.token = "";
  polling.bot = null;
  polling.offset = 0;
  polling.lastError = "";
  polling.lastPollAt = "";
  polling.startedAt = "";
  polling.deps = {};
}

export type ConnectResult =
  | { ok: true; bot: TelegramBotInfo }
  | { ok: false; status: number; description: string };

/**
 * Validate a token with getMe, drop any webhook, and start polling.
 * Shared by the connect API route and the boot-time auto-connect.
 */
export async function connectTelegramWithToken(token: string, deps: PollingDeps = {}): Promise<ConnectResult> {
  const normalized = token.trim();
  if (!normalized) {
    return { ok: false, status: 400, description: "Bot token is required." };
  }
  if (!isValidTelegramTokenFormat(normalized)) {
    return { ok: false, status: 400, description: "Invalid Telegram bot token format." };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;

  let bot: TelegramBotInfo;
  try {
    bot = await fetchTelegramBotInfo(normalized, fetchImpl);
  } catch (error) {
    if (error instanceof TelegramApiError) {
      return { ok: false, status: error.status, description: error.description };
    }
    throw error;
  }

  await deleteTelegramWebhook(normalized, fetchImpl);

  rememberTelegramToken(normalized);
  startTelegramPolling(normalized, bot, deps);
  return { ok: true, bot };
}

/** Auto-connect on server boot when TELEGRAM_BOT_TOKEN is set (see instrumentation.ts). */
export function maybeAutoStartPolling(): void {
  if (typeof window !== "undefined") return;
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
  if (!envToken || !isValidTelegramTokenFormat(envToken)) return;

  connectTelegramWithToken(envToken, { insertOrderFn: insertOrder })
    .then(result => {
      if (!result.ok) {
        console.warn(`[Telegram] TELEGRAM_BOT_TOKEN rejected (${result.status}): ${result.description}`);
      }
    })
    .catch(error => {
      console.warn("[Telegram] Auto-connect with TELEGRAM_BOT_TOKEN failed:", error instanceof Error ? error.message : error);
    });
}
