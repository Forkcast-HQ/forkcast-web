"use client";

/**
 * ProofFigures — the three numbers that justify the product.
 *
 * A bare number in a big weight is a poster, not evidence. Each figure here
 * carries a small piece of geometry that shows the *shape* of the claim, so
 * the reader gets the point before they finish reading the label:
 *
 *   58.5%   a plate-shaped gauge, filled to the number — more than half
 *   2 in 3  three plates, two of them filled — you can count it
 *   24 kcal a bar so short against a 2,000 kcal day that the argument
 *           against calorie labels makes itself
 *
 * Everything holds at zero until the strip scrolls into view, then counts
 * and fills together. Under prefers-reduced-motion the final state is what
 * renders — no counting, no filling.
 */

import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/CountUp";
import { cls } from "@/lib/format";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/** A ring filled to `pct`, using the plate's geometry. */
function Gauge({ pct, on, size = 92 }: { pct: number; on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="40" stroke="rgb(32 30 29 / 0.12)" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r="40"
        pathLength={100}
        stroke="#ec3013"
        strokeWidth="9"
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{
          strokeDasharray: on ? `${pct} ${100 - pct}` : "0 100",
          transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </svg>
  );
}

/** `filled` of `total` plates, filled left to right. */
function Plates({ filled, total, on }: { filled: number; total: number; on: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <svg key={i} width="30" height="30" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="rgb(32 30 29 / 0.18)" strokeWidth="11" />
          <circle
            cx="50"
            cy="50"
            r="40"
            pathLength={100}
            stroke="#ec3013"
            strokeWidth="11"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              strokeDasharray: on && i < filled ? "100 0" : "0 100",
              transition: "stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${400 + i * 220}ms`,
            }}
          />
        </svg>
      ))}
    </div>
  );
}

/** A bar showing `part` against `whole` — the point being how little it is. */
function Sliver({ part, whole, on }: { part: number; whole: number; on: boolean }) {
  const pct = (part / whole) * 100;
  return (
    <div className="w-full max-w-[190px]" aria-hidden="true">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-600"
          style={{
            width: on ? `${Math.max(pct, 0.9)}%` : "0%",
            transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
          }}
        />
      </div>
      <p className="kicker mt-2 text-ink/45">against a 2,000 kcal day</p>
    </div>
  );
}

function Figure({
  visual,
  number,
  label,
  cite,
  accent,
}: {
  visual: React.ReactNode;
  number: React.ReactNode;
  label: string;
  cite: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 border-t-2 border-ink/15 px-0 pt-7 sm:border-l sm:border-t-0 sm:px-8 sm:pt-0 sm:first:border-l-0 sm:first:pl-0">
      <div className="flex min-h-[92px] items-center">{visual}</div>
      <div>
        <p
          className={cls(
            "font-display text-[clamp(2.5rem,4.6vw,3.75rem)] font-extrabold leading-none tracking-[-0.035em] tabular-nums",
            accent ? "text-brand-600" : "text-ink",
          )}
        >
          {number}
        </p>
        <p className="mt-3 max-w-[27ch] text-[15px] leading-snug text-ink/65">{label}</p>
        <p className="kicker mt-3 text-ink/45">{cite}</p>
      </div>
    </div>
  );
}

export function ProofFigures() {
  const [ref, on] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-3 sm:gap-0 sm:px-6 lg:px-8"
    >
      <Figure
        visual={<Gauge pct={58.5} on={on} />}
        number={on ? <CountUp value={58.5} decimals={1} suffix="%" duration={1500} /> : "0.0%"}
        label="of U.S. food spending now happens away from home — an all-time high."
        cite="USDA ERS · 2023"
      />
      <Figure
        visual={<Plates filled={2} total={3} on={on} />}
        number="2 in 3"
        label="diners underestimate their restaurant meal's calories — 1 in 4 by 500 or more."
        cite="BMJ / JAMA · peer-reviewed"
      />
      <Figure
        visual={<Sliver part={24} whole={2000} on={on} />}
        number={on ? <CountUp value={24} prefix="~" suffix=" cal" duration={1200} /> : "~0 cal"}
        label="is all a menu calorie label shifts intake, on its own. Labels inform; they don't plan."
        cite="Cochrane review"
        accent
      />
    </div>
  );
}
