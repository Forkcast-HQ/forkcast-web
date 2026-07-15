# Forkcast — Design Integration & NIW Evidence Review

*July 15, 2026 · Review of the Claude Design handoff (`design_handoff_forkcast/`) against the live codebase (Seymurhh/forkcast) and an EB-2 NIW-oriented product/evidence standard.*

---

## 1. Competitor-informed design critique

**Against DoorDash / Uber Eats.** The marketplaces own speed, cart mechanics, live courier logistics, and merchant scale. The handoff's order flow correctly does not compete on logistics — there is no fake courier map or invented ETA. Its differentiation is placed where the marketplaces are structurally weak: the decision *before* the cart. DoorDash shows you what's popular; Forkcast shows you what fits your remaining day, with an explainable score. The critique: the handoff's checkout borrows marketplace visual conventions (fees, tax lines, fulfillment toggles), which is right for user familiarity, but the production build must keep the "prototype — integration required" state visually louder than a marketplace would ever allow. That honesty is a feature for the NIW record, not a UX defect.

**Against MyFitnessPal.** MFP owns retrospective logging at database scale, and its weakness is exactly Forkcast's thesis: logging happens *after* the decision, is high-friction, and treats restaurant meals as a guessing game. The handoff's strongest idea — order acceptance generating a pre-filled "Log this meal?" card with portion edits — converts logging from a chore into a one-tap confirmation with better data than MFP can get (the order itself is the ground truth of what was served). The critique: the handoff described auto-logging on acceptance; the implemented flow deliberately inserts user confirmation (portion, substitutions, "don't log") before anything reaches the day. That is the right call both for data quality and for evidence integrity — nothing enters the record without the user attesting to it.

**Against Foodsmart.** Foodsmart bundles dietitians, benefits billing, and grocery. Forkcast should not chase clinical services; its lane is the moment of restaurant decision. The handoff respects this — no telehealth screens, no diagnosis language, BMI labeled as screening.

**Against MenuFit / PlateMate / Nuuro.** These are the honest comparables and Forkcast must never claim an empty field. They position on "know what to order," AI scoring, and breadth of chain coverage. The handoff's counter-positioning is structural rather than cosmetic: (a) confidence is a first-class UI element — every nutrition number carries a source and a ± range, where competitors present AI estimates as flat facts; (b) provenance and correction history are visible on the dish, not buried; (c) sponsored placement is contractually and visually separated from the Fit Score, with a standing disclaimer; (d) the loop closes — competitors stop at recommendation, Forkcast carries the decision through order into a verified log entry. The critique of the handoff itself: dish-level correction history (screen 4 of the required set) exists in the partner terminal prototype but is thin on the consumer dish page; production should surface "last verified / N corrections" on every dish card, not only at restaurant level.

