# Forkcast 🍴

**Know before you go.** A nutrition-aware restaurant recommendation app that tells you *what to order* at nearby restaurants — matched to your body and goals — **before** you eat, then closes the loop with a quick photo. GrubHub-grade UX, but nutrition-AI-recommendation-first.

> The core insight: passive menu calorie labels barely change behavior (~24 cal/order), and every nutrition app makes you log *after* you've eaten. Forkcast steers you to the right dish *before* you order — and gets restaurants to pay to be the recommendation.

**🔗 Live demo:** https://seymurhh.github.io/forkcast-live/ (static build on GitHub Pages — source stays here, private).

**This repo** (`forkcast-web`) is the app only. Business plan, financial model, architecture, and research docs live in a sibling repo, [`Forkcast-HQ/forkcast-docs`](https://github.com/Forkcast-HQ/forkcast-docs) *(currently empty — docs are being cleaned up and will be pushed there soon)*; the mobile handoff spec lives in [`Forkcast-HQ/forkcast-mobile`](https://github.com/Forkcast-HQ/forkcast-mobile).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

Node 18+ (built/tested on Node 25). No API keys needed — the AI is realistically mocked behind a clean swap-in seam.

---

## What's in here

### The product (interactive demo)
A full, working Next.js app — not a mockup:

| Route | What it does |
|---|---|
| `/` | Marketing landing page (investor-facing, cited problem stats) |
| `/onboarding` | **Health cabinet** — live BMI / BMR / TDEE / macro targets as you type |
| `/discover` | Goal-ranked restaurants & dishes with personal **Fit Scores** |
| `/restaurant/[slug]` | Restaurant menu with per-dish nutrition + "sorted for you" |
| `/dashboard` | Daily rings, macro bars, **AI photo meal-logging**, weekly trends |
| `/for-restaurants` | Two-sided partner pitch + pricing |
| `/business` | The investor opportunity (market, model, whitespace, the ask) |
| `/how-it-works` | The science, the Fit Score, and the **system architecture** |

Everything is interactive and persists locally (profile, logged meals, weight) — set up a profile and watch nearby menus reorder around your goals.

### Strategy & business docs

Moved out of this repo — see [`Forkcast-HQ/forkcast-docs`](https://github.com/Forkcast-HQ/forkcast-docs) for the business plan, financial model, system architecture, research dossier, competitive audit, and NIW material *(repo is empty right now — docs are being cleaned up locally before they're pushed there)*.

> The NIW material is an evidence-development and product-planning aid, not legal advice. Immigration filings should be reviewed by qualified counsel.

---

## How it works (in one breath)

Your metrics → **Mifflin-St Jeor BMR → activity-factor TDEE → goal-adjusted calories + ISSN macros** → an explainable **Fit Score (0–100)** per dish (calorie fit, protein density, fiber, sodium, sugar, weighted by goal) → ranked restaurants → one-tap log → photo reconcile.

The defensible core is the **nutrition layer**: chain-exact data (USDA FoodData Central + Nutritionix/FatSecret) **plus** an estimation engine for the *independent* restaurants no commercial database covers — the structural gap the FDA rule leaves open.

---

## Tech stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · Recharts · Claude (Anthropic) multimodal for meal recognition (mocked in the demo, real-implementation seam in `lib/ai.ts` + `app/api/analyze/route.ts`).

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

The live demo is a **static export** published to GitHub Pages. To redeploy after changes:

```bash
bash scripts/deploy-pages.sh   # builds + pushes to the public forkcast-live repo
```

For an SSR host (Netlify/Vercel) instead, just connect this repo (`netlify.toml` is included) — `app/api/analyze/route.ts` runs as-is under SSR.

## Turning on real AI

In `lib/ai.ts` set `USE_REAL_AI = true`, install `@anthropic-ai/sdk`, set `ANTHROPIC_API_KEY`, and uncomment the Claude Opus 4.8 vision + structured-output block in `app/api/analyze/route.ts`. No other changes.

---

*Demonstration prototype. Nutrition values are realistic estimates, not clinical figures. Built for the Forkcast pre-seed pitch.*
