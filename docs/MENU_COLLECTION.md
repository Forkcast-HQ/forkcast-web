# Restaurant Menu Collection Protocol

*How Forkcast gathers, digitizes, estimates, and verifies independent-restaurant menus. This protocol is itself NIW evidence: a reproducible method, not a scraped guess. Draft v1 — July 2026.*

## Why a protocol

Chains publish nutrition because 21 CFR 101.11 makes them. Independent restaurants (~65% of U.S. locations) publish nothing — that's the coverage gap Forkcast exists to close. Every dish in the catalog must therefore carry a documented path from source to number, so a wrong value can be traced and corrected rather than silently overwritten.

## Pipeline (per restaurant)

**1. Source capture.** Collect the menu from the most authoritative available source, in priority order: (a) menu provided directly by the owner (photo, PDF, POS export), (b) the restaurant's own website/PDF, (c) an in-person menu photo, (d) third-party listing (last resort, flagged). Record: source type, URL/photo, capture date.

**2. Digitization.** Transcribe every dish: name, description (verbatim — it drives allergen/diet matching), price, category. One reviewer transcribes, a second spot-checks 20% of items. Store in the catalog format below.

**3. Nutrition estimation.** For each dish, the estimation engine (current: recipe decomposition against USDA FoodData Central reference foods; portion assumptions documented per cuisine) produces calories, protein, carbs, fat, fiber, sodium, sugar — each with the method noted. Every estimated dish is labeled `Estimated ±15%` in the product. No estimate is ever displayed without its confidence label.

**4. Owner verification (partner track).** Walk the digitized menu with the owner/chef: confirm portions, oils, preparation. Corrections recorded through the partner terminal — versioned and timestamped, never silent. Verified dishes are relabeled `Partner-verified (±5%)`. Output artifacts: signed verification letter + the correction log itself.

**5. Maintenance.** Quarterly re-check (menus drift); any diner-reported discrepancy opens a correction ticket; the dish page shows its full correction history.

## Catalog format

Dishes live in `data/restaurants.ts` (see `mi()` helper). Collection worksheet columns for field work:

| field | example | notes |
|---|---|---|
| restaurant / slug | Verdant / `verdant` | |
| source + date | owner PDF · 2026-07-15 | keep the artifact |
| dish name / description / price | verbatim | description drives flags |
| cal / P / C / F / fiber / sodium(mg) / sugar | engine output | method noted |
| estimation method | USDA FDC decomposition v1 | |
| verified? | no → yes (date) | via partner terminal |

## Effort benchmark (to be measured in pilot)

"Independent-restaurant onboarding cost" is a pre-registered pilot metric (see /impact): hours + dollars to digitize, estimate, and verify one full menu. Target cohort: 3–5 Boston independents. No numbers are claimed until measured.

## Delivery partnership note (comment #1, July 2026)

Founders' validation with restaurant owners puts third-party delivery cost at **$5–7 per order**; the demo checkout uses $5.99 within that range. Path: launch pickup-only (no delivery economics), evaluate DoorDash Drive (white-label dispatch API) once pilot order volume justifies it. The checkout integration-state board already lists the delivery API as "Not connected" until then.
