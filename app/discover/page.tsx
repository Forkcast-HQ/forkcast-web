"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, ArrowRight, Map as MapIcon, List, Star, Clock } from "lucide-react";
import { RESTAURANTS, CUISINES, allMenuItems } from "@/data/restaurants";
import { useUser } from "@/lib/store";
import { fitScore } from "@/lib/nutrition";
import { RestaurantCard } from "@/components/RestaurantCard";
import { MenuItemCard } from "@/components/MenuItemCard";
import { FitPill } from "@/components/FitBadge";
import { GOAL_LABELS } from "@/lib/nutrition";
import { cls, priceLevelLabel } from "@/lib/format";

const RestaurantMap = dynamic(() => import("@/components/RestaurantMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-brand-50" />,
});

type Sort = "fit" | "distance" | "rating";
type View = "list" | "map";

export default function Discover() {
  const { profile, targets, consumedToday, hydrated } = useUser();
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>(profile ? "fit" : "rating");
  const [dietOnly, setDietOnly] = useState(false);
  const [view, setView] = useState<View>("list");

  // Honor ?view=map deep links (and shareable map view).
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "map") {
      setView("map");
    }
  }, []);

  // best-fit dish per restaurant (for sort + headline)
  const bestFitOf = useMemo(() => {
    const map = new Map<string, number>();
    if (!targets || !profile) return map;
    for (const r of RESTAURANTS) {
      let best = 0;
      for (const m of r.menu) best = Math.max(best, fitScore(m, targets, profile.goal).score);
      map.set(r.slug, best);
    }
    return map;
  }, [targets, profile]);

  const restaurants = useMemo(() => {
    let list = [...RESTAURANTS];
    if (cuisine) list = list.filter((r) => r.cuisine === cuisine);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.cuisine.toLowerCase().includes(s) ||
          r.neighborhood.toLowerCase().includes(s),
      );
    }
    if (dietOnly && profile?.dietary.length) {
      const wanted = profile.dietary.map((d) => d.toLowerCase());
      list = list.filter((r) =>
        r.menu.some((m) => m.tags.some((t) => wanted.includes(t))),
      );
    }
    list.sort((a, b) => {
      if (sort === "fit") return (bestFitOf.get(b.slug) ?? 0) - (bestFitOf.get(a.slug) ?? 0);
      if (sort === "distance") return a.distanceMi - b.distanceMi;
      return b.rating - a.rating;
    });
    return list;
  }, [q, cuisine, sort, dietOnly, bestFitOf, profile]);

  const mapItems = useMemo(
    () =>
      restaurants.map((r) => ({
        slug: r.slug,
        name: r.name,
        cuisine: r.cuisine,
        lat: r.lat,
        lng: r.lng,
        distanceMi: r.distanceMi,
        fit: bestFitOf.get(r.slug) ?? 0,
        partner: r.partner,
      })),
    [restaurants, bestFitOf],
  );

  const topDishes = useMemo(() => {
    if (!targets || !profile) return [];
    return allMenuItems()
      .map((m) => ({ m, fit: fitScore(m, targets, profile.goal).score }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, 6)
      .map((x) => x.m);
  }, [targets, profile]);

  const consumed = hydrated ? consumedToday() : null;
  const remaining =
    targets && consumed ? Math.max(0, targets.calories - consumed.calories) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Personalized header */}
      {hydrated && profile && targets ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {GOAL_LABELS[profile.goal]} plan · Boston
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              {profile.name ? `${profile.name.split(" ")[0]}, ` : ""}here&apos;s what fits today
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-3xl font-extrabold text-brand-700">{remaining}</p>
              <p className="text-xs text-ink/55">calories left today</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              My dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl bg-brand-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Discover restaurants near you</h1>
            <p className="mt-1 text-white/70">
              Set up your profile to unlock personal Fit Scores on every dish.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            <Sparkles className="h-4 w-4" /> Build my plan
          </Link>
        </div>
      )}

      {/* Top dishes rail */}
      {topDishes.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-xl font-bold text-ink">Top matches for you</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {topDishes.map((m, i) => (
              <MenuItemCard
                key={m.id}
                item={m}
                restaurantSlug={m.restaurantSlug}
                restaurantName={m.restaurantName}
                seed={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mt-12">
        <div className="sticky top-16 z-30 -mx-4 border-y border-black/5 bg-cream/80 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search restaurants, cuisines, neighborhoods"
                className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-ink/40" />
              {(["fit", "distance", "rating"] as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  disabled={s === "fit" && !profile}
                  className={cls(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                    sort === s ? "bg-brand-600 text-white" : "bg-white text-ink/60 hover:bg-black/5",
                  )}
                >
                  {s === "fit" ? "Best fit" : s === "distance" ? "Closest" : "Top rated"}
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-black/10" />
              <div className="flex rounded-full bg-white p-0.5 ring-1 ring-black/10">
                <button onClick={() => setView("list")} className={cls("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition", view === "list" ? "bg-brand-600 text-white" : "text-ink/60")} aria-label="List view">
                  <List className="h-4 w-4" /> List
                </button>
                <button onClick={() => setView("map")} className={cls("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition", view === "map" ? "bg-brand-600 text-white" : "text-ink/60")} aria-label="Map view">
                  <MapIcon className="h-4 w-4" /> Map
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip active={!cuisine} onClick={() => setCuisine(null)}>All</Chip>
            {CUISINES.map((c) => (
              <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>
                {c}
              </Chip>
            ))}
            {profile?.dietary.length ? (
              <Chip active={dietOnly} onClick={() => setDietOnly((v) => !v)}>
                {dietOnly ? "✓ " : ""}My diet ({profile.dietary.join(", ")})
              </Chip>
            ) : null}
          </div>
        </div>

        {view === "list" ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r) => (
                <RestaurantCard key={r.slug} restaurant={r} />
              ))}
            </div>
            {restaurants.length === 0 && (
              <p className="py-16 text-center text-ink/50">No restaurants match those filters.</p>
            )}
          </>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-[420px] overflow-hidden rounded-2xl border border-black/5 lg:h-[640px]">
              <RestaurantMap items={mapItems} />
            </div>
            <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
              {restaurants.map((r) => (
                <Link
                  key={r.slug}
                  href={`/restaurant/${r.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 transition hover:card-shadow"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{r.name}</p>
                    <p className="truncate text-xs text-ink/55">{r.cuisine} · {r.neighborhood}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-ink/50">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{r.rating}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.deliveryMins[0]}-{r.deliveryMins[1]}m</span>
                      <span>{priceLevelLabel(r.priceLevel)}</span>
                    </p>
                  </div>
                  {targets && (bestFitOf.get(r.slug) ?? 0) > 0 && <FitPill score={bestFitOf.get(r.slug)!} />}
                </Link>
              ))}
              {restaurants.length === 0 && <p className="py-10 text-center text-ink/50">No restaurants match those filters.</p>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-black/10 bg-white text-ink/65 hover:border-black/20",
      )}
    >
      {children}
    </button>
  );
}
