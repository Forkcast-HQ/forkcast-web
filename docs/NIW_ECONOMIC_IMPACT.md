# Forkcast — Economic Impact Evidence Brief (EB-2 NIW Support)

*July 2026 · Prepared by the founder as source material for immigration counsel.*

**Important framing.** This document is not legal advice and draws no legal conclusions. It organizes the factual, economic, and documentary record supporting the founder's proposed endeavor so that a qualified immigration attorney can assess and argue it under the applicable standard (Matter of Dhanasar). Every market figure is sourced in `RESEARCH.md` (CDC, USDA ERS, AHRQ, peer-reviewed literature, company filings); forward-looking figures come from the planning model and are labeled as projections, never as accomplished facts. Nothing herein claims users, partners, revenue, or health outcomes that do not exist.

---

## 1. The proposed endeavor (specific and defined)

To build and scale **Forkcast**, a U.S. nutrition decision-support and data-verification system for restaurant meals, with three concrete components:

1. **A consumer product** that scores restaurant dishes against an individual's clinically-derived nutrition targets *before* ordering, then closes the loop — order, confirmation, evidence-carrying meal log, and adaptive recalibration from the user's own measured energy balance.
2. **A small-business data program** that digitizes, estimates, and owner-verifies nutrition data for **independent restaurants** — the majority of U.S. restaurants, which federal menu-labeling rules (21 CFR 101.11, chains of 20+ locations only) do not reach — under a documented, reproducible protocol with versioned public corrections.
3. **A measurement framework**: six pilot metrics pre-registered publicly before any measurement (pre-order decision rate; verified-menu coverage; correction turnaround; logged-meal accuracy against order ground truth; independent-restaurant onboarding cost; diet-quality delta), so national-scale claims are earned from reproducible evidence, not asserted.

The endeavor is operational today as a complete working product with a dated development record (2026), three-tier data provenance including live-captured restaurant-published nutrition (Sweetgreen; The Halal Guys), a restaurant-side order terminal with a versioned correction system, and role-based accounts for diners and restaurants.

## 2. The national problem, in economic terms (all sourced)

| Economic fact | Figure | Source |
|---|---|---|
| Annual U.S. cost of diet-related disease | **~$334B/yr** | CDC / AHRQ MEPS |
| Of which obesity-attributable medical costs | **~$173B/yr** (2019$) | CDC |
| U.S. adults with obesity / overweight | **40.3% + 31.7% ≈ 72%** | CDC NCHS, 2024 |
| Share of U.S. food spending away from home | **58.5%** — a record; $4,485/capita | USDA ERS, 2024 |
| Share of daily calories from food away from home | ~1/3 | USDA ERS / NHANES |
| Nutritional penalty of restaurant food | higher calorie & sodium density vs. home (e.g., 2,151 vs 1,369 mg sodium/1,000 kcal) | USDA ERS EIB-105 |
| Effect of the existing federal intervention (menu calorie labels) | **~22–25 kcal/transaction; often null in fast food** | Peer-reviewed (Petimar et al.; Bleich et al.) |
| Consumers' ability to self-correct | ~2 in 3 underestimate restaurant calories; ~25% by 500+ kcal | USDA/NHANES 2024 |

**The economic syllogism:** more than half of U.S. food spending now flows through a channel that (a) measurably worsens diets, (b) largely escapes the federal transparency requirement, and (c) has proven resistant to the one intervention tried at scale (passive labels). The cost side of that failure — $334B/yr — is national by any definition. An intervention that operates *upstream of the order*, covers the *unregulated independent majority*, and *measures its own effect* addresses the failure at the precise points where existing policy and existing products do not.

## 3. Channels of economic impact

