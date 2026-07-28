import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KineticHero } from "@/components/KineticHero";
import { HeroDemo } from "@/components/HeroDemo";

/**
 * Landing page — deliberately ultra-minimal.
 *
 * Four beats: the hero object, one live proof that the engine is real, a
 * three-number credibility strip, and one CTA. The stats band, problem
 * section, four-step explainer and catalog carousel that used to live here
 * all still exist on /how-it-works, /impact and /discover — this page's job
 * is to make someone want to click, not to brief them.
 */
export default function Home() {
  return (
    <>
      <KineticHero />

      {/* ---------------- INK BAND ----------------
          A moving seam between the hero and the proof. Also the only place
          the product's promise is stated as a flat claim. */}
      <section className="overflow-hidden border-y-2 border-ink bg-ink py-5" aria-hidden="true">
        <div className="marquee">
          <div className="band-track flex w-max items-center gap-10 whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex items-center gap-10">
                {[
                  "a fit score on every dish",
                  "every number shows its source",
                  "independent kitchens, not just chains",
                  "free to start",
                ].map((phrase) => (
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
      <section id="engine" className="scroll-mt-20 border-t-2 border-ink/40 bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="kicker text-brand-700">Not a mockup</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.02em] text-ink text-balance">
                This is the real engine, running here.
              </h2>
              <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink/60">
                Change the goal. Watch every dish re-rank. Nothing is
                pre-computed for the demo.
              </p>
              <Link
                href="/how-it-works"
                className="link-wipe mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink"
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

      {/* ---------------- PROOF STRIP ---------------- */}
      <section className="border-t-2 border-ink/40 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Figure
            value="58.5%"
            label="of U.S. food spending happens away from home"
            cite="USDA ERS · 2023"
          />
          <Figure
            value="2 in 3"
            label="diners underestimate their restaurant meal's calories"
            cite="BMJ / JAMA · peer-reviewed"
          />
          <Figure
            value="~24 cal"
            label="all a menu calorie label changes, on its own"
            cite="Cochrane review"
            accent
          />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="border-t-2 border-ink/40 bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-cream text-balance">
            Know before you order.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-cream/55">
            Sixty seconds to a plan. Free to start.
          </p>
          <Link
            href="/signup"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white transition hover:bg-brand-500"
          >
            Build my plan
            <ArrowRight className="h-4.5 w-4.5 transition group-hover:translate-x-1" />
          </Link>
          <p className="mt-8 text-sm text-cream/60">
            <Link href="/discover" className="link-wipe font-semibold text-cream/60">
              Or just browse Boston first
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function Figure({
  value,
  label,
  cite,
  accent,
}: {
  value: string;
  label: string;
  cite: string;
  accent?: boolean;
}) {
  return (
    <div className="border-ink/10 px-2 py-6 sm:border-l sm:first:border-l-0 sm:px-8">
      <p
        className={`font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.03em] ${
          accent ? "text-brand-600" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-3 max-w-[26ch] text-sm leading-snug text-ink/60">{label}</p>
      <p className="kicker mt-3 text-ink/60">{cite}</p>
    </div>
  );
}
