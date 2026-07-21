import Link from "next/link";
import { HeartPulse, Sparkles, Utensils, Camera, ArrowRight } from "lucide-react";
import { BudgetBuilder } from "@/components/BudgetBuilder";
import { FitScoreExplorer } from "@/components/FitScoreExplorer";

export const metadata = {
  title: "How it works — Forkcast",
  description: "The science, the Fit Score, and the system architecture behind Forkcast.",
};

export default function HowItWorks() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">How it works</span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl text-balance">
            Real formulas. Honest estimates. A recommendation you can act on.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/65">
            Forkcast turns your body metrics into daily targets, scores every nearby
            dish against them, and closes the loop with a quick photo. No black boxes —
            here&apos;s exactly how each part works.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <StepCard
            icon={<HeartPulse className="h-6 w-6" />}
            n="01"
            title="Your health cabinet"
            body="Height, weight, age, activity, goal — that becomes your daily calorie and macro targets, computed with the same clinical equations dietitians use. Set it once, adjust anytime."
          />
          <StepCard
            icon={<Sparkles className="h-6 w-6" />}
            n="02"
            title="The Fit Score"
            body="Every dish gets a personal 0–100 score against what's left of your day — and it always tells you why: High protein · Good fiber · Watch sodium. Never a mystery number."
          />
          <StepCard
            icon={<Utensils className="h-6 w-6" />}
            n="03"
            title="Decide before you order"
            body="Restaurants and dishes reorder around your day. Add to an order in one tap — your remaining budget updates instantly."
          />
          <StepCard
            icon={<Camera className="h-6 w-6" />}
            n="04"
            title="Snap to close the loop"
            body="Snap what you actually ate. AI estimates the nutrition, you confirm or correct, and your day updates."
          />
        </div>
      </section>

      {/* Daily budget builder */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Your daily budget</span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          The math behind your targets — try it.
        </h2>
        <p className="mt-3 max-w-2xl text-ink/65">
          Set your metrics and watch your daily calorie and macro targets recompute live, using the same
          clinical equation Forkcast runs on day one.
        </p>
        <div className="mt-8">
          <BudgetBuilder />
        </div>
      </section>

      {/* Fit Score breakdown */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-300">Inside the Fit Score</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Five sub-scores, weighted by your goal.</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Weights shift with your goal — losing weight leans harder on calorie fit and protein.
          </p>
          <FitScoreExplorer />
        </div>
      </section>

      {/* Why it's different — evidence-carrying numbers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Why it&apos;s different</span>
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

      {/* How it fits together (high-level) */}
      <section id="architecture" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-600">How it fits together</span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Two sides, one nutrition layer.
        </h2>
        <p className="mt-3 max-w-2xl text-ink/65">
          Diners get personalized recommendations; restaurants get discovered by
          health-minded customers. In between sits the part we obsess over — turning any
          menu, from chains to independents, into trustworthy per-dish nutrition.
        </p>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5 text-sm text-ink/60">
          <strong className="text-ink">Honesty by design:</strong> estimates are shown as
          estimates, with a confidence label and easy correction — never presented as
          clinical accuracy. Detailed architecture is shared with partners and investors on request.
        </div>

        <div className="mt-10 text-center">
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700">
            Try it yourself <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function StepCard({ icon, n, title, body }: { icon: React.ReactNode; n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
        <span className="font-display text-2xl font-extrabold text-black/10">{n}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

function CompareLi({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${ok ? "bg-brand-600 text-white" : "bg-black/10 text-ink/50"}`}
      >
        {ok ? "✓" : "×"}
      </span>
      <span className="text-sm">{children}</span>
    </li>
  );
}

