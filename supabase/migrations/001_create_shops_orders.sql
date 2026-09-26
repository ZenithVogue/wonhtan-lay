-- WonHtan Lay Telegram ordering schema
-- Run this migration in the Supabase SQL Editor or with a service-role migration runner.

create extension if not exists pgcrypto;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  telegram_bot_token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_name text,
  customer_telegram_id text not null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'delivered')),
  payment_slip_url text,
  created_at timestamptz not null default now()
);

create index if not exists orders_shop_id_idx on public.orders(shop_id);
create index if not exists orders_customer_telegram_id_idx on public.orders(customer_telegram_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.shops enable row level security;
alter table public.orders enable row level security;

-- Keep the tables protected by RLS. The webhook uses these narrowly scoped
-- SECURITY DEFINER functions through Supabase RPC, so the anon key never gets
-- direct table read/write policies.

create or replace function public.register_telegram_shop(p_name text, p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
begin
  insert into public.shops (name, telegram_bot_token)
  values (coalesce(nullif(trim(p_name), ''), 'Telegram Shop'), p_token)
  on conflict (telegram_bot_token)
  do update set name = excluded.name
  returning id into v_shop_id;
  return v_shop_id;
end;
$$;

create or replace function public.create_telegram_order(
  p_token text,
  p_customer_name text,
  p_customer_telegram_id text,
  p_items jsonb,
  p_total_amount numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_order_id uuid;
begin
  select id into v_shop_id
  from public.shops
  where telegram_bot_token = p_token
  limit 1;

  if v_shop_id is null then
    raise exception 'No shop found for Telegram bot token';
  end if;

  insert into public.orders (
    shop_id, customer_name, customer_telegram_id, items, total_amount, status
  ) values (
    v_shop_id,
    nullif(trim(p_customer_name), ''),
    p_customer_telegram_id,
    coalesce(p_items, '[]'::jsonb),
    coalesce(p_total_amount, 0),
    'pending'
  ) returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.register_telegram_shop(text, text) from public;
revoke all on function public.create_telegram_order(text, text, text, jsonb, numeric) from public;
grant execute on function public.register_telegram_shop(text, text) to anon, authenticated;
grant execute on function public.create_telegram_order(text, text, text, jsonb, numeric) to anon, authenticated;
