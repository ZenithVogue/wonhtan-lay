import { afterEach, describe, expect, it, vi } from "vitest";
import { type NewOrder, type Order } from "./orders";
import {
  extractOrderFromMessage,
  fetchTelegramBotInfo,
  isValidTelegramTokenFormat,
  processIncomingMessage,
  TelegramApiError,
  WELCOME_PREFIX,
} from "./telegram";
import {
  connectTelegramWithToken,
  disconnectTelegram,
  getTelegramPollingStatus,
  stopTelegramPolling,
} from "./telegram-poll";

const validToken = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fakeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    customer_name: "Aye",
    customer_telegram_id: 777,
    items: "order rice",
    total_amount: 0,
    status: "Pending",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

afterEach(() => {
  disconnectTelegram();
  vi.unstubAllGlobals();
});

describe("token validation", () => {
  it("accepts BotFather-style tokens and rejects garbage", () => {
    expect(isValidTelegramTokenFormat(validToken)).toBe(true);
    expect(isValidTelegramTokenFormat(`  ${validToken}  `)).toBe(true);
    expect(isValidTelegramTokenFormat("not-a-token")).toBe(false);
    expect(isValidTelegramTokenFormat("")).toBe(false);
  });
});

describe("extractOrderFromMessage", () => {
  it("extracts customer name, numeric telegram id, and text", () => {
    expect(
      extractOrderFromMessage({
        chat: { id: 12345 },
        from: { id: 999, first_name: "May", username: "maythu" },
        text: "Cica Toner × 2",
      }),
    ).toEqual({ customerName: "May", telegramId: 999, chatId: 12345, text: "Cica Toner × 2" });
  });

  it("falls back to username / generic name and null id", () => {
    expect(extractOrderFromMessage({ chat: { id: 1 }, from: { username: "ghost" } })).toMatchObject({
      customerName: "ghost",
      telegramId: null,
      text: "",
    });
    expect(extractOrderFromMessage({ chat: { id: 1 } })).toMatchObject({
      customerName: "Telegram customer",
      telegramId: null,
    });
  });

  it("returns null when there is no usable message", () => {
    expect(extractOrderFromMessage(undefined)).toBeNull();
    expect(extractOrderFromMessage(null)).toBeNull();
    expect(extractOrderFromMessage({ from: { id: 1 } })).toBeNull();
  });
});

describe("processIncomingMessage", () => {
  it("inserts a Pending order and replies with the welcome prefix", async () => {
    const inserted: NewOrder[] = [];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true, result: {} }));

    const result = await processIncomingMessage(
      validToken,
      { chat: { id: 12345 }, from: { id: 999, first_name: "May" }, text: "hello" },
      {
        insertOrderFn: async input => {
          inserted.push(input);
          return fakeOrder();
        },
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );

    expect(result.handled).toBe(true);
    expect(inserted).toEqual([
      {
        customer_name: "May",
        customer_telegram_id: 999,
        items: "hello",
        total_amount: 0,
        status: "Pending",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${validToken}/sendMessage`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ chat_id: 12345, text: `${WELCOME_PREFIX}hello` }),
      }),
    );
  });

  it("never throws: insert and reply failures are swallowed after logging", async () => {
    const result = await processIncomingMessage(
      validToken,
      { chat: { id: 1 }, from: { id: 2 }, text: "hi" },
      {
        insertOrderFn: async () => {
          throw new Error("db down");
        },
        fetchImpl: (async () => {
          throw new Error("network down");
        }) as unknown as typeof fetch,
      },
    );
    expect(result).toEqual({ handled: true, order: null, replyText: `${WELCOME_PREFIX}hi` });
  });
});

describe("fetchTelegramBotInfo", () => {
  it("returns bot info for a valid token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, result: { id: 1, username: "shop_bot", first_name: "Shop" } }));
    const bot = await fetchTelegramBotInfo(validToken, fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${validToken}/getMe`,
      expect.objectContaining({ method: "GET" }),
    );
    expect(bot).toEqual({ id: 1, username: "shop_bot", first_name: "Shop" });
  });

  it("throws TelegramApiError with Telegram's description on 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: false, description: "Unauthorized" }, 401));
    const error = await fetchTelegramBotInfo(validToken, fetchMock as unknown as typeof fetch).catch(e => e);
    expect(error).toBeInstanceOf(TelegramApiError);
    expect(error.status).toBe(401);
    expect(error.description).toBe("Unauthorized");
  });
});

