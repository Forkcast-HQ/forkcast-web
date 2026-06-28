import Link from "next/link";
import {
  ArrowRight,
  Camera,
  HeartPulse,
  MapPin,
  Sparkles,
  Store,
  Target,
  TrendingDown,
  Utensils,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { RestaurantCard } from "@/components/RestaurantCard";
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

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              Nutrition-aware ordering, before you eat
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl text-balance">
              Know what you&apos;ll eat,{" "}
              <span className="text-brand-600">before you sit down.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/65">
              Forkcast turns your height, weight and goals into a daily plan — then
              matches you to dishes at nearby restaurants that actually fit it.
              Order or walk in, snap a photo, and stay on track without the guesswork.
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

            <p className="mt-5 text-sm text-ink/50">
              Free to start · No food logging burden · Boston launch
            </p>
          </div>

          {/* Product preview */}
          <div className="relative animate-rise lg:justify-self-end">
            <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-black/5 bg-white card-shadow-lg">
              <div className="relative h-56 w-full">
                <SmartImage
                  src={foodImg("salmon,bowl,quinoa,healthy", 901, 800, 600)}
                  alt="Citrus salmon bowl"
                  label="Citrus Salmon Bowl"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-full bg-brand-600 font-display text-xl font-bold text-white shadow-lg">
                  92
                </div>
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-xs font-medium text-white/80">Char &amp; Greens · Seaport · 1.9 mi</p>
                  <p className="font-display text-lg font-bold">Blackened Salmon Bowl</p>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">Fits your day</span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    Fit Score A
                  </span>
                </div>
                <PreviewBar label="Calories" value="580 / 700 left" pct={58} />
                <PreviewBar label="Protein" value="40g · great" pct={74} color="#059669" />
                <PreviewBar label="Sodium" value="600mg · low" pct={30} color="#f59e0b" />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["High protein", "Good fiber", "Low sugar"].map((t) => (
                    <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -left-6 -top-6 hidden rotate-[-6deg] rounded-2xl border border-black/5 bg-white px-4 py-3 card-shadow sm:block">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-accent/15 text-amber-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-ink/50">Daily target</p>
                  <p className="text-sm font-bold text-ink">1,980 kcal · 150g protein</p>
                </div>
              </div>
            </div>
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
              Americans now eat about a third of their calories away from home. Those
              meals run ~200 calories and ~350mg more sodium than home cooking — and
              we&apos;re terrible at guessing how much. Even mandatory calorie labels
              move intake by only about <strong>24 calories</strong> per order.
            </p>
            <p className="mt-4 text-lg text-ink/65">
              Today&apos;s apps make you log <em>after</em> you&apos;ve already eaten.
              That&apos;s accounting, not coaching. Forkcast flips it: decide what fits{" "}
              <strong>before</strong> you order.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProblemPoint icon={<TrendingDown className="h-5 w-5" />} title="Guesswork, not data" body="Menus rarely show protein, carbs or sodium for independent restaurants." />
              <ProblemPoint icon={<Camera className="h-5 w-5" />} title="Too late to help" body="Photo-calorie apps tell you the damage once the plate is empty." />
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

      {/* ---------------- DIFFERENTIATOR ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionTag>Why it&apos;s different</SectionTag>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl text-balance">
            Plan-ahead beats log-after.
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/40">Today&apos;s apps</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">Log after eating</p>
            <ul className="mt-5 space-y-3 text-ink/65">
              <CompareLi ok={false}>Manual diary — most users quit within weeks</CompareLi>
              <CompareLi ok={false}>Tells you the damage once it&apos;s done</CompareLi>
              <CompareLi ok={false}>Generic database, not restaurant menus</CompareLi>
              <CompareLi ok={false}>No connection to where you actually eat</CompareLi>
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-brand-500 bg-brand-50/50 p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Forkcast</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">Plan before ordering</p>
            <ul className="mt-5 space-y-3 text-ink/75">
              <CompareLi ok>Recommends dishes that already fit your day</CompareLi>
              <CompareLi ok>Acts before the order, when it can still help</CompareLi>
              <CompareLi ok>Real menus from real nearby restaurants</CompareLi>
              <CompareLi ok>Two-sided: restaurants get health-minded diners</CompareLi>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED RESTAURANTS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <SectionTag>On Forkcast now</SectionTag>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Partner restaurants near you
            </h2>
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

function PreviewBar({ label, value, pct, color = "#10b981" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-ink/70">{label}</span>
        <span className="text-ink/50">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

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
