# Palatify — Engineering Status

*Running dated log. Newest entry first. Read the "Current state" block, then the
most recent dated entry, then the standing reference sections at the bottom —
whichever model/session is picking this up.*

*Renamed from "Forkcast" to "Palatify" on 2026-07-26 (forkcast.com and most
short, easily-pronounced variants were unavailable; palatify.com was bought and
connected same day). Entries dated before 2026-07-26 below refer to the product
under its former name "Forkcast" and are left as written — they're the
historical record of what actually happened, not retroactively renamed.*

**Production:** https://palatify.com (custom domain; underlying Vercel project
still deploys from the `palatify-web` repo — see 2026-07-26 entry)
**Repos:** `Palatify-HQ/palatify-web` (this app, public) · `Palatify-HQ/palatify-docs` (empty by choice) · `Palatify-HQ/palatify-mobile` (handoff spec only)
**Docs (local-only, not pushed):** `~/Desktop/DS:AI - Projects/Healthy_restaurant/Forkcast-Docs-Local/`

---

## Current state — as of 2026-07-26

- **Renamed Forkcast → Palatify.** Domain `palatify.com` purchased (Hostinger)
  and connected to the existing Vercel project via DNS (A + CNAME records).
  `www.palatify.com` and apex `palatify.com` both resolve; apex redirects to
  `www` with a 308. Verified live in-browser by the user.
- All visible app text (~47 files: page titles, headers, footers, aria-labels,
  legal pages, seed data blurbs) and `package.json`'s `name` field were
  updated Forkcast → Palatify. `tsc --noEmit` confirmed clean after the change.
  **Not yet done:** committing/pushing this rename, and updating
  `NEXT_PUBLIC_SITE_URL` in Vercel to `https://palatify.com` (currently still
  falls back to the old Vercel subdomain if the env var isn't set — see
  "Still open" below).
- The EB-2 NIW business plan, its 12 exhibits, the restaurant Letter of
  Interest, and the Verified Partner Agreement template were all rebuilt
  under the new name, with the domain section of the business plan updated
  from "not yet selected" to "selected: palatify.com."
- **GitHub org and repos renamed to `Palatify-HQ` / `palatify-*` (2026-08-05).**
  The org rename was done in the GitHub UI; the three repos were renamed via
  the API, and `deploy-pages.yml` base paths were updated in the same commit
  so the Pages build keeps resolving its assets.

### Still open, in order

1. **`git push` the app-code rename** — committed locally (`38b4c6a`, 50
   files: the Forkcast→Palatify rename plus the new logo, see below), but
   this session has no GitHub credentials configured, so `git push` failed
   with "could not read Username for 'https://github.com'". Push from a
   machine with GitHub auth set up.
2. Set `NEXT_PUBLIC_SITE_URL=https://palatify.com` in Vercel → Settings →
   Environment Variables, then redeploy.
3. Update the Google Health and Whoop OAuth redirect URIs — **only after**
   updating the matching redirect URI in the Google Cloud Console and Whoop
   developer portal, or those integrations break. `.env.local` still points
   at `forkcastmenu.vercel.app/api/health/...` and was deliberately left
   untouched pending that coordination.
4. Optional, lower priority: rename the GitHub org/repos, the Supabase
   project label, and the local `Forkcast-Docs-Local` folder name.

### Logo — 2026-07-27

- Applied the chosen combination mark (open ring + accent stroke, lowercase
  "palatify" wordmark) to the web app only, per instruction — mobile app
  icon not touched. Rebuilt `components/Logo.tsx` as an inline SVG/text
  recreation (light variant for cream/white backgrounds, dark pill variant
  for the dark marketing panel in `AuthShell.tsx`), replacing the old
  fork+leaf icon and split-color "Fork/cast" wordmark that survived the
  earlier rename untouched (it was two separate JSX text nodes, so the
  bulk find-and-replace never matched it).
- **Note on the source assets:** the two logo crops you attached render
  correctly when viewed, but this session's shell sandbox could not read
  their raw file bytes (only list them) to copy them in directly — so the
  logo was rebuilt as a vector recreation rather than using your exact PNG
  files. Close, but worth a visual side-by-side check against the original
  before treating this as final; a follow-up session with direct file
  access to the PDF/PNGs could swap in the exact exported assets instead.
- Bundled into the same commit as the rename push above (not yet pushed —
  see item 1).

