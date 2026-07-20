-- Forkcast backend v1.3 — third-party health/wearable connections
-- Apply after 0003: SQL Editor → paste → Run.
--
-- Powers "Connect Fitbit / Google Health" on the Profile page: Forkcast can
-- push logged meals into a user's Fitbit nutrition log (via the Google
-- Health API, the cloud successor to the Fitbit Web API) and pull steps /
-- active-calories-burned back into the dashboard.
--
-- Security model — different from every other table in this app:
-- `device_connections` holds an OAuth refresh token, which must never be
-- readable (or forgeable) from the browser, even though the rest of Forkcast
-- runs entirely on the anon key + RLS. So RLS is enabled here with NO
-- policies granted to anon/authenticated at all — every read/write goes
-- through server API routes (app/api/health/**) using the service-role key
-- (see lib/supabase-admin.ts). This is the same "server-only" posture as the
-- entitlement-protection trigger in 0002, just enforced by omission of
-- policies rather than a trigger.

create table if not exists public.device_connections (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  provider          text not null default 'google_health' check (provider in ('google_health')),
  access_token      text,
  refresh_token     text not null,
  token_expires_at  timestamptz,
  scope             text,
  health_user_id    text,        -- Google Health API user id (getIdentity())
  legacy_user_id    text,        -- Fitbit legacy user id (getIdentity())
  auto_sync_meals   boolean not null default true,
  connected_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.device_connections enable row level security;
-- Intentionally no policies — server (service role) access only.

-- Short-lived, single-use OAuth `state` → user mapping. The Google OAuth
-- redirect lands on our callback route with no Authorization header (it's a
-- plain browser navigation from Google, not an authenticated fetch from our
-- own client code), so this table is how the callback recovers "which
-- Forkcast user was connecting." Rows are deleted immediately after use.
create table if not exists public.oauth_states (
  id          text primary key,   -- random opaque state string
  user_id     uuid not null references auth.users(id) on delete cascade,
  provider    text not null default 'google_health',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

alter table public.oauth_states enable row level security;
-- Also server-only; expires in ~10 minutes, consumed once by the callback.

-- Optional housekeeping (run occasionally, or on a cron): clear stale states.
--   delete from public.oauth_states where expires_at < now();
