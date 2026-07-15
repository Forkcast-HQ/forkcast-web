"use client";

// Impact & evidence page (handoff screen 10).
// NIW-friendly: pre-registered pilot metrics marked "defined — not yet
// measured", a source ledger for every nutrition value, and a standing
// no-unrecorded-claims statement. Nothing here overclaims: counts shown
// are real counts of demo activity on this device, labeled as such.

import { useEffect, useState } from "react";
import { BadgeCheck, ClipboardList, FlaskConical, Scale, ShieldCheck } from "lucide-react";
import { RESTAURANTS } from "@/data/restaurants";
import { readCorrections } from "@/lib/bus";
import { cls } from "@/lib/format";

const METRICS = [
  {
    name: "Pre-order decision rate",
    definition: "Share of logged restaurant meals whose dish was viewed in Forkcast before the order was placed.",
    why: "Measures whether the product changes the decision, not just records it.",
  },
  {
    name: "Verified-menu coverage",
    definition: "Percent of listed dishes whose nutrition data has been reviewed and confirmed by the restaurant.",
    why: "The transparency gap for independent restaurants is the core problem.",
  },
  {
    name: "Correction turnaround",
    definition: "Median time from a flagged nutrition value to a versioned, restaurant-approved correction.",
    why: "Trust depends on how fast bad data gets fixed, visibly.",
  },
  {
    name: "Logged-meal accuracy",
    definition: "Difference between order-confirmed meal contents (ground truth) and engine estimates, per nutrient.",
    why: "The order-to-log loop creates a validation dataset no retrospective logger can build.",
  },
  {
    name: "Independent-restaurant onboarding cost",
    definition: "Hours and dollars to digitize, estimate, and verify one independent restaurant's full menu.",
    why: "National importance requires a protocol that scales beyond one city.",
  },
  {
    name: "Diet-quality delta",
    definition: "Change in sodium and calorie intake per restaurant meal for active users vs their own baseline.",
    why: "The public-benefit claim must eventually rest on measured behavior change.",
  },
];

export default function ImpactPage() {
  const [counts, setCounts] = useState({ corrections: 0 });

  useEffect(() => {
    setCounts({ corrections: readCorrections().length });
  }, []);

  const dishes = RESTAURANTS.reduce((s, r) => s + r.menu.length, 0);
  const partners = RESTAURANTS.filter((r) => r.partner);
  const partnerDishes = partners.reduce((s, r) => s + r.menu.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="kicker text-brand-700">Evidence, not claims</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-ink sm:text-4xl">Impact &amp; evidence</h1>
      <p className="mt-3 max-w-2xl text-ink/65">
        Forkcast&apos;s public-benefit case — better nutrition transparency for restaurant meals, especially at the
        independent restaurants federal menu-labeling rules don&apos;t reach — will be made with measured evidence.
        This page defines the measurements <em>before</em> the pilot, and reports nothing that hasn&apos;t happened.
      </p>

      {/* No-unrecorded-claims statement */}
      <div className="mt-6 rounded-2xl border-2 border-ink/40 bg-white p-5">
        <p className="flex items-start gap-2.5 text-sm text-ink/80">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <span>
            <strong>Standing commitment.</strong> No users, restaurants, partners, outcomes, revenue, or health effects
            are claimed here or anywhere in the product unless they are recorded, dated, and reproducible. The current
            catalog is demonstration data; orders are prototype orders; every simulated state is labeled simulated.
          </span>
        </p>
      </div>

      {/* Pilot metrics — pre-registered */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <FlaskConical className="h-5 w-5 text-ink/40" /> Pilot metrics — pre-registered
        </h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Defined now, measured when the Boston independent-restaurant pilot runs. Definitions won&apos;t move after the fact.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {METRICS.map((m) => (
            <div key={m.name} className="rounded-2xl border border-black/5 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-bold text-ink">{m.name}</p>
                <span className="shrink-0 rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Defined · not yet measured
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink/65">{m.definition}</p>
              <p className="mt-1.5 text-xs text-ink/45"><em>Why it matters:</em> {m.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Source ledger */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <Scale className="h-5 w-5 text-ink/40" /> Source ledger
        </h2>
        <p className="mt-1.5 text-sm text-ink/55">Where every nutrition number in the catalog comes from, by restaurant.</p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/40 text-left">
                <th className="px-4 py-2.5 font-bold text-ink">Restaurant</th>
                <th className="px-4 py-2.5 font-bold text-ink">Dishes</th>
                <th className="px-4 py-2.5 font-bold text-ink">Data source</th>
              </tr>
            </thead>
            <tbody>
              {RESTAURANTS.map((r) => (
                <tr key={r.slug} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-ink">{r.name}</td>
                  <td className="px-4 py-2.5 tabular-nums text-ink/70">{r.menu.length}</td>
                  <td className="px-4 py-2.5">
                    {r.partner ? (
                      <span className="inline-flex items-center gap-1 text-brand-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Demo partner-verified pattern
                      </span>
                    ) : (
                      <span className="text-ink/60">Engine estimate from menu (±15%)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-black/5 px-4 py-3 text-xs text-ink/50">
            {RESTAURANTS.length} restaurants · {dishes} dishes · {partnerDishes} dishes under the partner-verified pattern.
            The entire catalog is <strong>demonstration data</strong> modeled on Boston restaurants — no restaurant has
            authorized or reviewed these listings yet. This table becomes the real ledger as pilot restaurants sign on.
          </p>
        </div>
      </section>

      {/* Activity on this device — honest, small, labeled */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <ClipboardList className="h-5 w-5 text-ink/40" /> Recorded activity
        </h2>
        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 text-sm text-ink/70">
          <p>
            Corrections recorded via the demo partner terminal on this device:{" "}
            <strong className={cls("tabular-nums", counts.corrections > 0 && "text-brand-700")}>{counts.corrections}</strong>
            {counts.corrections > 0 ? " — each versioned and timestamped." : "."}
          </p>
          <p className="mt-2 text-xs text-ink/45">
            No aggregate usage statistics are published because none have been measured. When the pilot produces real
            numbers, they will appear here with methodology.
          </p>
        </div>
      </section>

      {/* Evidence artifacts */}
      <section className="mt-10 border-t-2 border-ink/40 pt-6">
        <h2 className="font-display text-xl font-extrabold text-ink">How this product accumulates evidence</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          Dated, tagged releases with changelogs. Orders stamped as prototype so demo data can never masquerade as
          traction. Meal-log entries that carry source, order reference, portion, and two confidence dimensions —
          exportable as JSON. Menu corrections that are versioned and public. Pre-registered pilot metrics. Each is a
          by-product of using the product, not a claim written after the fact.
        </p>
      </section>
    </div>
  );
}
