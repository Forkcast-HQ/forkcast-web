# Fitbit / Google Health setup

Forkcast can push logged meals into a user's Fitbit nutrition log and pull
steps / active-calories-burned back into the dashboard, via the **Google
Health API** — Google's cloud successor to the old Fitbit Web API (which
Google is retiring in **September 2026**). This is a cloud REST API, so the
integration lives entirely in the Next.js backend (`app/api/health/**`) —
no mobile app is required for it to work.

This doc is the founder-side setup checklist. The code is already written;
these are the steps only you can do (creating a Google Cloud project and
pasting real secrets isn't something Claude/any AI assistant should do on
your behalf).

## 1. Create the Google Cloud project + OAuth client

1. Go to **[Set up Google Cloud and OAuth](https://developers.google.com/health/setup)**
   and click "Enable the API and get an OAuth 2.0 Client ID."
2. Create a new project (or reuse one), select **Web Server** when asked
   "Where are you calling from?"
3. For **Authorized redirect URIs**, add both:
   - `http://localhost:3000/api/health/callback` (local dev)
   - `https://forkcastmenu.vercel.app/api/health/callback` (production)
4. Copy the **Client ID** and **Client Secret**.

## 2. Add yourself as a test user

New OAuth clients start in "Testing" mode (capped at 100 users, which is
plenty for now — going to "Production" requires a third-party security
review since health scopes are sensitive).

1. Open the **[Audience page](https://console.developers.google.com/auth/audience)**
   for your project.
2. Under "Test users," click **+ Add users** and add your own Google
   account email (the one linked to your Fitbit / Google Health app).
3. Save.

## 3. Add the scopes

1. Open the **[Data Access page](https://console.developers.google.com/auth/scopes)**.
2. Click **Add or remove scopes**, search "Google Health API," and select:
   - `.nutrition.readonly` / `.nutrition.writeonly`
   - `.activity_and_fitness.readonly`
   - `.health_metrics_and_measurements.readonly` / `.writeonly`
3. Update, then Save.

## 4. Get your Supabase service-role key

The OAuth callback route needs to store a refresh token for a user who
doesn't have a live browser session at that moment (Google's redirect lands
on our server directly) — this requires the Supabase **service role** key,
which bypasses row-level security. This is different from every other key
in this app (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is safe to ship to the
browser) — the service role key must **never** be exposed client-side.

1. Supabase dashboard → your project → **Settings → API**.
2. Copy the **service_role** secret (not the anon key — that one you already have).

## 5. Set the env vars

**Locally** — edit `.env.local` (already has empty placeholders added):
```
SUPABASE_SERVICE_ROLE_KEY=<paste the service_role secret>
GOOGLE_HEALTH_CLIENT_ID=<paste the OAuth client ID>
GOOGLE_HEALTH_CLIENT_SECRET=<paste the OAuth client secret>
GOOGLE_HEALTH_REDIRECT_URI=http://localhost:3000/api/health/callback
```

**In Vercel** (Project → Settings → Environment Variables), add the same
four, but set `GOOGLE_HEALTH_REDIRECT_URI` to:
```
https://forkcastmenu.vercel.app/api/health/callback
```

## 6. Run the database migration

In the Supabase SQL Editor, run `supabase/migrations/0004_device_connections.sql`
(same process as the earlier migrations — paste, run). This creates
`device_connections` and `oauth_states`, both locked down so only the
service-role key can read or write them.

## 7. Test it

1. Restart `npm run dev` (env vars only load on process start).
2. Go to `/profile`, find the new **Connected apps** card, click **Connect
   Fitbit**.
3. Sign in with the Google account you added as a test user, approve the
   consent screen.
4. You should land back on `/profile` with "Fitbit / Google Health
   connected." Log a meal (photo, manual, or via an order) — it should
   appear in your Fitbit app's food log within a minute or two (Fitbit
   syncs to Google roughly every 15 minutes when the Fitbit app is open, so
   the number might not be instant even though our push succeeds
   immediately).

## A known open item: nutrition payload field names

Google's public docs (as of mid-2026) don't yet publish a field-level
schema for the `nutritionLog` data type the way they do for `steps` or
`active-energy-burned`. `lib/googleHealth.ts` ships a best-informed first
attempt (`pushNutritionLog`), built by analogy to the confirmed `bodyFat`
sample shape and Google Fit's older nutrient-enum conventions.

**If the first real meal sync fails**, check your server logs — every
failure in that function logs Google's raw error response, and Google's
REST APIs are good about naming the actual expected field in a 400
response (e.g. "Unknown field 'nutrients'" or similar). Send me that error
text and I'll patch the payload shape in `lib/googleHealth.ts` — it's
isolated to one function, so it's a small fix once we see a real response.

The read side (steps, active calories burned) does **not** have this
uncertainty — those schemas are fully confirmed in Google's docs and were
tested against the documented REST examples directly.
