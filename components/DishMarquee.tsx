// Auto-scrolling dish ticker (pure CSS animation, pauses on hover,
// respects reduced-motion via globals). Server component — no JS shipped.

import Link from "next/link";
import { RESTAURANTS } from "@/data/restaurants";

export function DishMarquee() {
  // A tasty cross-section of the catalog (name · cal · restaurant).
  const dishes = RESTAURANTS.flatMap((r) =>
    r.menu.slice(0, 2).map((m) => ({ id: m.id, slug: r.slug, name: m.name, cal: m.calories, rest: r.name })),
  ).slice(0, 14);
  const loop = [...dishes, ...dishes]; // duplicated for a seamless loop

  return (
    <div className="marquee group border-y-2 border-ink/40 bg-white py-3.5" aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-8 group-hover:[animation-play-state:paused]">
        {loop.map((d, i) => (
          <Link
            key={`${d.id}-${i}`}
            href={`/restaurant/${d.slug}/dish/${d.id}`}
            tabIndex={-1}
            className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-ink/70 transition hover:text-brand-700"
          >
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            {d.name}
            <span className="font-normal text-ink/40">{d.cal} cal · {d.rest}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
