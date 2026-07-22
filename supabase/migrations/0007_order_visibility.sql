-- Forkcast backend — restaurant order visibility + live status
-- Apply in the Supabase dashboard: SQL Editor → paste → Run.
--
-- Lets a restaurant owner READ and UPDATE the status of orders placed to a
-- restaurant they own (matched by slug), so the partner terminal receives and
-- works real orders. Adds the status lifecycle + kitchen flags to the row and
-- enables realtime streaming. Consumer RLS from 0001 is unchanged (a diner
-- still only sees their own orders); these policies are additive.

alter table public.orders
  add column if not exists status        text not null default 'sent'
    check (status in ('sent','accepted','preparing','ready','completed')),
  add column if not exists prep_min      int,
  add column if not exists customer_name text,
  add column if not exists flags         jsonb not null default '[]'::jsonb,
  add column if not exists updated_at     timestamptz not null default now();

create index if not exists orders_slug_status on public.orders (slug, status, placed_at desc);

-- Restaurant owner may read + update orders for a restaurant they own.
create policy "restaurant reads own-slug orders" on public.orders for select
  using (exists (select 1 from public.restaurants r where r.slug = orders.slug and r.owner_id = auth.uid()));
create policy "restaurant updates own-slug orders" on public.orders for update
  using (exists (select 1 from public.restaurants r where r.slug = orders.slug and r.owner_id = auth.uid()));

-- Realtime for cross-device order delivery (guarded so re-runs don't error).
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when others then null;
end $$;
