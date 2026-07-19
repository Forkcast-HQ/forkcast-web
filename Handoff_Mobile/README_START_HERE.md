# Forkcast — Mobile Development Handoff Package

Prepared July 19, 2026 · Co-founders: Seymur Hasanov & Rahman · Contact: shasanov@seas.harvard.edu
Live product reference: https://seymurhh.github.io/forkcast-live/

This folder is the complete handoff for building the Forkcast mobile app
(Android first via Google Play, then iOS/App Store) with **React Native /
Expo**. The shipped web app — not any earlier mockup — is the source of
truth; repo access accompanies this folder.

## Read in this order

| # | File | What it is | For |
|---|------|-----------|-----|
| 1 | `1_MOBILE_HANDOFF` | The build spec: shared-code plan (which TypeScript modules port unchanged), 21-screen inventory, design tokens, business-logic spec, backend contract, milestones M0–M3 | Developer |
| 2 | `2_BACKEND_SETUP` | Supabase backend: what syncs, sync model, project setup steps | Developer + founders |
| 3 | `3_supabase_migration_0001_init.sql` | The database schema with row-level security — apply as-is, do not redesign | Developer |
| 4 | `4_APP_INFO_SPEC` | The Settings screen spec: required rows (incl. Delete Account, Restore Purchases), hosted policy URLs, product non-negotiables | Developer |
| 5 | `5_STORE_READINESS` | Everything the stores require beyond the build: privacy/data-safety forms, health-app declarations, IAP, testing gates, founders' to-dos | Both |

Each document is included as PDF (for reading) and Markdown (for copying).

## The three rules that override everything else

1. **Nutrition math is imported, never re-implemented.** `lib/nutrition.ts`
   from the repo is the product. Same inputs must give identical numbers on
   web and mobile.
2. **Every number carries its provenance** (partner-verified / published /
   estimated ±), every AI output shows confidence and is correctable, every
   simulated state is labeled. These honesty constraints are the brand.
3. **Health data is never used for advertising**, and account deletion must
   work in-app. Both are store requirements and product policy.

## Hosted policy pages (required by both stores, already built)

- Privacy Policy — https://seymurhh.github.io/forkcast-live/privacy/
- Terms and Conditions — https://seymurhh.github.io/forkcast-live/terms/
- Source of Data & AI — https://seymurhh.github.io/forkcast-live/data-and-ai/

(Drafts pending legal review; live after the next site deploy.)

## Questions

Anything ambiguous: email shasanov@seas.harvard.edu rather than guessing —
especially anything touching nutrition numbers, provenance labels, or
health-data handling.
