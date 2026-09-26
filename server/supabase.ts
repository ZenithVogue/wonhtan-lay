type SupabaseRow = Record<string, unknown>;

type SupabaseConfig = {
  restUrl: string;
  anonKey: string;
};

function getSupabaseConfig(): SupabaseConfig | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !anonKey) return null;

  const restUrl = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "") + "/rest/v1";
  return { restUrl, anonKey };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  if (!config) return { configured: false, response: null, data: null as T | null };

  const response = await fetch(`${config.restUrl}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }
  return { configured: true, response, data };
}

export async function ensureTelegramShop(token: string) {
  const result = await supabaseRequest<string>("rpc/register_telegram_shop", {
    method: "POST",
    body: JSON.stringify({ p_name: "Telegram Shop", p_token: token }),
  });

  if (!result.configured) return { configured: false, shop: null };
  if (!result.response?.ok) {
    throw new Error(`Supabase shop registration failed (${result.response?.status}): ${JSON.stringify(result.data)}`);
  }
  return { configured: true, shop: result.data ? { id: result.data } : null };
}

export async function createTelegramOrder(order: {
  telegramToken: string;
  customerName: string;
  customerTelegramId: string;
  items: unknown;
  totalAmount?: number;
}) {
  const result = await supabaseRequest<string>("rpc/create_telegram_order", {
    method: "POST",
    body: JSON.stringify({
      p_token: order.telegramToken,
      p_customer_name: order.customerName || null,
      p_customer_telegram_id: order.customerTelegramId,
      p_items: order.items,
      p_total_amount: order.totalAmount ?? 0,
    }),
  });

  if (!result.configured) return { configured: false, order: null };
  if (!result.response?.ok) {
    throw new Error(`Supabase order insert failed (${result.response?.status}): ${JSON.stringify(result.data)}`);
  }
  return { configured: true, order: result.data ? { id: result.data } : null };
}
