"use client";

/**
 * HowItWorks — the landing-page "How it works" flow.
 *
 * A single live Forkcast app card that updates in place across four steps:
 *   01 Build your profile → your daily budget ring
 *   02 See what fits      → a real dish gets its Fit Score
 *   03 Order or dine in   → the dish drops onto the plate, budget updates
 *   04 Confirm the meal   → the order logs itself
 *
 * Numbers are honest: the daily target and Fit Score come from the real
 * engine (lib/nutrition) against a demo profile; the dish + photo come
 * from the live catalog. Auto-advances until the visitor takes control.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Dumbbell,
  Flame,
  Leaf,
  Receipt,
  Send,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { RESTAURANTS } from "@/data/restaurants";
import { categoryImg } from "@/lib/images";
import { computeTargets, fitColor, fitScore } from "@/lib/nutrition";
import type { HealthProfile } from "@/lib/types";

const STEPS = [
  {
    n: "01",
    label: "Profile",
    title: "Build your profile",
    body: "We compute your daily targets from height, weight, age, activity, and goal — the number you have left to spend today.",
  },
  {
    n: "02",
    label: "Fit",
    title: "See what fits",
    body: "Every nearby dish gets a personal Fit Score from calories, protein, fiber, sodium, and sugar — ranked against your day.",
  },
  {
    n: "03",
    label: "Order",
    title: "Order or dine in",
    body: "Add a dish and it drops onto your plate — your remaining budget updates the moment you commit.",
  },
  {
    n: "04",
    label: "Log",
    title: "Confirm the meal",
    body: "Confirmed orders pre-fill your log with source, portion, and confidence. Photos cover everything else.",
  },
] as const;

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

const AUTO_MS = 4600;

function useCountUp(target: number, active: number, dur = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, dur]);
  return v;
}

/** Animated SVG ring; animates from empty to `value`% each time it mounts. */
function Ring({
  size,
  stroke,
  value,
  color,
  children,
}: {
  size: number;
  stroke: number;
  value: number;
  color: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(c * (1 - value / 100)));
    return () => cancelAnimationFrame(id);
  }, [c, value]);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eae7e7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.3,.7,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** Animated fill bar; grows from 0 to `frac` each time it mounts. */
function Bar({ frac, tall = false }: { frac: number; tall?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(frac));
    return () => cancelAnimationFrame(id);
  }, [frac]);
  return (
    <div
      className={`overflow-hidden rounded-full border border-black/5 bg-neutral-100 ${tall ? "h-2.5" : "h-1.5"}`}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.round(w * 100)}%`,
          background: "linear-gradient(90deg,#ff563c,#ec3013)",
          transition: "width .85s cubic-bezier(.3,.7,.3,1)",
        }}
      />
    </div>
  );
}

const Chip = ({
  icon,
  children,
  tone = "brand",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "brand" | "green" | "neutral";
}) => {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-[#eafaf1] text-[#0f6e56]",
    neutral: "bg-neutral-100 text-ink/55",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
};

export function HowItWorks({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const { targets, dish, pct, left, photo } = useMemo(() => {
    const t = computeTargets(DEMO_PROFILE);
    const item = RESTAURANTS[0].menu[0]; // Harvest Power Bowl (Verdant)
    const fit = fitScore(item, t, DEMO_PROFILE.goal);
    return {
      targets: t,
      dish: { ...item, fit: fit.score, restaurant: RESTAURANTS[0].name },
      pct: Math.round((item.calories / t.calories) * 100),
      left: t.calories - item.calories,
      photo: categoryImg(item.category, 11, 256, 256),
    };
  }, []);

  // Auto-advance until the visitor interacts.
  useEffect(() => {
    if (touched) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), AUTO_MS);
    return () => clearInterval(id);
  }, [touched]);

  const go = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const step = STEPS[active];
  const dayPill = active >= 2 ? `${left.toLocaleString()} kcal left` : `${targets.calories.toLocaleString()} kcal left`;

  return (
    <div>
      {/* full-width step rail */}
      <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center" style={{ flex: i === 0 ? "0 0 auto" : "1 1 0%" }}>
              {i > 0 && (
                <div className="mx-1 mb-6 h-0.5 flex-1 overflow-hidden bg-white/15">
                  <div
                    className="h-full origin-left bg-brand-500"
                    style={{
                      transform: `scaleX(${i <= active ? 1 : 0})`,
                      transition: "transform .55s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </div>
              )}
              <button
                onClick={() => go(i)}
                aria-pressed={i === active}
                aria-label={`Step ${s.n}: ${s.title}`}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition ${
                    i === active
                      ? "glass-red scale-110"
                      : i < active
                        ? "glass text-brand-700"
                        : "glass-dark text-white/70"
                  }`}
                >
                  {i < active ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span
                  className={`text-[11.5px] font-medium transition ${i === active ? "text-white" : "text-white/40"}`}
                >
                  {s.label}
                </span>
              </button>
            </div>
          ))}
      </div>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Left: copy + CTA */}
        <div>
          <div key={active} className="animate-rise">
            <div className="font-display text-5xl font-extrabold leading-none text-white/20 sm:text-6xl">
              {step.n}
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">{step.title}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{step.body}</p>
          </div>
          {ctaHref && (
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-white/90"
            >
              {ctaLabel ?? "Learn more"} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Right: the live app card */}
        <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_18px_50px_-24px_rgba(0,0,0,0.5)]">
        {/* app chrome */}
        <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
          <span className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
            <span className="glass-red grid h-4 w-4 place-items-center rounded-[5px]">
              <Flame className="h-2.5 w-2.5" />
            </span>
            Forkcast
          </span>
          <span className="text-xs font-medium text-ink/45">· Today</span>
          <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700">
            {dayPill}
          </span>
        </div>

        {/* stage — remounts per step so animations replay */}
        <div key={active} className="animate-rise min-h-[218px] p-5">
          <Stage
            active={active}
            targets={targets}
            dish={dish}
            pct={pct}
            left={left}
            photo={photo}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

