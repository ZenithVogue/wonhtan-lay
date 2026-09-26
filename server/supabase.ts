import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseRpcClient = SupabaseClient;

function getProjectUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!rawUrl) return "";
  return rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function getSupabaseClient(): SupabaseRpcClient | null {
  const projectUrl = getProjectUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!projectUrl || !anonKey) return null;

  return createClient(projectUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function ensureTelegramShop(token: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { configured: false, shop: null };

  const { data, error } = await supabase.rpc("register_telegram_shop", {
    p_name: "Telegram Shop",
    p_token: token,
  });
  if (error) {
    throw new Error(`Supabase shop registration failed: ${error.message}`);
  }

  return { configured: true, shop: data ? { id: String(data) } : null };
}

export async function createTelegramOrder(order: {
  telegramToken: string;
  customerName: string;
  customerTelegramId: string;
  items: unknown;
  totalAmount?: number;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return { configured: false, order: null };

  const { data, error } = await supabase.rpc("create_telegram_order", {
    p_token: order.telegramToken,
    p_customer_name: order.customerName || null,
    p_customer_telegram_id: order.customerTelegramId,
    p_items: order.items,
    p_total_amount: order.totalAmount ?? 0,
  });
  if (error) {
    throw new Error(`Supabase order insert failed: ${error.message}`);
  }

  return { configured: true, order: data ? { id: String(data) } : null };
}
