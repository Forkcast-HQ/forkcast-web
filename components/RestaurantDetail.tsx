"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star, Clock, MapPin, BadgeCheck, ArrowLeft, Flame, Info } from "lucide-react";
import { getRestaurant } from "@/data/restaurants";
import { useUser } from "@/lib/store";
import { fitScore, deriveTags } from "@/lib/nutrition";
import { SmartImage } from "@/components/SmartImage";
import { MenuItemCard } from "@/components/MenuItemCard";
import { restaurantImg } from "@/lib/images";
import { cls, priceLevelLabel } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "All dishes" },
  { key: "high-protein", label: "High protein" },
  { key: "under-500", label: "Under 500 cal" },
  { key: "low-carb", label: "Low carb" },
  { key: "vegan", label: "Vegan" },
];

export function RestaurantDetail({ slug }: { slug: string }) {
  const restaurant = getRestaurant(slug);
  const { profile, targets } = useUser();
  const [sortFit, setSortFit] = useState(true);
  const [filter, setFilter] = useState("all");

  const menu = useMemo(() => {
    if (!restaurant) return [];
    let items = restaurant.menu.map((m) => ({
      m,
      fit: targets && profile ? fitScore(m, targets, profile.goal).score : 0,
      tags: deriveTags(m),
    }));
    if (filter !== "all") items = items.filter((x) => x.tags.includes(filter));
    if (sortFit && targets) items.sort((a, b) => b.fit - a.fit);
    return items;
  }, [restaurant, targets, profile, sortFit, filter]);

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Restaurant not found</h1>
        <Link href="/discover" className="mt-4 inline-block text-brand-700 underline">
          Back to discover
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 w-full sm:h-96">
        <SmartImage
          src={restaurant.photoUrl ?? restaurantImg(restaurant.category)}
          alt={restaurant.name}
          label={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 top-0 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" /> Discover
          </Link>
        </div>
        <div className="absolute bottom-0 mx-auto w-full max-w-7xl px-4 pb-6 text-white sm:px-6 lg:px-8">
          {restaurant.partner && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              <BadgeCheck className="h-3.5 w-3.5" /> Sample pilot listing
            </span>
          )}
          <h1 className="font-display text-3xl font-extrabold drop-shadow sm:text-4xl">{restaurant.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
            <span>{restaurant.cuisine}</span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {restaurant.rating} ({restaurant.reviews.toLocaleString()})
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {restaurant.deliveryMins[0]}-{restaurant.deliveryMins[1]} min
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {restaurant.neighborhood} · {restaurant.distanceMi} mi
            </span>
            <span>{priceLevelLabel(restaurant.priceLevel)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Provenance line — nutrition-data source + confidence (design handoff) */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink/40 pb-4">
          {restaurant.partner ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Partner-verified menu data
              </span>
              <span className="text-xs text-ink/55">Nutrition reviewed with the restaurant · corrections are versioned and timestamped</span>
            </>
          ) : restaurant.dataSource === "published" ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-brand-600 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Restaurant-published nutrition
              </span>
              <span className="max-w-xl text-xs text-ink/55">{restaurant.sourceNote}</span>
            </>
          ) : (
            <>
              <span className="rounded-full border border-neutral-400 px-2.5 py-1 text-[11px] font-bold text-ink/70">
                Estimated from menu
              </span>
              <span className="max-w-xl text-xs text-ink/55">
                {restaurant.sourceNote ?? "Values carry a ± range · not yet verified by this restaurant"}
              </span>
            </>
          )}
          <span className="ml-auto text-xs text-ink/45">Allergens: always confirm with the restaurant</span>
        </div>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/65">{restaurant.blurb}</p>
        <div className="mt-3 flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-ink/45">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
          <p>This pilot listing uses demonstration menu and nutrition data. Confirm current ingredients, allergens, pricing, and availability with the restaurant.</p>
        </div>

        {!profile && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink/70">
              <strong>Set up your profile</strong> to see how each dish fits your goals.
            </p>
            <Link
              href="/signup"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Build my plan
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            {/* controls */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Menu</h2>
                <p className="mt-1 text-sm text-ink/45">{menu.length} {menu.length === 1 ? "dish" : "dishes"} shown</p>
              </div>
              {targets && (
                <button
                  onClick={() => setSortFit((v) => !v)}
                  aria-pressed={sortFit}
                  className={cls(
                    "self-start rounded-full px-4 py-2 text-sm font-semibold transition",
                    sortFit ? "bg-brand-600 text-white" : "bg-black/5 text-ink/70",
                  )}
                >
                  {sortFit ? "✓ Sorted for you" : "Sort for me"}
                </button>
              )}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={cls(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    filter === f.key
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-black/10 bg-white text-ink/65 hover:border-black/20",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {menu.map(({ m }, i) => (
                <MenuItemCard key={m.id} item={m} restaurantSlug={restaurant.slug} restaurantName={restaurant.name} seed={i} showRestaurant={false} />
              ))}
              {menu.length === 0 && <p className="py-10 text-center text-ink/50">No dishes match that filter.</p>}
            </div>
          </div>

          {/* sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="font-semibold text-ink">Pilot listing details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Address" value={restaurant.address} />
                <InfoRow label="Cuisine" value={restaurant.cuisine} />
                <InfoRow label="Delivery" value={`${restaurant.deliveryMins[0]}-${restaurant.deliveryMins[1]} min`} />
                <InfoRow label="Distance" value={`${restaurant.distanceMi} mi away`} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {restaurant.tags.map((t) => (
                  <span key={t} className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-ink/60">{t}</span>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <div className="relative h-32">
                <div className="hero-grid absolute inset-0 bg-brand-50" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink card-shadow">
                    <MapPin className="h-4 w-4 text-brand-600" /> {restaurant.neighborhood}
                  </div>
                </div>
              </div>
              <div className="p-4 text-sm text-ink/55">Pickup, delivery, or dine-in. Your plan updates the moment you log a dish.</div>
            </div>

            <div className="rounded-2xl bg-brand-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-accent" />
                <p className="font-semibold">Estimated average Fit Score</p>
              </div>
              <p className="mt-2 font-display text-4xl font-extrabold">
                {targets && profile
                  ? Math.round(restaurant.menu.reduce((s, m) => s + fitScore(m, targets, profile.goal).score, 0) / restaurant.menu.length)
                  : "—"}
              </p>
              <p className="text-sm text-white/60">{targets ? "Across this sample menu, for your goals." : "Set up your plan to see this."}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/45">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
