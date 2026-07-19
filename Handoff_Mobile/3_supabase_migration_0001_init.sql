-- Forkcast backend v1 — Supabase (Postgres + RLS)
-- Apply in the Supabase dashboard: SQL Editor → paste → Run.
--
-- Design notes
-- - One row per auth user in `profiles`; health profile kept as jsonb so the
--   client types (lib/types.ts HealthProfile) remain the single source of truth.
-- - meal_logs / orders keep typed core columns (queryable from mobile,
--   dashboards, SQL) plus a lossless `data` jsonb of the full client object.
-- - Every table is protected by row-level security: a user can only touch
--   rows where user_id = auth.uid(). The anon key is safe to ship in clients
--   BECAUSE of these policies — do not disable them.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  role       text not null default 'customer' check (role in ('customer','restaurant')),
  profile    jsonb,                          -- HealthProfile | null
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile select" on public.profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id);
create policy "own profile delete" on public.profiles for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------- meal_logs
create table if not exists public.meal_logs (
  id         text primary key,               -- client-generated uid (lib/format.ts)
  user_id    uuid not null references auth.users(id) on delete cascade,
  logged_at  timestamptz not null,
  name       text not null,
  source     text not null check (source in ('planned','photo','manual','order')),
  calories   numeric not null,
  protein    numeric not null,
  carbs      numeric not null,
  fat        numeric not null,
  fiber      numeric not null,
  sodium     numeric not null,
  sugar      numeric not null,
  data       jsonb not null,                 -- full LoggedMeal (photo data URLs stripped)
  created_at timestamptz not null default now()
);

create index if not exists meal_logs_user_time on public.meal_logs (user_id, logged_at desc);
alter table public.meal_logs enable row level security;

create policy "own meals select" on public.meal_logs for select using (auth.uid() = user_id);
create policy "own meals insert" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "own meals update" on public.meal_logs for update using (auth.uid() = user_id);
create policy "own meals delete" on public.meal_logs for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------ weight_entries
create table if not exists public.weight_entries (
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,                  -- one entry per day (todayKey)
  weight_kg  numeric not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.weight_entries enable row level security;

create policy "own weights select" on public.weight_entries for select using (auth.uid() = user_id);
create policy "own weights insert" on public.weight_entries for insert with check (auth.uid() = user_id);
create policy "own weights update" on public.weight_entries for update using (auth.uid() = user_id);
create policy "own weights delete" on public.weight_entries for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------- orders
create table if not exists public.orders (
  id              text primary key,          -- client-generated uid
  user_id         uuid not null references auth.users(id) on delete cascade,
  ref             text not null,             -- e.g. "F-1042"
  slug            text not null,             -- restaurant slug
  restaurant_name text not null,
  fulfill         text not null check (fulfill in ('pickup','delivery','partner')),
  placed_at       timestamptz not null,
  subtotal        numeric not null,
  total           numeric not null,
  logged          boolean not null default false,
  dismissed_log   boolean not null default false,
  data            jsonb not null,            -- full Order (items, tax, fees, integration flag)
  created_at      timestamptz not null default now()
);

create index if not exists orders_user_time on public.orders (user_id, placed_at desc);
alter table public.orders enable row level security;

create policy "own orders select" on public.orders for select using (auth.uid() = user_id);
create policy "own orders insert" on public.orders for insert with check (auth.uid() = user_id);
create policy "own orders update" on public.orders for update using (auth.uid() = user_id);
create policy "own orders delete" on public.orders for delete using (auth.uid() = user_id);
