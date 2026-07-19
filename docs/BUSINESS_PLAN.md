# Forkcast — Business Plan

**The trust layer for restaurant nutrition decisions.** Forkcast tells diners what to order *before* they order — scored against their own body and goals — then closes the loop: order, confirm, log, measure. It is the only product connecting pre-order decision support, verified independent-restaurant nutrition data, and post-order confirmed logging.

*Version 2.0 — July 2026. Prepared for pre-seed conversations and as part of the founders' evidence record. All market figures are sourced (CDC, USDA ERS, AHRQ, peer-reviewed literature, company filings/press; see `RESEARCH.md`); competitive claims from live site captures dated July 15, 2026 (see `COMPETITIVE_SCAN_2026-07.md`). Nothing in this document claims users, partners, revenue, or outcomes that do not exist.*

---

## 0. The answer first

**Americans eat out more than ever, decide blind, and every existing app reacts only after the plate is empty.** The category leader for "eat out healthy" markets AI guesses across 22 million locations as facts; the logging giants own the aftermath; the delivery marketplaces own the transaction. Nobody owns the *decision* — and nobody at all serves the ~65% of U.S. restaurants that are independent and exempt from federal menu labeling.

**Forkcast owns the decision, and earns the right to with honesty no competitor structurally can match:** every nutrition number carries its source and a ± range, restaurants review and correct their own data through a versioned public process, sponsored placement can never touch the score, and the personal calorie target itself recalibrates from the user's own measured energy balance. The full product — decision → order → restaurant terminal → confirmed log → adaptive measurement — **exists and works today** (this repository, 38+ dated commits, live demo).

**The ask: ~$1.0–1.5M pre-seed SAFE (~$5–6M post) plus non-dilutive SBIR**, to run the Boston pilot against six pre-registered metrics, convert the first independent restaurants into verified partners, and prove retention economics.

---

## 1. Situation — eating out is where American diets are decided

| Fact | Figure | Source |
|---|---|---|
| Food spending eaten away from home | **58.5%** (record; $4,485/capita, +12% YoY) | USDA ERS Food Expenditure Series, 2024 |
| Daily calories from food away from home | ~1/3 of adults' calories | USDA ERS / NHANES (directional) |
| Restaurant vs. home meal | **+~200 kcal, +~350 mg sodium** | USDA ERS |
| Diners who underestimate restaurant calories | **~2 in 3**; ~25% by 500+ kcal | USDA / NHANES, 2024 |
| Behavior change from mandatory calorie labels | **~24 fewer kcal/transaction** (often null in fast food) | Peer-reviewed labeling literature |
| U.S. adult obesity / overweight | **40.3% obese + 31.7% overweight ≈ 72%** | CDC NCHS, 2024 |
| Diet-related disease cost | **~$334B/yr**; obesity ~$173B/yr (2019$) | CDC; AHRQ MEPS |

## 2. Complication — three structural failures nobody has fixed

1. **The data doesn't exist where people actually eat.** FDA menu labeling (21 CFR 101.11) binds only 20+-location chains. The independent majority of U.S. restaurants publish nothing, and no commercial database covers them — the structural gap at the center of this plan.
2. **The timing is wrong everywhere.** Logging apps (MyFitnessPal: 220M registered, ~30M MAU) act after eating — accounting, not coaching — with 70–80% of calorie-app users quitting within two weeks. Labels act at the menu but move behavior ~24 kcal. Delivery apps act at the transaction with zero nutrition intelligence.
3. **The new "AI menu" entrants sell certainty they don't have.** MenuFit (live capture, July 2026): "#1 App For Eating Out Healthy," 22.3M locations, meals that "perfectly align with your macros" — no sources, no error ranges, no correction mechanism, no restaurant participation, no web product, and a recommendation that dead-ends (no order, no log). Credibility is the category's open flank.

## 3. Resolution — the trust layer, already built