**Design-system critique.** The Modernist system (Archivo, ink/ground/accent, 2px dividers, grayscale photography) is distinctive and avoids the generic wellness-gradient trap. Two cautions: grayscale food photography is a bold brand move but works against appetite appeal — acceptable for a trust-first product, worth A/B validation in pilot; and the accent red (#ec3013) doubles as both brand and warning color, so over-budget states need a second signal (icon + copy) for accessibility.

## 2. Niche and uniqueness (one paragraph)

Forkcast is the trust layer for restaurant nutrition decisions before ordering — focused on the ~65% of U.S. restaurants that are independent and therefore outside the FDA's chain menu-labeling requirement. It is not a delivery marketplace, not a general food logger, and not a telehealth service: it is a decision-support and verification system that ranks real menu items against a person's remaining daily budget using an explainable Fit Score, labels every nutrition number with its source and confidence, lets restaurants review and correct their own data through a versioned, timestamped process, keeps sponsored placement permanently separated from scoring, and closes the loop by turning a confirmed order into a provenance-carrying meal-log entry. Competitors cover fragments of this (MenuFit and PlateMate on scoring, Nuuro on AI menu guidance, MyFitnessPal on logging, DoorDash on ordering); none connect pre-order decision, verified independent-restaurant data, and post-order confirmed logging into one measurable protocol.

## 3. Revised product flow (mobile + web)

The canonical loop, now implemented end to end in the codebase:

**plan → discover → compare → order → confirm → log → measure day**

1. **Plan** (`/onboarding`, `/profile`) — Mifflin-St Jeor BMR → TDEE → goal-adjusted targets; consent-gated.
2. **Discover** (`/discover`) — map/list hybrid, restaurants ranked by top-dish Fit Score for *this* user's remaining day; partner-verified vs estimated badges on every card.
3. **Compare** (`/restaurant/[slug]`) — menu sorted by fit; each dish: Fit Score, macros, price, warnings, dietary tags, data confidence.
4. **Order** (`/basket` → `/checkout`) — one restaurant per basket; quantity edits; **day-impact bars** (already-logged + this-order stacked against targets) and a balance check (over budget / protein behind pace / on track) *before* checkout; fulfillment choice: pickup, delivery, or order-through-restaurant (partner handoff). Checkout computes real subtotal, delivery fee, 7% MA meals tax — and carries a permanent, prominent **"Prototype checkout — restaurant ordering integration required"** state. No payment is taken, no order transmitted, and the partner-handoff option states explicitly that no handoff link is live.
5. **Confirm** (`/order`) — four-step status timeline (sent → accepted → preparing → ready), explicitly labeled **simulated kitchen**; on acceptance, the **"Log this meal?"** card appears.
6. **Log** — per-item portion steppers (0–2× in 0.25 steps), substitution note, computed will-log totals, or "don't log." Confirmed entries carry `source: "order"`, restaurant, timestamp, order reference, portion, confidence (`partner-verified` | `estimated`), and note.
7. **Measure day** (`/dashboard`, `/orders`) — daily log shows each order-sourced meal with its order ref, confidence, and portion; order history preserves the full evidence trail and supports reorder.

Web companion (from the handoff, next build phase): Today / Discover / Orders tabs sharing the same store, with the live-order card synced. Partner terminal (restaurant iPad) supplies the real counterpart to the simulated kitchen and the menu-verification/correction workflow.

## 4. Visual design direction with concrete screens

Direction: mobile-first, image-forward, fewer paragraphs, structured visual decisions; Modernist tokens (Archivo, ink `#201e1d`, ground `#f3f2f2`, accent `#ec3013`, 12–16px radii, pill tags, 2px dividers); interactive rings and stacked bars as the primary data language; animation only where it communicates state (pulsing current order step, count-ups); no decorative 3D.

| # | Screen | Status | Key visual elements |
|---|--------|--------|---------------------|
| 1 | Home/dashboard | live | day ring, macro bars, weekly chart, provenance-tagged meal list |
| 2 | Discovery | live | map/list hybrid, filter chips, Fit rings on cards |
| 3 | Restaurant detail | live | hero imagery, fit-sorted menu, partner badge |
| 4 | Dish detail | partial | Fit ring, reasons/warnings; **add ± ranges + correction history** |
| 5 | Basket | **built this session** | qty steppers, stacked day-impact bars, balance alerts |
| 6 | Checkout / integration state | **built this session** | fulfillment cards, amber prototype-integration notice, real tax math |
| 7 | Post-order confirmation | **built this session** | "Log this meal?" card, portion steppers, substitution note |
| 8 | Daily log w/ evidence | **built this session** | order ref + confidence + portion on each entry |
| 9 | Restaurant verification/admin | prototype only | partner terminal: queue, flags, versioned corrections |
| 10 | Impact/evidence page | prototype only | metric definitions marked "defined, not yet measured"; source ledger |

## 5. NIW evidence gaps and how the product collects proof

**Framing to protect:** substantial merit (restaurant nutrition transparency, pre-order decision support, health literacy, small-business menu digitization); national importance (a scalable, reproducible protocol for U.S. markets — emphasis on independent restaurants left uncovered by 21 CFR 101.11); well-positioned (working product, source code, dated releases, roadmap); evidence integrity (nothing fabricated, ever).

Current gaps and the built-in collection mechanism for each:

1. **No measured pilot outcomes yet.** Gap: national-importance claims cannot rest on intent. Mechanism: the impact dashboard defines six pilot metrics *in advance* (e.g., pre-order decision rate, verified-menu coverage, correction turnaround, logged-meal accuracy vs order ground truth, independent-restaurant onboarding cost, user-level sodium/calorie deltas) each marked "defined, not yet measured" until real data exists — a pre-registration pattern that reads as scientific discipline.
2. **No restaurant partners on record.** Gap: partner-verification claims are currently design intent. Mechanism: the partner terminal's verification workflow produces timestamped, versioned correction records; each onboarded restaurant yields a signed participation letter + a verifiable data trail. Target: 3–5 Boston independents as a documented pilot cohort.
3. **No dated release trail.** Mechanism: tagged releases with changelogs; every order stamped `integration: "prototype"` so demo data can never masquerade as traction; this session's commit is itself an artifact of documented technical progress.
4. **No source ledger for nutrition numbers.** Mechanism: per-dish source field (partner-verified / USDA-derived / estimated) already surfaces in UI; extend to an exportable ledger (dish → source → method → date → corrections) — the direct answer to "how do you know these numbers."
5. **No usage metrics.** Mechanism: privacy-respecting counters (orders placed, log-confirmation rate, portion-edit rate — the last being evidence users actively correct data rather than passively accept it).
6. **No validation study.** Mechanism: the confirmed-order log creates ground truth (order contents) vs estimate (nutrition engine) pairs — a publishable accuracy dataset no post-hoc logging app can construct.

**Never:** fabricated users, restaurants, partners, outcomes, revenue, ratings, health claims, or legal conclusions. The app enforces this in code — simulated states are labeled simulated, demo payments labeled demo, estimates carry confidence labels.

## 6. Near-term roadmap: ordering + automatic meal logging

**Phase 0 — done (this session, in repo).** Basket/order state layer (`lib/order.tsx`), basket with day-impact preview, prototype-safe checkout (pickup/delivery/partner-handoff, MA tax), simulated-and-labeled order timeline, "Log this meal?" confirmation with portion/substitution edits, provenance-carrying log entries (`source, orderRef, confidence, portion, note`), order history with reorder, dashboard provenance display.

**Phase 1 — weeks 1–3: trust surface.** Dish-level ± confidence ranges and correction history on dish cards; `/impact` evidence page in the app (port the Impact Dashboard prototype: metric definitions + source ledger + no-unrecorded-claims statement); tagged v0.2 release with changelog.

**Phase 2 — weeks 3–6: restaurant side.** Port the partner terminal as `/partner` (order queue, accept with prep time, allergy/diet flags, versioned menu corrections); replace localStorage sync bus with a real backend channel (Supabase/Postgres + subscriptions); restaurant menu-verification workflow generating timestamped correction records.

**Phase 3 — weeks 6–10: pilot.** Onboard 3–5 Boston independent restaurants (manual menu digitization + verification letters); real pickup orders through the partner terminal at the counter — still no payment processing (pay at restaurant), keeping the money-handling honest; begin measuring the six pre-registered metrics.

**Phase 4 — weeks 10–16: web companion + measurement.** Port the Web Companion (Today/Discover/Orders) on the shared backend; first impact report from pilot data — published on `/impact` with methodology; evaluate a delivery-partner API (DoorDash Drive) and real payments (Stripe) only after pilot demand is demonstrated.

Each phase ends with a dated, tagged release — the NIW record accumulates as a by-product of shipping.
