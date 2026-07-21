"use client";

/**
 * BudgetBuilder — live daily-target calculator for /how-it-works.
 *
 * Visitors set their metrics; we run the real engine (computeTargets →
 * Mifflin-St Jeor BMR × activity ± goal) and show the daily calorie and
 * macro targets update in real time. Proves "real formulas, not vibes."
 * Light theme.
 */

import { useMemo, useState } from "react";
import { ACTIVITY_LABELS, GOAL_LABELS, computeTargets } from "@/lib/nutrition";
import type { ActivityLevel, Goal, HealthProfile, Sex } from "@/lib/types";

const ACTIVITIES: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const ACTIVITY_SHORT: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  very_active: "Very active",
};
const GOALS: Goal[] = ["lose", "maintain", "gain"];

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink/70">{label}</label>
        <span className="font-display text-sm font-bold text-ink tabular-nums">
          {value}
          <span className="ml-0.5 text-xs font-medium text-ink/45">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-brand-600"
      />
    </div>
  );
}

function Seg<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={on}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              on
                ? "bg-brand-600 text-white shadow-[0_4px_12px_-5px_rgba(236,48,19,0.6)]"
                : "border border-black/10 bg-white text-ink/60 hover:border-black/20"
            }`}
          >
            {labels[o]}
          </button>
        );
      })}
    </div>
  );
}

function MacroBar({ name, grams, share, color }: { name: string; grams: number; share: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[13px]">
        <span className="text-ink/60">{name}</span>
        <span className="font-semibold text-ink tabular-nums">
          {grams} g <span className="font-medium text-ink/40">· {Math.round(share * 100)}%</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.round(share * 100)}%`, background: color, transition: "width .5s cubic-bezier(.3,.7,.3,1)" }}
        />
      </div>
    </div>
  );
}

export function BudgetBuilder() {
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState(32);
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(66);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");

  const targets = useMemo(() => {
    const profile: HealthProfile = {
      name: "",
      sex,
      age,
      heightCm,
      weightKg,
      activity,
      goal,
      dietary: [],
      avoid: [],
      createdAt: 0,
    };
    return computeTargets(profile);
  }, [sex, age, heightCm, weightKg, activity, goal]);

  const pCal = targets.protein * 4;
  const cCal = targets.carbs * 4;
  const fCal = targets.fat * 9;
  const total = Math.max(1, pCal + cCal + fCal);

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      {/* Controls */}
      <div className="space-y-5 rounded-2xl border border-black/5 bg-white p-6">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-ink/40">Sex</p>
          <Seg<Sex>
            options={["female", "male"] as Sex[]}
            value={sex}
            onChange={setSex}
            labels={{ female: "Female", male: "Male" }}
          />
        </div>
        <Slider label="Age" value={age} min={16} max={80} unit="yrs" onChange={setAge} />
        <Slider label="Height" value={heightCm} min={140} max={210} unit="cm" onChange={setHeightCm} />
        <Slider label="Weight" value={weightKg} min={40} max={160} unit="kg" onChange={setWeightKg} />
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-ink/40">Activity</p>
          <Seg options={ACTIVITIES} value={activity} onChange={setActivity} labels={ACTIVITY_SHORT} />
          <p className="mt-2 text-xs text-ink/45">{ACTIVITY_LABELS[activity]}</p>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-ink/40">Goal</p>
          <Seg options={GOALS} value={goal} onChange={setGoal} labels={GOAL_LABELS} />
        </div>
      </div>

      {/* Result */}
      <div className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 card-shadow">
        <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink/40">Your daily target</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-5xl font-extrabold text-ink tabular-nums">
            {targets.calories.toLocaleString()}
          </span>
          <span className="text-lg font-semibold text-ink/45">kcal / day</span>
        </div>
        <p className="mt-1 text-sm text-ink/55">
          BMR {targets.bmr.toLocaleString()} · TDEE {targets.tdee.toLocaleString()} · {GOAL_LABELS[goal].toLowerCase()}
        </p>

        <div className="mt-6 space-y-3.5">
          <MacroBar name="Protein" grams={targets.protein} share={pCal / total} color="#ec3013" />
          <MacroBar name="Carbs" grams={targets.carbs} share={cCal / total} color="#ff9783" />
          <MacroBar name="Fat" grams={targets.fat} share={fCal / total} color="#e0853a" />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
          <span className="text-ink/55">Fiber target</span>
          <span className="font-display font-bold text-ink tabular-nums">{targets.fiber} g</span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink/45">
          Computed with the Mifflin-St Jeor equation — the same clinical formula dietitians use — then
          adjusted for your goal. This is exactly what Forkcast sets as your budget on day one.
        </p>
      </div>
    </div>
  );
}

export default BudgetBuilder;
