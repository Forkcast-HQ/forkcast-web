"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, ArrowRight, Map as MapIcon, List, Star, Clock, Info, X, LocateFixed } from "lucide-react";
import { RESTAURANTS, CUISINES, allMenuItems } from "@/data/restaurants";
import { useUser } from "@/lib/store";
import { fitScore, personalAdjust } from "@/lib/nutrition";
import { RestaurantCard } from "@/components/RestaurantCard";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Rail } from "@/components/Rail";
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
  const [attrs, setAttrs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  // Real distances only with permission — never pretend we know where you are.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "asking" | "granted" | "denied">("idle");

  const askLocation = () => {
    if (!("geolocation" in navigator)) { setGeoState("denied"); return; }
    setGeoState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoState("granted"); },
      () => setGeoState("denied"),
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  const haversineMi = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const R = 3958.8;
    const dLat = ((bLat - aLat) * Math.PI) / 180;
    const dLng = ((bLng - aLng) * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
  };

  const toggleAttr = (key: string) =>
    setAttrs((prev) => (prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]));

  const ATTR_KEYS = ["partner", "high-protein", "under-500", "low-sodium", "high-fiber"];
  const urlHadSort = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("sort"))[0];

  // Honor deep links: ?view=map, ?q, ?cuisine, ?attrs, ?sort (hero search,
  // cuisine rail, and shared filtered views).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "map") setView("map");
    const qp = params.get("q");
    if (qp) setQ(qp);
    const cp = params.get("cuisine");
    if (cp && CUISINES.includes(cp)) setCuisine(cp);
    const ap = params.get("attrs");
    if (ap) setAttrs(ap.split(",").filter((a) => ATTR_KEYS.includes(a)));
    const sp = params.get("sort");
    if (sp === "fit" || sp === "distance" || sp === "rating") setSort(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated && profile && !urlHadSort) setSort("fit");
  }, [hydrated, profile, urlHadSort]);

  // Keep the URL in sync so any filtered view is shareable / bookmarkable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cuisine) p.set("cuisine", cuisine);
    if (attrs.length) p.set("attrs", attrs.join(","));
    if (view === "map") p.set("view", "map");
    p.set("sort", sort);
    // Drop the sort param when it's the default, to keep URLs clean.
    if (sort === (profile ? "fit" : "rating")) p.delete("sort");
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, cuisine, attrs, view, sort, profile]);

  // Best-fit dish per restaurant (for sort + headline) — PERSONALIZED:
  // allergen-matching dishes can't carry a restaurant's headline score, and
  // condition advisories apply their penalty, matching the dish rails.
  const bestFitOf = useMemo(() => {
    const map = new Map<string, number>();
    if (!targets || !profile) return map;
    for (const r of RESTAURANTS) {
      let best = 0;
      for (const m of r.menu) {
        const adj = personalAdjust(m, profile);
        if (adj.exclude) continue;
        best = Math.max(best, fitScore(m, targets, profile.goal).score - adj.penalty);
      }
      map.set(r.slug, Math.max(0, best));
    }
    return map;
  }, [targets, profile]);

  // With permission granted, distances become real (haversine from the user);
  // otherwise the static values stand, clearly labeled as demo-center-based.
  const located = useMemo(() => {
    if (!coords) return RESTAURANTS;
    return RESTAURANTS.map((r) => ({ ...r, distanceMi: haversineMi(coords.lat, coords.lng, r.lat, r.lng) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const restaurants = useMemo(() => {
    let list = [...located];
    if (cuisine) list = list.filter((r) => r.cuisine === cuisine);
    if (q.trim()) {
      const s = q.toLowerCase();
      // Search covers dishes too — "falafel" should find The Halal Guys.
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.cuisine.toLowerCase().includes(s) ||
          r.neighborhood.toLowerCase().includes(s) ||
          r.menu.some((m) => m.name.toLowerCase().includes(s) || m.description.toLowerCase().includes(s)),
      );
    }
    if (dietOnly && profile?.dietary.length) {
      const wanted = profile.dietary.map((d) => d.toLowerCase());
      list = list.filter((r) =>
        r.menu.some((m) => m.tags.some((t) => wanted.includes(t))),
      );
    }
    // Dish-attribute chips (from the design handoff): restaurant qualifies if
    // any dish passes ALL selected attributes (partner is restaurant-level).
    if (attrs.length) {
      list = list.filter((r) => {
        // "Verified data" = demo partner-verified OR restaurant-published
        if (attrs.includes("partner") && !r.partner && r.dataSource !== "published") return false;
        const dishAttrs = attrs.filter((a) => a !== "partner");
        if (!dishAttrs.length) return true;
        return r.menu.some((m) =>
          dishAttrs.every((a) =>
            a === "high-protein" ? m.protein >= 25 || (m.protein * 4) / Math.max(1, m.calories) >= 0.3
            : a === "under-500" ? m.calories <= 500
            : a === "low-sodium" ? m.sodium <= 600
            : a === "high-fiber" ? m.fiber >= 6
            : true,
          ),
        );
      });
    }
    list.sort((a, b) => {
      if (sort === "fit") return (bestFitOf.get(b.slug) ?? 0) - (bestFitOf.get(a.slug) ?? 0);
      if (sort === "distance") return a.distanceMi - b.distanceMi;
      return b.rating - a.rating;
    });
    return list;
  }, [q, cuisine, sort, dietOnly, attrs, bestFitOf, profile, located]);

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

  // Personalized: allergen hits excluded from recommendations, condition-
  // flagged dishes ranked below clean ones (menus still show everything, flagged).
  const topDishes = useMemo(() => {
    if (!targets || !profile) return [];
    return allMenuItems()
      .map((m) => ({ m, fit: fitScore(m, targets, profile.goal).score, adj: personalAdjust(m, profile) }))
      .filter((x) => !x.adj.exclude)
      .sort((a, b) => b.fit - b.adj.penalty - (a.fit - a.adj.penalty))
      .slice(0, 6)
      .map((x) => x.m);
  }, [targets, profile]);

  const consumed = hydrated ? consumedToday() : null;
  const remaining =
    targets && consumed ? Math.max(0, targets.calories - consumed.calories) : null;
  const hasFilters = Boolean(q.trim() || cuisine || dietOnly || attrs.length);

  const clearFilters = () => {
    setQ("");
    setCuisine(null);
    setDietOnly(false);
    setAttrs([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Budget summary — Modernist "Left today" strip (from the design handoff) */}
      {hydrated && profile && targets && consumed ? (
        <div className="surface-card flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="kicker text-brand-700">{GOAL_LABELS[profile.goal]} plan · Boston</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-[38px] font-extrabold leading-none tabular-nums text-ink">{remaining}</span>
              <span className="text-sm font-semibold text-ink/50">cal left today · of {targets.calories}</span>
            </div>
            <h1 className="mt-2 text-sm font-medium text-ink/60">
              {profile.name ? `${profile.name.split(" ")[0]}, ` : ""}restaurants below are ranked for what&apos;s left of your day
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <MacroMini label="Protein" value={consumed.protein} target={targets.protein} />
              <MacroMini label="Carbs" value={consumed.carbs} target={targets.carbs} />
              <MacroMini label="Fat" value={consumed.fat} target={targets.fat} />
            </div>
            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white shadow-xl shadow-brand-950/10 sm:flex-row sm:items-center sm:justify-between sm:p-7">
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

      <div className="mt-3 flex items-start gap-2 rounded-xl px-1 text-xs leading-relaxed text-ink/50">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p>
          Every dish shows its nutrition source (verified · published · estimated). Always confirm allergens with the restaurant.
        </p>
      </div>

      {/* Top dishes rail */}
      {topDishes.length > 0 && (
        <section className="mt-10" aria-labelledby="top-matches-heading">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 id="top-matches-heading" className="font-display text-xl font-bold text-ink">Top matches for you</h2>
          </div>
          {/* Swipeable rail with paging arrows (design handoff: swipeable dish cards) */}
          <Rail itemGap="gap-4">
            {topDishes.map((m, i) => (
              <div key={m.id} className="w-[88%] min-w-[300px] max-w-md shrink-0 snap-start py-1 sm:w-[46%]">
                <MenuItemCard
                  item={m}
                  restaurantSlug={m.restaurantSlug}
                  restaurantName={m.restaurantName}
                  seed={i}
                />
              </div>
            ))}
          </Rail>
        </section>
      )}

      {/* Filters */}
      <section className="mt-12">
        <div className="sticky top-[4.5rem] z-30 -mx-4 border-y border-black/5 bg-cream/90 px-4 py-3 shadow-[0_12px_30px_-28px_rgba(32,22,15,0.5)] backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <label htmlFor="restaurant-search" className="sr-only">Search restaurants</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                id="restaurant-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search restaurants, cuisines, neighborhoods"
                className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* One Filters button replaces two always-visible chip rows */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={cls(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                  showFilters || attrs.length || cuisine || dietOnly
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-ink/70 hover:border-black/25",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {(attrs.length + (cuisine ? 1 : 0) + (dietOnly ? 1 : 0)) > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                    {attrs.length + (cuisine ? 1 : 0) + (dietOnly ? 1 : 0)}
                  </span>
                )}
              </button>
              <span className="mx-1 h-5 w-px bg-black/10" />
              {(["fit", "distance", "rating"] as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  disabled={s === "fit" && !profile}
                  aria-pressed={sort === s}
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
                <button onClick={() => setView("list")} aria-pressed={view === "list"} className={cls("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition", view === "list" ? "bg-brand-600 text-white" : "text-ink/60")} aria-label="List view">
                  <List className="h-4 w-4" /> List
                </button>
                <button onClick={() => setView("map")} aria-pressed={view === "map"} className={cls("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition", view === "map" ? "bg-brand-600 text-white" : "text-ink/60")} aria-label="Map view">
                  <MapIcon className="h-4 w-4" /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible filter panel — chips live here instead of two permanent rows */}
          {showFilters && (
            <div className="mt-3 rounded-xl border border-black/5 bg-white p-4">
              <p className="kicker text-ink/45">Dish attributes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { key: "partner", label: "Verified data" },
                  { key: "high-protein", label: "High protein" },
                  { key: "under-500", label: "Under 500 kcal" },
                  { key: "low-sodium", label: "Low sodium" },
                  { key: "high-fiber", label: "High fiber" },
                ].map((a) => (
                  <Chip key={a.key} active={attrs.includes(a.key)} onClick={() => toggleAttr(a.key)}>
                    {a.label}
                  </Chip>
                ))}
              </div>
              <p className="kicker mt-4 text-ink/45">Cuisine</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip active={!cuisine} onClick={() => setCuisine(null)}>All</Chip>
                {CUISINES.map((c) => (
                  <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
              {profile?.dietary.length ? (
                <>
                  <p className="kicker mt-4 text-ink/45">My diet</p>
                  <div className="mt-2">
                    <Chip active={dietOnly} onClick={() => setDietOnly((v) => !v)}>
                      Only show {profile.dietary.join(" / ")} options
                    </Chip>
                  </div>
                </>
              ) : null}
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                <button onClick={clearFilters} className="text-xs font-bold text-ink/45 hover:text-brand-700">Clear all</button>
                <button onClick={() => setShowFilters(false)} className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-white hover:bg-black">Done</button>
              </div>
            </div>
          )}

          {/* Active filters as removable chips (when the panel is closed) */}
          {!showFilters && hasFilters && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {cuisine && (
                <ActivePill label={cuisine} onClear={() => setCuisine(null)} />
              )}
              {attrs.map((a) => (
                <ActivePill
                  key={a}
                  label={{ partner: "Verified data", "high-protein": "High protein", "under-500": "Under 500 kcal", "low-sodium": "Low sodium", "high-fiber": "High fiber" }[a] ?? a}
                  onClear={() => toggleAttr(a)}
                />
              ))}
              {dietOnly && <ActivePill label="My diet" onClear={() => setDietOnly(false)} />}
              {q.trim() && <ActivePill label={`“${q.trim()}”`} onClear={() => setQ("")} />}
              <button onClick={clearFilters} className="ml-1 text-xs font-bold text-ink/40 hover:text-brand-700">Clear all</button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-sm text-ink/55" aria-live="polite">
            <span className="font-bold text-ink">{restaurants.length}</span> {restaurants.length === 1 ? "restaurant" : "restaurants"} in this view
          </p>
          <div className="flex items-center gap-3">
            {geoState === "granted" ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                <LocateFixed className="h-3.5 w-3.5" /> Distances from your location
              </span>
            ) : (
              <button
                onClick={askLocation}
                disabled={geoState === "asking"}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-ink disabled:opacity-50"
                title="Until you share location, distances are measured from downtown Boston (demo center)"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                {geoState === "asking" ? "Locating…" : geoState === "denied" ? "Location unavailable — distances from downtown Boston" : "Use my location for real distances"}
              </button>
            )}
            <p className="hidden text-xs text-ink/40 sm:block">Boston catalog · demo + published + estimated tiers</p>
          </div>
        </div>

        {view === "list" ? (
          <>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r) => {
                const s = q.trim().toLowerCase();
                const dishMatches = s
                  ? r.menu.filter((m) => m.name.toLowerCase().includes(s) || m.description.toLowerCase().includes(s)).length
                  : 0;
                return (
                  <div key={r.slug}>
                    <RestaurantCard restaurant={r} />
                    {dishMatches > 0 && (
                      <p className="mt-1.5 flex items-center gap-1 pl-1 text-[11px] font-semibold text-brand-700">
                        <Search className="h-3 w-3" /> {dishMatches} {dishMatches === 1 ? "dish matches" : "dishes match"} &ldquo;{q.trim()}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {restaurants.length === 0 && (
              <div className="py-16 text-center text-ink/50">
                <p>No restaurants match those filters.</p>
                <button onClick={clearFilters} className="mt-3 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">Clear filters</button>
              </div>
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

function MacroMini({ label, value, target }: { label: string; value: number; target: number }) {
  const p = Math.min(100, Math.round((value / Math.max(1, target)) * 100));
  return (
    <div className="w-16">
      <div className="flex items-baseline justify-between">
        <span className="kicker text-ink/45">{label}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${p}%` }} />
      </div>
      <p className="mt-0.5 text-[10px] tabular-nums text-ink/50">{Math.round(value)}/{target}g</p>
    </div>
  );
}

function ActivePill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label} filter`} className="rounded-full p-0.5 hover:bg-white/20">
        <X className="h-3 w-3" />
      </button>
    </span>
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
      aria-pressed={active}
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
