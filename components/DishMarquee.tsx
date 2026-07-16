// Slow editorial dish ticker — real plate photography, unhurried pace,
// pauses on hover, disabled under reduced-motion. Server component.

import Link from "next/link";
import { RESTAURANTS } from "@/data/restaurants";
import { SmartImage } from "@/components/SmartImage";
import { categoryImg } from "@/lib/images";

export function DishMarquee() {
  const dishes = RESTAURANTS.flatMap((r) =>
    r.menu.slice(0, 2).map((m, i) => ({
      id: m.id,
      slug: r.slug,
      name: m.name,
      cal: m.calories,
      protein: m.protein,
      rest: r.name,
      category: m.category,
      seed: i,
    })),
  ).slice(0, 12);
  const loop = [...dishes, ...dishes]; // duplicated for a seamless loop

  return (
    <div className="marquee group border-y-2 border-ink/40 bg-white py-5">
      <div className="marquee-track flex w-max items-center gap-5 group-hover:[animation-play-state:paused]">
        {loop.map((d, i) => (
          <Link
            key={`${d.id}-${i}`}
            href={`/restaurant/${d.slug}/dish/${d.id}`}
            tabIndex={i >= dishes.length ? -1 : 0}
            aria-hidden={i >= dishes.length}
            className="flex shrink-0 items-center gap-3 rounded-full border border-black/[0.07] bg-white py-1.5 pl-1.5 pr-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:card-shadow"
          >
            <span className="block h-11 w-11 shrink-0 overflow-hidden rounded-full">
              <SmartImage
                src={categoryImg(d.category, d.seed)}
                alt={d.name}
                label={d.name}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-ink">{d.name}</span>
              <span className="block text-xs text-ink/50">
                {d.cal} cal · {d.protein}g protein · {d.rest}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
