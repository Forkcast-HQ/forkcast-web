# Competitive Scan — July 15, 2026

*Live captures via web fetch on this date. MenuFit (menufit.com) captured in full; Foodsmart (foodsmart.com) meta/positioning only (client-rendered site); Nuuro and PlateMate sites not server-renderable from this session — findings for those and the marketplaces (DoorDash, Uber Eats, MyFitnessPal) draw on their documented, stable product patterns. Re-verify before quoting in filings.*

---

## 1. What they're doing (observed)

### MenuFit — the closest direct competitor (captured in full)

Positioning: "The #1 App For Eating Out Healthy" · "Join over 1.5 million happy users" · "Finally Eat Out Guilt-Free." Claims coverage of "22.3 Million+ locations" — "any restaurant in the world." AI analyzes menus against goal (explicitly framed as *cutting or bulking*), age, preferences, dislikes, then ranks meals. Multiple ranked alternatives; dietary restrictions and allergies configurable. Distribution: iOS/Android only — no web product. Marketing: fitness-influencer testimonials (nutrition coach, "fitness influencer," "All-American athlete"), chain logos (Chick-fil-A, Chipotle, Dunkin'), repeated "guilt free" framing.

### Foodsmart (positioning capture)

"Personalized Telehealth Nutrition Solution" — national network of registered dietitians, "3 million members," benefits/insurance channel. It is a care-delivery company, not a menu-decision tool; nutrition guidance happens in sessions, not at the point of ordering.

### The stable patterns (documented)

DoorDash/Uber Eats: own ordering logistics, cart mechanics, merchant network; zero personal-nutrition intelligence; sponsored placement pervasive and profitable. MyFitnessPal: owns retrospective logging at database scale; restaurant meals are its weakest data; logging happens after eating. Nuuro/PlateMate: AI menu-photo guidance and "know what to order" scoring, app-first, chain-coverage-led.

## 2. What they're lacking (the gaps, with evidence)

1. **No closed loop.** MenuFit's flow ends at the recommendation. No basket, no ordering, no handoff, no post-meal log. The decision and the record never connect. (Marketplaces have the inverse: all transaction, no decision support.)
2. **Estimates presented as certainty.** MenuFit promises meals that "perfectly align with your suggested calories and macros" across 22.3M locations — no source attribution, no error ranges, no verification, no correction mechanism anywhere on the site. AI output is styled as fact. This is the single largest credibility gap in the category.
3. **Restaurants are scraped, not participants.** No competitor shows a restaurant-side product: no verification workflow, no corrections, no partner terminal. The supply side has no reason to make the data better.
4. **Fitness-bro framing excludes most of the market.** "Bulking or cutting?", "guilt free" (×5 on one page), influencer proof. This targets people who already track macros. It leaves out: people with hypertension/diabetes (sodium/sugar flags), older users, families, and anyone alienated by guilt language. Forkcast's design spec explicitly bans weight-loss guilt language — that's a market position, not just a style rule.
5. **Breadth-first data is shallow data.** "Any restaurant in the world" means model-generated guesses for the independent restaurants that publish nothing. Nobody does depth-first: a verifiable, corrected, per-dish dataset for a defined market.
6. **App-only distribution.** MenuFit has no web product at all — no shareable dish/restaurant pages, no SEO surface, no desktop companion. Forkcast's web-first build (statically rendered, linkable dish pages) is an unclaimed channel.
7. **Claims-based, not evidence-based.** "#1 app," "1.5M happy users" — assertions without methodology. None publish accuracy validation, correction logs, or measured outcomes. For an NIW record this contrast is the story: Forkcast pre-registers metrics and publishes a source ledger before claiming anything.

## 3. What Forkcast should enhance to make the difference

**Already shipped (keep loud):** the closed loop (plan → order → confirm → log with provenance), confidence labels + ± ranges, versioned public correction history, partner terminal, sponsored-never-affects-scoring rule, impact page with pre-registered metrics, web-first shareable pages.

**Next, in priority order:**

1. **Trust-contrast landing section.** A visual strip: "AI guess vs. verified data" — their flat number next to Forkcast's number-with-source-range-and-correction-history. The category leader markets certainty; Forkcast markets honesty. Make the difference visible in one glance.
2. **Dish comparison view.** Select 2–3 dishes → side-by-side macros, Fit rings, sodium/sugar bars. Nobody in the category has visual comparison; it's the natural "which one?" moment before ordering.
3. **Condition-aware profiles (from the design handoff).** Hypertension/diabetes/heart-disease chips that gate sodium/sugar/fat warnings on every dish. Instantly serves the health-condition population the "bulking/cutting" apps ignore — and aligns with the NIW public-health framing. (Advisory language only; no medical claims.)
4. **Shareable dish cards.** OG-image cards for dish pages (Fit ring + macros + provenance) so a shared link previews rich. Web distribution competitors can't match app-only.
5. **"Why we're different" honesty page.** Short public methodology: where numbers come from, what ± means, how corrections work, what Forkcast refuses to claim. Directly weaponizes gap #7 and doubles as NIW evidence.
6. **Depth-first coverage story.** Marketing copy shift: not "22M locations" — "every dish verified or honestly labeled, one market at a time, starting with Boston independents."

## 4. One-line position

Competitors sell confident guesses to people who already count macros; Forkcast is building the verified nutrition layer for everyone who eats at the restaurants no database covers — and it can prove every claim it makes.
