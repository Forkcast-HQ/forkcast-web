# Forkcast — Next Steps

*Brief, living roadmap. Updated 2026-06-28.*

---

## Where we are now (DONE)
- **Working, investor-ready demo** (live: https://seymurhh.github.io/forkcast-live/) — accounts, onboarding wizard, BMI/TDEE/macros, Fit-Score discovery + map, dashboard, photo logging. "Warm Editorial" design.
- **Strategy package** — business plan, financial model, system architecture, research dossier (all private).
- **Private source repo + one-command deploy.**

**What we do NOT have yet:** real users, real restaurants, a pitch deck, or any external validation. That's the gap the next steps close.

---

## THE NEXT STEP (single focus for the next ~4 weeks)
**Turn the demo into proof.** Get evidence that diners want this and restaurants will play — before writing more code or raising.

Three parallel, cheap actions:
1. **20 user interviews** with goal-oriented Boston/Cambridge diners (Harvard network first). Show the demo; ask: would you use this, what's missing, would you pay ~$60/yr? *Done = 20 conversations + a one-page "what we heard."*
2. **Demand signal** — add a real **waitlist** (email capture) to the live site and drive ~200 signups via a TikTok/IG post + campus channels. *Done = waitlist live + first 100 signups.*
3. **5–10 restaurant conversations** in one dense neighborhood (e.g., Newbury St / Central Sq). Pitch "featured healthy dish." *Done = ≥3 verbal "yes, I'd try it."*

In parallel, build the **pitch deck** (10–12 slides) from the business plan — the artifact every investor/grant needs.

---

## THEN — next ~90 days (in order)
1. **Beachhead data layer** — wire real chain nutrition (USDA FoodData Central + Nutritionix) for ~50 real Boston restaurants so the app reflects reality, not seed data.
2. **MVP backend** — real auth + database (swap the local store), and turn on **real Claude photo analysis** (restore `/api/analyze`, deploy to Netlify/Vercel for SSR).
3. **First 10 restaurants live + first 100 active users** in one neighborhood. Track **D30 retention** (target >35%) and **CAC** — the two numbers that make or break the raise.
4. **Apply for non-dilutive grants** — NIH/NIDDK SBIR, USDA-NIFA SBIR (verify post-Apr-2026 solicitation dates).

---

## Funding track (runs alongside)
- **Now:** deck + a clean data room (the docs we have).
- **Month 1–2:** warm intros to pre-seed angels/funds (health-tech, food-tech, Harvard/MIT networks); apply to an accelerator (YC-style).
- **Target:** ~$1.0–1.5M pre-seed SAFE, gated on the validation proof above + SBIR as non-dilutive top-up.

---

## Numbers that unlock the raise (the proof investors want)
| Metric | Target |
|---|---|
| D30 retention | > 35% |
| Featured/committed restaurants | 10+ live, 150+ pipeline |
| Active users (1 metro) | 100 → 1,000 |
| LTV:CAC | ≥ 3:1, payback 6–9 mo |

---

## Housekeeping (this week)
- [ ] Decide on the public deploy repo (delete + recreate `forkcast-live` for a 100% clean history, or leave the scrubbed version).
- [ ] Lock the name/trademark check for "Forkcast."
- [ ] Buy a domain (e.g. forkcast.app) and point the live site at it.
- [ ] Recruit 1–2 advisors: a registered dietitian and a fast-casual operator.

---

**One line:** the product is built — the next job is **validation + a deck + first restaurants**, not more features.
