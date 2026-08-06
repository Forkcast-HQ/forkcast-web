# Palatify

**Know before you go.** A nutrition-aware restaurant recommendation app that tells you *what to order* at nearby restaurants — matched to your body and goals — **before** you eat, then closes the loop with a quick photo. GrubHub-grade UX, but nutrition-AI-recommendation-first.

> The core insight: passive menu calorie labels barely change behavior (~24 cal/order), and every nutrition app makes you log *after* you've eaten. Palatify steers you to the right dish *before* you order — and gets restaurants to pay to be the recommendation.

**Public cover:** https://palatify.com — a deliberately limited Coming Soon page.

**Development build:** https://palatify-hq.github.io/palatify-web/ — the full reviewable product experience.

**This repo** (`Palatify-HQ/palatify-web`) is the app only. Business plan, financial model, architecture, and research docs live in a sibling repo, [`Palatify-HQ/palatify-docs`](https://github.com/Palatify-HQ/palatify-docs) *(currently empty — docs are being cleaned up and will be pushed there soon)*; the mobile handoff spec lives in [`Palatify-HQ/palatify-mobile`](https://github.com/Palatify-HQ/palatify-mobile).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

Node 18+. The app runs with no keys at all. Without Supabase it falls back to
the seed catalog in `data/restaurants.ts`. Without an AI key the coach returns
an error, and the photo logger says "AI unavailable" and shows a sample
estimate badged **sample** rather than **AI estimate** — it never passes a
canned number off as a real one. See **Configuration** below for what each key
switches on.

---

## What's in here

### The product (interactive demo)
A full, working Next.js app — not a mockup:

| Route | What it does |
|---|---|
| `/` | Landing page — the hero plate, the live Fit Score demo, and what the AI does |
| `/onboarding` | **Health cabinet** — live BMI / BMR / TDEE / macro targets as you type |
| `/discover` | Goal-ranked restaurants & dishes with personal **Fit Scores** |
| `/restaurant/[slug]` | Restaurant menu with per-dish nutrition + "sorted for you" |
| `/dashboard` | Daily rings, macro bars, **AI photo meal-logging**, weekly trends |
| `/for-restaurants` | Two-sided partner pitch + pricing |
| `/business` | The investor opportunity (market, model, whitespace, the ask) |
| `/how-it-works` | The science, the Fit Score, and the **system architecture** |

Everything is interactive and persists locally (profile, logged meals, weight) — set up a profile and watch nearby menus reorder around your goals.

### Strategy & business docs

Moved out of this repo — see [`Palatify-HQ/palatify-docs`](https://github.com/Palatify-HQ/palatify-docs) for the business plan, financial model, system architecture, research dossier, competitive audit, and NIW material *(repo is empty right now — docs are being cleaned up locally before they're pushed there)*.

> The NIW material is an evidence-development and product-planning aid, not legal advice. Immigration filings should be reviewed by qualified counsel.

---

## How it works (in one breath)

Your metrics → **Mifflin-St Jeor BMR → activity-factor TDEE → goal-adjusted calories + ISSN macros** → an explainable **Fit Score (0–100)** per dish (calorie fit, protein density, fiber, sodium, sugar, weighted by goal) → ranked restaurants → one-tap log → photo reconcile.

The defensible core is the **nutrition layer**: chain-exact data (USDA FoodData Central + Nutritionix/FatSecret) **plus** an estimation engine for the *independent* restaurants no commercial database covers — the structural gap the FDA rule leaves open.

---

## Tech stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · Recharts · Supabase (auth + catalog) · Anthropic Claude via the DataRobot gateway for meal recognition and the coach (`app/api/analyze`, `app/api/chat`, seam in `lib/ai.ts`).

## Project structure

```
app/            routes (landing, onboarding, discover, restaurant, dashboard, business, …)
components/     Navbar, cards, MacroRing, FitBadge, PhotoLogger, SmartImage, …
lib/            nutrition.ts (formulas + Fit Score), store.tsx (state), ai.ts (AI seam), images.ts
data/           restaurants.ts (Boston seed catalog with full per-dish nutrition)
supabase/       migrations for the Postgres/Supabase backend
```

---

## Deploying

The two deployments have intentionally different purposes:

- **https://palatify.com** is served by the normal Vercel build and displays
  only the public Coming Soon cover.
- **https://palatify-hq.github.io/palatify-web/** is built with
  `STATIC_EXPORT=true` and publishes the full development experience through
  the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.

Every push to `main` refreshes both surfaces. The static Pages build cannot
run server-only AI endpoints; those features remain visibly unavailable when
credentials or a server runtime are absent.

To verify the Pages artifact locally, run `npm run build:pages`. The helper
temporarily excludes server-only API routes and restores the source tree after
the export completes.

`netlify.toml` is still present if you ever want an SSR host other than
Vercel; connecting the repo is all it takes.

## Configuration

Everything below goes in `.env.local` (never committed) and in the Vercel
project settings for production.

| Variable | Switches on | Required |
|---|---|---|
| `DATAROBOT_API_TOKEN` | The AI coach (`/api/chat`), photo + description meal estimation and restaurant menu reading (`/api/analyze`) | For any AI feature |
| `DATAROBOT_ENDPOINT` | Gateway base URL. Defaults to `https://app.datarobot.com/api/v2` | No |
| `DATAROBOT_CHAT_MODEL` | Model id. Defaults to `anthropic/claude-opus-4-8` | No |
| `DATAROBOT_VISION_MODEL` | Vision model, if you want it to differ from the chat model | No |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real accounts, the live catalog, cloud sync. Without them the app runs on device-local accounts and the seed catalog | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Seeding scripts only — server-side, never shipped to the browser | No |

### About the AI

One provider: **Anthropic's Claude**, reached through the DataRobot LLM
gateway, keys held server-side. There is no `@anthropic-ai/sdk` dependency —
the gateway speaks the OpenAI-compatible wire format, so the two route
handlers call it with `fetch`. Earlier versions of this file described a
`USE_REAL_AI` flag and a commented-out SDK block; neither exists.

The **Fit Score is not AI**. It is a fixed formula in `lib/nutrition.ts` —
five weighted sub-scores over the nutrition values — which is what lets every
ranking show its working. The model reads menus, photographs and questions;
the arithmetic does the ranking.

---

*Nutrition values are estimates, not clinical figures. Palatify is not medical advice — confirm allergens with the restaurant.*
