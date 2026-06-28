# Forkcast — Financial Model

*A transparent, assumption-driven 5-year model. Every line is a lever you can challenge. Benchmarks are sourced from the research dossier (CDC, USDA ERS, company filings, SaaS/marketplace norms). This is a planning model, not a guarantee.*

---

## 1. Core assumptions

### Consumer subscription
| Lever | Assumption | Basis |
|---|---|---|
| Pricing | $8.99/mo or **$59.99/yr** | Between MyFitnessPal Premium ($79.99/yr) and Cal AI ($29.99/yr) |
| Blended net ARPU | **~$60/yr gross → ~$51 net** | After ~15% blended platform/payment fees (web-first billing minimizes app-store cut) |
| Free→paid conversion | **4–6%** of registered | Freemium consumer-health norm (2–5%) |
| Paid churn | ~**3.5%/mo** blended (annual-plan-led) | Category churns worst of all subscriptions; annual plans ~halve it |
| Avg paid lifetime | ~**16–18 months** | Implied by annual-led mix |
| Blended CAC (per paying user) | **~$22** | TikTok CPI $3–6 + organic/referral mix; gated, not guaranteed |
| Gross margin (consumer) | **~82%** | See COGS below |

### Restaurant retail-media
| Lever | Assumption |
|---|---|
| Featured placement | **~$200/mo/location** ($2,400/yr) |
| Gross margin | ~**90%** (software + placement) |
| Benchmark | DoorDash ad/retail-media **>$1B run-rate**; 13–30% delivery take-rates |

### B2B2C covered nutrition (from Year 3)
| Lever | Assumption |
|---|---|
| Model | Commercial MNT (CPT 97802–97804) via payer/employer |
| Recognition | Conservative; ramps Y3→Y5 |
| Gross margin | ~**70%** (RD time / partner rev-share) |

---

## 2. Five-year revenue build

**Paying consumers (end of year)** — a deliberate climb from a single metro to multi-metro US, reaching **~0.8% of the 55.7M SAM** by Y5 (inside the 0.5–2.0% SOM band).

| | Y1 (Boston) | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| Paying subscribers (EoY) | 3,000 | 25,000 | 90,000 | 220,000 | 450,000 |
| **Consumer ARR** (@$60) | $0.18M | $1.50M | $5.40M | $13.20M | $27.00M |
| Featured restaurant locations | 40 | 400 | 1,500 | 4,000 | 9,000 |
| **Restaurant ARR** (@$2,400) | $0.06M* | $0.96M | $3.60M | $9.60M | $21.60M |
| **B2B2C revenue** | – | – | $0.50M | $3.00M | $9.00M |
| **Total revenue (recognized)** | **$0.24M** | **$2.46M** | **$9.50M** | **$25.80M** | **$57.60M** |

\* Partial-year for restaurant leg in Y1.

Y5 total (~$57.6M) sits within the research-derived **$40–90M 5-yr SOM**. Restaurant revenue tracks the dossier's own anchors (2,000 locations ≈ $4.8M; 10,000 ≈ $24M).

---

## 3. Consumer unit economics

| Metric | Value | Notes |
|---|---:|---|
| Gross ARPU | $60/yr | Blended payer |
| Net ARPU | ~$51/yr | After ~15% platform/payment |
| Gross-margin contribution | ~$42/yr | 82% GM |
| Avg paid lifetime | ~1.6 yr | Annual-led |
| **LTV** (GM contribution × lifetime) | **~$67** | |
| **CAC** | **~$22** | Blended paid + organic |
| **LTV : CAC** | **~3.0 : 1** | At/above the 3:1 gate |
| **CAC payback** | **~7 months** | Within 6–9 mo target |

**This is the model's most fragile assumption.** The category's constraint is retention, not demand (70–80% quit in 2 weeks). Every growth cohort is gated on holding LTV:CAC ≥ 3:1 and payback ≤ 9 months before scaling spend. If retention underperforms, we slow paid acquisition rather than buy unprofitable users.

---

## 4. COGS / gross margin detail

Per **paying** user per month:

| Component | Cost/mo | Note |
|---|---:|---|
| AI meal-photo inference | ~$0.06–0.20 | ~20 photos/mo. Opus 4.8 vision ≈ **$0.015/photo**; Haiku 4.5 ≈ **$0.003/photo**. Route most volume to a cheaper tier + cache. |
| Nutrition data APIs | ~$0.10–0.25 | Nutritionix/FatSecret tiers; USDA FoodData Central is free |
| Infra / hosting | ~$0.10 | |
| Payments | ~3% of revenue | |
| **Total COGS** | **~$0.70–1.00/mo** | → **~80–85% gross margin** |

