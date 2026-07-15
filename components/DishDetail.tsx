"use client";

// Dish detail — handoff screen 4:
// photo, price, 72px Fit ring, "Why this fits" reason tags + warning tags,
// nutrient rows with bars and ± range, source/confidence line, allergen
// disclaimer, budget line, add-to-order.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Flame, Plus, ShieldAlert, ShoppingBag } from "lucide-react";
import { getRestaurant } from "@/data/restaurants";
import { useUser } from "@/lib/store";
import { useOrder } from "@/lib/order";
import { fitScore } from "@/lib/nutrition";
import { FitBadge } from "@/components/FitBadge";
import { SmartImage } from "@/components/SmartImage";
import { categoryImg } from "@/lib/images";
import { cls, money, pct } from "@/lib/format";

// Estimate uncertainty by source (labeled, never presented as measurement):
// partner-reviewed data carries a smaller band than menu-derived estimates.
const RANGE_VERIFIED = 0.05;
const RANGE_ESTIMATED = 0.15;

export function DishDetail({ slug, id }: { slug: string; id: string }) {
  const router = useRouter();
  const restaurant = getRestaurant(slug);
  const item = restaurant?.menu.find((m) => m.id === id);
  const { profile, targets, consumedToday, hydrated, logMeal } = useUser();
  const { addToCart } = useOrder();
  const [inCart, setInCart] = useState(false);
  const [logged, setLogged] = useState(false);

  if (!restaurant || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Dish not found</h1>
        <Link href="/discover" className="mt-4 inline-block text-brand-700 underline">Back to discover</Link>
      </div>
    );
  }

  const fit = targets && profile ? fitScore(item, targets, profile.goal) : null;
  const range = restaurant.partner ? RANGE_VERIFIED : RANGE_ESTIMATED;
  const consumed = hydrated ? consumedToday() : null;
  const remaining = targets && consumed ? Math.max(0, targets.calories - consumed.calories) : null;
  const budgetPct = remaining !== null && remaining > 0 ? Math.round((item.calories / remaining) * 100) : null;

  const addToOrder = () => {
    addToCart(slug, item.id);
    setInCart(true);
    setTimeout(() => setInCart(false), 2200);
  };

  const logIt = () => {
    logMeal({
      restaurantSlug: slug,
      restaurantName: restaurant.name,
      itemId: item.id,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber,
      sodium: item.sodium,
      sugar: item.sugar,
      source: "planned",
      confidence: restaurant.partner ? "partner-verified" : "estimated",
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 2200);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/restaurant/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {restaurant.name}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Photo + identity */}
        <div>
          <div className="relative overflow-hidden rounded-2xl">
            <SmartImage
              src={categoryImg(item.category, 0)}
              alt={item.name}
              label={item.name}
              className="h-72 w-full object-cover sm:h-80"
            />
            {fit && (
              <div className="absolute right-4 top-4">
                <FitBadge score={fit.score} grade={fit.grade} size="lg" />
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start justify-between gap-4 border-b-2 border-ink/40 pb-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{item.name}</h1>
              <p className="mt-1.5 text-ink/60">{item.description}</p>
            </div>
            <span className="shrink-0 font-display text-2xl font-extrabold text-ink">{money(item.price)}</span>
          </div>

          {/* Why this fits / warnings */}
          {fit ? (
            <div className="mt-4">
              <p className="kicker text-ink/45">Why this {fit.score >= 65 ? "fits" : "scores " + fit.score}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fit.reasons.map((r) => (
                  <span key={r} className="rounded-full border border-brand-600 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">{r}</span>
                ))}
                {fit.warnings.map((w) => (
                  <span key={w} className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{w}</span>
                ))}
                {!fit.reasons.length && !fit.warnings.length && (
                  <span className="text-sm text-ink/50">A middle-of-the-road choice for your goals.</span>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">
              <Link href="/onboarding" className="text-brand-700 underline">Set up your profile</Link> to see a personal Fit Score and why.
            </p>
          )}

          {/* Budget line */}
          {budgetPct !== null && (
            <p className="mt-4 flex items-center gap-2 text-sm text-ink/70">
              <Flame className="h-4 w-4 text-amber-accent" />
              Uses <strong className="tabular-nums">{budgetPct}%</strong> of the {remaining} cal left in your day
              {budgetPct > 100 ? " — over what remains" : ""}
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={addToOrder}
              className={cls(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition",
                inCart ? "bg-brand-950 text-white" : "bg-brand-600 text-white hover:bg-brand-700",
              )}
            >
              {inCart ? (<><Check className="h-4 w-4" /> In basket</>) : (<><ShoppingBag className="h-4 w-4" /> Add to order</>)}
            </button>
            <button
              onClick={logIt}
              className={cls(
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold transition",
                logged ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:border-ink",
              )}
            >
              {logged ? (<><Check className="h-4 w-4" /> Logged</>) : (<><Plus className="h-4 w-4" /> Log without ordering</>)}
            </button>
          </div>
        </div>

        {/* Nutrition panel */}
        <aside>
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Nutrition</h2>
              {restaurant.partner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">
                  <BadgeCheck className="h-3.5 w-3.5" /> Partner-verified
                </span>
              ) : (
                <span className="rounded-full border border-neutral-400 px-2.5 py-1 text-[11px] font-bold text-ink/70">Estimated ±{Math.round(RANGE_ESTIMATED * 100)}%</span>
              )}
            </div>

            <div className="mt-4 space-y-3.5">
              <NutrientRow label="Calories" value={item.calories} unit="cal" max={targets ? targets.calories * 0.35 : item.calories * 1.4} range={range} />
              <NutrientRow label="Protein" value={item.protein} unit="g" max={targets ? targets.protein * 0.4 : 50} range={range} accent />
              <NutrientRow label="Carbs" value={item.carbs} unit="g" max={targets ? targets.carbs * 0.4 : 80} range={range} />
              <NutrientRow label="Fat" value={item.fat} unit="g" max={targets ? targets.fat * 0.4 : 40} range={range} />
              <NutrientRow label="Fiber" value={item.fiber} unit="g" max={10} range={range} />
              <NutrientRow label="Sodium" value={item.sodium} unit="mg" max={2000} range={range} warnAt={1400} />
              <NutrientRow label="Sugar" value={item.sugar} unit="g" max={35} range={range} warnAt={25} />
            </div>

            {/* Source line */}
            <p className="mt-5 border-t border-black/5 pt-3 text-xs text-ink/50">
              Source: {restaurant.partner
                ? `menu data reviewed with ${restaurant.name}; corrections are versioned and timestamped.`
                : `estimated from ${restaurant.name}'s public menu by the Forkcast nutrition engine; not yet reviewed by the restaurant.`}
              {" "}Values are estimates with a ±{Math.round(range * 100)}% range, not measurements.
            </p>
          </div>

          {/* Allergen disclaimer */}
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Allergens &amp; preparation.</strong> Forkcast cannot guarantee allergen absence — kitchens change and
                cross-contact happens. Always confirm directly with the restaurant before ordering.
                {profile?.avoid?.length ? ` Your profile flags: ${profile.avoid.join(", ")}.` : ""}
              </span>
            </p>
          </div>

          {/* Correction history — honest empty state until real corrections exist */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
            <p className="kicker text-ink/45">Correction history</p>
            <p className="mt-1.5 text-xs text-ink/55">
              No corrections recorded for this dish yet. When a restaurant or diner corrects a value, each change is
              logged here with a timestamp and version — never silently.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NutrientRow({
  label,
  value,
  unit,
  max,
  range,
  accent = false,
  warnAt,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  range: number;
  accent?: boolean;
  warnAt?: number;
}) {
  const p = Math.min(100, pct(value, Math.max(1, max)));
  const lo = Math.round(value * (1 - range));
  const hi = Math.round(value * (1 + range));
  const warn = warnAt !== undefined && value > warnAt;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="tabular-nums text-ink/70">
          <strong className={cls("text-ink", warn && "text-amber-700")}>{value.toLocaleString()}</strong> {unit}
          <span className="ml-1.5 text-xs text-ink/40">({lo.toLocaleString()}–{hi.toLocaleString()})</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cls("h-full rounded-full", warn ? "bg-amber-accent" : accent ? "bg-brand-600" : "bg-neutral-500")}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}
