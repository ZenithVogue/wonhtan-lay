import express from "express";
import { describe, expect, it, vi } from "vitest";
import { registerTelegramRoutes } from "./telegramRoutes";

type RouteHandler = (req: express.Request, res: express.Response) => unknown;

function createRouteHarness() {
  const handlers = new Map<string, RouteHandler>();
  const app = {
    post(path: string, handler: RouteHandler) {
      handlers.set(path, handler);
      return this;
    },
  } as unknown as express.Express;

  registerTelegramRoutes(app);
  return handlers;
}

function createResponse() {
  const response = {
    statusCode: 200,
    headers: new Map<string, string>(),
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    setHeader(name: string, value: string) {
      response.headers.set(name, value);
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
    send(body: unknown) {
      response.body = body;
      return response;
    },
  };
  return response;
}

const validToken = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ";

describe("Telegram webhook routes", () => {
  it("calls Telegram setWebhook with the detected public host and returns Telegram's response", async () => {
    const telegramResponse = { ok: true, result: true, description: "Webhook was set" };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(telegramResponse), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const handlers = createRouteHarness();
    const response = createResponse();
    await handlers.get("/api/telegram/set-webhook")?.({
      body: { token: validToken },
      headers: { host: "shop.example.com" },
      get: (name: string) => (name.toLowerCase() === "host" ? "shop.example.com" : undefined),
    } as unknown as express.Request, response as unknown as express.Response);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`https://api.telegram.org/bot${validToken}/setWebhook?url=https%3A%2F%2Fshop.example.com%2Fapi%2Ftelegram%2Fwebhook`),
      expect.objectContaining({ method: "GET" }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify(telegramResponse));
  });

  it("passes Telegram's exact error description back to the caller", async () => {
    const telegramResponse = { ok: false, error_code: 401, description: "Unauthorized" };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(telegramResponse), {
      status: 401,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const handlers = createRouteHarness();
    const response = createResponse();
    await handlers.get("/api/telegram/set-webhook")?.({
      body: { token: validToken },
      headers: { host: "shop.example.com" },
      get: () => "shop.example.com",
    } as unknown as express.Request, response as unknown as express.Response);

    expect(response.statusCode).toBe(401);
    expect(response.body).toBe(JSON.stringify(telegramResponse));
  });

  it("replies with the incoming message and always acknowledges Telegram with HTTP 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: {} }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const handlers = createRouteHarness();
    // Configure the in-memory token used by the webhook handler for this test.
    const setResponse = createResponse();
    await handlers.get("/api/telegram/set-webhook")?.({
      body: { token: validToken },
      headers: { host: "shop.example.com" },
      get: () => "shop.example.com",
    } as unknown as express.Request, setResponse as unknown as express.Response);

    const response = createResponse();
    await handlers.get("/api/telegram/webhook")?.({
      body: { message: { chat: { id: 12345 }, text: "hello" } },
    } as unknown as express.Request, response as unknown as express.Response);

    expect(fetchMock).toHaveBeenLastCalledWith(
      `https://api.telegram.org/bot${validToken}/sendMessage`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          chat_id: 12345,
          text: "မင်္ဂလာပါရှင်၊ ဝန်ထမ်းလေးမှ ကြိုဆိုပါတယ်။ သင်၏ စာကို လက်ခံရရှိပါသည်: hello",
        }),
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
