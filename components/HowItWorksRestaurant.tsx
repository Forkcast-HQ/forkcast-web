"use client";

/**
 * HowItWorksRestaurant — the For Restaurants onboarding flow.
 *
 * The live card is the partner's Forkcast dashboard, updating in place:
 *   01 Claim your listing    → verified badge goes live
 *   02 Add your menu         → per-dish nutrition + Fit Score auto-compute
 *   03 Verify & publish      → review, publish, live to diners
 *   04 Orders & insight       → pickup orders (with allergy flags) + growth
 *
 * Reuses the liquid-glass utilities from globals.css and the same rhythm
 * as the consumer <HowItWorks> so both pages read as one product.
 */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Check,
  Globe,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { useCatalog } from "@/lib/catalogContext";
import { categoryImg } from "@/lib/images";
import { computeTargets, fitColor, fitScore } from "@/lib/nutrition";
import type { HealthProfile } from "@/lib/types";

const STEPS = [
  {
    n: "01",
    label: "Claim",
    title: "Claim your listing",
    body: "Confirm your restaurant and locations — independents included. Your verified badge goes live the moment you're approved.",
    pill: "Claiming",
  },
  {
    n: "02",
    label: "Menu",
    title: "Add your menu",
    body: "Upload or paste your menu. Forkcast auto-computes per-dish calories, macros, and a Fit Score for every item — no lab bill.",
    pill: "Analyzing",
  },
  {
    n: "03",
    label: "Verify",
    title: "Verify & publish",
    body: "Review the numbers, adjust anything that's off, and publish. Diners now see accurate, verified nutrition on your dishes.",
    pill: "Published",
  },
  {
    n: "04",
    label: "Grow",
    title: "Orders & insight roll in",
    body: "Higher-intent diners find your best dishes. Pickup orders arrive with allergy flags, and your dashboard shows what's winning.",
    pill: "Live",
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
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.3,.7,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

function Bar({ frac }: { frac: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(frac));
    return () => cancelAnimationFrame(id);
  }, [frac]);
  return (
    <div className="h-2 overflow-hidden rounded-full border border-black/5 bg-neutral-100">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.round(w * 100)}%`,
          background: "linear-gradient(90deg,#ff563c,#ec3013)",
          transition: "width .9s cubic-bezier(.3,.7,.3,1)",
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
  tone?: "brand" | "green" | "amber" | "neutral";
}) => {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-[#eafaf1] text-[#0f6e56]",
    amber: "bg-[#fdf0dd] text-[#8a5a12]",
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

export function HowItWorksRestaurant() {
  const { restaurants: RESTAURANTS } = useCatalog();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), AUTO_MS);
    return () => clearInterval(id);
  }, [touched]);

  const go = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const step = STEPS[active];

  // Catalog loads async from Supabase — briefly empty on first mount.
  if (!RESTAURANTS.length) return null;

  const targets = computeTargets(DEMO_PROFILE);
  const item = RESTAURANTS[0].menu[0]; // Harvest Power Bowl (Verdant)
  const fit = fitScore(item, targets, DEMO_PROFILE.goal).score;
  const photo = categoryImg(item.category, 11, 256, 256);
  const dish = {
    name: item.name,
    kcal: item.calories,
    protein: Math.round(item.protein),
    fiber: Math.round(item.fiber),
    fit,
    restaurant: RESTAURANTS[0].name,
    neighborhood: RESTAURANTS[0].neighborhood,
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      {/* Left: rail + copy */}
      <div>
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

        <div key={active} className="animate-rise mt-7">
          <div className="font-display text-5xl font-extrabold leading-none text-white/20 sm:text-6xl">
            {step.n}
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold text-white">{step.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{step.body}</p>
        </div>
      </div>

      {/* Right: partner dashboard card */}
      <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_18px_50px_-24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
          <span className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
            <span className="glass-red grid h-[18px] w-[18px] place-items-center rounded-md">
              <Store className="h-2.5 w-2.5" />
            </span>
            Forkcast
          </span>
          <span className="text-xs font-medium text-ink/45">· Partner</span>
          <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700">
            {step.pill}
          </span>
        </div>

        <div key={active} className="animate-rise min-h-[214px] p-5">
          <Stage active={active} dish={dish} photo={photo} />
        </div>
      </div>
    </div>
  );
}

function Stage({
  active,
  dish,
  photo,
}: {
  active: number;
  dish: {
    name: string;
    kcal: number;
    protein: number;
    fiber: number;
    fit: number;
    restaurant: string;
    neighborhood: string;
  };
  photo: string;
}) {
  const fitN = useCountUp(dish.fit, active, 1000);
  const dishesN = useCountUp(6, active, 1100);
  const viewsN = useCountUp(1240, active, 1200);

  if (active === 0) {
    return (
      <>
        <div className="flex items-center gap-3.5">
          <div className="glass-tile grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neutral-500 to-neutral-800 text-white">
            <Store className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-semibold text-ink">{dish.restaurant}</div>
            <div className="text-[13px] text-ink/55">{dish.neighborhood} · 1 location</div>
          </div>
          <Chip icon={<BadgeCheck className="h-3.5 w-3.5" />} tone="green">
            Verified Partner
          </Chip>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip icon={<MapPin className="h-3.5 w-3.5" />} tone="neutral">
            Independent
          </Chip>
          <Chip icon={<ShieldCheck className="h-3.5 w-3.5" />} tone="neutral">
            Listing claimed
          </Chip>
        </div>
      </>
    );
  }

  if (active === 1) {
    return (
      <>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink/40">
          Importing menu
        </p>
        <div className="mb-1.5 mt-1.5 flex items-center justify-between text-xs">
          <span className="text-ink/55">Computing nutrition</span>
          <span className="font-bold text-ink tabular-nums">{dishesN} / 6 dishes</span>
        </div>
        <Bar frac={1} />
        <div className="mt-4 flex items-center gap-3.5">
          <DishThumb photo={photo} name={dish.name} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-semibold text-ink">{dish.name}</div>
            <div className="text-[13px] text-ink/55">
              {dish.kcal} kcal · {dish.protein}g protein · {dish.fiber}g fiber
            </div>
          </div>
          <Ring size={52} stroke={6} value={dish.fit} color={fitColor(dish.fit)}>
            <span className="font-display text-[15px] font-extrabold text-ink tabular-nums">{fitN}</span>
          </Ring>
        </div>
        <div className="mt-3.5">
          <Chip icon={<Sparkles className="h-3.5 w-3.5" />}>Fit Score auto-computed</Chip>
        </div>
      </>
    );
  }

  if (active === 2) {
    return (
      <>
        <div className="flex items-center gap-3.5">
          <DishThumb photo={photo} name={dish.name} check />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-semibold text-ink">{dish.name}</div>
            <div className="text-[13px] text-ink/55">
              {dish.kcal} kcal · {dish.protein}g protein · verified
            </div>
          </div>
          <Ring size={52} stroke={6} value={dish.fit} color={fitColor(dish.fit)}>
            <span className="font-display text-[15px] font-extrabold text-ink tabular-nums">{fitN}</span>
          </Ring>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip icon={<BadgeCheck className="h-3.5 w-3.5" />} tone="green">
            Verified &amp; published
          </Chip>
          <Chip icon={<Pencil className="h-3.5 w-3.5" />} tone="neutral">
            Correct anytime
          </Chip>
        </div>
        <div className="mt-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_-4px_rgba(236,48,19,0.5)]">
            <Globe className="h-3.5 w-3.5" />
            Live to diners
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3.5">
        <div className="glass-tile grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Bell className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-semibold text-ink">New pickup order</div>
          <div className="text-[13px] text-ink/55">{dish.name} · ready 6:40pm</div>
        </div>
        <Chip icon={<AlertTriangle className="h-3.5 w-3.5" />} tone="amber">
          Allergy: nuts
        </Chip>
      </div>
      <div className="mt-4 flex gap-2.5">
        <div className="flex-1 rounded-xl bg-neutral-100 px-3.5 py-3">
          <div className="text-[11px] text-ink/50">Profile views</div>
          <div className="font-display text-lg font-extrabold text-ink tabular-nums">{viewsN.toLocaleString()}</div>
        </div>
        <div className="flex-1 rounded-xl bg-neutral-100 px-3.5 py-3">
          <div className="text-[11px] text-ink/50">Top dish this week</div>
          <div className="font-display text-sm font-bold text-ink">{dish.name}</div>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-ink/55">
        6% per order we originate · $0 on walk-ins &amp; your own channels
      </p>
    </>
  );
}

function DishThumb({ photo, name, check }: { photo: string; name: string; check?: boolean }) {
  return (
    <div className="glass-tile relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl">
      <SmartImage src={photo} alt="" label={name} className="h-full w-full object-cover" />
      {check && (
        <span className="glass absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full text-[#3b6d11]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}

export default HowItWorksRestaurant;
