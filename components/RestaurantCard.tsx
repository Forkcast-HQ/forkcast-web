"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Star, BadgeCheck } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { useUser } from "@/lib/store";
import { fitScore } from "@/lib/nutrition";
import { SmartImage } from "./SmartImage";
import { FitPill } from "./FitBadge";
import { TiltCard } from "./TiltCard";
import { restaurantHeroImg } from "@/lib/images";
import { priceLevelLabel } from "@/lib/format";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { targets, profile } = useUser();

  // Best-fitting dish drives the card's headline fit
  let bestFit = 0;
  let bestName = "";
  if (targets && profile) {
    for (const m of restaurant.menu) {
      const f = fitScore(m, targets, profile.goal).score;
      if (f > bestFit) {
        bestFit = f;
        bestName = m.name;
      }
    }
  }

  return (
    <TiltCard>
    <Link
      href={`/restaurant/${restaurant.slug}`}
      aria-label={`View ${restaurant.name} menu`}
      className="group block overflow-hidden rounded-[1.35rem] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(32,22,15,0.03)] transition-shadow hover:card-shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={restaurant.photoUrl ?? restaurantHeroImg(restaurant.slug, restaurant.category)}
          alt={restaurant.name}
          label={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />

        <div className="absolute left-3 top-3 flex gap-2">
          {restaurant.partner ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow-sm backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5" /> Partner-verified (demo)
            </span>
          ) : restaurant.dataSource === "published" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5" /> Published nutrition
            </span>
          ) : (
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink/60 shadow-sm backdrop-blur">
              Estimated ±
            </span>
          )}
        </div>

        {targets && bestFit > 0 && (
          <div className="absolute right-3 top-3">
            <FitPill score={bestFit} />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold leading-tight drop-shadow">
              {restaurant.name}
            </h3>
            <p className="truncate text-sm text-white/85">{restaurant.cuisine}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/65">
          <span className="inline-flex items-center gap-1 font-semibold text-ink">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {restaurant.rating}
          </span>
          <span className="text-ink/30">·</span>
          <span>{restaurant.reviews.toLocaleString()} ratings</span>
          <span className="text-ink/30">·</span>
          <span>{priceLevelLabel(restaurant.priceLevel)}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/55">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {restaurant.deliveryMins[0]}-{restaurant.deliveryMins[1]} min
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {restaurant.neighborhood} · {restaurant.distanceMi} mi
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
          {targets && bestName ? (
            <p className="min-w-0 truncate text-xs text-ink/55">
              <span className="font-semibold text-brand-700">Best for you:</span> {bestName}
            </p>
          ) : (
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {restaurant.tags.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-ink/60">
                  {t}
                </span>
              ))}
            </div>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-700">
            View menu <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
    </TiltCard>
  );
}
