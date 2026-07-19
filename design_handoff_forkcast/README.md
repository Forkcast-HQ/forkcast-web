# Handoff: Forkcast — nutrition-aware food ordering (full product prototype)

## Overview
Forkcast lets a diner set a personal daily calorie/macro budget, ranks nearby restaurant dishes against what remains of that budget, and logs the meal automatically the moment the restaurant's kitchen accepts the order. This bundle covers three synced surfaces — the customer iPhone app, the restaurant-partner iPad terminal, the desktop web companion — plus an impact/evidence dashboard and a 17-slide investor deck.

Target codebase: the existing repo `Seymurhh/forkcast` already contains the canonical nutrition math (`lib/nutrition.ts`) and Boston seed catalog (`data/restaurants.ts`). The prototypes re-implement those faithfully; when building, use the repo's versions as the source of truth.

## About the Design Files
The `.dc.html` files here are **design references created in HTML** — working prototypes showing intended look and behavior, not production code to copy. They open in a browser (keep the folder structure intact; they load `support.js` and `_ds/.../styles.css` + `_ds_bundle.js` relatively). The task is to **recreate these designs in the target codebase's environment** (React Native / Next.js / whatever the repo establishes) using its patterns. Each file has two parts: an `<x-dc>` HTML template (all layout/styling inline) and a `<script data-dc-script>` logic class (all state, math, and seed data) — the logic classes are the best implementation reference.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interaction flows are final intent. Recreate pixel-perfectly, including all disclaimer copy (it is legally deliberate — see Constraints).

## Screens / Views

### 1. Customer app — `Forkcast Order Flow.dc.html` (390×844 in an iPhone frame)
Single state machine, `state.screen`. All screens share: 20px horizontal padding, 2px section dividers (`--color-divider`), sticky bottom "day bar" (remaining kcal + cart button) on discover/menu/dish.

- **Onboarding** (4 steps + consent gate): sex → body metrics (± steppers) → activity level → goal. Live preview strip (BMI/BMR/TDEE/target) pinned above footer. "Next" disabled (45% opacity) until the consent checkbox is checked; consent links to Legal.
- **Discover**: budget summary ("Left today" 38px numeral + 3 macro mini-bars), search input + 5 filter chips (Partner-verified, High protein, Under 500 kcal, Low sodium, High fiber), restaurant cards (inset rounded photo 16px radius, partner badge, sponsored tag, top-dish Fit ring 46px). Ranked by top dish score. Footer disclaimer: sponsored never changes Fit Scores.
- **Restaurant menu**: hero photo, provenance line (partner-verified w/ review date + corrections count, or "Estimated"), ±confidence tag, dishes sorted by fit with 72px thumbs, per-dish flag line (allergen / diet conflict / over budget / top pick).
- **Dish detail**: photo, price, 72px Fit ring, "Why this fits" reason tags + warning tags, nutrient rows with bars and ± range, source line, allergen disclaimer, budget line, add-to-order.
- **Cart**: qty steppers, "Day impact" stacked bars (logged ink + this-order accent), "Balance check" alerts (over budget / macro falling behind pace / on track).
- **Checkout**: Pickup (free) vs Delivery (DoorDash, fee tweakable), Forkcast Pay vs card, gym-perk discount row (see Perk), 7% MA meals tax, total; demo-payment disclaimer.
- **Tracking**: 4 steps (sent → accepted → preparing → ready/out), pulsing current step, "Logged to your day — automatically" accent card once accepted. Driven by the sync bus (below).
- **Dashboard**: 132px day ring, macro bars, 7-day bar chart (6 seeded days: 1980/2140/1720/1890/2310/1650 + live today; over-target bars in accent; dashed target line), meals list, coach line, CTAs (find dinner / photo log / orders / gym).
- **Order history**: live + 2 seeded past orders, reorder, track.
- **Photo log**: photo slot → "Analyze" → 1.8s mock recognition → 4 items with confidence + portion steppers → log (meta records "corrected by you").
- **Profile**: metric steppers (re-rank everything live), diet/allergy/condition chips (gate dish flags), CDC BMI bar with classes incl. Obesity 1/2/3, energy rows (BMR/TDEE/targets), link to Legal.
- **Legal & consent**: 8 accordion draft policies (privacy, health-data consent, ToS, estimate methodology, allergen limitations, corrections, sponsored placement, accessibility).
- **Gym & activity**: linked gym card (Planet Fitness · Fenway, demo), manual check-in → +310 kcal MET-based credit raises the day budget (opt-out toggle), weekly check-in dots + streak, high-protein recovery CTA (pre-sets Discover filter), member perk card.

### 2. Partner terminal — `Forkcast Partner Terminal.dc.html` (1180×780 landscape iPad)
Left queue (392px): active order cards (new = pulsing accent border, selected = ink border + neutral-100 fill) + completed list. Right detail: order header, items with qty×/kcal/price, subtotal + 7% tax, **customer flags card** (accent border — allergy/diet notes with confirm-in-kitchen disclaimer), **auto-log card** (shown once accepted), actions by status: Accept·10/15/20 min → Mark ready → Complete (pickup vs DoorDash handoff copy). Footer: pending nutrition-correction card (approve = versioned + timestamped, dismiss notifies customer) + 4 day stats. Header: pause-orders toggle, menu-sync tag. Simulated incoming order at ~14s.

