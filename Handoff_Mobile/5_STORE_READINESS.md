# Forkcast — Store Readiness Checklist (Google Play first, then App Store)

Companion to [`MOBILE_HANDOFF.md`](./MOBILE_HANDOFF.md). That doc covers
building the app; this one covers everything the stores require beyond the
build. Items marked **(app change)** need code; items marked **(founders)**
are the founders' to produce; the rest is the developer's release work.

Forkcast collects health data (weight, height, conditions, allergies, meal
logs), which puts it in the stricter review lane on both stores. Plan for
that from day one, not at submission.

---

## A. Required before EITHER store

1. **Hosted privacy policy URL** **(founders + app change)** — mandatory for
   both stores; must name every data type collected (health profile, meal
   logs, weight history, photos, location), why, where it's stored
   (Supabase), retention, and deletion. Add a `/privacy` page to the web app
   so the URL is on your own domain. I can draft this.
2. **Terms of service URL** **(founders)** — expected by reviewers for apps
   with subscriptions.
3. **In-app account deletion** **(app change)** — both stores require that
   users can delete their account and data from inside the app. Backend needs
   a `delete_user_data()` flow (Supabase: delete auth user; rows cascade via
   the FKs already in the migration). Put it in Profile → Membership.
4. **In-app purchases for Premium** **(app change)** — $4.99/mo · $39.99/yr
   must go through Play Billing / StoreKit (RevenueCat wraps both). Selling
   the subscription any other way inside the app is a rejection on both
   stores. Free 7-day trial maps to a standard introductory offer.
5. **Health disclaimers surfaced in-app** — the "not medical advice" language
   the web app already uses must appear on the coach chat, condition
   warnings, and onboarding. Reviewers look for it.
6. **Assets** — adaptive icon (Android) / app icon set (iOS), splash screen,
   feature graphic (Play), 6–8 screenshots per form factor, short + full
   description. Design tokens in the handoff; I can generate first drafts.
7. **Location permission rationale** — Discover uses geolocation; both stores
   require a plain-language purpose string, and Android 12+ needs the
   approximate/precise choice handled.
8. **Camera/photo permission rationale** — for photo meal logging.

## B. Google Play (first release)

1. **Developer account** **(founders)** — one-time $25, plus D-U-N-S/identity
   verification for organization accounts (allow ~1 week).
2. **Data Safety form** — must exactly match the privacy policy and actual
   SDK behavior (Supabase, AI endpoints). Health data → declare "Health &
   fitness" data types, encrypted in transit, deletable on request.
3. **Health apps declaration** — Play requires an additional declaration for
   apps handling health data; complete it in Play Console → App content.
4. **Testing gates** — new personal accounts need a closed test with ≥12
   testers for 14 days before production. Plan the pilot cohort as those
   testers.
5. **Signing** — Play App Signing (default), target API level current per
   Play policy; Expo/EAS handles both.

## C. App Store (second release)

1. **Apple Developer Program** **(founders)** — $99/yr; enroll early, identity
   verification can take days.
2. **Privacy nutrition labels** — App Store Connect questionnaire mirroring
   the Data Safety form.
3. **Sign in with Apple** **(app change)** — required IF any third-party/social
   login is offered. Email/password-only (current plan) does NOT trigger it;
   adding Google sign-in later would.
4. **Guideline 5.1.3 (health data)** — health data may not be used for
   advertising; do not add ad SDKs. State this in the policy.
5. **Review demo account** — provide a seeded demo login + notes explaining
   the "prototype integration" order labeling so the reviewer doesn't flag a
   "non-functional" checkout. The honesty labels the product already carries
   are an asset here.
6. **TestFlight** — external testing needs its own lightweight review; use it
   for the pilot cohort on iOS.

## D. Sequencing note (one codebase, two launches)

Expo/EAS builds both stores from the same code. "Android first" is a release
order, not a separate project: ship Play closed test → production, then the
identical app to TestFlight → App Store, reusing all metadata and the
privacy answers. If the developer instead proposes a native Kotlin Android
app now and a separate iOS app later, surface it immediately — it forfeits
the shared TypeScript core (`lib/nutrition.ts` etc.), doubles long-term cost,
and both apps must then be verified against the web app's numbers by hand.

## E. Founders' to-do summary

- [ ] Play developer account + Apple Developer Program enrollment
- [ ] Privacy policy + ToS drafted and hosted (ask me — I'll draft both and
      add `/privacy` and `/terms` pages to the web app)
- [ ] Decide subscription platform (RevenueCat recommended) and create the
      products (monthly $4.99, annual $39.99, 7-day intro trial)
- [ ] Pilot cohort ≥12 people for the Play closed-test requirement
- [ ] Demo reviewer account with seeded data