Forkcast turns a health profile (Mifflin-St Jeor BMR → activity-scaled TDEE → goal-adjusted targets; ISSN macros; CDC BMI classes; allergies and conditions) into an explainable per-dish **Fit Score**, ranks every nearby menu around what's left of the user's day, and then — unlike every competitor — **finishes the job**:

**plan → discover → compare → order → restaurant accepts → confirm portions → log with evidence → measure → recalibrate**

### As built (dated commits in this repository, July 2026)

| Capability | Status | Why it matters |
|---|---|---|
| Fit Score engine + condition/allergen personalization | **Live** | Explainable, safety-aware ranking; allergen matches excluded from recommendations, condition advisories on every dish |
| Full ordering loop: basket → checkout → tracking → "Log this meal?" | **Live** (payments/delivery integrations honestly labeled prototype) | The decision connects to the record; every logged restaurant meal carries an order reference |
| Restaurant partner terminal | **Live** (demo-labeled) | Order queue with customer allergy flags, prep quotes, and **versioned, timestamped menu corrections** that surface publicly on dish pages |
| Three-tier data provenance | **Live** | *Partner-verified* / *Restaurant-published* (Sweetgreen menu captured live July 2026; The Halal Guys' published guide) / *Estimated ±15%* (real Boston independents, labeled) |
| Adaptive metabolic calibration | **Live** | Target TDEE back-calculated from the user's own logged intake + weight change (energy balance), confidence-blended — the state-of-the-art approach, attached to restaurant decisions no adaptive app has |
| Evidence system | **Live** | Exportable meal log with source/portion/confidence per entry; `/impact` page with six pre-registered pilot metrics and a public source ledger |
| Role-based accounts (diner / restaurant), web-first with shareable dish pages | **Live** | Two-sided from day one; the app-only competitors have no web surface at all |

**What is deliberately *not* built:** payment processing, live delivery dispatch, and partner handoff links — all shown as clearly-labeled integration states, never simulated as real. Kitchen status is simulated and labeled until a terminal claims the order.

## 4. Market

*U.S.-only; reasoning explicit so each number can be challenged (full derivations in `RESEARCH.md`).*

- **TAM ≈ $11.1B/yr.** ~186M U.S. adults with elevated BMI (≈72% of 258M adults; CDC 2024) × ~$60 blended annual consumer ARPU (anchored between MyFitnessPal Premium $79.99/yr and Cal AI $29.99/yr). Triangulates with the independently sized calorie-tracking app market ($5.5–14B, 2025; 12–20% CAGR).
- **SAM ≈ $3.3B/yr.** ~55.7M goal-oriented active dieters who eat out often (~30% of the elevated-BMI pool) × $60.
- **SOM ≈ $40–90M ARR (5-yr).** 0.5–2.0% of SAM (0.28–1.1M payers; 1% ≈ $33M consumer ARR) plus restaurant retail-media and B2B2C legs. **Retention-bound, not demand-bound.**
- **Velocity proof:** Cal AI reached ~15M downloads and $30M+ ARR in under two years before MyFitnessPal acquired it (Dec 2025).

## 5. Competition — and the flank they all leave open

| Player | Owns | Structurally absent |
|---|---|---|
| **MenuFit / PlateMate / Nuuro** | "Know what to order" positioning; AI menu scoring; influencer GTM | Sources, error ranges, corrections, restaurant participation, ordering/logging loop, web presence; guilt-based fitness framing excludes the health-condition market |
| **MyFitnessPal** | Retrospective logging at scale | Acts after eating; restaurant data is its weakest (same dish 400–1,200 kcal); 70–80% two-week churn; first revenue decline (−5.7%, 2025) |
| **DoorDash / Uber Eats** | Ordering logistics, merchant graph, $1B+ ads | Zero personal-nutrition intelligence; sponsored placement *is* the product |
| **Sweetgreen / CAVA** | Excellent single-brand transparency | Can't be brand-agnostic |
| **Foodsmart / Nourish** | Payer-funded dietitian care (2.2M members / $1B+ valuation) | Care delivery, not the moment of ordering |

**The whitespace in one line:** *nobody connects pre-order decision support, verified independent-restaurant data, and post-order confirmed logging — and nobody can prove their numbers.*

**The moat compounds through participation:** every restaurant that verifies its menu, every versioned correction, every order-confirmed meal (ground truth vs. estimate — a validation dataset no retrospective logger can construct), and every calibration cycle makes the data asset harder to replicate than any vision model.

## 6. Business model — three legs, sequenced

1. **Consumer subscription (launch) — priced to win.** The closed loop is **free forever** (charging for logging is the incumbents' most-hated move, and free order volume feeds the restaurant leg). Premium — calibration, analytics, unlimited photo AI, condition packs — at **$4.99/mo or $39.99/yr**: half of MyFitnessPal's annual, 4–14× under every incumbent monthly, priced just below the accuracy-monetizers (MacroFactor $71.99/yr) whose model proves trust holds price. Gate growth on **LTV:CAC ≥ 3:1, ~6-month payback**, funded by a ~$0-CAC channel no logger has: restaurant-partner co-marketing.
2. **Restaurant leg — every dollar earned (incentive ladder).** Rung 1: **Verified Partner is free forever** (terminal, allergy flags, corrections, badge) — their participation improves our data asset. Rung 2: **6% commission on Forkcast-originated pickup orders** — against the 15–30% they already pay marketplaces, we are the cheap, health-intent channel; they pay only when we deliver a customer. Rung 3: optional **featured placement from $99/mo**, bought after the order channel proves volume — and **never affecting Fit Scores**. Blended yield ~$1,050/location/yr.
3. **B2B2C covered nutrition (durable).** Payer/employer contracts on broadly-covered medical nutrition therapy (CPT 97802–97804); GLP-1 companion programs; Medicaid expansion treated as optionality, not thesis.

Full assumptions, five-year build, unit economics, and scenarios: `FINANCIAL_MODEL.md`.

## 7. Go-to-market — density, then proof, then scale

- **Phase 1 (months 0–12): Boston density.** Chains seeded from published disclosures (the Sweetgreen/Halal Guys pattern, already demonstrated); independents digitized block-by-block under the documented collection protocol (`MENU_COLLECTION.md`: source → digitize → estimate → owner-verify → maintain). Consumer acquisition via TikTok/influencer (the Cal AI playbook) aimed at GLP-1 and goal-oriented audiences — with trust-first, guilt-free positioning the incumbents ceded.
- **The pilot is pre-registered.** Six metrics were defined *before* measurement and are published at `/impact`: pre-order decision rate, verified-menu coverage, correction turnaround, logged-meal accuracy (order ground truth vs. estimates), independent-restaurant onboarding cost, and diet-quality delta. Definitions don't move after the fact.
- **Phase 2 (12–30 mo):** convert coverage into retail-media; raise seed on retention + featured-restaurant proof (AI took 62% of 2025 digital-health VC).
- **Phase 3 (30 mo+):** payer/employer contracts on covered MNT.

## 8. Funding strategy

- **Pre-seed:** ~$1.0–1.5M SAFE (~$5–6M post) — mid-range of 2024–26 norms, defensible with a working product and pilot protocol.
- **Non-dilutive:** NIH/NIDDK, USDA-NIFA, and NSF SBIR (Phase I ~$150–300k / $125–175k / ~$275k; Phase II $1–2M). *SBIR/STTR lapsed Oct 2025, reauthorized Apr 2026 — verify solicitation calendars.*
- **Seed (~$4–6M) at months 12–18** on retention + featured-cohort proof; **Series A (~$15–25M)** for GTM and the payer leg.
- **Why now:** the GLP-1/food-as-medicine funding wave (Nourish $70M Series B at $1B+; Foodsmart $200M; Fay, Berry Street $50M each) rewards exactly this evidence-first nutrition positioning.

## 9. Milestones — next 18 months

| Milestone | Target | Status |
|---|---|---|
| Working end-to-end product (decision → order → log → measure) | — | **Done, July 2026** |
| Published-nutrition chain seeding demonstrated | — | **Done** (Sweetgreen, Halal Guys) |
| Pilot metrics pre-registered publicly | — | **Done** (`/impact`) |
| Backend (cross-device accounts, live terminal sync) | Month 1–2 | Next |
| Catalog: 20+ restaurants incl. verified independents | Month 3 | 13 today |
| First 3–5 owner-verified partner restaurants (letters + correction logs) | Month 4–6 | — |
| D30 retention | **>35%** (vs. ~30% category) | — |
| Featured-restaurant cohort | 150+ | — |
| Paying subscribers (Boston) | ~3,000 | — |
| SBIR Phase I submitted/awarded | Month 9–12 | — |
| Seed raised | Month 12–18 | — |

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Estimation accuracy is physics-bound** (~16–25% photo floor) | Lead with menu text (models match nutritionists there); RAG-ground in USDA FNDDS (grounding cuts error 63–83%); surface ± ranges; user correction built into every surface; never marketed as clinical |
| **Retention kills this category** | Plan-ahead is a decision habit, not a logging chore; order-confirmed logging removes the diary; calibration gives a compounding reason to stay; annual plans ~halve churn |
| **Two-sided cold start** | Published-disclosure seeding gives day-one chain coverage free; density beats breadth; the terminal gives independents value (orders + flags) before any fee |
| **GLP-1 substitution** | Position as the eating-out companion *for* GLP-1 users — the angle funding the category |
| **Incumbent consolidation** (MFP × Cal AI) | Moat is the verified-data + correction + ground-truth graph, not the model |
| **Trust/integrity failure would be fatal** | Governance is product: sponsored-scoring separation is categorical; corrections versioned and public; simulated states labeled; the `/impact` no-unrecorded-claims commitment |
| **Policy risk on B2B2C** | Anchor on commercial MNT; Medicaid expansion as optionality |

## 11. National-interest alignment

*This section states the founders' case factually; it draws no legal conclusions.*

- **Substantial merit.** Restaurant-nutrition transparency for the independent majority that federal labeling does not reach; pre-order decision support where labels demonstrably fail (~24 kcal/transaction); health literacy through explained, sourced, correctable numbers; small-restaurant menu digitization at documented cost.
- **National importance.** A reproducible protocol — collection standard, provenance tiers, correction governance, pre-registered measurement — designed to scale across U.S. markets rather than serve one city; addressed at a diet-disease burden of ~$334B/yr.
- **Well positioned.** Working product with dated commit history; live-captured published-data integrations; documented methods (`MENU_COLLECTION.md`, `/impact`, `SYSTEM_ARCHITECTURE.md`); financial and competitive analyses; a pilot designed for verifiable evidence (restaurant letters, correction logs, exportable provenance-carrying data).
- **Evidence integrity.** No fabricated users, restaurants, partners, outcomes, revenue, ratings, or health claims — enforced in the product itself (prototype stamps, simulation labels, demo-payment disclosures, confidence tiers).

## 12. Team

Founding team — two co-founders: **Seymur Hasanov** (Harvard SEAS engineering; product and engineering; builder of the product to date) and **Rahman [surname]** (co-founder; strategy, market validation, and regulatory-economic analysis). Pre-seed hires: registered dietitian/nutrition-science advisor (credibility + B2B2C), ML engineer (estimation engine), local GTM lead (restaurant density). Advisory targets: a fast-casual operator and a digital-health payer-contracting advisor.

---

*Companions: `FINANCIAL_MODEL.md` · `RESEARCH.md` (cited evidence base) · `COMPETITIVE_SCAN_2026-07.md` (live captures) · `MENU_COLLECTION.md` (data protocol) · `SYSTEM_ARCHITECTURE.md` · `DESIGN_INTEGRATION_NIW.md`. Working product: this repository (`npm run dev`) and the published demo site.*
