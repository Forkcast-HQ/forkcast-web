# Forkcast — Business Plan

**Know before you go.** Nutrition-aware restaurant recommendations that tell you what to order *before* you eat out, matched to your body and goals — and get restaurants to pay to be the recommendation.

*Prepared for pre-seed conversations. All market figures are sourced (CDC, USDA ERS, AHRQ, peer-reviewed literature, company filings/press). Figures are directional where the underlying data is older NHANES cycles; these are flagged.*

---

## 1. Executive summary

Americans now spend a **record 58.5% of food dollars away from home** (USDA ERS, 2023) and get roughly a third of daily calories from restaurant food that runs **~+200 kcal and +350 mg sodium per meal** vs. home — yet **two-thirds of diners underestimate** that food, a quarter by 500+ calories. The obvious policy fix, FDA-mandated menu calorie labeling (in force since May 2018), changes behavior by only **~24 calories per transaction**. Passive disclosure that nobody acts on is the wedge.

Every consumer nutrition app attacks this from the wrong end: they make you **log after** you've eaten. The category's universal failure mode is logging friction and inaccurate data — **70–80% of calorie-app users quit within two weeks**, and the worst data gap is exactly *eating out*. No commercial database has nutrition for arbitrary **independent** restaurants, because the FDA rule only forces 20+-location chains to disclose.

**Forkcast** flips the model: a plan-ahead, location-aware recommendation app that scores nearby restaurant dishes against your personal calorie/macro targets and tells you what to order, with photo logging as a supporting feature — not the product. We monetize first via consumer subscription, then a high-margin **restaurant "featured healthy dish" retail-media** leg, then a durable **payer/employer covered-nutrition** leg.

**The ask:** ~**$1.0–1.5M pre-seed SAFE** (~$5–6M post) plus a non-dilutive SBIR, to launch a Boston beachhead, build the independent-restaurant nutrition layer, and prove retention + the first featured-restaurant cohort.

---

## 2. The problem

**Eating out is the new default, and it's where good intentions fail.**

| Fact | Figure | Source |
|---|---|---|
| Food spending now eaten away from home | **58.5%** (record; $4,485/capita, +12% YoY) | USDA ERS Food Expenditure Series, 2024 |
| Daily calories from food away from home | ~1/3 of adults' calories | USDA ERS / NHANES (directional) |
| Restaurant vs. home meal | **+~200 kcal, +~350 mg sodium** | USDA ERS |
| Diners who underestimate restaurant calories | **~2 in 3**; ~25% by 500+ kcal | USDA / NHANES, 2024 |
| Behavior change from mandatory calorie labels | **~24 fewer kcal/transaction** (often null in fast food) | Peer-reviewed labeling literature |
| US adult obesity / overweight | **40.3% obese + 31.7% overweight = ~72%** | CDC NCHS, 2024 |
| Diet-related disease cost | **~$334B/yr**; obesity ~$173B/yr (2019$) | CDC; AHRQ MEPS |

People want to eat better when they eat out; they lack a personal, in-the-moment signal they'll actually act on. Labels don't provide it. Apps that log after the fact don't either.

---

## 3. The solution

Forkcast turns a user's **health cabinet** (height, weight, age, sex, activity, goal) into daily targets using real clinical formulas (Mifflin-St Jeor BMR → activity-factor TDEE → goal-adjusted calories; ISSN-based macros). It then computes a **personal, explainable Fit Score (0–100)** for every nearby dish — calorie appropriateness, protein density, fiber, sodium, sugar — weighted by the user's goal, and ranks restaurants and menus around it. Add a dish in one tap; the plan updates. Snap a photo to close the loop.

**Why plan-ahead beats log-after:** it acts *before* the order, when it can still change the outcome, and it turns every meal out into a recurring decision habit rather than a logging chore — directly attacking the category's retention problem.

A working interactive demo of all of this exists (this repository): onboarding with live BMI/TDEE/macros, goal-ranked discovery, per-dish Fit Scores, and AI photo logging.

---

## 4. Market

*All US-only unless noted; reasoning is explicit so each number can be challenged.*

