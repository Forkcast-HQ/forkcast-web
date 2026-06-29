import Link from "next/link";
import { HeartPulse, Sparkles, Utensils, Camera, ArrowRight, Database, Store } from "lucide-react";

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
            body="Enter height, weight, age, sex, activity and goal. We compute BMI, then BMR via the Mifflin-St Jeor equation, multiply by an activity factor for TDEE, and apply a safe deficit or surplus. Macros follow ISSN protein guidance (up to 2.0 g/kg when cutting), ~27% fat, the rest carbs, with a 14g-fiber-per-1000-kcal target."
          />
          <StepCard
            icon={<Sparkles className="h-6 w-6" />}
            n="02"
            title="The Fit Score"
            body="Every dish gets a personal 0–100 score: calorie appropriateness for one meal, protein density, fiber, sodium and sugar — weighted by your goal. It's explainable: you see exactly why (High protein · Good fiber · Watch sodium), never a mystery number."
          />
          <StepCard
            icon={<Utensils className="h-6 w-6" />}
            n="03"
            title="Decide before you order"
            body="Nearby restaurants and dishes reorder around your day. Add a dish in one tap — delivery, pickup, or just walk in. Your remaining calories and macros update instantly, so the next decision is informed too."
          />
          <StepCard
            icon={<Camera className="h-6 w-6" />}
            n="04"
            title="Snap to close the loop"
            body="Photograph what you actually ate. Our vision model estimates calories and macros, you confirm or correct, and it reconciles against your plan and weekly trend. Logging is a feature here — not the whole job."
          />
        </div>
      </section>

      {/* Fit Score breakdown */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-300">Inside the Fit Score</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Five sub-scores, weighted by your goal.</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Each is normalized 0–1, then combined and scaled to 100. Weights shift for
            weight-loss vs. muscle-building goals — e.g. losing weight leans harder on
            calorie fit and protein.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ScorePart title="Calorie fit" w="30–34%" body="How well calories match a single meal's share of your daily target. Overshooting is penalized harder than undershooting." />
            <ScorePart title="Protein density" w="30–36%" body="Share of calories from protein. ≥30% earns full marks — the lever for satiety and lean mass." />
            <ScorePart title="Fiber" w="12%" body="Rewards 8g+ per meal — satiety and metabolic health." />
            <ScorePart title="Sodium" w="12–16%" body="Full marks ≤600mg, zero by 2000mg. Restaurant food's biggest hidden cost." />
            <ScorePart title="Sugar" w="10–14%" body="Full marks ≤8g, penalized toward 35g. Catches 'healthy' bowls that aren't." />
          </div>
        </div>
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

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StepCard icon={<HeartPulse className="h-6 w-6" />} n="A" title="You" body="Your profile becomes daily targets, every nearby dish gets a Fit Score, and a quick photo keeps your day honest." />
          <StepCard icon={<Database className="h-6 w-6" />} n="B" title="The nutrition layer" body="We turn any restaurant's menu into per-dish calories and macros — the part no off-the-shelf database covers — and always show how confident we are." />
          <StepCard icon={<Store className="h-6 w-6" />} n="C" title="Restaurants" body="Partners upload a menu, get instant nutrition, and surface their best dishes to people who came to eat well." />
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5 text-sm text-ink/60">
          <strong className="text-ink">Honesty by design:</strong> photo-based calorie
          estimation has a physics-bound error floor (~16–25%). Forkcast leads with
          menu name + description (where models match nutritionists), grounds estimates
          in trusted nutrition data, and shows ranges — we sell &quot;fast, good-enough,
          easy to correct,&quot; never clinical accuracy.
        </div>

        <p className="mt-6 text-sm text-ink/45">
          The detailed system architecture and data pipeline are shared with partners and investors on request.
        </p>

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

function ScorePart({ title, w, body }: { title: string; w: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold">{title}</p>
        <span className="text-xs font-bold text-brand-300">{w}</span>
      </div>
      <p className="mt-2 text-xs text-white/60">{body}</p>
    </div>
  );
}

