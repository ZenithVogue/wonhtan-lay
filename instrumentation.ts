/**
 * Runs once when the Next.js server boots. Starts Telegram polling
 * automatically when TELEGRAM_BOT_TOKEN is configured.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { maybeAutoStartPolling } = await import("./lib/telegram-poll");
    maybeAutoStartPolling();
  }
}
