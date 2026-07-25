# Forkcast — Engineering Status

*Last updated: 2026-07-25. Read this first when picking the project back up —
whichever model/session is doing the picking up.*

## TL;DR

The GitHub org restructuring and the web→Supabase catalog migration are both
done, verified, and **live in production** at https://forkcastmenu.vercel.app.
A restaurant can self-serve sign up, build a menu, publish, and immediately be
discoverable and orderable by diners — the whole loop was tested end-to-end
against the real deployment. Several real bugs surfaced and got fixed along
the way (list below). Nothing is currently broken; a couple of things are
cosmetic-only gaps, noted at the bottom.

## What changed (2026-07-24 → 2026-07-25)

### 1. GitHub reorganized under `Forkcast-HQ`
- Repo split into three: **`forkcast-web`** (this app), `forkcast-docs`
  (business/technical docs — currently emptied, real docs are local-only at
  `~/Desktop/DS:AI - Projects/Forkcast-Docs-Local/`, not pushed anywhere by
  choice), `forkcast-mobile` (handoff spec only, no app code yet).
- `forkcast-web` was **transferred** from `Seymurhh/forkcast` (history
  preserved) and is now **public** (was private — see "Vercel" below for why).
- Commits: `0b2eab9`, `d1e7e93`.

### 2. Dynamic restaurant catalog — web now matches mobile
Previously `data/restaurants.ts` was a static, build-time seed array that only
the web app read. Now:
- `supabase/migrations/0008_mobile_catalog_fields.sql` extends the
  restaurant-self-serve schema (`0006`) so seeded rows (`owner_id = NULL`,
  `catalog_origin = 'seed'`) and self-serve rows (`owner_id = <auth uid>`,
  `catalog_origin = 'restaurant_self_serve'`) live in the same table, both
  publicly readable once `status = 'published'`.
- `scripts/seed-restaurants-supabase.ts` (run via `tsx`, needs
  `SUPABASE_SERVICE_ROLE_KEY`) one-off imported the static catalog into
  Supabase. Already run — 13 seed restaurants + 79 menu items are live.
- New `lib/catalog.ts` (server-safe fetch + row mapping) and
  `lib/catalogContext.tsx` (`CatalogProvider` / `useCatalog()` hook, wraps
  the app in `app/layout.tsx`) replace every one of the 19 old
  `data/restaurants.ts` import sites — 4 server components fetch directly,
  the rest use the hook.
- `data/restaurants.ts` itself is untouched — it's now only the seed source
  for the one-off script, no longer imported by the live app.
- This is what makes a restaurant's self-serve-published listing actually
  show up on `/discover` and `/restaurant/[slug]` for real diners, and what
  mobile will read from too (same tables, same RLS).
- Commits: `dd9120c`, `12e20a7`.

### 3. Bugs found and fixed along the way
All verified against the real Supabase project and/or the live Vercel
deployment (disposable test accounts, deleted after via the service-role key
— see "Testing pattern" below).

- **`/partner` hung on "Loading…" forever when signed out.** `mode` was
  computed as `"loading"` whenever `owner === undefined`, but the effect that
  ever resolves `owner` away from `undefined` only runs for a signed-in
  restaurant account — a signed-out visitor left it `undefined` permanently.
  Fixed in `app/partner/page.tsx`. Commit `af4309a`.
- **Login silently landed in the wrong account's role.** The "I'm a diner" /
  "I'm a restaurant" toggle on `/login` only changed page copy — it was never
  actually passed to the login call (role is fixed at signup, not chosen at
  login). Selecting the wrong one just silently redirected into whatever the
  account actually is, with zero explanation. Now shows an explicit "Wrong
  account type" screen on mismatch. `app/login/page.tsx`. Commit `027dcf3`.
- **Fresh restaurant signup landed on `/partner` instead of
  `/partner/onboarding`.** A redirect race between the signup page's
  "already logged in" effect and its own explicit post-signup navigation.
  `app/signup/page.tsx`. Commit `2ed3c5c`.
- **`public.premium_requests` table was missing** from the live Supabase
  project (migration `0003_premium_requests.sql` existed in the repo but was
  never applied) — caused a 404 on every page load via `lib/premium.tsx`.
  User applied the migration; verified clean afterward. No code change.
