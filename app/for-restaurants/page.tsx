import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Users,
  LineChart,
  Utensils,
  Upload,
  Megaphone,
  Check,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { HowItWorksRestaurant } from "@/components/HowItWorksRestaurant";
import { restaurantImg } from "@/lib/images";

export const metadata = {
  title: "For restaurants — Forkcast",
  description: "Get discovered by diners who came to eat well.",
};

export default function ForRestaurants() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <BadgeCheck className="h-4 w-4" /> For restaurants
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl text-balance">
              Get discovered by diners who came to eat well.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/65">
              Forkcast turns your menu into per-dish nutrition, surfaces your best
              options to people actively chasing a goal, and sends you higher-intent,
              more loyal customers — chains and independents alike.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?role=restaurant"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700"
              >
                Become a partner <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/restaurant/verdant" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-base font-semibold text-ink hover:border-black/20">
                See a partner page
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-black/5 card-shadow-lg">
            <SmartImage
              src={restaurantImg("grill")}
              alt="Restaurant kitchen"
              label="Partner restaurant"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Benefit
            icon={<Users className="h-6 w-6" />}
            title="Higher-intent customers"
            body="Our diners are choosing around a goal — when your dish fits, you're the recommendation, not one of fifty thumbnails."
          />
          <Benefit
            icon={<Utensils className="h-6 w-6" />}
            title="Free menu nutrition"
            body="We compute per-dish calories and macros for your whole menu — the transparency big chains have, without the lab bill."
          />
          <Benefit
            icon={<LineChart className="h-6 w-6" />}
            title="Insight you can use"
            body="See which dishes win, what diners near you search for, and where a lighter option would capture missed demand."
          />
        </div>
      </section>

      {/* How */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-300">Onboarding</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Live in four steps.</h2>
          <div className="mt-10">
            <HowItWorksRestaurant />
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <Proof figure="58.5%" label="of U.S. food spending is now away from home — and growing" cite="USDA ERS, 2023" />
          <Proof figure="$1B+" label="ad/retail-media run-rate proves diners act on in-app placement (DoorDash)" cite="DoorDash IR, 2024–25" />
          <Proof figure="72%" label="of U.S. adults have elevated BMI — your health-minded demand pool" cite="CDC, 2024" />
        </div>
      </section>

      {/* How partnership works — every dollar earned, no flat fees */}
      <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <PriceCard
            name="Verified Partner"
            price="Free"
            sub="forever"
            features={["Order terminal with customer allergy flags", "Menu verification & public corrections", "Verified badge on your listing", "Listing analytics"]}
          />
          <PriceCard
            name="Orders we bring you"
            price="6%"
            sub="per pickup order we originate"
            features={["Pay only when we deliver a customer", "vs. 15–30% you pay delivery marketplaces", "No fee for walk-ins or your own channels"]}
            highlight
          />
          <PriceCard
            name="Featured"
            price="From $99"
            sub="/month · optional, later"
            features={["Clearly-labeled placement", "Available once the order channel proves itself", "Never affects Fit Scores"]}
          />
        </div>
        <p className="mt-6 text-center text-sm text-ink/50">
          Early-partner terms, subject to partner agreements. Sponsored placement is always labeled —
          recommendation integrity is the product.
        </p>
        <div className="mt-8 text-center">
          <Link
            href="/signup?role=restaurant"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white hover:bg-brand-700"
          >
            Partner with Forkcast <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function Benefit({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

function Step({ n, icon, title, body }: { n: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">{icon}</span>
        <span className="font-display text-2xl font-extrabold text-white/15">{n}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/60">{body}</p>
    </div>
  );
}

function Proof({ figure, label, cite }: { figure: string; label: string; cite: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 text-center">
      <p className="font-display text-4xl font-extrabold text-brand-600">{figure}</p>
      <p className="mx-auto mt-2 max-w-[26ch] text-sm text-ink/65">{label}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-ink/35">{cite}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  sub,
  features,
  highlight,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-7 ${highlight ? "border-2 border-brand-500 bg-brand-50/40" : "border-black/10 bg-white"}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
        {highlight && <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">Most popular</span>}
      </div>
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
    </div>
  );
}
