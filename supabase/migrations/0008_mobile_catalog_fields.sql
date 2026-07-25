-- Forkcast mobile catalog fields
-- Apply in the Supabase dashboard: SQL Editor → paste → Run.
--
-- Extends the restaurant/menu schema (0006_restaurants.sql) so mobile (and
-- web, eventually) can read the full catalog from Supabase instead of the
-- static data/restaurants.ts seed file. See BACKEND_MOBILE_CATALOG_HANDOFF.md
-- (forkcast-mobile repo) for the full rationale and the Android data contract.

-- Platform-seeded rows may not belong to a restaurant account.
alter table public.restaurants
  alter column owner_id drop not null;

-- Restaurant listing fields currently present in data/restaurants.ts.
alter table public.restaurants
  add column if not exists rating numeric not null default 0,
  add column if not exists reviews int not null default 0,
  add column if not exists delivery_min int not null default 0,
  add column if not exists delivery_max int not null default 0,
  add column if not exists distance_mi numeric,
  add column if not exists partner boolean not null default false,
  add column if not exists data_source text check (data_source in ('published', 'estimated', 'verified')),
  add column if not exists source_note text,
  add column if not exists photo_url text,
  add column if not exists category text not null default '',
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists catalog_origin text not null default 'restaurant_self_serve'
    check (catalog_origin in ('seed', 'restaurant_self_serve', 'admin')),
  add column if not exists available boolean not null default true;

-- Menu fields needed by mobile.
alter table public.menu_items
  add column if not exists photo_url text,
  add column if not exists available boolean not null default true;

-- Useful indexes for mobile queries.
create index if not exists restaurants_published_available
  on public.restaurants (status, available, updated_at desc);

create index if not exists restaurants_slug_idx
  on public.restaurants (slug);

create index if not exists restaurants_geo_idx
  on public.restaurants (lat, lng);

create index if not exists menu_items_restaurant_available
  on public.menu_items (restaurant_id, available, position);
