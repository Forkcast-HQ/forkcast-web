import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, LineChart, Users, Utensils } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { HowItWorksRestaurant } from "@/components/HowItWorksRestaurant";
import { restaurantImg } from "@/lib/images";

export const metadata = {
  title: "For restaurants",
  description:
    "List your restaurant on Palatify. Free forever, live in a day, and you only pay when we send you an order.",
};

/**
 * /for-restaurants — aimed at one reader: someone who runs a restaurant and
 * is deciding whether to list.
 *
 * Two things were wrong with the previous version. The three pricing cards
 * had no call to action of any kind, so the commercial terms — the part a
 * restaurateur scrolls to first — dead-ended; and one of them wore a "Most
 * popular" badge, which frames three parts of a single model (free listing,
 * commission on orders we originate, optional placement later) as three
 * plans to choose between. Nobody chooses the 6%.
 *
 * Also cut: a stats block arguing that DoorDash makes a billion a year on
 * in-app placement, and that 72% of U.S. adults have an elevated BMI. Both
 * are investor arguments. Read from the other side of the table the first
 * says "we intend to sell ads against you" and the second describes your
 * customers as a demand pool.
 *
 * What replaced them is the thing the page was missing: a plain account of
 * what listing actually involves, taken from the real form in
 * app/partner/onboarding — so nobody arrives at step one surprised.
 */

/** Exactly what app/partner/onboarding asks for, in the order it asks. */
const NEEDED = [
  "Your name, cuisine, neighbourhood and address",
  "A one-line description of the place",
  "Each dish: name, price, and what's in it",
  "Nutrition — AI fills it in from the ingredients; you correct it",
];

export default function ForRestaurants() {
  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <BadgeCheck className="h-4 w-4" /> For restaurants
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink text-balance">
              Get your menu in front of diners who came to eat well.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/65">
              Publish per-dish nutrition without a lab bill, and be the
              recommendation for people already choosing around a goal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?role=restaurant"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"
              >
                List my restaurant — free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/restaurant/verdant"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition hover:border-ink/35"
              >
                See a live listing
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink/50">
              Free forever · no card · walk-ins and your own channels are never charged
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-ink/5 card-shadow-lg">
            <SmartImage
              src={restaurantImg("grill")}
              alt="A partner restaurant kitchen"
              label="Partner restaurant"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------------- What you get ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Benefit
            icon={<Utensils className="h-6 w-6" />}
            title="AI reads your menu"
            body="Paste a dish and its ingredients; AI returns calories, protein, carbs, fat, fibre, sodium and sugar. You review and correct every number before it goes live."
          />
          <Benefit
            icon={<Users className="h-6 w-6" />}
            title="Higher-intent diners"
            body="Our diners are choosing around a goal. When your dish fits, you're the recommendation — not one of fifty thumbnails."
          />
          <Benefit
            icon={<LineChart className="h-6 w-6" />}
            title="Insight you can act on"
            body="Which dishes win, what diners near you search for, and where a lighter option would capture demand you're missing."
          />
        </div>
      </section>

      {/* ---------------- How to list ---------------- */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="kicker text-brand-300">Getting listed</p>
          <h2 className="mt-3 font-display text-3xl font-bold">Live in four steps.</h2>
          <div className="mt-10">
            <HowItWorksRestaurant />
          </div>

          <div className="mt-12 grid gap-8 rounded-2xl border border-white/10 bg-white/[0.04] p-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="font-display text-lg font-bold">What you'll need to hand</h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {NEEDED.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/signup?role=restaurant"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 text-base font-bold text-ink transition hover:bg-white/90 sm:self-center"
            >
              Start listing <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- What it costs ---------------- */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="kicker text-brand-600">What it costs</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink text-balance">
            One model. You pay only when we bring you an order.
          </h2>
          <p className="mt-3 text-ink/65">
            Not three plans to pick between — the listing is free, the
            commission only applies to orders we originate, and placement is
            something to talk about much later.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PriceCard
            name="Your listing"
            price="Free"
            sub="forever"
            features={[
              "Order terminal with customer allergy flags",
              "Menu verification & public corrections",
              "Verified badge on your listing",
              "Listing analytics",
            ]}
            cta={{ href: "/signup?role=restaurant", label: "Start free" }}
          />
          <PriceCard
            name="Orders we originate"
            price="6%"
            sub="per pickup order"
            features={[
              "Only on orders we send you",
              "Against 15–30% at the delivery marketplaces",
              "Nothing on walk-ins or your own channels",
            ]}
            highlight
            note="Included automatically — nothing to switch on."
          />
          <PriceCard
            name="Featured placement"
            price="From $99"
            sub="/month"
            features={[
              "Always labelled as placement",
              "Never affects a Fit Score or a ranking",
              "Only once the order channel has proven itself",
            ]}
            muted
            note="Not available yet. No sign-up, nothing to opt into."
          />
        </div>

        <p className="mt-8 max-w-3xl text-sm text-ink/50">
          Early-partner terms, subject to a partner agreement. Sponsored
          placement is always labelled — recommendation integrity is the
          product, so it is the one thing that is never for sale.
        </p>

        <div className="mt-12 border-t border-ink/10 pt-12 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            Ready to be on the menu?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-ink/60">
            Set up your listing in a sitting. Nothing goes live until you press
            publish.
          </p>
          <Link
            href="/signup?role=restaurant"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white transition hover:bg-brand-700"
          >
            List my restaurant <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function Benefit({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-6">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

/**
 * A card ends in exactly one of two things: a button that does something, or
 * a sentence saying why there is no button. The previous version ended in
 * neither, which left the commercial terms looking like a form you could
 * fill in and then couldn't.
 */
function PriceCard({
  name,
  price,
  sub,
  features,
  highlight,
  muted,
  cta,
  note,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  highlight?: boolean;
  muted?: boolean;
  cta?: { href: string; label: string };
  note?: string;
}) {
  return (
    <div
      className={[
        "flex flex-col rounded-2xl border p-7",
        highlight ? "border-2 border-brand-500 bg-brand-50/40" : "border-ink/10 bg-white",
        muted ? "opacity-75" : "",
      ].join(" ")}
    >
      <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
      <p className="mt-3">
        <span className="font-display text-4xl font-extrabold text-ink">{price}</span>
        <span className="ml-1 text-sm text-ink/50">{sub}</span>
      </p>

      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 grow" />
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition hover:bg-brand-600"
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <p className="text-sm font-medium text-ink/45">{note}</p>
      )}
    </div>
  );
}
