import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BudgetBuilder } from "@/components/BudgetBuilder";
import { FitScoreExplorer } from "@/components/FitScoreExplorer";
import { ProofFigures } from "@/components/ProofFigures";

export const metadata = {
  title: "How it works",
  description:
    "Four steps from your goal to your order — and the two that do the real work, running live on the page.",
};

/**
 * /how-it-works — the journey, and two places to try it.
 *
 * This page used to run eight sections over five and a half screens: a
 * three-line hero, the evidence strip, four step cards, two full interactive
 * demos, a two-card "us vs them" comparison, an architecture blurb, an
 * honesty note and a CTA. The four steps — the only thing on the page that
 * actually answers its own title — were the smallest element on it, a 2×2
 * grid of cards floating between the demos.
 *
 * So the steps are now the spine, stated once, in order, at a size that
 * reads in a glance. The two demos follow as steps 01 and 02 made tangible
 * rather than as unrelated widgets. Three separate arguments for trusting
 * the numbers (the comparison cards, the architecture section, the honesty
 * note) collapse into the one that says something concrete.
 *
 * What went, and where it lives instead: the "other apps show you a number"
 * comparison is positioning, not mechanism — /impact and the landing page's
 * own claim band carry it. The architecture blurb said only that the
 * architecture is available on request; #architecture still resolves, to
 * the honesty note that was the substance of it.
 */

const STEPS = [
  {
    n: "01",
    t: "Tell us the goal",
    b: "Height, weight, activity, what you avoid. Sixty seconds, once.",
  },
  {
    n: "02",
    t: "Menus re-rank",
    b: "Every dish nearby scored 0–100 against what's left of your day.",
  },
  {
    n: "03",
    t: "Order knowing",
    b: "Protein, sodium, calories — and where each number came from.",
  },
  {
    n: "04",
    t: "Snap to close the loop",
    b: "Photograph what you actually ate. Your day updates.",
  },
];

export default function HowItWorks() {
  return (
    <div>
      {/* ---------------- The journey ---------------- */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 lg:px-8">
          <p className="kicker text-brand-600">How it works</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink text-balance">
            Four steps from your goal to your order.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/65">
            No black boxes. The two steps that do the real work are running
            live further down this page — change the numbers and watch.
          </p>

          <ol className="mt-14 grid gap-y-10 sm:grid-cols-2 sm:gap-0 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="relative sm:border-l sm:border-ink/15 sm:px-7 sm:first:border-l-0 sm:first:pl-0 lg:px-6"
              >
                <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.04em] text-brand-600/25 tabular-nums">
                  {s.n}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-ink">{s.t}</h2>
                <p className="mt-2 max-w-[28ch] text-[15px] leading-snug text-ink/60">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Step 01, for real ---------------- */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="kicker text-brand-600">Step 01 · try it</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            Your metrics become a daily budget.
          </h2>
          <p className="mt-3 max-w-2xl text-ink/65">
            The Mifflin–St Jeor equation, the same one dietitians use. Move
            anything and the targets recompute — this is the real calculation,
            not a mock-up of one.
          </p>
          <div className="mt-8">
            <BudgetBuilder />
          </div>
        </div>
      </section>

      {/* ---------------- Step 02, for real ---------------- */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="kicker text-brand-300">Step 02 · try it</p>
          <h2 className="mt-3 font-display text-3xl font-bold">
            Every dish, scored against what&apos;s left.
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Five sub-scores, weighted by your goal — losing weight leans harder
            on calorie fit and protein. Pick a real dish and watch it break
            down.
          </p>
          <FitScoreExplorer />
        </div>
      </section>

      {/* ---------------- Why it exists ----------------
          Kept short and placed after the mechanism, not before it: the
          numbers argue that the problem is real, which is a thing you read
          once you already understand what is being proposed. */}
      <section className="border-b border-ink/10 bg-neutral-100">
        <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="kicker text-brand-600">Why it&apos;s needed</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink text-balance">
            Eating out is now the default, and nobody can eyeball it.
          </h2>
          <ProofFigures />
        </div>
      </section>

      {/* ---------------- Honesty + CTA ---------------- */}
      <section id="architecture" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
            <h2 className="font-display text-lg font-bold text-ink">Honesty by design</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink/65">
              Every number carries a source and a ± range. Estimates are labelled
              as estimates, restaurants review and correct their own menus, and
              corrections are versioned and public. Sponsored placement never
              changes a score. Nothing here is medical advice.
            </p>
            <Link
              href="/data-and-ai"
              className="link-wipe mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink"
            >
              Where the data comes from <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white transition hover:bg-brand-700"
            >
              Build my plan
              <ArrowRight className="h-4.5 w-4.5 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
