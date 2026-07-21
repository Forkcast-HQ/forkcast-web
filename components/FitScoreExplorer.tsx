"use client";

/**
 * FitScoreExplorer — the interactive heart of /how-it-works.
 *
 * Pick a real catalog dish and a goal; the real fitScore() engine runs
 * and the five weighted sub-scores animate in, along with the "why"
 * reasons and warnings. Makes the transparency claim ("every number has
 * a source") undeniable. Dark theme to match the Fit Score band.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { RESTAURANTS } from "@/data/restaurants";
import { categoryImg } from "@/lib/images";
import { computeTargets, fitColor, fitScore } from "@/lib/nutrition";
import type { Goal, HealthProfile, MenuItem } from "@/lib/types";

const DEMO_PROFILE: HealthProfile = {
  name: "Demo",
  sex: "female",
  age: 32,
  heightCm: 168,
  weightKg: 66,
  activity: "moderate",
  goal: "lose",
  dietary: [],
  avoid: [],
  createdAt: 0,
};

const GOALS: { key: Goal; label: string }[] = [
  { key: "lose", label: "Lose weight" },
  { key: "maintain", label: "Maintain" },
  { key: "gain", label: "Build muscle" },
];

const SUBS: { key: "cal" | "protein" | "fiber" | "sodium" | "sugar"; label: string }[] = [
  { key: "cal", label: "Calorie fit" },
  { key: "protein", label: "Protein density" },
  { key: "fiber", label: "Fiber" },
  { key: "sodium", label: "Sodium" },
  { key: "sugar", label: "Sugar" },
];

// Goal weights mirror lib/nutrition fitScore() for the live weight readout.
const WEIGHTS: Record<Goal, Record<string, number>> = {
  lose: { cal: 0.34, protein: 0.32, fiber: 0.12, sodium: 0.12, sugar: 0.1 },
  maintain: { cal: 0.3, protein: 0.3, fiber: 0.12, sodium: 0.14, sugar: 0.14 },
  gain: { cal: 0.22, protein: 0.36, fiber: 0.12, sodium: 0.16, sugar: 0.14 },
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const gaussian = (x: number, mu: number, sigma: number) => {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
};

/** Per-sub-score fractions (0..1), matching the engine's internal math. */
function subScores(item: MenuItem, calT: number) {
  const proteinDensity = (item.protein * 4) / Math.max(1, item.calories);
  const sigma = item.calories > calT ? calT * 0.5 : calT * 0.85;
  return {
    cal: gaussian(item.calories, calT, sigma),
    protein: clamp01(proteinDensity / 0.3),
    fiber: clamp01(item.fiber / 8),
    sodium: clamp01(1 - (item.sodium - 600) / 1400),
    sugar: clamp01(1 - (item.sugar - 8) / 27),
  };
}

function useTween(target: number, dur = 650) {
  const [v, setV] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    const from = ref.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const val = from + (target - from) * (1 - Math.pow(1 - p, 3));
      ref.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return Math.round(v);
}

export function FitScoreExplorer() {
  const [goal, setGoal] = useState<Goal>("lose");
  const [sel, setSel] = useState(0);

  const { targets, dishes, calT } = useMemo(() => {
    const t = computeTargets(DEMO_PROFILE);
    const want = ["grain-bowl", "salmon-plate", "salad", "chicken-plate", "mediterranean"];
    const all = RESTAURANTS.flatMap((r) => r.menu);
    const picked: MenuItem[] = [];
    want.forEach((c) => {
      const hit = all.find((i) => i.category === c && !picked.includes(i));
      if (hit) picked.push(hit);
    });
    for (const i of all) {
      if (picked.length >= 5) break;
      if (!picked.includes(i)) picked.push(i);
    }
    return {
      targets: t,
      calT: t.calories * 0.35,
      dishes: picked.slice(0, 5).map((item, idx) => ({
        item,
        photo: categoryImg(item.category, idx * 29 + 7, 160, 160),
      })),
    };
  }, []);

  const active = dishes[sel].item;
  const result = fitScore(active, targets, goal);
  const subs = subScores(active, calT);
  const scoreT = useTween(result.score);
  const color = fitColor(result.score);

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      {/* Controls */}
      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-white/40">Your goal</p>
          <div className="flex gap-1.5 rounded-xl bg-white/[0.06] p-1">
            {GOALS.map((g) => {
              const on = g.key === goal;
              return (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  aria-pressed={on}
                  className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    on ? "bg-brand-600 text-white" : "text-white/55 hover:text-white/80"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-white/40">Pick a dish</p>
          <div className="space-y-2">
            {dishes.map((d, i) => {
              const on = i === sel;
              return (
                <button
                  key={d.item.id}
                  onClick={() => setSel(i)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                    on
                      ? "border-brand-500 bg-brand-600/15"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <div className="glass-tile h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <SmartImage src={d.photo} alt="" label={d.item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-white">{d.item.name}</div>
                    <div className="text-[11.5px] text-white/45">
                      {d.item.calories} kcal · {d.item.protein}g protein
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center gap-4">
          <div className="glass-tile h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <SmartImage
              src={dishes[sel].photo}
              alt=""
              label={active.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold text-white">{active.name}</div>
            <div className="text-[13px] text-white/50">
              {active.calories} kcal · {active.protein}g protein · Verdant, Back Bay
            </div>
          </div>
          {/* overall score ring */}
          <div className="relative h-[92px] w-[92px] shrink-0">
            <svg width={92} height={92} className="-rotate-90">
              <circle cx={46} cy={46} r={39} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={9} />
              <circle
                cx={46}
                cy={46}
                r={39}
                fill="none"
                stroke={color}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 39}
                strokeDashoffset={2 * Math.PI * 39 * (1 - result.score / 100)}
                style={{ transition: "stroke-dashoffset .7s cubic-bezier(.3,.7,.3,1)" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="font-display text-2xl font-extrabold leading-none text-white tabular-nums">
                  {scoreT}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-brand-300">
                  Grade {result.grade}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sub-scores */}
        <div className="mt-6 space-y-3">
          {SUBS.map((s) => {
            const val = Math.round(subs[s.key] * 100);
            const wt = Math.round(WEIGHTS[goal][s.key] * 100);
            return (
              <div key={s.key}>
                <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                  <span className="text-white/75">
                    {s.label} <span className="text-[11px] font-semibold text-white/35">· weight {wt}%</span>
                  </span>
                  <span className="font-bold text-white tabular-nums">{val}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${val}%`,
                      background: "linear-gradient(90deg,#ff563c,#ec3013)",
                      transition: "width .6s cubic-bezier(.3,.7,.3,1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* reasons + warnings */}
        <div className="mt-5 flex flex-wrap gap-2">
          {result.reasons.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0f6e56]/25 px-2.5 py-1 text-[11.5px] font-semibold text-[#5dcaa5]"
            >
              <Check className="h-3.5 w-3.5" />
              {r}
            </span>
          ))}
          {result.warnings.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e0853a]/20 px-2.5 py-1 text-[11.5px] font-semibold text-[#f0b878]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {w}
            </span>
          ))}
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
          Scored against your {targets.calories.toLocaleString()} kcal/day budget · one main meal ≈ 35% (
          {Math.round(calT)} kcal). Weights shift with your goal — losing leans harder on calories and protein.
        </p>
      </div>
    </div>
  );
}

export default FitScoreExplorer;
