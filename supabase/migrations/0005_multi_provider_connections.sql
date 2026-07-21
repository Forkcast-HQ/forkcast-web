-- Forkcast backend v1.4 — multiple simultaneous device connections
-- Apply after 0004: SQL Editor → paste → Run. Safe to run more than once
-- (every step checks whether it's already done before acting) — the first
-- version of this file wasn't, which is what threw the
-- "device_connections_user_provider_key already exists" error on a re-run.
--
-- 0004 gave device_connections a single-row-per-user primary key (user_id),
-- which meant a user could connect exactly one wearable at a time. The
-- Profile page now offers a device picker (Fitbit, WHOOP, and — once a
-- native mobile app exists — Apple Watch / Samsung Health), so a user needs
-- to be able to hold a Fitbit/Google Health connection AND a WHOOP
-- connection at once. This migration widens the key to (user_id, provider).

-- 1. Add a surrogate id column (if not already present).
alter table public.device_connections add column if not exists id uuid not null default gen_random_uuid();

-- 2. Drop the old single-column primary key (if it's still on user_id) and
-- put the primary key on `id` instead.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'device_connections_pkey'
      and conrelid = 'public.device_connections'::regclass
      and pg_get_constraintdef(oid) = 'PRIMARY KEY (user_id)'
  ) then
    alter table public.device_connections drop constraint device_connections_pkey;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'device_connections_pkey'
      and conrelid = 'public.device_connections'::regclass
  ) then
    alter table public.device_connections add constraint device_connections_pkey primary key (id);
  end if;
end $$;

-- 3. Composite uniqueness so (user_id, provider) can't duplicate, without
-- erroring if it's already there from a prior run.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'device_connections_user_provider_key'
      and conrelid = 'public.device_connections'::regclass
  ) then
    alter table public.device_connections add constraint device_connections_user_provider_key unique (user_id, provider);
  end if;
end $$;

-- 4. Widen the provider whitelist. WHOOP is live (read-only recovery/
-- strain/sleep — WHOOP has no nutrition-log endpoint, so meal auto-sync
-- stays Fitbit/Google-Health-only). apple_health / samsung_health are
-- listed for forward compatibility with the picker UI but aren't wired to
-- anything yet — both HealthKit and the Samsung Health SDK are on-device
-- only, so they'll need the not-yet-built native mobile app, not a cloud
-- OAuth flow like Fitbit/WHOOP.
alter table public.device_connections drop constraint if exists device_connections_provider_check;
alter table public.device_connections add constraint device_connections_provider_check
  check (provider in ('google_health', 'whoop', 'apple_health', 'samsung_health'));

-- oauth_states.provider was never constrained to a single value (see 0004),
-- so no change needed there — it already accepts 'whoop' as-is.