- **"Edit menu" dead-ended on the publish screen.** Once a restaurant is
  published, `app/partner/onboarding/page.tsx`'s `load()` always forced
  `step = 2` (the "you're live" confirmation) — there was no way back to the
  actual menu editor. Now always lands on the menu step (which already has
  its own paths to listing details / publish). Commit `332eb98`.
- **"View your public page" used a relative link**, so it opened on
  whatever host the owner happened to be browsing the terminal from —
  including a protected, non-public Vercel per-deployment preview URL
  (reported as a confusing "404", actually a Vercel SSO redirect). Now an
  explicit absolute URL (`NEXT_PUBLIC_SITE_URL` env var, falls back to
  `https://forkcastmenu.vercel.app`). Same commit, `332eb98`.

### 4. Vercel deployment was stuck for 3 days — now fixed
The GitHub repo transfer (`Seymurhh/forkcast` → `Forkcast-HQ/forkcast-web`)
silently broke Vercel's auto-deploy — nothing from this session reached
production until this was caught. Sequence, for reference if it ever
recurs after another repo move:
1. Vercel Hobby plan **refuses to connect a private repo owned by a GitHub
   org** ("Upgrade to Pro to continue"). Fixed by making `forkcast-web`
   **public** (deliberate choice among a few options — repo has no secrets
   in it or its history, confirmed via `git log --all -- .env*` and a grep
   sweep before flipping visibility).
2. Reconnecting the repo in Vercel does **not** itself trigger a build
   against the existing HEAD — it only reacts to new pushes. Had to push an
   empty commit (`296b5ea`) to fire a fresh webhook.
3. After that, auto-deploy on push works normally again (confirmed: `332eb98`
   went live within the polling window, no manual redeploy needed).

**If deploys ever go stale-looking again:** check
`curl -sI https://forkcastmenu.vercel.app/ | grep -i last-modified` (or any
route) — compare the date to today. That's what caught this.

## Current state (as of last verification)

- Production: https://forkcastmenu.vercel.app — confirmed fresh deploy, all
  fixes above verified live via real signup→publish→edit flows.
- A real restaurant ("Land of Fire Pizzeria," owner-published) is live,
  discoverable, and orderable — this was the actual proof case throughout.
- Supabase migrations applied through `0008` (mobile catalog fields) +
  `0003` (premium_requests, applied late by the user, out of order but no
  conflict since migrations here are idempotent `create table if not
  exists` style, not a numbered/tracked migration runner).
- `forkcast-mobile` and `forkcast-docs` repos exist under `Forkcast-HQ` but
  are otherwise untouched by this session (mobile has no app code yet; docs
  is intentionally empty — real docs are local-only, see `MEMORY.md`-style
  notes below if picking this up in a fresh Claude session).

## Known non-blocking gaps (not fixed, not asked for)

- New/self-serve restaurants have no custom photo uploads yet — `SmartImage`
  falls back to a stock category photo, which is graceful but not the real
  restaurant's actual photo. Cosmetic only.
- No mobile app code exists yet (`forkcast-mobile` repo is just the handoff
  spec) — the backend is ready for it (same Supabase tables, RLS already
  scoped for anon public reads), nobody has started the client.

## Useful gotchas for whoever picks this up

- **The project path contains a literal colon** (`.../DS:AI - Projects/...`).
  This corrupts `PATH` inside `npm run <script>` (colon is the Unix `PATH`
  separator) — `npm run dev`, `npm run build`, etc. all fail with
  "command not found" for anything in `node_modules/.bin`. Workaround used
  throughout this session: invoke binaries directly, e.g.
  `./node_modules/.bin/next dev` / `./node_modules/.bin/next build`, not
  `npm run dev`.
- **Testing pattern used throughout:** for anything touching real auth/data,
  spin up a disposable test account (unique timestamped email), drive it
  through Playwright (installed via `npm install --no-save playwright` +
  `./node_modules/.bin/playwright install chromium` — not a permanent
  dependency), then delete it via the service-role admin client
  (`supabase.auth.admin.deleteUser`) so no junk test data lingers in
  production. Don't skip the cleanup step.
- `dynamicParams = true` on `app/restaurant/[slug]/page.tsx` and its dish
  route (needed so newly-published restaurants render without a rebuild) is
  incompatible with `output: 'export'` — `scripts/deploy-pages.sh` (the
  separate GitHub Pages static-export path) patches it to `false` for that
  build only, then restores it. If touching those two files, re-read that
  script's stash/patch/restore logic first.
