-- Forkcast backend — restaurants & menus (restaurant self-serve)
-- Apply in the Supabase dashboard: SQL Editor → paste → Run.
--
-- Adds restaurant listings owned by a restaurant-role account plus their menu
-- items. RLS design:
--   - An owner has full control of their own rows (owner_id = auth.uid()).
--   - Anyone (anon or authenticated) may READ listings/menus that are
--     PUBLISHED, so the consumer discovery surface can query them directly.
--   - Draft rows remain private to the owner.
-- The anon key is safe to ship BECAUSE of these policies — do not disable them.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- restaurants
create table if not exists public.restaurants (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  slug          text not null unique,
  name          text not null,
  cuisine       text not null default '',
  neighborhood  text not null default '',
  address       text not null default '',
  lat           numeric,
  lng           numeric,
  price_level   int  not null default 2,
  blurb         text not null default '',
  status        text not null default 'draft' check (status in ('draft','published')),
  verified      boolean not null default false,
  claimed_slug  text,                          -- set when claiming an existing seed listing
  data          jsonb,                         -- lossless extra fields (mirrors lib/types Restaurant)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists restaurants_owner  on public.restaurants (owner_id);
create index if not exists restaurants_status on public.restaurants (status);

alter table public.restaurants enable row level security;

create policy "own restaurant select" on public.restaurants for select using (auth.uid() = owner_id);
create policy "own restaurant insert" on public.restaurants for insert with check (auth.uid() = owner_id);
create policy "own restaurant update" on public.restaurants for update using (auth.uid() = owner_id);
create policy "own restaurant delete" on public.restaurants for delete using (auth.uid() = owner_id);
create policy "public read published restaurants" on public.restaurants for select using (status = 'published');

-- ---------------------------------------------------------------- menu_items
create table if not exists public.menu_items (
  id               text primary key,             -- client-generated uid
  restaurant_id    uuid not null references public.restaurants(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  price            numeric not null default 0,
  calories         numeric not null default 0,
  protein          numeric not null default 0,
  carbs            numeric not null default 0,
  fat              numeric not null default 0,
  fiber            numeric not null default 0,
  sodium           numeric not null default 0,
  sugar            numeric not null default 0,
  category         text not null default '',
  tags             jsonb not null default '[]'::jsonb,
  nutrition_source text not null default 'estimated' check (nutrition_source in ('published','estimated','verified')),
  position         int  not null default 0,
  data             jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists menu_items_restaurant on public.menu_items (restaurant_id, position);

alter table public.menu_items enable row level security;

create policy "own menu select" on public.menu_items for select
  using (exists (select 1 from public.restaurants r where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()));
create policy "own menu insert" on public.menu_items for insert
  with check (exists (select 1 from public.restaurants r where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()));
create policy "own menu update" on public.menu_items for update
  using (exists (select 1 from public.restaurants r where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()));
create policy "own menu delete" on public.menu_items for delete
  using (exists (select 1 from public.restaurants r where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()));
create policy "public read published menu" on public.menu_items for select
  using (exists (select 1 from public.restaurants r where r.id = menu_items.restaurant_id and r.status = 'published'));
