"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Sparkles, Trash2, Camera, Utensils, PencilLine, Flame, Trophy, Target, ShoppingBag, MapPin, Clock, Info } from "lucide-react";
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
    else if (authHydrated && user?.role === "restaurant") router.replace("/partner");
  }, [authHydrated, user, router]);

  const consumed = hydrated ? consumedToday() : null;
  const today = hydrated ? todaysMeals() : [];

  const weekData = useMemo(() => {
    if (!targets) return { days: [] as { day: string; calories: number; sample: boolean }[], sparse: true };
    const now = new Date();
    const byDay = new Map<string, number>();
    for (const m of meals) {
      const k = todayKey(new Date(m.loggedAt));
      byDay.set(k, (byDay.get(k) ?? 0) + m.calories);
    }
    const sparse = meals.length < 3;
    const days: { day: string; calories: number; sample: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = todayKey(d);
      const real = byDay.get(k);
      if (real !== undefined && real > 0) {
        days.push({ day: DAY_LABELS[d.getDay()], calories: real, sample: false });
      } else if (sparse && i > 0) {
        // Sample days hover around the target so the chart teaches the shape.
        const wobble = ((i * 37) % 9) - 4;
        days.push({ day: DAY_LABELS[d.getDay()], calories: Math.round((targets.calories * (1 + wobble / 30)) / 10) * 10, sample: true });
      } else {
        days.push({ day: DAY_LABELS[d.getDay()], calories: 0, sample: false });
      }
    }
    return { days, sparse };
  }, [meals, targets]);

  // ---- Eating-pattern analytics (last 30 days of real logs) ----
  const patterns = useMemo(() => {
    if (!targets) return null;
    const cutoff = Date.now() - 30 * 86400000;
    const recent = meals.filter((m) => m.loggedAt >= cutoff);
    // Day totals (real logged days only, excluding today)
    const byDay = new Map<string, number>();
    const tk = todayKey();
    for (const m of recent) {
      const k = todayKey(new Date(m.loggedAt));
      if (k !== tk) byDay.set(k, (byDay.get(k) ?? 0) + m.calories);
    }
    const dayTotals = Array.from(byDay.values());
    const last7 = dayTotals.slice(-7);
    const avg = dayTotals.length ? Math.round(dayTotals.reduce((s, v) => s + v, 0) / dayTotals.length) : null;
    const onTarget = last7.filter((v) => v <= targets.calories).length;
    // Favorite places + categories
    const restCount = new Map<string, { name: string; n: number }>();
    const catCount = new Map<string, number>();
    const windows = { Morning: 0, Midday: 0, Evening: 0 };
    for (const m of recent) {
      if (m.restaurantSlug && m.restaurantName) {
        const cur = restCount.get(m.restaurantSlug) ?? { name: m.restaurantName, n: 0 };
        restCount.set(m.restaurantSlug, { ...cur, n: cur.n + 1 });
      }
      const h = new Date(m.loggedAt).getHours();
      if (h < 11) windows.Morning++;
      else if (h < 16) windows.Midday++;
      else windows.Evening++;
    }
    const items = allMenuItems();
    for (const m of recent) {
      if (!m.itemId) continue;
      const it = items.find((x) => x.id === m.itemId && x.restaurantSlug === m.restaurantSlug);
      if (it) catCount.set(it.category, (catCount.get(it.category) ?? 0) + 1);
    }
    const topSpots = Array.from(restCount.entries())
      .map(([slug, v]) => ({ slug, ...v }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
    return { avg, onTarget, daysLogged: last7.length, topSpots, catCount, restCount, windows, mealsLogged: recent.length };
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

  // Next best meals — fit + safety + HABITS: dishes from categories and
  // restaurants you actually eat get a modest boost, with the reason shown.
  // Allergen hits stay excluded; condition-flagged dishes rank below clean ones.
  const recommended = useMemo(() => {
    if (!targets || !profile) return [];
    const catCount = patterns?.catCount ?? new Map<string, number>();
    const restCount = patterns?.restCount ?? new Map<string, { name: string; n: number }>();
    return allMenuItems()
      .map((m) => {
        const fit = fitScore(m, targets, profile.goal).score;
        const adj = personalAdjust(m, profile);
        const nCat = catCount.get(m.category) ?? 0;
        const nRest = restCount.get(m.restaurantSlug)?.n ?? 0;
        const habitBonus = Math.min(10, nCat * 3) + Math.min(8, nRest * 2);
        const reason =
          nRest >= 2 ? `You order from ${m.restaurantName} often` :
          nCat >= 2 ? `You tend to enjoy ${m.category.replace(/-/g, " ")}s` :
          null;
        return { m, adj, reason, score: fit - adj.penalty + habitBonus };
      })
      .filter((x) => !x.adj.exclude)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [targets, profile, patterns]);

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
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommended.map(({ m, reason }, i) => (
              <div key={m.id} className="w-[88%] min-w-[300px] max-w-md shrink-0 snap-start sm:w-[46%] lg:w-[32%]">
                <MenuItemCard item={m} restaurantSlug={(m as any).restaurantSlug} restaurantName={(m as any).restaurantName} seed={i} />
                {reason && (
                  <p className="mt-1.5 flex items-center gap-1 pl-1 text-[11px] font-semibold text-brand-700">
                    <Sparkles className="h-3 w-3" /> {reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">Set your goals to get recommendations.</p>
        )}
        <p className="mt-1 text-xs text-ink/45">Ranked by Fit Score for what&apos;s left of your day, your safety flags, and your recent eating habits.</p>
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

        {/* Eating patterns — habit analytics from your real logs */}
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-ink">Your eating patterns</h2>
          {!patterns || patterns.mealsLogged === 0 ? (
            <p className="mt-4 text-sm text-ink/50">
              Patterns appear after your first few logged meals — order or photo-log to start building the picture.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/[0.03] p-3">
                  <p className="kicker text-ink/45">Days on budget</p>
                  <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                    {patterns.onTarget}<span className="text-base text-ink/40">/{Math.max(1, patterns.daysLogged)}</span>
                  </p>
                  <p className="text-[11px] text-ink/45">of your last logged days</p>
                </div>
                <div className="rounded-xl bg-black/[0.03] p-3">
                  <p className="kicker text-ink/45">Daily average</p>
                  <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                    {patterns.avg !== null ? patterns.avg.toLocaleString() : "—"}
                  </p>
                  <p className={cls("text-[11px]", patterns.avg !== null && patterns.avg > targets.calories ? "font-semibold text-amber-700" : "text-ink/45")}>
                    {patterns.avg !== null
                      ? patterns.avg > targets.calories
                        ? `${(patterns.avg - targets.calories).toLocaleString()} over your ${targets.calories.toLocaleString()} target`
                        : `${(targets.calories - patterns.avg).toLocaleString()} under your ${targets.calories.toLocaleString()} target`
                      : "logs needed"}
                  </p>
                </div>
              </div>

              {patterns.topSpots.length > 0 && (
                <div>
                  <p className="kicker text-ink/45">Your usual spots</p>
                  <ul className="mt-2 space-y-1.5">
                    {patterns.topSpots.map((s) => (
                      <li key={s.slug} className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                        <Link href={`/restaurant/${s.slug}`} className="min-w-0 truncate font-semibold text-ink hover:text-brand-700">{s.name}</Link>
                        <span className="ml-auto shrink-0 tabular-nums text-xs text-ink/45">{s.n} {s.n === 1 ? "meal" : "meals"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="kicker text-ink/45">When you eat</p>
                <div className="mt-2 flex gap-1.5">
                  {(Object.entries(patterns.windows) as [string, number][]).map(([w, n]) => {
                    const total = Math.max(1, patterns.mealsLogged);
                    return (
                      <span key={w} className="flex-1 rounded-lg bg-black/[0.03] px-2 py-1.5 text-center">
                        <Clock className="mx-auto h-3 w-3 text-ink/35" />
                        <span className="block text-[11px] font-bold text-ink/70">{w}</span>
                        <span className="block text-[11px] tabular-nums text-ink/45">{Math.round((n / total) * 100)}%</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: charts — weekly bars vs target + weight trend */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Calories this week</h2>
            {weekData.sparse && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Sample — fills in as you log</span>}
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData.days} margin={{ top: 12, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#7d7979" }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, Math.ceil((targets.calories * 1.25) / 500) * 500]}
                  ticks={[0, Math.round(targets.calories / 2), targets.calories, Math.ceil((targets.calories * 1.25) / 500) * 500]}
                  tickFormatter={(v: number) => v.toLocaleString()}
                  tick={{ fontSize: 11, fill: "#7d7979" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  cursor={{ fill: "rgba(32,30,29,0.04)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
                  formatter={(v: number, _n, entry) => [`${v.toLocaleString()} cal${(entry?.payload as { sample?: boolean })?.sample ? " (sample)" : ""}`, "Calories"]}
                />
                <ReferenceLine
                  y={targets.calories}
                  stroke="#e0853a"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  label={{ value: `target ${targets.calories.toLocaleString()}`, fontSize: 11, fill: "#e0853a", position: "insideTopRight" }}
                />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {weekData.days.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.sample ? "#d7d3d3" : d.calories > targets.calories ? "#ec3013" : "#444141"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-ink/45">
            Dark bars fit your budget · red bars went over · gray bars are illustrative samples until you log.
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Weight</h2>
            <span className="text-sm tabular-nums text-ink/50">{Math.round(kgToLb(profile.weightKg))} lb</span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7d7979" }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[(min: number) => Math.floor(min - 2), (max: number) => Math.ceil(max + 2)]}
                  allowDecimals={false}
                  tickFormatter={(v: number) => String(Math.round(v))}
                  tick={{ fontSize: 11, fill: "#7d7979" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }} formatter={(v: number) => [`${v} lb`, "Weight"]} />
                <Line type="monotone" dataKey="lb" stroke="#ec3013" strokeWidth={2.5} dot={{ r: 3, fill: "#ec3013" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology — where the numbers come from */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5">
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-ink/55">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>
            <strong className="text-ink">Where your daily target comes from:</strong> resting energy via the{" "}
            <strong>Mifflin-St Jeor equation</strong> (the clinical standard recommended by the Academy of Nutrition and
            Dietetics), scaled by your activity level, then adjusted for your goal (−500 kcal to lose ≈1 lb/week, +300 to
            gain lean mass) with safety floors of 1,500/1,200 kcal. Protein follows ISSN guidance, fiber follows the
            Dietary Guidelines for Americans (14 g per 1,000 kcal), and BMI categories follow CDC definitions. These are
            evidence-based estimates for healthy adults, not medical advice —{" "}
            <Link href="/how-it-works" className="font-semibold text-brand-700 underline">see the full methodology</Link>.
          </span>
        </p>
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