AI inference is a *controllable* COGS line: tier routing (Haiku for routine photos, Opus for hard/mixed plates), prompt caching, and leaning on menu name+description over raw vision keep it well under 1% of revenue at scale.

---

## 5. Simplified P&L and burn

| | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| Revenue | $0.24M | $2.46M | $9.50M | $25.80M | $57.60M |
| Gross profit (~83%) | $0.20M | $2.04M | $7.9M | $21.4M | $47.8M |
| Team (R&D + ops) | $0.9M | $2.4M | $5.0M | $9.5M | $16.0M |
| Marketing / GTM | $0.4M | $1.6M | $4.0M | $8.5M | $15.0M |
| G&A | $0.2M | $0.6M | $1.2M | $2.3M | $4.0M |
| **Operating income** | **−$1.3M** | **−$2.6M** | **−$2.3M** | **+$1.1M** | **+$12.8M** |
| Cumulative funding needed | $1.3M | $3.9M | $6.2M | — | — |

**Path to profitability ≈ Year 4**, driven by the high-margin restaurant + B2B2C legs layering on top of consumer. Non-dilutive SBIR offsets R&D in Y1–Y2 (not shown above as revenue).

**Capital plan:** Pre-seed ~$1.25M (covers Y1 + into Y2 with SBIR) → Seed ~$5M (Y2) → Series A ~$15–25M (Y3) to fund the Y3 scale-up before Y4 breakeven.

---

## 6. Use of funds — pre-seed (~$1.25M, ~18 months)

| Allocation | % | $ | What it buys |
|---|---:|---:|---|
| Product & engineering | 45% | ~$560k | Core app + the independent-restaurant nutrition layer (the moat) |
| GTM (Boston) | 28% | ~$350k | Influencer/TikTok acquisition, restaurant partnerships, density |
| Data & API costs | 12% | ~$150k | Nutritionix/FatSecret licensing, AI inference, infra |
| Ops & G&A | 15% | ~$190k | Legal, accounting, dietitian advisor |

**Stacked with non-dilutive SBIR** for the estimation-engine R&D, extending effective runway.

---

## 7. Non-dilutive funding targets

| Program | Phase I | Phase II | Fit |
|---|---:|---:|---|
| NIH/NIDDK SBIR/STTR | ~$150–300k | ~$1–2M | Obesity/metabolic-disease prevention |
| USDA-NIFA SBIR (Food Science & Nutrition) | ~$125–175k | ~$650k–1M | Nutrition + food systems |
| NSF SBIR/STTR | ~$275k | ~$1M | Deep-tech estimation engine |

*Verify post-reauthorization (Apr 2026) solicitation windows before relying on timing — SBIR/STTR lapsed Oct 2025 and only reauthorized Apr 13, 2026.*

---

## 8. Scenarios (Year-5 total ARR)

| Scenario | SAM capture | Consumer ARR | + Restaurant + B2B2C | **Total ARR** |
|---|---:|---:|---:|---:|
| **Bear** | ~0.5% (280k) | ~$17M | ~$13M | **~$30M** |
| **Base** | ~0.8% (450k) | ~$27M | ~$31M | **~$58M** |
| **Bull** | ~2.0% (1.1M) | ~$67M | ~$23M+ | **~$90M+** |

All three land inside the research-derived $30–90M+ SOM envelope. The swing factor is consumer retention; the de-risker is that the restaurant retail-media leg scales on *coverage*, somewhat independent of consumer churn.

---

## 9. What would make this model wrong (and how we'd know early)

- **Retention below ~30% D30** → consumer LTV collapses; we'd cut paid spend and lean on the restaurant leg. *Tracked weekly from Boston launch.*
- **CAC above ~$35** → payback breaks 9 months; shift to organic/partnership channels. *Tracked per cohort.*
- **Independent-restaurant estimation unreliable** → narrow to chains first, expand only as accuracy clears a published bar. *Tracked via held-out nutrition validation.*
- **Restaurant willingness-to-pay < $200/mo** → reprice to performance-based (CPA on visits). *Tracked from first 40 Boston partners.*

---

*Companion: `BUSINESS_PLAN.md` (narrative, market, GTM, risks) and `SYSTEM_ARCHITECTURE.md` (technical design).*
