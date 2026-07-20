# WHOOP setup

Forkcast can pull recovery score, day strain, and sleep performance from a
user's WHOOP into the dashboard, via WHOOP's own OAuth 2.0 API
(`developer.whoop.com`). Unlike the Fitbit/Google Health integration, WHOOP
has no nutrition-log endpoint — this is read-only, so there's no meal
auto-sync path for WHOOP. This is a cloud REST API, so — same as the Fitbit
integration — it lives entirely in the Next.js backend (`app/api/health/whoop/**`);
no mobile app is required for it to work.

This doc is the founder-side setup checklist. The code is already written;
these are the steps only you can do (creating a WHOOP developer app and
pasting real secrets isn't something Claude/any AI assistant should do on
your behalf).

## 1. Create a WHOOP Developer team + app

1. Go to the **[WHOOP Developer Dashboard](https://developer-dashboard.whoop.com)**
   and sign in with your WHOOP account credentials.
2. If prompted, create a **Team** first (any name).
3. Click **[Create App](https://developer-dashboard.whoop.com/apps/create)**.
4. Under **Scopes**, select:
   - `read:recovery`
   - `read:cycles`
   - `read:sleep`
   - `read:profile`
   - `offline` (required — without it WHOOP won't issue a refresh token, and
     the connection would silently stop working once the short-lived access
     token expires)
5. Under **Redirect URIs**, add:
   - `https://forkcastmenu.vercel.app/api/health/whoop/callback` (production)
   - `http://localhost:3000/api/health/whoop/callback` (local dev, if WHOOP's
     dashboard accepts a plain `http://localhost` redirect — some OAuth
     providers require `https`; if it's rejected, test against the deployed
     production URL instead)
6. Click **Create**, then copy the **Client ID** and **Client Secret** shown.

## 2. Set the env vars

**Locally** — edit `.env.local` (already has empty placeholders added):
```
WHOOP_CLIENT_ID=<paste the Client ID>
WHOOP_CLIENT_SECRET=<paste the Client Secret>
WHOOP_REDIRECT_URI=http://localhost:3000/api/health/whoop/callback
```

**In Vercel** (Project → Settings → Environment Variables), add the same
three, but set `WHOOP_REDIRECT_URI` to:
```
https://forkcastmenu.vercel.app/api/health/whoop/callback
```

No new database migration is required beyond `0005_multi_provider_connections.sql`
(already added this session) — it widens `device_connections` so a user can
hold a WHOOP row alongside a Fitbit/Google Health row instead of just one or
the other.

## 3. Run the migration (if you haven't already)

In the Supabase SQL Editor, run `supabase/migrations/0005_multi_provider_connections.sql`.
If your Postgres project doesn't already have the `pgcrypto` extension
enabled (needed for `gen_random_uuid()`), enable it first: `create extension
if not exists pgcrypto;`.

## 4. Test it

1. Restart `npm run dev` / redeploy (env vars only load on process start).
2. Go to `/profile` → **Connected apps**. Since Fitbit is likely already
   connected, the device picker will default to **WHOOP** — click **Connect**.
3. Sign in with your WHOOP account credentials, approve the consent screen.
4. You should land back on `/profile` with "WHOOP connected." Your
   dashboard should then show **WHOOP recovery**, **WHOOP day strain**, and
   **WHOOP sleep performance** tiles (each only appears once WHOOP has
   actually scored that day's cycle/recovery/sleep — a brand-new WHOOP
   account or one that hasn't synced recently may show fewer tiles at
   first).

## Notes

- **App approval:** new WHOOP apps can be used immediately by your own
  WHOOP account (the one that created the Team) for testing. Approving
  the app for *other* WHOOP users to connect requires WHOOP's
  [App Approval](https://developer.whoop.com/docs/developing/app-approval)
  process — fine to defer until closer to launch.
- **No nutrition sync:** WHOOP doesn't have a food-logging feature or API,
  so `auto_sync_meals` and the "Log this meal?" → Fitbit push stay
  Google-Health-only. If WHOOP ever ships a nutrition endpoint, `lib/whoop.ts`
  is the file to extend.
- **If a pull fails**, check your server logs — every failure in
  `lib/whoop.ts`/`app/api/health/whoop/daily` logs WHOOP's raw error
  response, same debugging convention as the Google Health integration.