- **TAM ≈ $11.1B/yr.** ~186M US adults with elevated BMI (≈72% of 258M adults; CDC 2024), nearly all of whom eat out, × ~$60 blended annual consumer ARPU (anchored between MyFitnessPal Premium $79.99/yr and Cal AI $29.99/yr). Triangulates with the independently-sized **calorie-tracking app market of $5.5–14B in 2025** (12–20% CAGR). Materially larger if the food-as-medicine payer pool is counted.
- **SAM ≈ $3.3B/yr.** ~55.7M goal-oriented "active dieters" who eat out often (~30% of elevated-BMI adults) × $60. Consistent with MyFitnessPal's ~30M MAU as a category engagement ceiling.
- **SOM ≈ $40–90M ARR (5-yr).** 0.5–2.0% of SAM = 0.28–1.1M paying users ($17–67M consumer ARR; 1% base ≈ $33M), plus restaurant retail-media and B2B2C legs. **Retention-bound, not demand-bound.**

**Proof point:** Cal AI bootstrapped to ~15M downloads and **$30M+ ARR in under two years** before MyFitnessPal acquired it (Dec 2025).

---

## 5. Competition & whitespace

No incumbent occupies all four of **{pre-meal · location-aware · independent-restaurant coverage · restaurant-supply monetization}**.

| Player | Strong at | Structurally absent |
|---|---|---|
| **MyFitnessPal** | Scale (220M registered, ~30M MAU) | After-the-fact logging; inaccurate DB (same dish 400–1,200 kcal); 70–80% 2-wk churn; first revenue decline (-5.7%, 2025) |
| **Cal AI / SnapCalorie** | Photo estimation; TikTok distribution | No recommendation; no restaurant supply side |
| **Sweetgreen / CAVA / Just Salad** | Excellent healthy menus | Single-brand only; can't be brand-agnostic |
| **DoorDash / Uber Eats** | Restaurant graph + $1B+ ad engine | Zero nutrition-goal intelligence |
| **Foodsmart** | Payer contracts, RD-led, 2.2M members | Grocery/telehealth — not in-the-moment eating-out |

**One-line whitespace:** *Plan-ahead, location-aware, brand-agnostic dish recommendations for your goal — across chains AND independents — with restaurants paying to be featured.*

**The moat** is the nutrition layer: chain-exact data (USDA FoodData Central + Nutritionix/FatSecret) **plus** an estimation engine for the independent restaurants no database covers. That engine is the one asset competitors cannot buy off the shelf — and the hardest to build.

---

## 6. Product & technology

- **Personalization engine** — BMI, BMR (Mifflin-St Jeor), TDEE, goal-adjusted targets, explainable Fit Score.
- **Nutrition layer (moat)** — chain-exact lookup + RAG-grounded NLP/VLM estimation for independents, grounded against USDA FNDDS (grounding cuts error 63–83% vs. ungrounded models; DietAI24, 2025). Confidence and ranges surfaced — **never marketed as clinical** (photo calorie error has a physics-bound ~16–25% floor).
- **Meal recognition** — photo → vision model estimate → user confirm/correct → reconcile vs. plan.
- **Two-sided** — restaurant portal for menu upload, auto-nutrition, and featured placement.

See `docs/SYSTEM_ARCHITECTURE.md` for the full architecture and build roadmap.

---

## 7. Business model — three legs, sequenced

1. **Consumer subscription (launch leg).** Transparent pricing, genuinely useful free tier (exploiting MyFitnessPal/Noom trust erosion). ~$60/yr blended, **annual-plan-led to fight churn.** Gate growth on **LTV:CAC ≥ 3:1, 6–9-month payback.**
2. **Restaurant retail-media (margin scaler).** Clearly-labeled "featured healthy dish" placement at ~$200/mo/location. 2,000 locations ≈ $4.8M; 10,000 ≈ $24M. Modeled on DoorDash's $1B+ ad run-rate. High-margin, and it solves the supply side.
3. **B2B2C covered nutrition (durable moat).** Payer/employer contracts on broadly-covered medical nutrition therapy (CPT 97802–97804) for day-one billable revenue and "free-to-you" acquisition. Medicaid/food-benefit expansion is treated as policy-dependent *optionality*, not the thesis.

Detailed numbers in `docs/FINANCIAL_MODEL.md`.

---

## 8. Go-to-market

