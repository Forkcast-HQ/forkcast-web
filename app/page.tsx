import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KineticHero } from "@/components/KineticHero";
import { HeroDemo } from "@/components/HeroDemo";
import { ProofFigures } from "@/components/ProofFigures";
import { PalatifyMark } from "@/components/PalatifyMark";

const BAND_PHRASES = [
  "a fit score on every dish",
  "every number shows its source",
  "independent kitchens, not just chains",
  "free to start",
];

const STEPS = [
  { n: "01", t: "Tell us the goal", b: "Height, weight, activity, what you avoid. Sixty seconds, once." },
  { n: "02", t: "Menus re-rank", b: "Every dish nearby is scored against what's left of your day." },
  { n: "03", t: "Order knowing", b: "Protein, sodium, calories — and where each number came from." },
];

/**
 * Landing page — deliberately ultra-minimal.
 *
 * Four beats: the hero object, one live proof that the engine is real, the
 * evidence, and one CTA. The stats band, problem section, four-step
 * explainer and catalog carousel that used to live here all still exist on
 * /how-it-works, /impact and /discover — this page's job is to make someone
 * want to click, not to brief them.
 */
export default function Home() {
  return (
    <>
      <KineticHero />

      {/* ---------------- INK BAND ----------------
          A moving seam between the hero and the proof, and the only place
          the promise is stated as a flat claim. */}
      <section className="overflow-hidden border-y-2 border-ink bg-ink py-5" aria-hidden="true">
        <div className="marquee">
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

      {/* ---------------- THE EVIDENCE ---------------- */}
      <section className="bg-cream">
        <ProofFigures />
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative overflow-hidden border-t-2 border-ink bg-ink">
        {/* The mark, oversized and cropped, as the only ornament */}
        <PalatifyMark
          r={30}
          stroke={1.1}
          inkColor="rgba(243,242,242,0.16)"
          accentColor="rgba(236,48,19,0.85)"
          animate={false}
          className="pointer-events-none absolute -right-[16%] top-1/2 aspect-square h-[150%] -translate-y-1/2 overflow-visible"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="kicker text-brand-500">Boston first</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5.6vw,4.25rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-cream text-balance">
              Know before you order.
            </h2>
            <p className="mt-5 max-w-md text-lg text-cream/60">
              Sixty seconds to a plan. Free to start, no card.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white"
              >
                <span className="absolute inset-0 -translate-x-full bg-cream transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                <span className="relative transition-colors group-hover:text-ink">Build my plan</span>
                <ArrowRight className="relative h-4.5 w-4.5 transition group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center rounded-full border-2 border-cream/25 px-8 py-4 text-base font-bold text-cream transition hover:border-cream"
              >
                Browse Boston first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
