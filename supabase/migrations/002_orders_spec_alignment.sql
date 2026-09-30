-- WonHtan Lay orders table, aligned to the app spec:
--   orders(id uuid, customer_name text, customer_telegram_id int8,
--          items text, total_amount numeric, status text, created_at timestamp)
--
-- Run this in the Supabase SQL Editor (idempotent — safe to run twice).
--
-- NOTE: if migration 001 was applied earlier, the legacy columns
-- (shop_id, items jsonb, status check pending/paid/delivered) are left
-- untouched below except for the additive changes. Migrate legacy rows to the
-- new shape manually before dropping old columns:
--   alter table public.orders alter column customer_telegram_id type bigint
--     using customer_telegram_id::bigint;
--   alter table public.orders alter column items type text
--     using items::text;

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_telegram_id bigint,
  items text,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- Additive alignment for tables created before this migration.
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_telegram_id bigint;
alter table public.orders add column if not exists items text;
alter table public.orders add column if not exists total_amount numeric(12, 2) not null default 0;
alter table public.orders add column if not exists status text not null default 'Pending';
alter table public.orders add column if not exists created_at timestamptz not null default now();

create index if not exists orders_customer_telegram_id_idx on public.orders(customer_telegram_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.orders enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies for the anon key.
--
-- The webhook/test-order routes and the dashboard realtime subscription all
-- use the anon (public) key, so the table needs anon policies. These are
-- intentionally open for a single-shop demo; for production, restrict writes
-- to a service-role backend and scope reads per authenticated shop instead.
-- ---------------------------------------------------------------------------
drop policy if exists "anon read orders" on public.orders;
create policy "anon read orders"
  on public.orders for select
  to anon
  using (true);

drop policy if exists "anon insert orders" on public.orders;
create policy "anon insert orders"
  on public.orders for insert
  to anon
  with check (true);

drop policy if exists "anon update order status" on public.orders;
create policy "anon update order status"
  on public.orders for update
  to anon
  using (true)
  with check (true);

-- Realtime: the dashboard subscribes to postgres_changes on this table.
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;
