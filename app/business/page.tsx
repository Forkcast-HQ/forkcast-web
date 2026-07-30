import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Layers,
  Megaphone,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "The opportunity",
  description: "Why Palatify, the market, the model, and the ask.",
};

export default function Business() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-black/5 bg-brand-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-300">
            The opportunity
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-balance">
            Passive calorie labels failed. Active, personal steering is the opening.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Americans eat a record share of meals out and badly misjudge what&apos;s
            in them. Every nutrition app still makes you log <em>after</em>. Palatify
            recommends the right dish at a nearby restaurant <em>before</em> you order —
            and gets restaurants to pay to be the recommendation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 hover:bg-white/90">
              See the product <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/for-restaurants" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              The restaurant side
            </Link>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <Section title="Why now" tag="The problem, in numbers">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric figure="58.5%" label="of U.S. food spending is now away from home — a record" cite="USDA ERS, 2023" />
          <Metric figure="2 in 3" label="diners underestimate restaurant-meal calories; ¼ by 500+" cite="USDA/NHANES, 2024" />
          <Metric figure="~24 cal" label="all that mandatory menu labels change per order" cite="Peer-reviewed, 2024" />
          <Metric figure="70–80%" label="of calorie-app users quit within two weeks" cite="JMIR review, 2026" />
        </div>
        <p className="mt-6 max-w-3xl text-ink/65">
          The category&apos;s unsolved failure is <strong>logging friction</strong> and{" "}
          <strong>bad data — worst exactly when eating out.</strong> No commercial
          database even has nutrition for independent restaurants, because the FDA rule
          only forces 20+-location chains to disclose. That structural gap is our moat.
        </p>
      </Section>

      {/* Market sizing */}
      <Section title="Market" tag="TAM · SAM · SOM (US)" dark>
        <div className="grid gap-6 lg:grid-cols-3">
          <MarketCard
            tier="TAM"
            value="$11.1B"
            sub="/year"
            body="186M U.S. adults with elevated BMI (72% of adults), nearly all of whom eat out, × ~$60 blended annual ARPU. Triangulates with the $5.5–14B calorie-tracking market growing 12–20%/yr."
            cite="CDC 2024 · USDA ERS 2023"
          />
          <MarketCard
            tier="SAM"
            value="$3.3B"
            sub="/year"
            body="~55.7M goal-oriented 'active dieters' who eat out often (~30% of elevated-BMI adults) × $60/yr. Consistent with MyFitnessPal's ~30M MAU as a category engagement ceiling."
            cite="Bottom-up"
            highlight
          />
          <MarketCard
            tier="SOM"
            value="$40–90M"
            sub="ARR, 5-yr"
            body="Capturing 0.5–2.0% of SAM = 0.28–1.1M paying users ($17–67M consumer ARR; 1% base ≈ $33M), plus restaurant retail-media and B2B2C covered-nutrition legs."
            cite="Modeled"
          />
        </div>
        <p className="mt-6 text-sm text-white/55">
          Cal AI is the proof point: ~15M downloads and $30M+ ARR in under two years,
          bootstrapped, before MyFitnessPal acquired it (Dec 2025).
        </p>
      </Section>

      {/* Business model */}
      <Section title="Model" tag="Three revenue legs, sequenced">
        <div className="grid gap-6 lg:grid-cols-3">
          <ModelCard
            icon={<Target className="h-6 w-6" />}
            n="1"
            title="Consumer subscription"
            body="Transparent pricing with a genuinely useful free tier (exploiting MyFitnessPal/Noom trust erosion). ~$60/yr blended, annual-plan-led to fight churn. Gate growth on LTV:CAC ≥3:1, 6–9 mo payback."
            tag="Launch leg"
          />
          <ModelCard
            icon={<Megaphone className="h-6 w-6" />}
            n="2"
            title="Restaurant retail-media"
            body="Clearly-labeled 'featured healthy dish' placements at ~$200/mo/location. 2,000 locations ≈ $4.8M; 10,000 ≈ $24M. Modeled on DoorDash's $1B+ ad run-rate. High-margin, and it solves the supply side."
            tag="Margin scaler"
            highlight
          />
          <ModelCard
            icon={<HeartHandshake className="h-6 w-6" />}
            n="3"
            title="B2B2C covered nutrition"
            body="Payer/employer contracts on broadly-covered medical nutrition therapy (CPT 97802–97804) for day-one billable revenue and 'free-to-you' acquisition. The durable, defensible third leg."
            tag="Durable moat"
          />
        </div>
      </Section>

      {/* Whitespace */}
      <Section title="Why we win" tag="The whitespace nobody owns" dark>
        <p className="max-w-3xl text-lg text-white/75">
          No incumbent occupies all four of{" "}
          <span className="font-semibold text-white">
            pre-meal · location-aware · independent-restaurant coverage · restaurant-supply monetization.
          </span>
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-white/50">
                <th className="px-4 py-2 font-medium">Player</th>
                <th className="px-4 py-2 font-medium">Strong at</th>
                <th className="px-4 py-2 font-medium">Structurally absent</th>
              </tr>
            </thead>
            <tbody>
              <Row a="MyFitnessPal" b="Scale (220M registered)" c="After-the-fact logging; inaccurate DB; 70–80% 2-wk churn" />
              <Row a="Cal AI / SnapCalorie" b="Photo estimation, TikTok reach" c="No recommendation, no restaurant supply side" />
              <Row a="Sweetgreen / CAVA" b="Great healthy menus" c="Single-brand only — can't be brand-agnostic" />
              <Row a="DoorDash / Uber Eats" b="Restaurant graph + $1B ad engine" c="Zero nutrition-goal intelligence" />
              <Row a="Foodsmart" b="Payer contracts, RD-led, 2.2M members" c="Grocery/telehealth — not in-the-moment eating-out" />
            </tbody>
          </table>
        </div>
      </Section>

      {/* Roadmap */}
      <Section title="Plan" tag="Go-to-market sequence">
        <div className="space-y-5">
          <Phase
            n="0–12 mo"
            title="Density, not breadth"
            body="Launch 2–3 dense urban markets (Boston beachhead). Seed full chain coverage instantly (Nutritionix/FatSecret/USDA); build independent-restaurant coverage block-by-block. Acquire via TikTok/influencer targeting GLP-1 and goal-oriented audiences. Fund with a pre-seed SAFE + a non-dilutive SBIR for the estimation engine."
          />
          <Phase
            n="12–30 mo"
            title="Turn coverage into retail-media"
            body="Convert restaurant coverage into the featured-dish revenue leg; sign marquee logos. Raise a seed/Series A timed to AI + food-as-medicine appetite (AI took 62% of 2025 digital-health VC dollars)."
          />
          <Phase
            n="30 mo+"
            title="Land the payer leg"
            body="Sign payer/employer B2B2C contracts on covered MNT, layering reimbursement as the durable moat. Realistic exit: a tech-forward chain (CAVA/Chipotle), a delivery platform, or a nutrition-care consolidator."
          />
        </div>
      </Section>

      {/* Risks + Ask */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Risks we underwrite honestly</h3>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
              <li><strong>Accuracy is physics-bound</strong> (~16–25% floor). We market "fast, good-enough, easy to correct," never clinical — RAG-grounded against USDA data.</li>
              <li><strong>Retention is the category killer.</strong> Plan-ahead makes a recurring habit out of every meal, not a logging chore; annual plans halve churn.</li>
              <li><strong>Two-sided cold start.</strong> Solved with geographic density, not national breadth.</li>
              <li><strong>GLP-1 headwind → tailwind.</strong> Position as the eating-out companion for GLP-1 users.</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-6">
            <div className="flex items-center gap-2 text-brand-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">The ask</h3>
            </div>
            <p className="mt-4 text-sm text-ink/75">
              Raising a <strong>~$1.0–1.5M pre-seed SAFE</strong> (~$5–6M post) to launch the Boston
              beachhead, build the independent-restaurant nutrition layer, and prove
              consumer retention + the first featured-restaurant cohort — matched with a
              non-dilutive SBIR for the estimation-engine R&D.
            </p>
            <p className="mt-3 text-sm text-ink/60">
              18-month milestones: density in 1 metro, &gt;35% D30 retention, 150+ featured
              restaurants, LTV:CAC ≥3:1 — the proof points for a seed.
            </p>
            <Link href="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Try the product <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-ink/40">
          All figures are research-backed (CDC, USDA ERS, AHRQ, peer-reviewed sources, company filings).
          Detailed business plan &amp; financial model available on request.
        </p>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({
  title,
  tag,
  dark,
  children,
}: {
  title: string;
  tag: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={dark ? "bg-ink text-white" : ""}>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <span className={`text-sm font-bold uppercase tracking-widest ${dark ? "text-brand-300" : "text-brand-600"}`}>
          {tag}
        </span>
        <h2 className={`mt-2 font-display text-3xl font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Metric({ figure, label, cite }: { figure: string; label: string; cite: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="font-display text-3xl font-extrabold text-brand-600">{figure}</p>
      <p className="mt-2 text-sm text-ink/65">{label}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-ink/35">{cite}</p>
    </div>
  );
}

function MarketCard({
  tier,
  value,
  sub,
  body,
  cite,
  highlight,
}: {
  tier: string;
  value: string;
  sub: string;
  body: string;
  cite: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-brand-400 bg-brand-500/10" : "border-white/10 bg-white/[0.03]"}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-300">{tier}</span>
        <TrendingUp className="h-4 w-4 text-white/30" />
      </div>
      <p className="mt-3 font-display text-4xl font-extrabold text-white">
        {value}
        <span className="ml-1 text-base font-medium text-white/50">{sub}</span>
      </p>
      <p className="mt-3 text-sm text-white/70">{body}</p>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-white/35">{cite}</p>
    </div>
  );
}

function ModelCard({
  icon,
  n,
  title,
  body,
  tag,
  highlight,
}: {
  icon: React.ReactNode;
  n: string;
  title: string;
  body: string;
  tag: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border p-6 ${highlight ? "border-2 border-brand-500 bg-brand-50/40" : "border-black/5 bg-white"}`}>
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
        <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/50">
          {tag}
        </span>
      </div>
      <p className="mt-4 font-display text-lg font-bold text-ink">
        <span className="text-brand-600">{n}.</span> {title}
      </p>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

function Row({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr className="bg-white/[0.04]">
      <td className="rounded-l-xl px-4 py-3 font-semibold text-white">{a}</td>
      <td className="px-4 py-3 text-white/65">{b}</td>
      <td className="rounded-r-xl px-4 py-3 text-white/65">{c}</td>
    </tr>
  );
}

function Phase({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6 sm:flex-row sm:gap-6">
      <div className="shrink-0">
        <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">{n}</span>
      </div>
      <div>
        <p className="font-display text-lg font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink/65">{body}</p>
      </div>
    </div>
  );
}