## Current state — as of 2026-07-25

- Restaurant self-serve loop is **live and verified end to end** against the real
  deployment: sign up → build menu → publish → discoverable on `/discover` →
  orderable by a diner. Tested with disposable accounts against real Supabase.
- Web catalog reads from **Supabase**, not the static build-time array. 13 seed
  restaurants + 79 menu items live. Mobile will read the same tables under the
  same RLS.
- A real restaurant — **Land of Fire Pizzeria**, owner-published — is live,
  discoverable, and orderable. This was the working proof case throughout.
- Supabase migrations applied through `0008`, plus `0003` (applied late, out of
  order, no conflict — migrations here are idempotent `create table if not
  exists` style, not a tracked runner).
- Vercel auto-deploy is working again after the repo transfer broke it (see
  2026-07-25 entry).
- **Nothing is currently broken.** Two cosmetic-only gaps are listed under
  "Standing known gaps."

---

## Change log

### 2026-07-25

**Web — shipped to production**

| Commit | Time | Change |
|---|---|---|
| `2ed3c5c` | 10:47 | Fix: fresh restaurant signup landed on `/partner` instead of `/partner/onboarding` |
| `296b5ea` | 11:21 | Empty commit to trigger a Vercel redeploy |
| `332eb98` | 11:38 | Fix: "Edit menu" dead-ended on the publish screen; "View your public page" now uses an absolute URL |
| `0b657c0` | 11:53 | Add `STATUS.md` — engineering handoff |

Detail on each:

- **Fresh restaurant signup landed on the wrong page.** A redirect race between
  the signup page's "already logged in" effect and its own explicit post-signup
  navigation. New restaurants skipped onboarding entirely. Fixed in
  `app/signup/page.tsx`.
- **"Edit menu" dead-ended on the publish screen.** Once a restaurant was
  published, `app/partner/onboarding/page.tsx`'s `load()` always forced
  `step = 2` (the "you're live" confirmation) — no path back to the menu editor.
  Now always lands on the menu step, which already has its own routes onward to
  listing details and publish.
- **"View your public page" used a relative link**, so it opened on whatever host
  the owner happened to be browsing from — including a protected Vercel
  per-deployment preview URL, which surfaced to the user as a confusing "404"
  that was actually a Vercel SSO redirect. Now an explicit absolute URL via
  `NEXT_PUBLIC_SITE_URL`, falling back to `https://forkcastmenu.vercel.app`.
- **Vercel deploys had been stuck for 3 days.** The GitHub repo transfer
  (`Seymurhh/forkcast` → `Forkcast-HQ/forkcast-web`) silently broke auto-deploy;
  nothing reached production until this was caught. Sequence, in case another
  repo move ever repeats it:
  1. Vercel Hobby **refuses to connect a private repo owned by a GitHub org**
     ("Upgrade to Pro to continue"). Fixed by making `forkcast-web` public — a
     deliberate choice, taken only after confirming no secrets in the repo or
     its history (`git log --all -- .env*` plus a grep sweep).
  2. Reconnecting the repo does **not** trigger a build against existing HEAD —
     Vercel only reacts to new pushes. Needed an empty commit (`296b5ea`) to
     fire a fresh webhook.
  3. Auto-deploy on push then worked normally (confirmed: `332eb98` went live
     within the polling window, no manual redeploy).

  **Detection command if deploys ever look stale again:**
  `curl -sI https://forkcastmenu.vercel.app/ | grep -i last-modified` — compare
  to today's date. That is what caught this.

**Documentation**

- Began the EB-2 NIW documentation track. Rebuilt the business plan from
  `Forkcast-Docs-Local/BUSINESS_PLAN.md` (v2.1) into a petition-grade Word
  document for **Rahman Shavahatli, Founder & CEO** — numbered exhibits,
  generated charts, a methodology note under every table and figure, and a full
  source ledger. Output:
  `Forkcast-Docs-Local/pitch/Forkcast_Business_Plan_EB2NIW.docx`.
- Ran a source-verification pass over every load-bearing statistic. Findings and
  the defects that must be closed before filing are recorded in
  `Forkcast-Docs-Local/pitch/SOURCE_VERIFICATION.md`.

### 2026-07-24

**Web — GitHub reorganized under `Forkcast-HQ`** (`0b2eab9`, `d1e7e93`)