### 3.1 Public-health cost reduction (the primary channel — honestly framed)
Forkcast's mechanism targets the decision moment where labels fail: personalized, explained scoring before ordering; safety flags for allergies and self-reported conditions (sodium/sugar/fat advisories); and a confirmed-order log that makes dietary change measurable per user. **No health-outcome effect is claimed today.** The pilot's pre-registered *diet-quality delta* metric (change in sodium and calories per restaurant meal versus each user's own baseline) is designed to quantify the effect honestly. Context for scale: labeling policy's ~24 kcal/transaction was considered meaningful enough to justify federal rulemaking; a decision-support tool needs to beat only that low bar, per user, to outperform the status-quo intervention — and the measurement framework will show whether it does.

### 3.2 Small-business competitiveness (independent restaurants)
- **Free digitization and verification tools** (order terminal, allergy flags, menu verification with versioned corrections) deliver, at no cost, capabilities that chains buy from enterprise vendors — narrowing a structural technology gap for the independent majority of U.S. restaurants.
- **A cheaper demand channel:** 6% commission only on orders Forkcast originates, against the 15–30% independent restaurants currently pay delivery marketplaces — direct margin relief on every order shifted, validated against the market benchmark (DoorDash's own pickup tier is 6%).
- **A durable data asset for the restaurant:** verified nutrition data and public correction history are portable reputation infrastructure for small businesses that otherwise have none.
- **Documented onboarding economics:** the pilot measures the cost of digitizing one independent restaurant (a pre-registered metric), turning "small-business menu digitization" from a slogan into a priced, replicable protocol.

### 3.3 Direct economic activity (projections, labeled as such)
From the planning model (base case, v2, July 2026 — assumptions in `FINANCIAL_MODEL.md`):
- **Revenue trajectory:** ~$0.2M (Y1) → ~$37M ARR (Y5); bear ~$21M, bull ~$73M+.
- **Employment:** team investment of ~$0.9M (Y1) to ~$11M/yr (Y5) implies growth from ~5–6 employees to an estimated **~45–60 U.S. jobs** by Year 5 at fully-loaded costs (engineering, dietetics, operations, restaurant partnerships) — plus indirect activity at partner restaurants.
- **Tax base:** payroll, corporate, and the state meals-tax collections on Forkcast-originated orders (the product already computes Massachusetts meals tax on every order).
- **Geographic scalability:** the protocol (collection standard → provenance tiers → correction governance → pre-registered measurement) is market-agnostic by design; Boston is the first instance, not the boundary.

### 3.4 Non-dilutive R&D alignment
The estimation-engine research agenda maps to standing federal SBIR priorities (NIH/NIDDK obesity and metabolic disease prevention; USDA-NIFA food science & nutrition; NSF deep tech). Alignment with programs Congress funds to produce national benefit is itself evidence of national relevance; submissions are planned, not claimed.

### 3.5 Knowledge and infrastructure spillovers
- The **menu-collection protocol** (`MENU_COLLECTION.md`) is a publishable method for digitizing unregulated menu nutrition at known cost.
- The **order-confirmed validation dataset** (ground truth from orders vs. engine estimates) is a research asset for nutrition-estimation accuracy that retrospective logging apps structurally cannot build.
- The **correction-governance model** (versioned, timestamped, public) is a transferable pattern for consumer-data integrity in AI products.

## 4. Factual mapping to the Dhanasar framework
*(Counsel determines legal sufficiency; this table organizes facts under each prong.)*

| Prong | Factual support assembled |
|---|---|
| **1. Substantial merit & national importance** | §2's sourced economics: $334B/yr diet-disease burden; record 58.5% away-from-home food spending; documented failure of passive labeling (~24 kcal); the federal transparency gap for independent restaurants; §3's channels (health costs, small business, jobs, R&D priorities); a protocol designed for cross-market U.S. scale rather than one locality. |
| **2. Well positioned to advance the endeavor** | Founder: Harvard SEAS engineering; sole builder of a complete, working product (dated 2026 commit history); demonstrated data capability (live-captured published nutrition integrations; three-tier provenance; adaptive calibration implementing the field's state-of-the-art energy-balance method); documented methods and plans (business plan v2 with verified figures, financial model, collection protocol, competitive scan with dated captures); pilot designed and pre-registered; funding strategy mapped (pre-seed + SBIR). |
| **3. On balance, beneficial to waive the labor-certification requirements** *(as argued by counsel)* | Facts available: the endeavor is a founder-created enterprise (job-creating rather than job-taking); the work product — protocol, dataset, correction governance — is infrastructure others can build on; urgency context: diet-disease costs compound annually while the independent-restaurant gap persists. |

## 5. Evidence inventory

**Exists today (dated, verifiable):**
1. Working end-to-end product; private repository with 45+ dated commits (2026) and a public demo deployment.
2. Three-tier provenance catalog with live-captured restaurant-published nutrition (Sweetgreen menu, July 15 2026; The Halal Guys nutrition guide, April 2026 page) with retrieval dates and non-affiliation statements.
3. Public pre-registered pilot metrics and source ledger (product `/impact` page).
4. Documented methods: `MENU_COLLECTION.md`, `SYSTEM_ARCHITECTURE.md`, `DESIGN_INTEGRATION_NIW.md`.
5. Business plan v2 (all 25 reused market figures verified against the sourced dossier) and financial model v2; branded PDF editions.
6. Competitive scan with dated live captures (`COMPETITIVE_SCAN_2026-07.md`).
7. Founder-validated delivery-cost research with restaurant owners ($5–7/order).
8. Product-embedded integrity system: prototype stamps, simulation labels, confidence tiers, no-unrecorded-claims commitment.

**To be generated by the pilot (the strengthening path):**
1. Signed verification/participation letters from 3–5 Boston independent restaurants + their correction logs.
2. Measured pilot metrics against the pre-registered definitions (usage, coverage, accuracy, onboarding cost, diet-quality delta).
3. Expert support letters: registered dietitian (health mechanism), health economist (cost framing), independent-restaurant operator or association (small-business value), and if possible a public-health academic.
4. SBIR submission (and, if awarded, the award itself — strong third-party validation).
5. The order-ground-truth validation dataset and any resulting write-up or preprint.
6. Press or trade coverage grounded in the pilot (never purchased or fabricated).

## 6. Gaps and honest weaknesses (state them before USCIS finds them)
- **No measured outcomes yet** — mitigated by pre-registration: definitions were published before data, which converts "no data" into "disciplined design."
- **Single-founder execution risk** — mitigated by the shipped record: one person built the entire operational system; hiring plan is specified and funded in the model.
- **Projections are projections** — every forward number is labeled; the base case was deliberately *reduced* (v1 $58M → v2 $37M) for defensibility, which itself evidences conservatism.
- **The catalog's real restaurants are not partners** — stated on every listing; converting them is the pilot's first milestone, with letters as the artifact.

---

*Companion documents: `BUSINESS_PLAN.md` · `FINANCIAL_MODEL.md` · `RESEARCH.md` (source citations for every figure above) · `MENU_COLLECTION.md` · `COMPETITIVE_SCAN_2026-07.md` · `DESIGN_INTEGRATION_NIW.md`. This brief should be reviewed, supplemented, and framed by qualified immigration counsel before any filing.*
