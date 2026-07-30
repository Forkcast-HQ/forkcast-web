import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AiReadout } from "@/components/AiReadout";
import { KineticHero } from "@/components/KineticHero";
import { HeroDemo } from "@/components/HeroDemo";
import { LiquidField } from "@/components/LiquidField";
import { ClosingCtas } from "@/components/LandingCtas";
import { PalatifyMark } from "@/components/PalatifyMark";
import { fetchCatalog } from "@/lib/catalog";

const BAND_PHRASES = [
  "a fit score on every dish",
  "an ai coach that knows your day",
  "every number shows its source",
  "photograph a plate, get the macros",
  "independent kitchens, not just chains",
  "free to start",
];

/**
 * Where the AI is, in three phrases rather than three paragraphs.
 *
 * The prose version of this ran ~90 words per column and nobody was going to
 * read it. The demonstration above them (AiReadout) now carries the argument;
 * these are captions, not copy. Note what is deliberately absent: the Fit
 * Score. It is a formula, not a model, and claiming otherwise would trade the
 * one thing that lets a Palatify number show its working for a buzzword.
 */
const AI_WORK = [
  { t: "Menus", b: "An ingredient list becomes per-dish macros." },
  { t: "Plates", b: "Photograph dinner. Confirm or correct in a tap." },
  { t: "Questions", b: "Ask what to order, against today's numbers." },
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
export default async function Home() {
  // Real counts, read at build time. The closing band used to restate the
  // hero's pitch in different words; it now says something the hero can't.
  const catalog = await fetchCatalog();
  const kitchens = catalog.length;
  const dishes = catalog.reduce((n, r) => n + r.menu.length, 0);

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
          {/* items-center, not the default stretch: the left column is
              shorter than the demo card, and stretching pooled ~270px of dead
              space under the card. The sub-paragraph that used to sit here
              said what the heading already says. */}
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <p className="kicker text-brand-700">Not a mockup</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.025em] text-ink text-balance">
                The real engine, running here.
              </h2>
              <p className="mt-4 max-w-sm text-lg leading-relaxed text-ink/65">
                Change the goal. Everything re-ranks.
              </p>

              <ol className="mt-8 space-y-0">
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

      {/* ---------------- THE AI ----------------
          Shown, not explained. The demonstration is the section; the three
          captions under it exist only so the scope is unambiguous. */}
      <section className="border-b-2 border-ink/40 bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="kicker text-brand-700">The engine underneath</p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.025em] text-ink text-balance">
            AI does the reading. A formula does the ranking.
          </h2>

          <div className="mt-10">
            <AiReadout />
          </div>

          <div className="mt-10 flex flex-wrap items-start gap-x-12 gap-y-6">
            {AI_WORK.map((a) => (
              <div key={a.t} className="min-w-[13rem] flex-1">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.08em] text-ink">
                  {a.t}
                </h3>
                <p className="mt-1.5 text-[15px] leading-snug text-ink/60">{a.b}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 border-l-2 border-brand-600 pl-5 text-[15px] leading-relaxed text-ink/70">
            <strong className="text-ink">The Fit Score is not AI</strong> — it&apos;s a
            formula, which is why a dish can always tell you why it ranked where it did.{" "}
            <Link href="/how-it-works" className="font-bold text-brand-700 hover:underline">
              See the calculation
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
          <div className="max-w-3xl">
            <p className="kicker text-brand-500">Boston, first</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5.6vw,4.25rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-cream text-balance">
              {kitchens > 0 ? (
                <>
                  {kitchens} kitchens. {dishes} dishes.
                  <br />
                  Every number sourced.
                </>
              ) : (
                <>Every number sourced.</>
              )}
            </h2>
            <ClosingCtas />
          </div>
        </div>
      </section>
    </>
  );
}
