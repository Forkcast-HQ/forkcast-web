import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KineticHero } from "@/components/KineticHero";
import { HeroDemo } from "@/components/HeroDemo";
import { LiquidField } from "@/components/LiquidField";
import { ClosingCtas } from "@/components/LandingCtas";
import { PalatifyMark } from "@/components/PalatifyMark";

const BAND_PHRASES = [
  "a fit score on every dish",
  "an ai coach that knows your day",
  "every number shows its source",
  "photograph a plate, get the macros",
  "independent kitchens, not just chains",
  "free to start",
];

/**
 * Where the AI actually is.
 *
 * Stated at this level of precision on purpose. All three of these run a
 * real vision/language model server-side (app/api/analyze, app/api/chat) —
 * but the Fit Score does not, and calling it "AI" would be both untrue and
 * self-defeating: the reason a Palatify number can show its working is that
 * a published formula produced it. So the AI reads, and the arithmetic
 * ranks, and the page says which is which.
 */
const AI_WORK = [
  {
    t: "It reads any menu",
    b: "A restaurant's own ingredient list becomes per-dish calories, protein, sodium and fibre — no lab bill, and the kitchen corrects anything off before it publishes.",
  },
  {
    t: "It reads your plate",
    b: "Photograph what you actually ate, or just describe it. You get an estimate with a confidence level, and you confirm or fix it in a tap.",
  },
  {
    t: "It answers in plain language",
    b: "Ask what to order and why, against the numbers left in your day. It won't diagnose, prescribe, or invent a dish that doesn't exist.",
  },
];

const STEPS = [
  { n: "01", t: "Tell us the goal", b: "Height, weight, activity, what you avoid. Sixty seconds, once." },
  { n: "02", t: "Menus re-rank", b: "Every dish nearby is scored against what's left of your day." },
  { n: "03", t: "Order knowing", b: "Protein, sodium, calories — and where each number came from." },
];

export const metadata = {
  title: "Palatify — Eat out. Stay on plan.",
  alternates: { canonical: "/" },
};

/**
 * Landing page — deliberately ultra-minimal.
 *
 * Three beats: the hero object, one live proof that the engine is real, and
 * one CTA. The stats band, problem section, four-step explainer and catalog
 * carousel that used to live here all still exist on /how-it-works, /impact
 * and /discover — this page's job is to make someone want to click, not to
 * brief them. The three evidence figures moved to /how-it-works for the same
 * reason: they argue that the problem is real, which is a thing you read
 * *after* you have decided to care.
 */
export default function Home() {
  return (
    <>
      <KineticHero />

      {/* ---------------- INK BAND ----------------
          A moving seam between the hero and the proof, and the only place
          the promise is stated as a flat claim. The visual track is hidden
          from assistive tech — a scrolling duplicated list is noise to read
          through — and the same four claims are given once, in order, to
          screen readers instead. */}
      <section className="overflow-hidden border-y-2 border-ink bg-ink py-5">
        <h2 className="sr-only">What you get</h2>
        <ul className="sr-only">
          {BAND_PHRASES.map((phrase) => (
            <li key={phrase}>{phrase}</li>
          ))}
        </ul>
        <div className="marquee" aria-hidden="true">
          <div className="band-track flex w-max items-center gap-10 whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex items-center gap-10">
                {BAND_PHRASES.map((phrase) => (
                  <span key={phrase} className="flex items-center gap-10">
                    <span className="font-display text-2xl font-extrabold lowercase tracking-tight text-cream sm:text-3xl">
                      {phrase}
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- THE ENGINE, LIVE ---------------- */}
      <section id="engine" className="scroll-mt-24 border-b-2 border-ink/40 bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Left column carries the three steps, so it stands as tall as
                the demo card instead of leaving a hole beneath a headline. */}
            <div>
              <p className="kicker text-brand-700">Not a mockup</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.025em] text-ink text-balance">
                This is the real engine, running here.
              </h2>
              <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink/65">
                Change the goal on the card. Watch every dish re-rank. Nothing
                is pre-computed for the demo.
              </p>

              <ol className="mt-10 space-y-0">
                {STEPS.map((s) => (
                  <li
                    key={s.n}
                    className="group flex gap-5 border-t border-ink/15 py-5 last:border-b"
                  >
                    <span className="font-display text-sm font-extrabold tabular-nums text-brand-600">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold text-ink">{s.t}</p>
                      <p className="mt-1 max-w-xs text-sm leading-snug text-ink/60">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <Link
                href="/how-it-works"
                className="link-wipe mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-ink"
              >
                How the score is built <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="reveal is-in">
              <HeroDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- THE AI ---------------- */}
      <section className="border-b-2 border-ink/40 bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="kicker text-brand-700">The engine underneath</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.025em] text-ink text-balance">
              AI does the reading. A formula does the ranking.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/65">
              Turning a menu, a photograph or a question into real numbers is
              the part that needs a model. Deciding what fits your day is the
              part that needs to be explainable.
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-0">
            {AI_WORK.map((a, i) => (
              <div
                key={a.t}
                className="border-t-2 border-ink/15 pt-7 sm:border-l sm:border-t-0 sm:px-8 sm:pt-0 sm:first:border-l-0 sm:first:pl-0"
              >
                <span className="font-display text-sm font-extrabold tabular-nums text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{a.t}</h3>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-ink/65">
                  {a.b}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 max-w-3xl border-l-2 border-brand-600 pl-5 text-[15px] leading-relaxed text-ink/70">
            <strong className="text-ink">The Fit Score itself is not AI.</strong>{" "}
            It&apos;s five weighted sub-scores from a published formula, which is
            exactly why a dish can always tell you why it ranked where it did.{" "}
            <Link href="/how-it-works" className="font-bold text-brand-700 hover:underline">
              See the whole calculation
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ---------------- CTA ----------------
          The page opens and closes on the same material: the liquid ground
          again, in ink, so the last screen is recognisably the first one
          after dark rather than a flat slab. */}
      <section className="relative overflow-hidden border-t-2 border-ink bg-ink">
        <LiquidField className="liquid" tone="ink" />
        {/* The mark, oversized and cropped, as the only ornament. Pulled in
            from -14% because at that offset the crop fell right through the
            lift: what showed was an anonymous grey crescent with the one
            persimmon element in the identity entirely off-canvas. */}
        <PalatifyMark
          stroke={2.2}
          inkColor="rgba(247,244,240,0.14)"
          accentColor="rgba(236,48,19,0.85)"
          animate={false}
          className="pointer-events-none absolute -right-[3%] top-1/2 aspect-square h-[132%] -translate-y-1/2 overflow-visible"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="kicker text-brand-500">Boston first</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5.6vw,4.25rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-cream text-balance">
              Know before you order.
            </h2>
            <ClosingCtas />
          </div>
        </div>
      </section>
    </>
  );
}
