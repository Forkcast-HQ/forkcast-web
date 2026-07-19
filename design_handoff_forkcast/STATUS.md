# Forkcast Restaurant Integration — session status (Jul 15, 2026)

## Deliverable
`Forkcast Order Flow.dc.html` — clickable 390×844 mobile prototype, Modernist DS, real Mifflin-St Jeor + Fit Score math from repo `lib/nutrition.ts`, Boston seed catalog from `data/restaurants.ts` (repo: Seymurhh/forkcast).

## Screens done (all functional, state-driven)
Onboarding (4 steps + consent gate) → Discover (budget-ranked, search + 5 filter chips, sponsored separation) → Restaurant menu (provenance, ±confidence) → Dish detail (why-this-fits, ranges, allergen disclaimer) → Cart (day-impact bars, balance alerts) → Checkout (pickup / DoorDash $5.99, Forkcast Pay mock, 7% MA tax) → Tracking (restaurant-iPad handoff steps, auto-log on accept) → Dashboard (rings, weekly trends chart, meals) · Profile (editable metrics, CDC BMI classes incl. Obesity 1/2/3, diet/allergy/condition chips that flag dishes) · Photo log (mock AI + correction steppers) · Order history (reorder) · Legal & consent (8 draft policies).

## Tweaks (props)
goal (lose/maintain/gain), deliveryFee, showProvenance.

## Known gaps / backlog
1. Photos: slots now prefilled with generated grayscale placeholder art (`assets/photos/`, canvas-rendered, seeded per id) via image-slot `src` fallback — user drops still override per slot. Swap in real partner photography when available; do NOT hotlink web images.

## Done Jul 15
- Rounded-corner polish pass (both DC files): 12-16px radii on buttons/option cards/steppers/images, pill tags, rounded bars/dots, circular avatars/radios — harmonized with device screen shape per user request (overrides DS zero-radius rule deliberately).
- `Forkcast Partner Terminal.dc.html` — restaurant-side iPad (Verdant): order queue (new/preparing/ready/done), accept with prep-time quote, auto-log notice on accept, customer allergy/diet flags with confirm-in-kitchen disclaimer, pause toggle, pending nutrition correction (approve = versioned+timestamped), day stats, simulated incoming order at ~14s. Props: simulateIncoming, defaultPrepMin, showCorrections.
- Gym surface (new `gym` screen in Order Flow, entry from Dashboard): linked gym card (Planet Fitness · Fenway, demo-labeled), manual check-in → +310 kcal MET-based credit that genuinely raises targets()/re-ranks Fit Scores, opt-out toggle, weekly check-in dots + streak, high-protein recovery CTA (pre-sets Discover filter), member perk card.
- Gym perk applied at checkout: 10% off subtotal when checked in AND cart restaurant is partner-verified; tax computed on discounted subtotal; perk flag stored on live order so history totals match; perk card tag reflects active/inactive.
- Live order sync (localStorage key `forkcast-live-order`, 1s poll both sides): phone placeOrder publishes the order (items, flags incl. allergen/diet notes, perk, status new); terminal picks it up, claims it, shows "Live · from the app" tag; terminal accept/ready/complete writes status back and drives the phone's tracking steps + auto-log on accept. If no terminal claims within ~22s the phone falls back to simulated kitchen (writes statuses to the bus for consistency).
- `Forkcast Web Companion.dc.html` — desktop web (Chrome frame, 3 tabs): Today (big ring/macros/week chart/meals, live-order card synced from the bus, targets, best-fit shortlist), Discover (3-col restaurant grid, top-3 fit scores each), Orders (table incl. live row). Duplicates core math/data locally (same pattern as other DCs); profile mirrors phone defaults; accepted bus orders count toward the day.
- Gym sync (localStorage `forkcast-gym`, phone writes on check-in/toggle, web polls 1s): companion shows gym card (checked-in tag + credit line) and applies the +310 kcal credit to its targets. One-way phone → web; phone state is session-local (not restored from storage).

## Constraints honored (keep honoring)
Estimates never presented as measurements; allergens never guaranteed; sponsored never affects Fit Score; no invented traction; demo data labeled as such.