function Stage({
  active,
  targets,
  dish,
  pct,
  left,
  photo,
}: {
  active: number;
  targets: { calories: number; protein: number; fiber: number; fat: number };
  dish: { name: string; calories: number; fit: number; restaurant: string };
  pct: number;
  left: number;
  photo: string;
}) {
  const budget = useCountUp(targets.calories, active, 1100);
  const fitN = useCountUp(dish.fit, active, 1000);
  const pctN = useCountUp(pct, active, 900);

  if (active === 0) {
    return (
      <>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink/40">
          Your daily budget
        </p>
        <div className="mt-3 flex items-center gap-5">
          <Ring size={128} stroke={11} value={100} color="#ec3013">
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold leading-none text-ink tabular-nums">
                {budget.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/40">
                kcal / day
              </div>
            </div>
          </Ring>
          <div className="flex-1 space-y-2.5">
            <MacroRow name="Protein" val={`${Math.round(targets.protein)} g`} frac={0.72} />
            <MacroRow name="Fiber" val={`${Math.round(targets.fiber)} g`} frac={0.55} />
            <MacroRow name="Fat" val={`${Math.round(targets.fat)} g`} frac={0.45} />
          </div>
        </div>
      </>
    );
  }

  if (active === 1) {
    return (
      <>
        <DishRow dish={dish} photo={photo} fitN={fitN} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip icon={<Flame className="h-3.5 w-3.5" />}>Fits your budget</Chip>
          <Chip icon={<Dumbbell className="h-3.5 w-3.5" />}>High protein</Chip>
          <Chip icon={<Leaf className="h-3.5 w-3.5" />}>Good fiber</Chip>
        </div>
      </>
    );
  }

  if (active === 2) {
    return (
      <>
        <DishRow dish={dish} photo={photo} fitN={fitN} added />
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-ink/55">Day planned</span>
            <span className="font-bold text-ink tabular-nums">{pctN}%</span>
          </div>
          <Bar frac={pct / 100} tall />
        </div>
        <div className="mt-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_-4px_rgba(236,48,19,0.5)]">
            <Send className="h-3.5 w-3.5" />
            Sent to {dish.restaurant}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3.5">
        <div className="glass-tile relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-2xl">
          <SmartImage src={photo} alt="" label={dish.name} className="h-full w-full object-cover" />
          <span className="glass absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full text-[#3b6d11]">
            <Check className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15.5px] font-semibold text-ink">{dish.name}</div>
          <div className="text-[13px] text-ink/55">Confirmed order · portion 1 · high confidence</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip icon={<CircleCheck className="h-3.5 w-3.5" />} tone="green">
          Logged automatically
        </Chip>
        <Chip icon={<Receipt className="h-3.5 w-3.5" />} tone="neutral">
          Source: order
        </Chip>
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-black/5 pt-3.5">
        <span className="text-[13px] text-ink/55">Today so far</span>
        <span className="font-display text-[15px] font-bold text-ink tabular-nums">
          {dish.calories}{" "}
          <span className="text-xs font-medium text-ink/40">
            / {targets.calories.toLocaleString()} kcal · {left.toLocaleString()} left
          </span>
        </span>
      </div>
    </>
  );
}

function MacroRow({ name, val, frac }: { name: string; val: string; frac: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11.5px]">
        <span className="text-ink/55">{name}</span>
        <span className="font-semibold text-ink">{val}</span>
      </div>
      <Bar frac={frac} />
    </div>
  );
}

function DishRow({
  dish,
  photo,
  fitN,
  added,
}: {
  dish: { name: string; calories: number; fit: number; restaurant: string };
  photo: string;
  fitN: number;
  added?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="glass-tile h-[66px] w-[66px] shrink-0 overflow-hidden rounded-2xl">
        <SmartImage src={photo} alt="" label={dish.name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15.5px] font-semibold text-ink">
          {dish.name}
          {added && <span className="ml-1.5 text-[11.5px] font-semibold text-[#3b6d11]">· added</span>}
        </div>
        <div className="text-[13px] text-ink/55">
          {dish.calories} kcal · {dish.restaurant}, Back Bay
        </div>
      </div>
      <Ring size={56} stroke={6} value={dish.fit} color={fitColor(dish.fit)}>
        <span className="font-display text-base font-extrabold text-ink tabular-nums">{fitN}</span>
      </Ring>
    </div>
  );
}

export default HowItWorks;
