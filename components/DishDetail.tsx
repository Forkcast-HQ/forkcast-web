"use client";

// Dish detail — handoff screen 4:
// photo, price, 72px Fit ring, "Why this fits" reason tags + warning tags,
// nutrient rows with bars and ± range, source/confidence line, allergen
// disclaimer, budget line, add-to-order.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Flame, ShieldAlert, ShoppingBag } from "lucide-react";
import { useCatalog } from "@/lib/catalogContext";
import { useUser } from "@/lib/store";
import { useOrder } from "@/lib/order";
import { useAuth } from "@/lib/auth";
import { conditionWarnings, fitScore } from "@/lib/nutrition";
import { correctionsFor } from "@/lib/bus";
import { flyToBasket } from "@/lib/fly";
import type { MenuCorrection } from "@/lib/types";
import { FitBadge } from "@/components/FitBadge";
import { SmartImage } from "@/components/SmartImage";
import { dishImg } from "@/lib/images";
import { cls, money, pct } from "@/lib/format";

// Estimate uncertainty by source (labeled, never presented as measurement):
// partner-reviewed data carries a smaller band than menu-derived estimates.
const RANGE_VERIFIED = 0.05;
const RANGE_ESTIMATED = 0.15;

export function DishDetail({ slug, id }: { slug: string; id: string }) {
  const router = useRouter();
  const { getRestaurant, loading: catalogLoading } = useCatalog();
  const restaurant = getRestaurant(slug);
  const item = restaurant?.menu.find((m) => m.id === id);
  const { profile, targets, consumedToday, hydrated } = useUser();
  const { addToCart } = useOrder();
  const { user } = useAuth();
  const [inCart, setInCart] = useState(false);
  const [guestNudge, setGuestNudge] = useState(false);
  const [portion, setPortion] = useState(1); // live preview multiplier
  const [corrections, setCorrections] = useState<MenuCorrection[]>([]);

  useEffect(() => {
    setCorrections(correctionsFor(slug, id));
  }, [slug, id]);

  if (catalogLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-ink/40">Loading…</div>;
  }

  if (!restaurant || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Dish not found</h1>
        <Link href="/discover" className="mt-4 inline-block text-brand-700 underline">Back to discover</Link>
      </div>
    );
  }

  const fit = targets && profile ? fitScore(item, targets, profile.goal) : null;
  const published = restaurant.dataSource === "published";
  const range = restaurant.partner || published ? RANGE_VERIFIED : RANGE_ESTIMATED;
  const itemText = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const allergenHits = (profile?.avoid ?? []).filter((a) => itemText.includes(a.toLowerCase()));
  const condWarns = conditionWarnings(item, profile?.conditions);
  const consumed = hydrated ? consumedToday() : null;
  const remaining = targets && consumed ? Math.max(0, targets.calories - consumed.calories) : null;
  const budgetPct = remaining !== null && remaining > 0 ? Math.round(((item.calories * portion) / remaining) * 100) : null;
  const scaled = (v: number) => Math.round(v * portion);

  const addToOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(slug, item.id);
    flyToBasket(e.currentTarget);
    setInCart(true);
    setTimeout(() => setInCart(false), 2200);
    if (!user) setGuestNudge(true); // guests get a clear next step, not silence
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
              src={item.photoUrl ?? dishImg(slug, item.id, item.category, 0)}
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
                {allergenHits.map((a) => (
                  <span key={a} className="rounded-full border-2 border-brand-600 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700" title="From menu text — always confirm with the restaurant">
                    ⚠ May contain {a.toLowerCase()}
                  </span>
                ))}
                {condWarns.map((w) => (
                  <span key={w} className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{w}</span>
                ))}
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

          {/* Budget line — live with portion */}
          {budgetPct !== null && (
            <p className="mt-4 flex items-center gap-2 text-sm text-ink/70">
              <Flame className="h-4 w-4 text-amber-accent" />
              {portion !== 1 ? `${portion}× portion uses` : "Uses"}{" "}
              <strong className="tabular-nums">{budgetPct}%</strong> of the {remaining} cal left in your day
              {budgetPct > 100 ? " — over what remains" : ""}
            </p>
          )}

          {/* Action — meals reach your log through a confirmed order (or a photo) */}
          <div className="mt-5">
            <button
              onClick={addToOrder}
              className={cls(
                "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition",
                inCart ? "bg-brand-950 text-white" : "bg-brand-600 text-white hover:bg-brand-700",
              )}
            >
              {inCart ? (<><Check className="h-4 w-4" /> In basket</>) : (<><ShoppingBag className="h-4 w-4" /> Add to order</>)}
            </button>
            <p className="mt-2 text-center text-xs text-ink/45">
              Logged to your day once the meal is confirmed — with portion edits and the order reference attached.
            </p>

            {/* Guest nudge: adding works without an account, but the next step
                is explicit — never a silent add for signed-out visitors. */}
            {guestNudge && !user && (
              <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                <p className="text-sm font-semibold text-ink">
                  <Check className="mr-1 inline h-4 w-4 text-brand-600" />
                  Added to your basket.
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  Create a free account to see your personal Fit Score on every dish and log this
                  meal to your day automatically when the order&apos;s confirmed.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/signup" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                    Get started — it&apos;s free
                  </Link>
                  <Link href="/login" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/25">
                    Log in
                  </Link>
                  <Link href="/basket" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/25">
                    View basket
                  </Link>
                </div>
              </div>
            )}
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
              ) : published ? (
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-brand-600 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                  <BadgeCheck className="h-3.5 w-3.5" /> Published
                </span>
              ) : (
                <span className="rounded-full border border-neutral-400 px-2.5 py-1 text-[11px] font-bold text-ink/70">Estimated ±{Math.round(RANGE_ESTIMATED * 100)}%</span>
              )}
            </div>

            {/* Interactive macro donut */}
            <MacroDonut protein={scaled(item.protein)} carbs={scaled(item.carbs)} fat={scaled(item.fat)} calories={scaled(item.calories)} />

            {/* Portion slider — everything below updates live */}
            <div className="mt-5 rounded-xl bg-black/[0.03] p-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-ink">Portion</span>
                <span className="font-bold tabular-nums text-brand-700">{portion}× · {scaled(item.calories)} cal</span>
              </div>
              <input
                type="range"
                min={0.25}
                max={2}
                step={0.25}
                value={portion}
                onChange={(e) => setPortion(Number(e.target.value))}
                className="mt-2 w-full accent-[#ec3013]"
                aria-label="Portion size"
              />
              <div className="flex justify-between text-[10px] text-ink/40"><span>¼×</span><span>1×</span><span>2×</span></div>
            </div>

            <div className="mt-4 space-y-3.5">
              <NutrientRow label="Calories" value={scaled(item.calories)} unit="cal" max={targets ? targets.calories * 0.35 : item.calories * 1.4} range={range} />
              <NutrientRow label="Protein" value={scaled(item.protein)} unit="g" max={targets ? targets.protein * 0.4 : 50} range={range} accent />
              <NutrientRow label="Carbs" value={scaled(item.carbs)} unit="g" max={targets ? targets.carbs * 0.4 : 80} range={range} />
              <NutrientRow label="Fat" value={scaled(item.fat)} unit="g" max={targets ? targets.fat * 0.4 : 40} range={range} />
              <NutrientRow label="Fiber" value={scaled(item.fiber)} unit="g" max={10} range={range} />
              <NutrientRow label="Sodium" value={scaled(item.sodium)} unit="mg" max={2000} range={range} warnAt={1400} />
              <NutrientRow label="Sugar" value={scaled(item.sugar)} unit="g" max={35} range={range} warnAt={25} />
            </div>

            {/* Source line */}
            <p className="mt-5 border-t border-black/5 pt-3 text-xs text-ink/50">
              Source: {restaurant.partner
                ? `menu data reviewed with ${restaurant.name}; corrections are versioned and timestamped.`
                : published
                  ? restaurant.sourceNote ?? `as published by ${restaurant.name}.`
                  : restaurant.sourceNote ?? `estimated from ${restaurant.name}'s public menu by the Forkcast nutrition engine; not yet reviewed by the restaurant.`}
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

          {/* Correction history — versioned, timestamped, never silent */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
            <p className="kicker text-ink/45">Correction history</p>
            {corrections.length === 0 ? (
              <p className="mt-1.5 text-xs text-ink/55">
                No corrections recorded for this dish yet. When a restaurant or diner corrects a value, each change is
                logged here with a timestamp and version — never silently.
              </p>
            ) : (
              <>
                <ul className="mt-2 space-y-1.5">
                  {corrections.map((c) => (
                    <li key={c.id} className="rounded-lg bg-black/[0.03] px-3 py-2 text-xs text-ink/70">
                      {c.field}: {c.oldValue.toLocaleString()} → <strong>{c.newValue.toLocaleString()}</strong>
                      <span className="ml-1 text-ink/45">
                        · v{c.version} · {new Date(c.correctedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · restaurant (demo)
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] text-ink/45">
                  Demo corrections recorded on this device via the partner terminal. In production, approved corrections
                  update the published values.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Interactive macro donut — hover/tap a segment to inspect it.
function MacroDonut({ protein, carbs, fat, calories }: { protein: number; carbs: number; fat: number; calories: number }) {
  const [active, setActive] = useState<"protein" | "carbs" | "fat" | null>(null);
  const pCal = protein * 4;
  const cCal = carbs * 4;
  const fCal = fat * 9;
  const total = Math.max(1, pCal + cCal + fCal);
  const R = 42;
  const C = 2 * Math.PI * R;
  const segs = [
    { key: "protein" as const, cal: pCal, grams: protein, color: "#ec3013", label: "Protein" },
    { key: "carbs" as const, cal: cCal, grams: carbs, color: "#9b9797", label: "Carbs" },
    { key: "fat" as const, cal: fCal, grams: fat, color: "#e0853a", label: "Fat" },
  ];
  let offset = 0;
  const activeSeg = segs.find((s) => s.key === active);

  return (
    <div className="mt-4 flex items-center gap-5">
      <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90 shrink-0">
        {segs.map((s) => {
          const len = (s.cal / total) * C;
          const el = (
            <circle
              key={s.key}
              cx={60}
              cy={60}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={active === s.key ? 16 : 11}
              strokeDasharray={`${Math.max(0, len - 2).toFixed(1)} ${C.toFixed(1)}`}
              strokeDashoffset={-offset}
              className="cursor-pointer transition-all duration-200"
              opacity={active && active !== s.key ? 0.35 : 1}
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === s.key ? null : s.key)}
            />
          );
          offset += len;
          return el;
        })}
        <g className="rotate-90" style={{ transformOrigin: "60px 60px" }}>
          <text x={60} y={56} textAnchor="middle" className="fill-ink font-display" style={{ fontSize: 20, fontWeight: 800 }}>
            {activeSeg ? `${activeSeg.grams}g` : calories.toLocaleString()}
          </text>
          <text x={60} y={73} textAnchor="middle" className="fill-ink/45" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {activeSeg ? activeSeg.label : "calories"}
          </text>
        </g>
      </svg>
      <div className="space-y-1.5 text-xs">
        {segs.map((s) => (
          <button
            key={s.key}
            onMouseEnter={() => setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            className={cls("flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition", active === s.key && "bg-black/[0.04]")}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="font-semibold text-ink">{s.label}</span>
            <span className="ml-auto tabular-nums text-ink/55">{s.grams}g · {Math.round((s.cal / total) * 100)}%</span>
          </button>
        ))}
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
