-- Forkcast backend v1.2 — in-app Premium access requests (pilot phase)
-- Apply after 0002: SQL Editor → paste → Run.
--
-- Flow: user taps "Request Premium access" → a row lands here → the app shows
-- "Request sent" → founders grant from the dashboard. Users can create and
-- see their own requests, never modify them.

create table if not exists public.premium_requests (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  email      text not null default '',
  status     text not null default 'pending' check (status in ('pending', 'granted', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists premium_requests_user on public.premium_requests (user_id, created_at desc);
alter table public.premium_requests enable row level security;

create policy "own requests insert" on public.premium_requests
  for insert with check (auth.uid() = user_id);
create policy "own requests select" on public.premium_requests
  for select using (auth.uid() = user_id);
-- No user update/delete: status changes are founders-only (dashboard).

-- Founders: review pending requests
--   select r.id, r.email, r.created_at from public.premium_requests r where r.status = 'pending';
-- Grant one (replace <id> and email):
--   update public.profiles set plan = 'pilot_comp'
--     where user_id = (select user_id from public.premium_requests where id = <id>);
--   update public.premium_requests set status = 'granted' where id = <id>;
