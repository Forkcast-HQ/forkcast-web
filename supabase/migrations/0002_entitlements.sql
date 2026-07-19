-- Forkcast backend v1.1 — Premium entitlements (server-side, spoof-proof)
-- Apply after 0001_init.sql: SQL Editor → paste → Run.
--
-- Plans:
--   'free'        default
--   'premium'     paying subscriber (written later by RevenueCat/Stripe webhooks)
--   'pilot_comp'  pilot tester comped by the founders
-- premium_until: NULL = no expiry (pilot comps), else entitlement end date.
--
-- SECURITY: users can update their own profiles row (RLS from 0001), so a
-- trigger pins plan/premium_until on any end-user request — only the
-- dashboard/service role (auth.uid() IS NULL) can change entitlements.

alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'premium', 'pilot_comp')),
  add column if not exists premium_until timestamptz;

create or replace function public.protect_entitlement()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.plan := 'free';
      new.premium_until := null;
    else
      new.plan := old.plan;
      new.premium_until := old.premium_until;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_entitlement on public.profiles;
create trigger protect_entitlement
  before insert or update on public.profiles
  for each row execute function public.protect_entitlement();

-- To comp a pilot tester (dashboard → SQL Editor):
--   update public.profiles set plan = 'pilot_comp'
--   where user_id = (select id from auth.users where email = 'tester@email.com');
