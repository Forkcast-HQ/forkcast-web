import Link from "next/link";
import {
  ArrowRight,
  Camera,
  HeartPulse,
  MapPin,
  Sparkles,
  Store,
  TrendingDown,
  Utensils,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { RestaurantCard } from "@/components/RestaurantCard";
import { HeroDemo } from "@/components/HeroDemo";
import { restaurantImg, foodImg } from "@/lib/images";
import { RESTAURANTS } from "@/data/restaurants";

export default function Home() {
  const featured = RESTAURANTS.filter((r) => r.partner).slice(0, 3);

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
              Interactive Boston pilot · sample catalog
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl text-balance">
              Know what you&apos;ll eat,{" "}
              <span className="italic text-brand-600">before you sit down.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">
              Your goals become a daily plan. Nearby menus re-rank around it.
              Try it live — that card is the real engine. →
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                Build my plan <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-base font-semibold text-ink transition hover:border-black/20"
              >
                <MapPin className="h-5 w-5 text-brand-600" /> Browse restaurants
              </Link>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/55" aria-label="Product highlights">
              {['Personal Fit Scores', 'Explainable nutrition', 'No payment required'].map((item) => (
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

      {/* ---------------- STAT BAND ---------------- */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Stat figure="58.5%" label="of U.S. food spending is now eaten away from home — an all-time high" cite="USDA ERS, 2023" />
          <Stat figure="2 in 3" label="diners underestimate their restaurant meal's calories; 1 in 4 by 500+" cite="Peer-reviewed, BMJ/JAMA" />
          <Stat figure="40.3%" label="of U.S. adults have obesity; 21% of children" cite="CDC NHANES, 2021-23" />
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
              A third of American calories are eaten out — and every existing app
              reacts <em>after</em> the plate is empty. Forkcast acts <strong>before</strong> you order.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProblemPoint icon={<TrendingDown className="h-5 w-5" />} title="Guesswork, not data" body="Independent-restaurant menus rarely show protein, sodium, or carbs — labeling rules only cover chains." />
              <ProblemPoint icon={<Camera className="h-5 w-5" />} title="Too late to help" body="Log-after apps are accounting, not coaching. Labels alone shift intake by ~24 cal per order." />
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-black/5 card-shadow-lg">
              <SmartImage
                src={foodImg("restaurant,table,food,friends", 902, 1000, 800)}
                alt="Eating out"
                label="Eating out"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 max-w-[220px] rounded-2xl border border-black/5 bg-white p-4 card-shadow">
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
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <SectionTag dark>How it works</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Your health profile becomes a daily eating-out plan.
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Four steps. No calorie diary required to get value on day one.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Step n="01" icon={<HeartPulse className="h-6 w-6" />} title="Build your cabinet" body="Enter height, weight, age, activity and goal. We compute your BMI, BMR/TDEE and macro targets with real formulas." />
            <Step n="02" icon={<Sparkles className="h-6 w-6" />} title="Get matched dishes" body="Every nearby dish gets a personal Fit Score — calories, protein density, fiber, sodium, sugar — ranked for you." />
            <Step n="03" icon={<Utensils className="h-6 w-6" />} title="Order or walk in" body="Add it to your day in one tap. Delivery, pickup, or just go eat — your plan updates instantly." />
            <Step n="04" icon={<Camera className="h-6 w-6" />} title="Snap to confirm" body="Photo-log what you actually ate. We reconcile it against your plan and your weekly trend." />
          </div>
          <div className="mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-white/90"
            >
              See the full system <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST CONTRAST ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionTag>Why it&apos;s different</SectionTag>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl text-balance">
            Other apps show you a number. We show you where it came from.
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Typical AI menu app — flat assertion */}
          <div className="rounded-3xl border border-black/10 bg-white p-7 opacity-90">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/40">Typical AI menu app</p>
            <div className="mt-5 rounded-2xl border border-black/10 bg-neutral-100 p-5">
              <p className="font-display text-lg font-bold text-ink">Grilled Chicken Bowl</p>
              <p className="mt-3 font-display text-4xl font-extrabold text-ink">540 <span className="text-lg text-ink/50">cal</span></p>
              <p className="mt-1 text-sm text-ink/45">Presented as fact. No source. No range. No way to correct it.</p>
            </div>
            <ul className="mt-5 space-y-2.5 text-ink/60">
              <CompareLi ok={false}>&quot;22 million locations&quot; — AI guesses at scale</CompareLi>
              <CompareLi ok={false}>Restaurants never see or verify their data</CompareLi>
              <CompareLi ok={false}>Recommendation is a dead end — no order, no log</CompareLi>
            </ul>
          </div>
          {/* Forkcast — evidence-carrying number */}
          <div className="rounded-3xl border-2 border-brand-500 bg-brand-50/50 p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Forkcast</p>
            <div className="mt-5 rounded-2xl border border-black/5 bg-white p-5 card-shadow">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-lg font-bold text-ink">Grilled Chicken Bowl</p>
                <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Verified</span>
              </div>
              <p className="mt-3 font-display text-4xl font-extrabold text-ink">
                540 <span className="text-lg text-ink/50">cal</span>{" "}
                <span className="align-middle text-base font-bold text-ink/40">±5%</span>
              </p>
              <p className="mt-1 text-sm text-ink/55">Reviewed with the restaurant · corrections versioned &amp; public · sponsored never changes scores</p>
            </div>
            <ul className="mt-5 space-y-2.5 text-ink/75">
              <CompareLi ok>Every number carries a source and a ± range</CompareLi>
              <CompareLi ok>Restaurants review and correct their own menus</CompareLi>
              <CompareLi ok>Decision → order → confirmed log, one loop</CompareLi>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink/50">
          Depth over breadth: every dish verified or honestly labeled an estimate — one market at a time, starting with
          Boston&apos;s independent restaurants.
        </p>
      </section>

      {/* ---------------- FEATURED RESTAURANTS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <SectionTag>Sample catalog</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Explore the Boston pilot experience
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink/55">Representative listings show how personalized discovery works before live restaurant onboarding.</p>
          </div>
          <Link href="/discover" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <RestaurantCard key={r.slug} restaurant={r} />
          ))}
        </div>
      </section>

      {/* ---------------- FOR RESTAURANTS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink text-white">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80">
                <Store className="h-4 w-4" /> For restaurants
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Get discovered by diners who came to eat well.
              </h2>
              <p className="mt-4 text-lg text-white/70">
                We turn your menu into per-dish nutrition, surface your best
                options to people actively trying to hit their goals, and send you
                higher-intent, higher-retention customers.
              </p>
              <Link
                href="/for-restaurants"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-400"
              >
                Partner with Forkcast <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <SmartImage
                src={restaurantImg("salad-bar")}
                alt="Restaurant partner"
                label="Partner restaurant"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-10 text-center sm:p-16">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl text-balance">
            Build your plan in 60 seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink/65">
            See your numbers, then watch nearby menus reorder themselves around your goals.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Get started — it&apos;s free <ArrowRight className="h-5 w-5" />
          </Link>
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

function Step({ n, icon, title, body }: { n: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">{icon}</div>
        <span className="font-display text-2xl font-extrabold text-white/15">{n}</span>
      </div>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      <p className="mt-2 text-sm text-white/60">{body}</p>
    </div>
  );
}

function CompareLi({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${ok ? "bg-brand-600 text-white" : "bg-black/10 text-ink/50"}`}>
        {ok ? "✓" : "×"}
      </span>
      <span className="text-sm">{children}</span>
    </li>
  );
}
