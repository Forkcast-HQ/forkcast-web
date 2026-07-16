"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Sparkles, Trash2, Camera, Utensils, PencilLine, Flame, Trophy, Target, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import { GOAL_LABELS, bmiInfo, kgToLb, fitScore, personalAdjust } from "@/lib/nutrition";
import { allMenuItems } from "@/data/restaurants";
import { coachTip } from "@/lib/ai";
import { MacroRing, MacroBar } from "@/components/MacroRing";
import { PhotoLogger } from "@/components/PhotoLogger";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CountUp } from "@/components/CountUp";
import { cls, todayKey } from "@/lib/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const { user, hydrated: authHydrated } = useAuth();
  const { profile, targets, hydrated, meals, weights, consumedToday, todaysMeals, removeMeal, streak } = useUser();

  useEffect(() => {
    if (authHydrated && !user) router.replace("/login");
  }, [authHydrated, user, router]);

  const consumed = hydrated ? consumedToday() : null;
  const today = hydrated ? todaysMeals() : [];

  const weekData = useMemo(() => {
    if (!targets) return [];
    const days: { day: string; calories: number }[] = [];
    const now = new Date();
    const byDay = new Map<string, number>();
    for (const m of meals) {
      const k = todayKey(new Date(m.loggedAt));
      byDay.set(k, (byDay.get(k) ?? 0) + m.calories);
    }
    const sparse = meals.length < 3;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = todayKey(d);
      let cal = byDay.get(k) ?? 0;
      if (sparse && i > 0) {
        const wobble = ((i * 37) % 9) - 4;
        cal = Math.round((targets.calories * (1 + (wobble - 1) / 40)) / 10) * 10;
      }
      days.push({ day: DAY_LABELS[d.getDay()], calories: cal });
    }
    return days;
  }, [meals, targets]);

  const weightData = useMemo(() => {
    if (!profile) return [];
    if (weights.length >= 2) {
      return weights.slice(-10).map((w) => ({ date: w.date.slice(5), lb: Math.round(kgToLb(w.weightKg) * 10) / 10 }));
    }
    const base = kgToLb(profile.weightKg);
    const dir = profile.goal === "lose" ? -1 : profile.goal === "gain" ? 1 : 0;
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 - i) * 4);
      return { date: todayKey(d).slice(5), lb: Math.round((base + dir * (7 - i) * 0.6) * 10) / 10 };
    });
  }, [weights, profile]);

  // Next best meals — personalized: allergen hits excluded, condition-flagged
  // dishes ranked below clean alternatives (they stay visible on menus, flagged).
  const recommended = useMemo(() => {
    if (!targets || !profile) return [];
    return allMenuItems()
      .map((m) => ({ m, fit: fitScore(m, targets, profile.goal).score, adj: personalAdjust(m, profile) }))
      .filter((x) => !x.adj.exclude)
      .sort((a, b) => b.fit - b.adj.penalty - (a.fit - a.adj.penalty))
      .slice(0, 6)
      .map((x) => x.m);
  }, [targets, profile]);

  if (!authHydrated || !hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink/40">Loading your plan…</div>;
  }
  if (!user) return null;

  if (!profile || !targets) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Utensils className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">Finish setting up</h1>
        <p className="mt-3 text-lg text-ink/60">Build your health cabinet to unlock your dashboard, targets, and Fit Scores.</p>
        <Link href="/onboarding" className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700">
          Build my plan <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, targets.calories - consumed!.calories);
  const proteinLeft = Math.max(0, targets.protein - consumed!.protein);
  const bmi = bmiInfo(profile.weightKg, profile.heightCm);
  const days = streak();
  const tip = coachTip({ goal: profile.goal, name: profile.name?.split(" ")[0], calLeft: targets.calories - consumed!.calories, proteinLeft });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {GOAL_LABELS[profile.goal]} · BMI {bmi.value} ({bmi.category})
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            {greeting()}{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {days > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
              <Flame className="h-4 w-4" /> {days}-day streak
            </span>
          )}
          <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink">
            <ShoppingBag className="h-4 w-4" /> Orders
          </Link>
          <Link href="/discover" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Sparkles className="h-4 w-4" /> Find a meal
          </Link>
        </div>
      </div>

      {/* Coach */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><Sparkles className="h-4 w-4" /></span>
        <p className="text-sm text-ink/80"><span className="font-semibold text-brand-700">Coach:</span> {tip}</p>
      </div>

      {/* Row 1: Today + Photo */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-black/5 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-ink">Today&apos;s nutrition</h2>
          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
            <MacroRing value={consumed!.calories} max={targets.calories} size={170} stroke={16} centerTop="Calories" centerMain={String(consumed!.calories)} centerSub={`${remaining} left`} />
            <div className="w-full flex-1 space-y-4">
              <MacroBar label="Protein" value={consumed!.protein} max={targets.protein} color="#ec3013" />
              <MacroBar label="Carbs" value={consumed!.carbs} max={targets.carbs} color="#7d7979" />
              <MacroBar label="Fat" value={consumed!.fat} max={targets.fat} color="#e0853a" />
              <MacroBar label="Fiber" value={consumed!.fiber} max={targets.fiber} color="#4a7c59" />
              <div className="flex justify-between pt-1 text-xs text-ink/50">
                <span>Sodium {consumed!.sodium}mg</span>
                <span>Sugar {consumed!.sugar}g</span>
                <span>TDEE {targets.tdee} kcal</span>
              </div>
            </div>
          </div>
        </div>
        <PhotoLogger />
      </div>

      {/* Row 2: stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={<Flame className="h-5 w-5" />} label="Calories left" value={<CountUp value={remaining} />} tone="brand" />
        <Tile icon={<Target className="h-5 w-5" />} label="Protein to go" value={<><CountUp value={proteinLeft} />g</>} />
        <Tile icon={<Trophy className="h-5 w-5" />} label="Logging streak" value={<><CountUp value={days} /> {days === 1 ? "day" : "days"}</>} />
        <Tile icon={<Utensils className="h-5 w-5" />} label="Meals today" value={<CountUp value={today.length} />} />
      </div>

      {/* Row 3: Next best meals — full-width swipeable rail */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-bold text-ink">Next best meals for the rest of your day</h2>
          </div>
          <Link href="/discover" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
            Discover <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recommended.length ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {recommended.map((m, i) => (
              <div key={m.id} className="w-[88%] min-w-[300px] max-w-md shrink-0 snap-start sm:w-[46%] lg:w-[32%]">
                <MenuItemCard item={m} restaurantSlug={(m as any).restaurantSlug} restaurantName={(m as any).restaurantName} seed={i} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">Set your goals to get recommendations.</p>
        )}
      </div>

      {/* Row 3b: Logged today */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Logged today</h2>
            <Link href="/log" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
              Full log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {today.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Nothing logged yet. Snap a photo or add a dish from a restaurant.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {today.slice().reverse().map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className={cls("grid h-9 w-9 shrink-0 place-items-center rounded-lg", m.source === "photo" ? "bg-brand-50 text-brand-600" : m.source === "order" ? "bg-brand-50 text-brand-700" : "bg-black/5 text-ink/50")}>
                    {m.source === "photo" ? <Camera className="h-4 w-4" /> : m.source === "order" ? <ShoppingBag className="h-4 w-4" /> : m.source === "manual" ? <PencilLine className="h-4 w-4" /> : <Utensils className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                    <p className="truncate text-xs text-ink/50">
                      {m.calories} cal · {m.protein}g P{m.restaurantName ? ` · ${m.restaurantName}` : ""}
                      {m.source === "order" && m.orderRef ? ` · Order ${m.orderRef}` : ""}
                      {m.confidence ? ` · ${m.confidence === "partner-verified" ? "verified" : "estimated"}` : ""}
                      {m.portion && m.portion !== 1 ? ` · ${m.portion}× portion` : ""}
                      {m.userConfidence && m.userConfidence !== "as-served" ? ` · ${m.userConfidence === "modified" ? "modified" : "low confidence"}` : ""}
                    </p>
                  </div>
                  <button onClick={() => removeMeal(m.id)} className="rounded-lg p-1.5 text-ink/30 transition hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Weight</h2>
            <span className="text-sm text-ink/50">{Math.round(kgToLb(profile.weightKg))} lb</span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 3", "dataMax + 3"]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }} formatter={(v: number) => [`${v} lb`, "Weight"]} />
                <Line type="monotone" dataKey="lb" stroke="#ec3013" strokeWidth={2.5} dot={{ r: 3, fill: "#ec3013" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: weekly trend — full width */}
      <div className="mt-6">
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Calories this week</h2>
            {meals.length < 3 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Sample — fills in as you log</span>}
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec3013" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ec3013" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }} formatter={(v: number) => [`${v} cal`, "Calories"]} />
                <ReferenceLine y={targets.calories} stroke="#e0853a" strokeDasharray="5 4" label={{ value: "target", fontSize: 11, fill: "#e0853a", position: "right" }} />
                <Area type="monotone" dataKey="calories" stroke="#ec3013" strokeWidth={2.5} fill="url(#cal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: "brand" }) {
  return (
    <div className={cls("rounded-2xl border p-5", tone === "brand" ? "border-brand-200 bg-brand-50" : "border-black/5 bg-white")}>
      <span className={cls("grid h-9 w-9 place-items-center rounded-lg", tone === "brand" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600")}>{icon}</span>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{label}</p>
    </div>
  );
}
