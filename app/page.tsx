import Link from "next/link";
import {
  ArrowRight,
  Camera,
  HeartPulse,
  MapPin,
  Sparkles,
  TrendingDown,
  Utensils,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { HowItWorks } from "@/components/HowItWorks";
import { HeroDemo } from "@/components/HeroDemo";
import { HeroSearch } from "@/components/HeroSearch";
import { DishMarquee } from "@/components/DishMarquee";
import { ShowcaseCarousel } from "@/components/ShowcaseCarousel";
import { categoryImg, editorialImg } from "@/lib/images";
import { RESTAURANTS } from "@/data/restaurants";

export default function Home() {
  const featured = RESTAURANTS;

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 sm:pt-16 lg:min-h-[680px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              Live demo · Boston catalog
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl text-balance">
              Know what you&apos;ll eat{" "}
              <span className="italic text-brand-600">before you sit down.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">
              Set your goals once. Every menu nearby re-ranks around what&apos;s left of
              your day — and the demo card here is the real engine. Try it.
            </p>

            {/* Big search — straight into personalized discovery */}
            <HeroSearch />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                Build my plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/discover?view=map"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-black/20"
              >
                <MapPin className="h-4 w-4 text-brand-600" /> Open the map
              </Link>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/55" aria-label="Product highlights">
              {['A Fit Score on every dish', 'Every number shows its source', 'Free to start'].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-sage-100 text-[10px] font-black text-sage-700" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Live product demo — the real engine, interactive */}
          <div className="relative animate-rise lg:justify-self-end">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ---------------- DISH TICKER ---------------- */}
      <DishMarquee />

      {/* ---------------- STAT BAND ---------------- */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Stat figure="58.5%" label="of U.S. food spending now happens away from home — an all-time high" cite="USDA ERS, 2023" />
          <Stat figure="2 in 3" label="diners underestimate their restaurant meal's calories — 1 in 4 by 500 or more" cite="Peer-reviewed, BMJ/JAMA" />
          <Stat figure="40.3%" label="of U.S. adults have obesity, along with 21% of children" cite="CDC NHANES, 2021–23" />
          <Stat figure="$173B" label="annual U.S. medical cost of obesity alone" cite="CDC, 2024" />
        </div>
      </section>

      {/* ---------------- PROBLEM ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionTag>The problem</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl text-balance">
              Eating out is the new normal — and it&apos;s where good intentions fall apart.
            </h2>
            <p className="mt-5 text-lg text-ink/65">
              Americans now eat a third of their calories away from home — and every
              existing app reacts <em>after</em> the plate is empty. Forkcast acts{" "}
              <strong>before</strong> you order.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProblemPoint icon={<TrendingDown className="h-5 w-5" />} title="Guesswork, not data" body="Independent restaurants rarely publish protein, sodium, or carbs — federal labeling rules only cover chains." />
              <ProblemPoint icon={<Camera className="h-5 w-5" />} title="Too late to help" body="Log-after apps are accounting, not coaching — and menu labels alone shift intake by only ~24 calories per order." />
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-black/5 card-shadow-lg">
              <div className="relative">
                <SmartImage
                  src={editorialImg("dining-together", 1000, 750)}
                  alt="Friends sharing a meal at a restaurant"
                  label="Eating out"
                  className="aspect-[4/3] w-full object-cover"
                />
                {/* On-image caption with scrim — right-aligned so the floating
                    stat card (bottom-left) never overlaps it */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-6 pb-5 pt-20 sm:text-right">
                  <p className="font-display text-xl font-extrabold leading-snug text-white sm:ml-auto sm:max-w-[24ch]">
                    A third of America&apos;s calories are now eaten out.
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/70">
                    USDA ERS · food-away-from-home, 2023
                  </p>
                </div>
              </div>
            </div>
            {/* Floating secondary photo */}
            <div className="absolute -right-6 -top-10 hidden w-44 rotate-3 overflow-hidden rounded-2xl border-4 border-white card-shadow-lg transition duration-300 hover:rotate-1 sm:block">
              <SmartImage
                src={editorialImg("healthy-table", 440, 550)}
                alt="Fresh, healthy bowls on a table"
                label="What fits"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            {/* Stat card: flows below the image on mobile, floats over the
                bottom-left corner on larger screens (caption is right-aligned) */}
            <div className="mt-4 max-w-[220px] rounded-2xl border border-black/5 bg-white p-4 card-shadow sm:absolute sm:-bottom-5 sm:-left-5 sm:mt-0">
              <p className="font-display text-3xl font-extrabold text-brand-600">~24 cal</p>
              <p className="mt-1 text-sm text-ink/60">
                Average intake change from menu calorie labels alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <SectionTag dark>How it works</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Your health profile becomes a daily eating-out plan.
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Four steps. No calorie diary required to get value on day one.
            </p>
          </div>
          <div className="mt-10">
            <HowItWorks ctaHref="/how-it-works" ctaLabel="See the full system" />
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED RESTAURANTS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <SectionTag>The catalog</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Explore Boston
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink/55">A representative catalog — this is how discovery will feel as real restaurants come aboard.</p>
          </div>
          <Link href="/discover" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Full-catalog showcase carousel */}
        <div className="mt-8">
          <ShowcaseCarousel restaurants={featured} />
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <SmartImage
            src={editorialImg("restaurant-spread", 1600, 640)}
            alt=""
            label="Forkcast"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/70 to-ink/50" />
          <div className="relative p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
              Build your plan in 60 seconds.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
              See your numbers, then watch nearby menus reorder around your goals.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
            >
              Get started — it&apos;s free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- small presentational helpers ---------- */

function Stat({ figure, label, cite }: { figure: string; label: string; cite: string }) {
  return (
    <div className="bg-white px-4 py-8 text-center sm:px-6">
      <p className="font-display text-3xl font-extrabold text-brand-600 sm:text-4xl">{figure}</p>
      <p className="mx-auto mt-2 max-w-[22ch] text-sm text-ink/65">{label}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-ink/35">{cite}</p>
    </div>
  );
}

function SectionTag({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`text-sm font-bold uppercase tracking-widest ${dark ? "text-brand-300" : "text-brand-600"}`}>
      {children}
    </span>
  );
}

function ProblemPoint({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      <p className="mt-3 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{body}</p>
    </div>
  );
}

function Step({ n, icon, title, body, img }: { n: string; icon: React.ReactNode; title: string; body: string; img: string }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="relative h-36 overflow-hidden">
        <SmartImage
          src={img}
          alt=""
          label={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/30 to-transparent" />
        <span className="absolute bottom-1 left-4 font-display text-4xl font-extrabold text-white/40">{n}</span>
        <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-950/60 text-brand-300 backdrop-blur-sm">{icon}</div>
      </div>
      <div className="p-6 pt-4">
        <p className="font-display text-lg font-bold">{title}</p>
        <p className="mt-2 text-sm text-white/60">{body}</p>
      </div>
    </div>
  );
}

