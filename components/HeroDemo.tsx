"use client";

// Interactive hero demo — the real Fit Score engine running live on the
// landing page. Sample profile (labeled), switchable goal, auto-rotating
// real dishes from the catalog, animated ring + bars. Try before signup.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalog } from "@/lib/catalogContext";
import { computeTargets, fitScore, GOAL_LABELS } from "@/lib/nutrition";
import type { Goal, HealthProfile } from "@/lib/types";
import { FitBadge } from "@/components/FitBadge";
import { TiltCard } from "@/components/TiltCard";
import { SmartImage } from "@/components/SmartImage";
import { categoryImg } from "@/lib/images";
import { cls } from "@/lib/format";

// Sample profile — clearly labeled in the UI.
const SAMPLE: Omit<HealthProfile, "goal"> = {
  name: "Sample",
  sex: "male",
  age: 32,
  heightCm: 178,
  weightKg: 82,
  activity: "moderate",
  dietary: [],
  avoid: [],
  createdAt: 0,
};

export function HeroDemo() {
  const { allMenuItems } = useCatalog();
  const [goal, setGoal] = useState<Goal>("lose");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const targets = useMemo(() => computeTargets({ ...SAMPLE, goal }), [goal]);

  // Top-6 dishes for this goal, re-ranked live when the goal changes.
  const dishes = useMemo(() => {
    return allMenuItems()
      .map((m) => ({ m, fit: fitScore(m, targets, goal) }))
      .sort((a, b) => b.fit.score - a.fit.score)
      .slice(0, 6);
  }, [targets, goal, allMenuItems]);

  useEffect(() => {
    if (paused || !dishes.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % dishes.length), 3800);
    return () => clearInterval(t);
  }, [paused, dishes.length]);

  // dishes is briefly [] while the catalog loads from Supabase.
  const cur = dishes.length ? dishes[idx % dishes.length] : null;
  const mealBudget = Math.round(targets.calories * 0.35);

  if (!cur) return null;
  const item = cur.m;
  const fit = cur.fit;

  return (
    <div
      className="relative w-full max-w-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TiltCard>
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white card-shadow-lg">
          {/* Goal switcher — re-ranks everything live */}
          <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-2.5">
            <span className="kicker text-ink/40">Live demo · real engine</span>
            <div className="flex gap-1">
              {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGoal(g); setIdx(0); }}
                  className={cls(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    goal === g ? "bg-ink text-white" : "bg-black/5 text-ink/55 hover:bg-black/10",
                  )}
                >
                  {GOAL_LABELS[g].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-52 w-full">
            <SmartImage
              key={item.id}
              src={categoryImg(item.category, idx)}
              alt={item.name}
              label={item.name}
              className="h-full w-full animate-rise object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute right-4 top-4 [transform:translateZ(30px)]">
              <FitBadge score={fit.score} size="lg" />
            </div>
            <div className="absolute bottom-3 left-4 text-white [transform:translateZ(20px)]">
              <p className="text-xs font-medium text-white/80">
                {(item as { restaurantName?: string }).restaurantName} · {(item as { restaurantNeighborhood?: string }).restaurantNeighborhood}
              </p>
              <p className="font-display text-lg font-bold">{item.name}</p>
            </div>
            {/* Dish stepper */}
            <div className="absolute inset-y-0 left-1 flex items-center">
              <button onClick={() => setIdx((i) => (i - 1 + dishes.length) % dishes.length)} aria-label="Previous dish" className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-1 flex items-center">
              <button onClick={() => setIdx((i) => (i + 1) % dishes.length)} aria-label="Next dish" className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink hover:bg-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 p-5">
            <DemoBar label="Calories" note={`${item.calories} of ~${mealBudget} meal budget`} pct={Math.min(100, Math.round((item.calories / mealBudget) * 100))} accent={item.calories <= mealBudget} />
            <DemoBar label="Protein" note={`${item.protein}g of ${targets.protein}g day target`} pct={Math.min(100, Math.round((item.protein / targets.protein) * 100))} accent />
            <DemoBar label="Sodium" note={`${item.sodium}mg${item.sodium <= 600 ? " · low" : ""}`} pct={Math.min(100, Math.round((item.sodium / 2000) * 100))} accent={false} />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {fit.reasons.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{t}</span>
              ))}
              {fit.warnings.slice(0, 1).map((t) => (
                <span key={t} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{t}</span>
              ))}
            </div>
            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 pt-1">
              {dishes.map((d, i) => (
                <button
                  key={d.m.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Dish ${i + 1}`}
                  className={cls("h-1.5 rounded-full transition-all", i === idx % dishes.length ? "w-5 bg-brand-600" : "w-1.5 bg-black/15 hover:bg-black/30")}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.06] bg-cream/70 px-5 py-3">
            <p className="text-[11px] leading-snug text-ink/45">
              Sample profile ({SAMPLE.age}y · {SAMPLE.heightCm}cm · {SAMPLE.weightKg}kg) · demo catalog
            </p>
            <Link href="/signup" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900">
              Use my numbers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </TiltCard>

      <div className="absolute -left-6 -top-6 hidden rotate-[-6deg] rounded-2xl border border-black/5 bg-white px-4 py-3 card-shadow sm:block">
        <p className="text-[11px] font-medium text-ink/50">Daily target · {GOAL_LABELS[goal].toLowerCase()}</p>
        <p className="text-sm font-bold tabular-nums text-ink">{targets.calories.toLocaleString()} kcal · {targets.protein}g protein</p>
      </div>
    </div>
  );
}

function DemoBar({ label, note, pct, accent }: { label: string; note: string; pct: number; accent: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink/70">{label}</span>
        <span className="tabular-nums text-ink/50">{note}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className={cls("h-full rounded-full transition-all duration-700 ease-out", accent ? "bg-brand-600" : "bg-neutral-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