### 3. Web companion — `Forkcast Web Companion.dc.html` (1280×860 in browser chrome)
Top nav with 3 pill tabs. **Today**: 150px ring + macro bars, weekly chart, meals; right rail (360px): live-order card (synced), gym card (synced), daily targets, top-4 best-fit shortlist. **Discover**: 3-col restaurant cards with top-3 dish scores. **Orders**: `.table` with live row pulsing.

### 4. Impact dashboard — `Forkcast Impact Dashboard.dc.html`
Desktop evidence page: six pilot metric definitions with status (defined, not yet measured), source ledger, no-unrecorded-claims statement.

## Interactions & Behavior
- Fit ring: SVG circle r=19 (46px) / r=30 (72px), stroke-dasharray = score/100 × circumference, rotated −90°; stroke accent when ≥65 else neutral-500.
- Selected option buttons: 2px ink border + neutral-100 fill; unselected: neutral-300 border, transparent.
- Tracking auto-advances via bus poll (1s); phone falls back to simulated kitchen if unclaimed ~22s.
- Photo analyze: 1.8s timeout, pulse animation (`@keyframes fc-pulse` 1.2s, opacity 1→0.35).
- One restaurant per cart (adding from a new restaurant clears the cart).
- Hover/focus: design-system defaults (accent-ramp hover tints, 2px accent `:focus-visible` ring). Hit targets ≥44px everywhere.

## State Management
Reference the logic classes directly. Key cross-surface protocol (replace with real backend; localStorage is the prototype transport):
- `forkcast-live-order` (JSON): `{ no, slug, restName, customer, placed, fulfill, perk, items:[{name,qty,price,cal}], flags:[string], status:'new'|'preparing'|'ready'|'done', prepMin, claimed, ts }`. Phone writes on placeOrder; terminal claims + writes status/prepMin; phone and web poll 1s. Accept ⇒ auto-log to customer's day.
- `forkcast-gym` (JSON): `{ checkedIn, adjust, bonus:310, ts }`. Phone writes; web applies bonus to targets.

## Core math (mirror `lib/nutrition.ts`)
- BMR (Mifflin-St Jeor): `10·kg + 6.25·cm − 5·age + (male ? +5 : −161)`; TDEE = BMR × {1.2, 1.375, 1.55, 1.725, 1.9}.
- Calorie target: TDEE + {lose −500, maintain 0, gain +300}, floor 1500 (M) / 1200 (F), rounded to 10. Protein g/kg: {2.0, 1.6, 1.8}; fat 27% kcal; carbs remainder. Gym credit +310 kcal when checked in and enabled.
- Fit Score (0–100): weighted blend — calorie fit (Gaussian around `min(target×0.35, remaining×0.9)`, asymmetric σ), protein density (pd/0.3 clamp), fiber (/8), sodium (1−(mg−600)/1400), sugar (1−(g−8)/27). Weights by goal, e.g. lose: cal .34 / protein .32 / fiber .12 / sodium .12 / sugar .10.
- Perk: 10% off subtotal when gym-checked-in AND restaurant is partner-verified; tax on discounted subtotal.
- BMI classes: CDC adult (Underweight <18.5, Healthy <25, Overweight <30, Obesity Class 1/2/3 at 30/35/40).

## Design Tokens (Modernist system — `_ds/.../styles.css` is canonical)
- Ground `#f3f2f2` · ink `#201e1d` · accent `#ec3013` · accent-700 `#ae1800` (accent-toned body text) · neutral ramp 100–900. Dividers: 2px `var(--color-divider)`, minor rules 1px neutral-300.
- Type: Archivo everywhere. Headings 800; body 500–700; kickers 10px/uppercase/+.1em tracking.
- Radii (deliberate override of the system's zero-radius rule, per client direction): buttons/option cards 12–14px, cards/photos 16px, bars 3–4px, tags/chips full pill, avatars/radio dots circles. Screen corners: phone 24px+, tablet 24, bezel 40.
- Photography always grayscale (`filter: grayscale`, `.grayscale` wrapper).

## Assets
`assets/photos/` — 28 generated grayscale placeholder plate images (hero-<slug>, dish-<id>, photo-log). **Placeholders only**: replace with licensed partner photography; do not hotlink web images. Image slots in the prototypes are drag-and-drop (`image-slot.js`).

## Constraints — carry into production verbatim
Estimates are never presented as measurements (always source + ± range); allergen flags never guaranteed (always "confirm with the restaurant"); sponsored placement never affects ranking and is always labeled; BMI is "screening, not diagnosis"; no invented traction (deck ask/founder fields are placeholders); corrections are versioned and timestamped, never silent; consent is granular and revocable.

## Files
- `Forkcast Order Flow.dc.html` — customer app (primary reference)
- `Forkcast Partner Terminal.dc.html` — restaurant iPad
- `Forkcast Web Companion.dc.html` — desktop web
- `Forkcast Impact Dashboard.dc.html` — evidence page
- `deck/index.html` — investor deck (17 slides)
- `_ds/…/styles.css` — design tokens (canonical); `_ds_bundle.js`, `support.js`, `image-slot.js`, `ios-frame.jsx`, `browser-window.jsx` — prototype runtime/frames (not for production)
- `STATUS.md` — build log and decisions
