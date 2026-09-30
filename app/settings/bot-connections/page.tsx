import { redirect } from "next/navigation";

/** Alias: /settings/bot-connections → canonical /dashboard/bot-settings. */
export default function BotConnectionsAlias() {
  redirect("/dashboard/bot-settings");
}
