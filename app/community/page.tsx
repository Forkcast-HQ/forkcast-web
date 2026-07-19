// Community — health events around the Boston pilot.
// HONEST STATE: no events are scheduled yet. This page shows the plan and
// collects interest; events go live with the pilot. Nothing here pretends
// an event, partner, or RSVP exists.

import Link from "next/link";
import { CalendarDays, ChefHat, Footprints, HeartPulse, Store, Users } from "lucide-react";

export const metadata = { title: "Community — Forkcast" };

const PLANNED = [
  {
    icon: <Footprints className="h-5 w-5" />,
    title: "Neighborhood walk & lunch",
    body: "A guided group walk that ends at a verified partner restaurant, with a best-fit menu preview before you arrive.",
  },
  {
    icon: <ChefHat className="h-5 w-5" />,
    title: "Partner kitchen tastings",
    body: "Independent restaurants walk through how a dish is made — portions, oils, swaps — and verify its nutrition with diners in the room.",
  },
  {
    icon: <HeartPulse className="h-5 w-5" />,
    title: "Eating out with a condition",
    body: "Practical sessions on navigating menus with hypertension, diabetes, or food allergies — with a dietitian, not influencer advice.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "GLP-1 companions table",
    body: "Small-group meetups for people on GLP-1 medications figuring out restaurant portions and protein together.",
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="kicker text-brand-700">Boston</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-ink sm:text-4xl">Community</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/65">
        Eating well is easier together. Alongside the app, Forkcast will run free, health-focused community
        events with our partner restaurants.
      </p>

      {/* Honest state */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-ink/40 bg-white p-5">
        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-sm text-ink/70">
          <strong className="text-ink">No events are scheduled yet.</strong> The calendar opens when Forkcast launches in Boston
          with its first verified partner restaurants. What follows is the plan — not a promise of dates.
        </p>
      </div>

      <h2 className="mt-10 font-display text-xl font-extrabold text-ink">What we're planning</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {PLANNED.map((e) => (
          <div key={e.title} className="rounded-2xl border border-black/5 bg-white p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">{e.icon}</span>
            <p className="mt-3 font-display font-bold text-ink">{e.title}</p>
            <p className="mt-1 text-sm text-ink/60">{e.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-ink p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-bold"><Store className="h-5 w-5 text-brand-400" /> Run a restaurant?</p>
            <p className="mt-1 max-w-md text-sm text-white/70">
              Community events are built with partner restaurants — hosting a tasting is one of the ways diners meet you.
            </p>
          </div>
          <Link href="/for-restaurants" className="shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500">
            Become a partner
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-ink/45">
        Interested in hearing when events go live? Create an account — members will be invited first.
      </p>
    </div>
  );
}
