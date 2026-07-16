"use client";

// Editorial carousel rail: snap scrolling, hidden scrollbar, and proper
// paging arrows (desktop) that fade out at the ends. Touch swipe on mobile.

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cls } from "@/lib/format";

export function Rail({ children, itemGap = "gap-6" }: { children: React.ReactNode; itemGap?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
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
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        className={cls(
          "-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          itemGap,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Scroll left"
        className={cls(
          "absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-ink card-shadow-lg transition hover:border-ink sm:grid",
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
          "absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-ink card-shadow-lg transition hover:border-ink sm:grid",
          canRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
