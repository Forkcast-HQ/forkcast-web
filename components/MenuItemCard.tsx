"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Flame, MapPin, ShoppingBag } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useUser } from "@/lib/store";
import { useOrder } from "@/lib/order";
import { conditionWarnings, deriveTags, fitScore } from "@/lib/nutrition";
import { getRestaurant } from "@/data/restaurants";
import { flyToBasket } from "@/lib/fly";
import { SmartImage } from "./SmartImage";
import { FitBadge } from "./FitBadge";
import { dishImg } from "@/lib/images";
import { cls, money } from "@/lib/format";

const TAG_LABEL: Record<string, string> = {
  "high-protein": "High protein",
  "low-carb": "Low carb",
  "high-fiber": "High fiber",
  "under-500": "Under 500 cal",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-free",
};

export function MenuItemCard({
  item,
  restaurantSlug,
  restaurantName,
  seed = 0,
  showRestaurant = true,
}: {
  item: MenuItem;
  restaurantSlug: string;
  restaurantName: string;
  seed?: number;
  showRestaurant?: boolean;
}) {
  const { targets, profile } = useUser();
  const { addToCart, cartRestaurantSlug } = useOrder();
  const [inCart, setInCart] = useState(false);

  const handleAddToOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(restaurantSlug, item.id);
    flyToBasket(e.currentTarget);
    setInCart(true);
    setTimeout(() => setInCart(false), 2200);
  };

  const fit = targets ? fitScore(item, targets, profile!.goal) : null;
  const tags = deriveTags(item).filter((t) => TAG_LABEL[t]);
  const rest = getRestaurant(restaurantSlug);
  const tier: "verified" | "published" | "estimated" = rest?.partner
    ? "verified"
    : rest?.dataSource === "published"
      ? "published"
      : "estimated";

  // Personal advisories: allergens (from menu text — never a guarantee) + conditions
  const itemText = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const allergenHits = (profile?.avoid ?? []).filter((a) => itemText.includes(a.toLowerCase()));
  const condWarns = conditionWarnings(item, profile?.conditions);

  return (
    <article className="interactive-card group flex gap-3 rounded-2xl border border-black/[0.07] bg-white p-3 sm:gap-4 sm:p-4">
      <Link
        href={`/restaurant/${restaurantSlug}/dish/${item.id}`}
        className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"
        aria-label={`${item.name} — details`}
      >
        <SmartImage
          src={item.photoUrl ?? dishImg(restaurantSlug, item.id, item.category, seed)}
          alt={item.name}
          label={item.name}
          className="h-full w-full object-cover"
        />
        {fit && (
          <div className="absolute -right-1 -top-1">
            <FitBadge score={fit.score} size="sm" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {showRestaurant && (
              <p className="flex items-center gap-1 truncate text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                <MapPin className="h-3 w-3 shrink-0" />
                {restaurantName}
              </p>
            )}
            <h3 className="truncate font-display text-[1.05rem] font-bold text-ink">
              <Link href={`/restaurant/${restaurantSlug}/dish/${item.id}`} className="hover:text-brand-700">
                {item.name}
              </Link>
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-ink/55">{item.description}</p>
          </div>
          <span className="shrink-0 font-semibold text-ink">{money(item.price)}</span>
        </div>

        {/* macros */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-ink">
            <Flame className="h-3.5 w-3.5 text-amber-accent" />
            {item.calories} cal
          </span>
          <Macro label="P" value={item.protein} color="text-brand-700" />
          <Macro label="C" value={item.carbs} color="text-neutral-600" />
          <Macro label="F" value={item.fat} color="text-neutral-600" />
          <span className="text-ink/40">·</span>
          <span className="text-ink/50">{item.fiber}g fiber</span>
          <span className="text-ink/40">·</span>
          <span
            className={cls(
              "rounded-full border px-1.5 py-px text-[10px] font-bold",
              tier === "estimated" ? "border-neutral-400 text-ink/55" : "border-brand-600 text-brand-700",
            )}
            title={
              tier === "verified"
                ? "Nutrition reviewed with the restaurant"
                : tier === "published"
                  ? "From the restaurant's own published nutrition disclosure"
                  : "Estimated from the menu — carries a ± range"
            }
          >
            {tier === "verified" ? "Verified" : tier === "published" ? "Published" : "Est. ±"}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
            >
              {TAG_LABEL[t]}
            </span>
          ))}
          {allergenHits.map((a) => (
            <span key={a} className="rounded-full border border-brand-600 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700" title="From menu text — always confirm with the restaurant">
              May contain {a.toLowerCase()}
            </span>
          ))}
          {condWarns.slice(0, 1).map((w) => (
            <span key={w} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {w}
            </span>
          ))}
          {fit && fit.warnings[0] && !condWarns.length && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {fit.warnings[0]}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {fit ? (
            <p className="truncate text-xs text-ink/50">
              {fit.reasons.length ? fit.reasons.join(" · ") : "A middle-of-the-road fit for your goals"}
            </p>
          ) : (
            <p className="text-xs text-ink/40">Set up your profile for a Fit Score</p>
          )}
          <button
            onClick={handleAddToOrder}
            aria-label={`Add ${item.name} to your order`}
            title={
              cartRestaurantSlug && cartRestaurantSlug !== restaurantSlug
                ? "Starts a new basket (one restaurant per order)"
                : "Add to order — it's logged once the meal is confirmed"
            }
            className={cls(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              inCart ? "bg-brand-950 text-white" : "bg-brand-600 text-white hover:bg-brand-700",
            )}
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" /> In basket
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> Add to order
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cls("font-bold", color)}>{label}</span>
      <span className="text-ink/70">{value}g</span>
    </span>
  );
}
