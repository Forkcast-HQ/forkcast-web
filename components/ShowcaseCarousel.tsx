"use client";

// Homepage showcase carousel — large editorial full-image cards with a glass
// info panel, snap scrolling, paging arrows, and a scroll progress bar.
// Used only on the landing page; discover/list views keep RestaurantCard.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { useUser } from "@/lib/store";
import { fitScore } from "@/lib/nutrition";
import { SmartImage } from "./SmartImage";
import { FitPill } from "./FitBadge";
import { restaurantHeroImg } from "@/lib/images";
import { cls, priceLevelLabel } from "@/lib/format";

export function ShowcaseCarousel({ restaurants }: { restaurants: Restaurant[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < max - 8);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {restaurants.map((r) => (
          <ShowcaseCard key={r.slug} restaurant={r} />
        ))}
      </div>

      {/* Paging arrows */}
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Scroll left"
        className={cls(
          "absolute -left-5 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-ink card-shadow-lg transition hover:border-ink sm:grid",
          canLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="Scroll right"
        className={cls(
          "absolute -right-5 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-ink card-shadow-lg transition hover:border-ink sm:grid",
          canRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Scroll progress */}
      <div className="mx-auto mt-3 hidden h-1 max-w-xs overflow-hidden rounded-full bg-black/[0.07] sm:block">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-150"
          style={{ width: `${10 + progress * 90}%` }}
        />
      </div>
    </div>
  );
}

function ShowcaseCard({ restaurant: r }: { restaurant: Restaurant }) {
  const { targets, profile } = useUser();

  // Best-fitting dish drives the card's personalized line.
  let bestFit = 0;
  let bestName = "";
  if (targets && profile) {
    for (const m of r.menu) {
      const f = fitScore(m, targets, profile.goal).score;
      if (f > bestFit) {
        bestFit = f;
        bestName = m.name;
      }
    }
  }

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      aria-label={`View ${r.name} menu`}
      className="group relative block w-[84%] min-w-[300px] max-w-[460px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-black/5 bg-ink card-shadow-lg transition duration-300 hover:-translate-y-1 sm:w-[48%] lg:w-[36%]"
    >
      <SmartImage
        src={r.photoUrl ?? restaurantHeroImg(r.slug, r.category)}
        alt={r.name}
        label={r.name}
        className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      {/* Trust badge */}
      <div className="absolute left-4 top-4 flex gap-2">
        {r.partner ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow-sm backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" /> Partner-verified (demo)
          </span>
        ) : r.dataSource === "published" ? (
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
        <div className="absolute right-4 top-4">
          <FitPill score={bestFit} />
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow">
          {r.name}
        </h3>
        <p className="mt-0.5 truncate text-sm font-medium text-white/75">
          {r.cuisine} · {r.neighborhood}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {r.rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {r.deliveryMins[0]}–{r.deliveryMins[1]} min
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {r.distanceMi} mi
          </span>
          <span>{priceLevelLabel(r.priceLevel)}</span>
        </div>

        {/* Glass panel: personalized line or tags + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
          {targets && bestName ? (
            <p className="min-w-0 truncate text-xs text-white/85">
              <span className="font-bold text-brand-300">Best for you:</span> {bestName}
            </p>
          ) : (
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {r.tags.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/85">
                  {t}
                </span>
              ))}
            </div>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-white">
            View menu{" "}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
