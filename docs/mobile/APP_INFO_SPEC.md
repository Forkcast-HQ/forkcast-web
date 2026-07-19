# Forkcast Mobile — Settings & App-Info Spec

What the Settings/Profile tab must contain. Benchmark: MenuFit's settings
screen (Edit Preferences / Terms / Privacy / Source of Data & AI / Contact /
Feedback / Rate / Log Out / Delete Account) — we match all of it and add the
transparency items that are Forkcast's differentiators.

Canonical content lives at hosted URLs (required by both stores); the app can
render the same content natively or in a web view:

- Privacy Policy → `https://seymurhh.github.io/forkcast-live/privacy/`
- Terms and Conditions → `https://seymurhh.github.io/forkcast-live/terms/`
- Source of Data & AI → `https://seymurhh.github.io/forkcast-live/data-and-ai/`

(Marked DRAFT pending legal review; URLs change if we move to a custom domain.)

## Settings screen — required rows, in order

**Profile & goals**
1. Edit profile & preferences — health profile, units (cm/kg ↔ ft/lb),
   dietary preferences, allergens, conditions. (Existing web `/profile`.)
2. Calibration status — "Where your targets come from": formula vs calibrated,
   with the explainer. Differentiator; MenuFit has nothing like it.
3. Notifications — order status, daily log reminder (each individually
   toggleable; default log-reminder OFF — no nagging).

**Membership**
4. Membership — plan (Trial · day N of 7 / Free / Premium), price line
   $4.99/mo · $39.99/yr, Manage subscription (deep-link to store subscription
   settings), Restore purchases (required by Apple).

**Transparency & legal**
5. Source of Data & AI — provenance tiers, named AI providers, confidence &
   correction policy, allergy limits. (Improved MenuFit equivalent.)
6. Privacy Policy
7. Terms and Conditions
8. Permissions — location & camera: what each is used for, with links to
   system settings.

**Support**
9. Contact support — mailto (later: in-app form).
10. Give feedback
11. Rate Forkcast — StoreReview API (Apple limits prompts; the row is always
    allowed).

**Account**
12. Export my data — generates JSON of profile/logs/weights/orders (backend
    query is trivial with the existing tables; strengthens both store privacy
    forms and GDPR posture).
13. Log out
14. Delete account — REQUIRED by both stores. Two-step confirm → deletes the
    Supabase auth user (rows cascade per migration FKs) → local wipe →
    signed-out state. Copy must say deletion is permanent.

**About (footer of screen)**
- Version + build, "Boston, MA", link to Impact & methodology page.
- Pilot honesty line: "Prototype integration — see order labeling."

## Non-negotiables (product law — do not soften)

These carry from the web app and must appear in mobile equivalents:

1. Every nutrition value shows its provenance tier (partner-verified /
   published / estimated ±). No unlabeled numbers, ever.
2. Allergen/condition notices are advisories with the "confirm with the
   restaurant" line — on dish detail AND at checkout.
3. AI outputs show confidence, are editable before logging, and failures are
   shown (never a silently invented number).
4. Coach chat: not-medical-advice boundary; no diagnosis/medication advice.
5. Simulated/prototype states are labeled as such.
6. No third-party ads; health data never used for advertising (also an App
   Store 5.1.3 requirement).

## What we deliberately do better than MenuFit's pages

- Their "Source of Data" names two APIs and stops. Ours explains the three
  provenance tiers, uncertainty labeling, named providers, correction
  versioning, and allergy limits — transparency as a feature, on brand for
  a company whose pitch is evidence-first.

- Their privacy policy is generic web-era boilerplate (cookies, browsing).
  Ours is written to the actual data model (health profile, photos, location,
  AI processing) and commits to in-app deletion + export — which the stores'
  data-safety forms then simply restate.