describe("connectTelegramWithToken", () => {
  it("validates with getMe, drops webhooks, and starts polling", async () => {
    const calls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      calls.push(String(url));
      if (String(url).includes("/getMe")) {
        return Promise.resolve(jsonResponse({ ok: true, result: { id: 1, username: "shop_bot" } }));
      }
      return Promise.resolve(jsonResponse({ ok: true, result: [] }));
    });

    const result = await connectTelegramWithToken(validToken, {
      insertOrderFn: async () => fakeOrder(),
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result).toEqual({ ok: true, bot: { id: 1, username: "shop_bot", first_name: undefined } });
    expect(calls[0]).toBe(`https://api.telegram.org/bot${validToken}/getMe`);
    expect(calls[1]).toContain(`/bot${validToken}/deleteWebhook?drop_pending_updates=true`);

    const status = getTelegramPollingStatus();
    expect(status).toMatchObject({ connected: true, mode: "polling", tokenConfigured: true });
    expect(status.bot?.username).toBe("shop_bot");
    stopTelegramPolling();
  });

  it("rejects invalid formats without calling Telegram", async () => {
    const fetchMock = vi.fn();
    const result = await connectTelegramWithToken("bad", { fetchImpl: fetchMock as unknown as typeof fetch });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, status: 400, description: "Invalid Telegram bot token format." });
  });

  it("passes Telegram's 401 through without starting polling", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: false, description: "Unauthorized" }, 401));
    const result = await connectTelegramWithToken(validToken, {
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, status: 401, description: "Unauthorized" });
    expect(getTelegramPollingStatus().connected).toBe(false);
  });
});

describe("polling loop", () => {
  it("consumes getUpdates, saves orders, and advances the offset", async () => {
    const inserted: NewOrder[] = [];
    const updatesCalls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const href = String(url);
      if (href.includes("/getMe")) {
        return Promise.resolve(jsonResponse({ ok: true, result: { id: 1, username: "shop_bot" } }));
      }
      if (href.includes("/getUpdates")) {
        updatesCalls.push(href);
        // First poll delivers a message; later polls are empty.
        if (updatesCalls.length === 1) {
          return Promise.resolve(
            jsonResponse({
              ok: true,
              result: [
                {
                  update_id: 42,
                  message: { chat: { id: 777 }, from: { id: 777, first_name: "Aye" }, text: "order rice" },
                },
              ],
            }),
          );
        }
        return Promise.resolve(jsonResponse({ ok: true, result: [] }));
      }
      return Promise.resolve(jsonResponse({ ok: true, result: true }));
    });

    const result = await connectTelegramWithToken(validToken, {
      insertOrderFn: async input => {
        inserted.push(input);
        return fakeOrder();
      },
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result.ok).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));
    stopTelegramPolling();

    expect(inserted).toEqual([
      {
        customer_name: "Aye",
        customer_telegram_id: 777,
        items: "order rice",
        total_amount: 0,
        status: "Pending",
      },
    ]);
    const sendCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("/sendMessage"));
    expect(sendCalls.length).toBeGreaterThan(0);
    expect(sendCalls[0][1]).toMatchObject({ method: "POST" });

    const lastUpdates = updatesCalls[updatesCalls.length - 1];
    expect(lastUpdates).toContain("offset=43");
  });

  it("stops polling when Telegram reports 401 mid-loop", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const href = String(url);
      if (href.includes("/getMe")) {
        return Promise.resolve(jsonResponse({ ok: true, result: { id: 1, username: "shop_bot" } }));
      }
      if (href.includes("/getUpdates")) {
        return Promise.resolve(jsonResponse({ ok: false, description: "Unauthorized" }, 401));
      }
      return Promise.resolve(jsonResponse({ ok: true, result: true }));
    });

    await connectTelegramWithToken(validToken, {
      insertOrderFn: async () => fakeOrder(),
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    await new Promise(resolve => setTimeout(resolve, 100));

    const status = getTelegramPollingStatus();
    expect(status.connected).toBe(false);
    expect(status.lastError).toContain("401");
  });
});
