# Forkcast product evidence plan for an EB-2 NIW record

Date: July 14, 2026

This document is a product-evidence work plan, not legal advice. Immigration counsel should decide what enters a petition and how it is characterized.

## Controlling product principle

The website and supporting record must separate:

- what exists and can be independently demonstrated now;
- what is contracted or supported by third parties;
- what is a near-term milestone;
- what is a projection or hypothesis; and
- what has been measured with a reproducible method.

USCIS's January 2025 NIW policy update states that broad assertions about general economic benefits or potential job creation do not, by themselves, establish an entrepreneur's eligibility. It also emphasizes the underlying EB-2 qualification, the specific proposed endeavor, national importance, whether the individual is well positioned, and the aggregate evidence. See [USCIS Policy Alert PA-2025-03](https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250115-Employment-BasedNationalInterestWaivers.pdf).

## Proposed endeavor — draft product framing

Develop, validate, and scale a confidence-aware nutrition decision-support and menu-transparency system for U.S. restaurants, with an initial focus on independent establishments that generally fall outside federal chain menu-labeling requirements. The system is intended to help people evaluate restaurant dishes before ordering, enable small restaurants to structure and verify menu nutrition inputs, and generate reproducible evidence about estimate accuracy, user decision quality, and restaurant participation across multiple U.S. markets.

This framing is specific enough to evaluate. It does not claim that a consumer app alone will reduce national obesity prevalence.

## Evidence matrix

| NIW-oriented issue | Product evidence that can support it | Current state | Next evidence artifact |
|---|---|---|---|
| Substantial merit | Federal nutrition-information gap; measured obesity burden; food-away-from-home spending; pre-order decision-support rationale | Primary sources identified | Counsel-reviewed endeavor statement with source exhibits |
| National importance | A replicable data/verification protocol, national restaurant applicability, multi-market evaluation, potential public-health and small-business implications | Architecture and roadmap described | Second-market replication plan; institutional letters addressing prospective impact |
| Well positioned | Founder education/experience, record of related work, working product, technical artifacts, restaurant/customer interest, funding, pilot execution | Working static prototype; founder-specific evidence not reviewed here | Source repository, dated product demos, founder CV/evidence, letters of interest, signed pilots, funding records |
| Progress toward endeavor | Product releases, validated datasets, accuracy benchmarks, users, retained cohorts, partner menus, corrections, public reports | Demonstration only; no live traction claimed | Versioned releases, analytics definitions, partner roster, pilot report, independent review |
| Waiver benefits the U.S. | Why founder-led continuity, specialized expertise, and the endeavor's prospective benefit outweigh the normal job-offer/labor-certification framework | Not established by the website | Counsel-led argument tied to record evidence, not generic entrepreneurship language |

## Evidence rules for the website

1. Never label a restaurant “Partner” without a dated agreement or written authorization.
2. Never display ratings, user counts, retention, revenue, ARR, market share, clinical outcomes, or restaurant counts as real unless the underlying record is retained.
3. Label demonstration data, modeled projections, pilot targets, and achieved results distinctly.
4. For every public statistic, retain title, publisher, URL/DOI, publication date, access date, exact definition, and approved paraphrase.
5. For every chart, retain the source data and analysis code.
6. For every testimonial or support letter, retain identity, relationship, basis of knowledge, date, signature, and permission to publish.
7. Maintain release notes and dated screenshots or videos showing product progress.
8. Make corrections visible; do not quietly overwrite a material claim without preserving version history.

## High-value evidence artifacts

- Maintainable source code with commit history, tests, architecture notes, and deployment records.
- Restaurant letters of interest, menu data authorizations, pilot agreements, and confirmation logs.
- A data dictionary covering nutrients, serving assumptions, confidence, verification, timestamps, and provenance.
- A preregistered pilot protocol and analysis plan.
- Accuracy comparisons against recipe analysis or qualified independent review.
- Cohort-based activation, weekly use, D30 retention, and pre-order session metrics.
- Evidence of customer and restaurant demand such as interviews, waitlists, paid pilots, or signed agreements, with methodology and denominators.
- Independent letters from experts who understand both the founder's work and the specific endeavor.
- Evidence of founder qualifications and a record of executing comparable technical, business, research, or public-interest work.
- Grants, accelerators, competitions, press, funding, or institutional interest—only to the extent actually obtained and documented.

## 90-day evidence sprint

### Weeks 1–3

- Recover or rebuild source code and establish a test/deployment pipeline.
- Freeze a precise proposed-endeavor statement with counsel.
- Define restaurant, menu, nutrition, verification, confidence, and correction schemas.
- Publish privacy, terms, accessibility, estimate-methodology, allergen, and correction policies.

### Weeks 4–8

- Recruit 10–15 Boston restaurants using dated letters of interest or pilot agreements.
- Replace demonstration partner badges with verified status.
- Build partner review/correction tools.
- Assemble a reference set of dishes for independent nutrition review.

### Weeks 9–13

- Run an initial pilot with predeclared endpoints.
- Export immutable analytics snapshots and analysis code.
- Publish a limitations-first pilot report.
- Request expert letters after reviewers can examine the product, protocol, and results.

## Risk controls

- Do not describe the service as diagnosis, treatment, or clinical nutrition unless qualified professionals and applicable compliance structures support that use.
- Do not guarantee allergens based on AI or inferred ingredients.
- Treat health profile and meal data as sensitive even if a specific legal regime is not yet determined to apply.
- Separate nutrition ranking from sponsored placement.
- Evaluate error and recommendation quality across dish types, price levels, neighborhoods, and represented user groups.
- Have immigration counsel review the final petition strategy; have privacy/health-product counsel review production policies and data practices.

## Primary official references

- [USCIS Policy Alert PA-2025-03: Second Preference Eligibility for National Interest Waiver Petitions](https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250115-Employment-BasedNationalInterestWaivers.pdf)
- [FDA overview of menu-labeling requirements](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/overview-fda-labeling-requirements-restaurants-similar-retail-food-establishments-and-vending)
- [USDA ERS food-away-from-home spending](https://www.ers.usda.gov/amber-waves/2024/october/u-s-consumers-increased-spending-on-food-away-from-home-in-2023-driving-overall-food-spending-growth)
- [CDC/NCHS obesity prevalence](https://www.cdc.gov/nchs/data/hestat/hestat111.htm)
