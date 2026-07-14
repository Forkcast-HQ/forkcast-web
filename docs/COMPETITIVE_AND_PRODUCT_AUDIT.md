# Forkcast competitive and product audit

Date: July 14, 2026

## Executive finding

Forkcast already demonstrates a coherent pre-order product loop: create a local account, build a metabolic profile, discover nearby restaurants, rank dishes against personal targets, log a meal, and update the dashboard. The visual identity is differentiated and editorial rather than generic wellness SaaS.

The earlier positioning—“no incumbent” or “whitespace nobody owns”—is no longer supportable. Direct or adjacent services now publicly market restaurant-menu personalization:

- [MenuFit](https://menufitapp.com/) says it ranks meals at restaurants around the world based on body metrics, preferences, and goals.
- [PlateMate](https://getplatemate.app/) says it scores restaurant menu items against calorie and macro targets and covers millions of restaurants with AI-analyzed estimates.
- [Nuuro](https://nuuro.com/) recommends restaurant choices from a photographed menu using health and preference context.
- [MyFitnessPal](https://www.myfitnesspal.com/) and photo-logging products remain large after-the-meal or tracking incumbents.

Forkcast should differentiate on the quality and auditability of independent-restaurant supply—not on being the first app to recommend a dish.

## Recommended product wedge

1. Partner-verified independent menus in dense local markets.
2. Nutrition estimates that expose source, serving assumption, confidence range, review date, and correction history.
3. Pre-order ranking against the user's remaining daily budget, with paid placement prohibited from changing the score.
4. A restaurant workflow that makes menu digitization and review practical for small operators.
5. A predeclared evaluation protocol measuring estimate accuracy, decision quality, sustained use, restaurant participation, comprehension, and fairness.

## Product and UX findings

### Working well

- Strong central promise: decide what fits before ordering.
- Clear editorial typography, warm visual identity, and useful Fit Score presentation.
- Four-step onboarding explains the metabolic calculation and updates a live preview.
- Dashboard totals, coaching copy, recommendations, and meal logging respond to profile data.
- Mobile layout includes a compact plan summary and a usable menu.
- The restaurant-facing and business-model stories create a credible two-sided product narrative.

### Corrected in this revision

- Replaced unstable LoremFlickr URLs that returned unrelated imagery with local, reviewed assets.
- Added keyboard focus visibility and reduced-motion handling.
- Added site metadata, favicon, web manifest, image credits, and a consistent evidence link.
- Replaced obsolete “no incumbent” language with a narrower, evidence-led differentiation.
- Corrected the source label for the “two-thirds underestimate” statistic to the underlying 2013 BMJ study.
- Added a public impact/evidence page that distinguishes a working prototype from proposed validation and achieved outcomes.
- Added a base-path-aware local server and repeatable static checks.

### Material gaps before production

- Original Next.js/React source is absent. The repository is a compiled export and cannot support safe feature iteration at production quality.
- Authentication and user data are local-device demo behavior; there is no secure identity, API, database, consent, deletion, or recovery model.
- Restaurant names, menus, partner badges, ratings, delivery times, and nutrition values are demonstration data unless separately documented.
- Photo logging is presented as an AI estimate but needs a real inference and correction workflow, confidence communication, and validation.
- No public privacy policy, terms, accessibility statement, estimate methodology, allergen policy, correction policy, or incident process exists yet.
- Claims and projections need a maintained source ledger with an owner, access date, definition, and allowed wording.
- No automated browser suite or measured Lighthouse/accessibility budget was present in the imported repository.

## Prioritized roadmap

### P0 — credibility and maintainability

- Recover the source repository or rebuild the application from the export into typed, tested source.
- Create a single content/data model for restaurants, dishes, nutrients, verification status, confidence, source, and timestamps.
- Add policy pages and explicit demo/live-data labeling.
- Replace local authentication with a secure backend only after defining privacy and retention requirements.
- Add WCAG 2.2 AA checks, responsive tests, link checks, and deployment previews.

### P1 — defensible pilot

- Implement restaurant claim/review/correction workflow.
- Add recipe/portion provenance and a confidence-aware estimate card.
- Recruit 10–15 Boston restaurant partners and retain dated letters of interest or agreements.
- Define and preregister pilot metrics before collecting outcome data.
- Publish a versioned pilot report, including limitations and negative results.

### P2 — scale evidence

- Replicate the protocol in a second metro.
- Benchmark ingestion time, menu-change freshness, estimate error, and restaurant support load.
- Add integrations only where they reduce verification cost or improve data quality.
- Pursue university, public-health, employer, payer, or nonprofit collaborations that fit the evidence obtained.

## Primary-source context

- [USDA ERS: U.S. food-away-from-home spending reached 58.5% of nominal food spending in 2023](https://www.ers.usda.gov/amber-waves/2024/october/u-s-consumers-increased-spending-on-food-away-from-home-in-2023-driving-overall-food-spending-growth)
- [FDA: federal menu labeling generally covers chains with 20 or more locations](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/overview-fda-labeling-requirements-restaurants-similar-retail-food-establishments-and-vending)
- [CDC/NCHS: 40.3% measured adult obesity prevalence in August 2021–August 2023](https://www.cdc.gov/nchs/data/hestat/hestat111.htm)
- [CDC: health and economic consequences associated with obesity](https://www.cdc.gov/obesity/php/about/consequences.html)
- [BMJ: at least two-thirds of surveyed fast-food diners underestimated meal calories; about one-quarter underestimated by at least 500 calories](https://www.bmj.com/content/346/bmj.f2907)
- [JAMA Network Open: menu labeling associated with approximately 25 fewer calories purchased per transaction in a national fast-food chain study](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2812966)

This audit is product and evidence-planning work, not legal, medical, or investment advice.