- Repo split into three: `forkcast-web` (this app), `forkcast-docs`
  (business/technical docs — intentionally emptied; the real docs stay local),
  `forkcast-mobile` (handoff spec only, no app code yet).
- `forkcast-web` was **transferred** from `Seymurhh/forkcast` with history
  preserved.

**Web — dynamic restaurant catalog, web now matches mobile** (`dd9120c`, `12e20a7`)

Previously `data/restaurants.ts` was a static build-time seed array only the web
app read. Now:

- `supabase/migrations/0008_mobile_catalog_fields.sql` extends the self-serve
  schema (`0006`) so seeded rows (`owner_id = NULL`, `catalog_origin = 'seed'`)
  and self-serve rows (`owner_id = <auth uid>`,
  `catalog_origin = 'restaurant_self_serve'`) live in one table, both publicly
  readable once `status = 'published'`.
- `scripts/seed-restaurants-supabase.ts` (run via `tsx`, needs
  `SUPABASE_SERVICE_ROLE_KEY`) one-off imported the static catalog. Already run.
- New `lib/catalog.ts` (server-safe fetch + row mapping) and
  `lib/catalogContext.tsx` (`CatalogProvider` / `useCatalog()`, wrapping the app
  in `app/layout.tsx`) replace all 19 old `data/restaurants.ts` import sites —
  4 server components fetch directly, the rest use the hook.
- `data/restaurants.ts` is untouched but is now only the seed source for the
  one-off script; the live app no longer imports it.
- This is what makes a self-serve-published listing actually appear on
  `/discover` and `/restaurant/[slug]` for real diners — and what mobile will
  read from.

**Web — bug fixes** (`af4309a`, `027dcf3`)

- **`/partner` hung on "Loading…" forever when signed out.** `mode` resolved to
  `"loading"` whenever `owner === undefined`, but the only effect that ever
  moves `owner` off `undefined` runs for signed-in restaurant accounts — so a
  signed-out visitor stayed there permanently. `app/partner/page.tsx`.
- **Login silently landed in the wrong account's role.** The "I'm a diner" /
  "I'm a restaurant" toggle on `/login` only changed page copy — it was never
  passed to the login call (role is fixed at signup, not chosen at login).
  Picking the wrong one silently redirected into whatever the account actually
  was, with no explanation. Now shows an explicit "Wrong account type" screen.
  `app/login/page.tsx`.
- **`public.premium_requests` was missing** from the live Supabase project —
  migration `0003_premium_requests.sql` existed in the repo but had never been
  applied, causing a 404 on every page load via `lib/premium.tsx`. Applied by
  the user; verified clean. No code change.

---

## Standing known gaps (not fixed, not currently asked for)

- **No custom photo uploads for new/self-serve restaurants.** `SmartImage` falls
  back to a stock category photo — graceful, but not the restaurant's real
  photo. Cosmetic only.
- **No mobile app code exists yet.** `forkcast-mobile` is just the handoff spec.
  The backend is ready (same Supabase tables, RLS already scoped for anon public
  reads); nobody has started the client. Android is the stated first target.
- **Domain not yet chosen.** Production runs on the Vercel subdomain. Business
  and immigration documents carry a placeholder until this is decided.

---

## Standing gotchas for whoever picks this up

- **The project path contains a literal colon** (`.../DS:AI - Projects/...`).
  This corrupts `PATH` inside `npm run <script>` — the colon is the Unix `PATH`
  separator — so `npm run dev`, `npm run build`, etc. all fail with "command not
  found" for anything in `node_modules/.bin`. Invoke binaries directly instead:
  `./node_modules/.bin/next dev`, `./node_modules/.bin/next build`.
- **Testing pattern for anything touching real auth/data:** spin up a disposable
  test account (unique timestamped email), drive it through Playwright
  (`npm install --no-save playwright` + `./node_modules/.bin/playwright install
  chromium` — deliberately not a permanent dependency), then delete it via the
  service-role admin client (`supabase.auth.admin.deleteUser`). **Don't skip the
  cleanup** — no junk test data in production.
- **`dynamicParams = true`** on `app/restaurant/[slug]/page.tsx` and its dish
  route (needed so newly-published restaurants render without a rebuild) is
  incompatible with `output: 'export'`. `scripts/deploy-pages.sh` (the separate
  GitHub Pages static-export path) patches it to `false` for that build only,
  then restores it. If you touch those two files, re-read that script's
  stash/patch/restore logic first.
