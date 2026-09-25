import type { Express, Request, Response } from "express";

const TELEGRAM_TOKEN_PATTERN = /^\d{7,12}:[A-Za-z0-9_-]{20,}$/;
const DEFAULT_WELCOME_PREFIX = "မင်္ဂလာပါရှင်၊ ဝန်ထမ်းလေးမှ ကြိုဆိုပါတယ်။ သင်၏ စာကို လက်ခံရရှိပါသည်: ";

// The latest token is kept in memory so a webhook can reply immediately after
// the set-webhook request. TELEGRAM_BOT_TOKEN is the durable production fallback
// for deployments that restart between webhook registrations.
let configuredTelegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";

function getForwardedValue(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.split(",")[0]?.trim() || "";
}

function getPublicWebhookUrl(req: Request) {
  const configuredBaseUrl = process.env.PUBLIC_APP_URL || process.env.WEBHOOK_BASE_URL;
  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  }

  const host = getForwardedValue(req.headers["x-forwarded-host"]) || req.get("host");
  if (!host) return "";

  // Telegram requires HTTPS. Reverse proxies may provide the original scheme,
  // but default to HTTPS for the public WebDev URL.
  const protocol = getForwardedValue(req.headers["x-forwarded-proto"]) || "https";
  return `${protocol}://${host}/api/telegram/webhook`;
}

function getTelegramApiUrl(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

function rememberTelegramToken(token: string) {
  configuredTelegramToken = token;
}

function getTelegramToken() {
  return configuredTelegramToken || process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function registerTelegramRoutes(app: Express) {
  app.post("/api/telegram/set-webhook", async (req: Request, res: Response) => {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";

    if (!token) {
      return res.status(400).json({ ok: false, error_code: 400, description: "Bot token is required." });
    }

    if (!TELEGRAM_TOKEN_PATTERN.test(token)) {
      return res.status(400).json({ ok: false, error_code: 400, description: "Invalid Telegram bot token format." });
    }

    const webhookUrl = getPublicWebhookUrl(req);
    if (!webhookUrl) {
      return res.status(500).json({ ok: false, error_code: 500, description: "Unable to determine the public webhook URL." });
    }

    try {
      const telegramResponse = await fetch(
        `${getTelegramApiUrl(token, "setWebhook")}?url=${encodeURIComponent(webhookUrl)}`,
        { method: "GET", headers: { accept: "application/json" } },
      );
      const responseBody = await telegramResponse.text();

      // Keep the raw Telegram response body and status so the browser receives
      // Telegram's exact `description` on failures.
      res.status(telegramResponse.status);
      const contentType = telegramResponse.headers.get("content-type");
      if (contentType) res.setHeader("content-type", contentType);
      if (telegramResponse.ok) {
        try {
          const parsed = JSON.parse(responseBody) as { ok?: boolean };
          if (parsed.ok === true) rememberTelegramToken(token);
        } catch {
          // The raw response is still returned below if Telegram sends non-JSON.
        }
      }
      return res.send(responseBody);
    } catch (error) {
      console.error("[Telegram] setWebhook request failed:", error instanceof Error ? error.message : error);
      return res.status(502).json({ ok: false, error_code: 502, description: "Unable to reach Telegram servers." });
    }
  });

  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    const update = req.body as {
      message?: {
        chat?: { id?: number | string };
        text?: string;
      };
    };
    const message = update?.message;
    const chatId = message?.chat?.id;
    const userMessageText = typeof message?.text === "string" ? message.text : "";
    const token = getTelegramToken();

    if (chatId !== undefined && token) {
      const replyText = `${DEFAULT_WELCOME_PREFIX}${userMessageText}`;
      try {
        const telegramResponse = await fetch(getTelegramApiUrl(token, "sendMessage"), {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: replyText }),
        });
        if (!telegramResponse.ok) {
          console.error("[Telegram] sendMessage failed:", await telegramResponse.text());
        }
      } catch (error) {
        console.error("[Telegram] webhook reply failed:", error instanceof Error ? error.message : error);
      }
    } else if (!token) {
      console.warn("[Telegram] Webhook received without a configured bot token.");
    }

    // Always acknowledge Telegram with HTTP 200 to prevent repeated delivery.
    return res.status(200).json({ ok: true });
  });
}