- **Phase 1 (0–12 mo): density, not breadth.** Launch Boston/Cambridge (founder's Harvard network; dense, health-conscious, high eat-out rate). Seed full chain coverage instantly; build independent coverage block-by-block. Acquire via TikTok/influencer (the Cal AI playbook; TikTok CPM ~half of Meta) targeting GLP-1 and goal-oriented audiences.
- **Phase 2 (12–30 mo):** convert restaurant coverage into the retail-media leg; sign marquee logos; raise a seed/Series A timed to AI + food-as-medicine appetite (**AI took 62% of 2025 digital-health VC dollars**).
- **Phase 3 (30 mo+):** land payer/employer B2B2C contracts on covered MNT.

---

## 9. Funding strategy

- **Pre-seed:** ~$1.0–1.5M SAFE (~$5–6M post). US pre-seed norms 2024–26 sit ~$0.5–2M; this is mid-range and defensible with a working demo + Boston pilot data.
- **Non-dilutive (stack on top):** NIH/NIDDK SBIR/STTR, USDA-NIFA SBIR (Food Science & Nutrition), NSF SBIR. *Note: SBIR/STTR lapsed Oct 1, 2025 and was reauthorized Apr 13, 2026 — verify restarted solicitation dates before counting on this runway.* Phase I ~$150–300k (NIH), ~$125–175k (USDA), ~$275k (NSF); Phase II $1–2M follow-on.
- **Accelerators:** Y Combinator-style pre-seed (standard ~$125k for 7% + uncapped MFN SAFE) for network and signal.
- **Seed (~$4–6M)** at ~Month 12–18 on retention + featured-restaurant proof; **Series A (~$15–25M)** to scale GTM and the payer leg.

**Why now for capital:** nutrition-care is a funding hotspot on the GLP-1/food-as-medicine boom — Nourish ($70M Series B at $1B+), Foodsmart ($200M), Fay and Berry Street ($50M each) — and AI captured 62% of 2025 digital-health VC dollars.

---

## 10. Milestones (next 18 months)

| Milestone | Target |
|---|---|
| Boston market live, full chain + seeded independent coverage | Month 3 |
| D30 retention | **> 35%** (vs. ~30% category) |
| Featured restaurant partners | **150+** |
| Paying subscribers (Boston) | ~3,000 |
| Unit economics | **LTV:CAC ≥ 3:1**, payback 6–9 mo |
| SBIR Phase I awarded | Month 9–12 |
| Seed raised | Month 12–18 |

---

## 11. Key risks & mitigations

| Risk | Mitigation |
|---|---|
| **Accuracy is physics-bound** (~16–25% floor) | Lead with menu name+description (where models match nutritionists); RAG-ground in USDA data; surface ranges; market "good-enough + easy correction," never clinical |
| **Retention is the category killer** | Plan-ahead = recurring decision habit, not a logging chore; annual plans ~halve churn |
| **Two-sided cold start** | Geographic density, not national breadth |
| **GLP-1 substitution** | Reframe as the eating-out companion *for* GLP-1 users (the angle funding Nourish/Fay/Foodsmart) |
| **Incumbent consolidation** (MFP bought Cal AI) | Defensibility from the restaurant supply graph + payer contracts, not the vision model |
| **Independent-data gap is moat *and* hardest build** | Stage it; ship chains first, expand independents block-by-block; SBIR-fund the estimation R&D |
| **Recommendation integrity vs. paid placement** | Sponsored results always clearly labeled, separated from organic Fit ranking |
| **Policy risk on B2B2C** | Anchor on broadly-covered commercial MNT; treat Medicaid expansion as optionality |

---

## 12. The team (to complete)

Founder: Harvard SEAS (engineering). Hiring priorities pre-seed: a registered dietitian / nutrition-science advisor (credibility + B2B2C), an ML engineer for the estimation engine, and a local GTM/partnerships lead for restaurant density. Advisory targets: a fast-casual operator and a digital-health/payer-contracting advisor.

---

*Companion documents: `FINANCIAL_MODEL.md` (assumptions, projections, unit economics, use of funds) and `SYSTEM_ARCHITECTURE.md` (technical design and roadmap). Working product demo: this repository (`npm run dev`).*
