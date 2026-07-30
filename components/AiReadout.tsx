"use client";

/**
 * AiReadout — the AI section's argument, shown rather than described.
 *
 * The section this replaces made its case in about ninety words across three
 * columns of prose. Nobody reads ninety words to learn what a product does.
 * This does the same job in one moving picture: a line of menu text (or a
 * photo caption) on the left, the nutrition it resolves to on the right, and
 * a scan travelling between them. It cycles, so watching it for six seconds
 * tells you what the AI is for.
 *
 * The numbers are illustrative and labelled as such — the honest version of
 * a marketing animation. Wiring it to the live /api/analyze endpoint would
 * put a model call on every landing-page view for a loop most visitors watch
 * once; the real thing is two clicks away on /how-it-works and in the app.
 *
 * Under prefers-reduced-motion it stops cycling and renders one example
 * fully resolved — the composition survives, the movement doesn't.
 */

import { useEffect, useRef, useState } from "react";
import { Camera, ScrollText } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { cls } from "@/lib/format";

type Sample = {
  kind: "menu" | "photo";
  source: string;
  macros: { label: string; value: number; unit: string }[];
};

const SAMPLES: Sample[] = [
  {
    kind: "menu",
    source: "Kale, quinoa, roasted chicken, sweet potato, almonds, lemon-tahini",
    macros: [
      { label: "kcal", value: 520, unit: "" },
      { label: "protein", value: 38, unit: "g" },
      { label: "fibre", value: 11, unit: "g" },
      { label: "sodium", value: 610, unit: "mg" },
    ],
  },
  {
    kind: "photo",
    source: "A photo of two tacos al pastor, pineapple, corn tortillas",
    macros: [
      { label: "kcal", value: 430, unit: "" },
      { label: "protein", value: 24, unit: "g" },
      { label: "fibre", value: 6, unit: "g" },
      { label: "sodium", value: 720, unit: "mg" },
    ],
  },
  {
    kind: "menu",
    source: "Blackened salmon, farro, charred broccolini, salsa verde",
    macros: [
      { label: "kcal", value: 580, unit: "" },
      { label: "protein", value: 40, unit: "g" },
      { label: "fibre", value: 9, unit: "g" },
      { label: "sodium", value: 600, unit: "mg" },
    ],
  },
];

const HOLD_MS = 5200;

export function AiReadout() {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;

    // Only advance while on screen — a loop nobody is looking at is just
    // a timer keeping the tab awake.
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      timer ??= setInterval(() => setI((n) => (n + 1) % SAMPLES.length), HOLD_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const el = wrap.current;
    const io = el
      ? new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 })
      : null;
    if (el && io) io.observe(el);
    else start();

    return () => {
      stop();
      io?.disconnect();
    };
  }, []);

  const s = SAMPLES[i];
  const Icon = s.kind === "photo" ? Camera : ScrollText;

  return (
    <div
      ref={wrap}
      className="surface-card overflow-hidden rounded-[28px]"
      aria-label="Example: how the AI turns a menu line into nutrition"
    >
      <div className="grid gap-0 md:grid-cols-[1.15fr_auto_1fr]">
        {/* ---- What goes in ---- */}
        <div className="flex flex-col justify-center gap-4 p-7 sm:p-9">
          <span className="kicker inline-flex items-center gap-2 text-ink/45">
            <Icon className="h-3.5 w-3.5" />
            {s.kind === "photo" ? "What you photographed" : "What the kitchen wrote"}
          </span>
          <p
            key={`src-${i}`}
            className="max-w-[34ch] font-display text-xl font-bold leading-snug text-ink sm:text-2xl"
            style={reduced ? undefined : { animation: "rise 0.55s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {s.source}
          </p>
        </div>

        {/* ---- The scan ----
             Horizontal on desktop, vertical on mobile, so the "in → out"
             reading order survives the column stack. */}
        <div className="relative flex items-center justify-center md:w-24">
          <div className="scan-rail h-px w-full md:h-full md:w-px" aria-hidden="true">
            {!reduced && <span className="scan-dot" />}
          </div>
        </div>

        {/* ---- What comes out ---- */}
        <div className="flex flex-col justify-center gap-4 bg-neutral-100 p-7 sm:p-9">
          <span className="kicker text-brand-700">Palatify reads</span>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {s.macros.map((m, mi) => (
              <div key={m.label}>
                <dd className="font-display text-2xl font-extrabold leading-none tracking-tight text-ink tabular-nums sm:text-[1.75rem]">
                  {reduced ? (
                    <>
                      {m.value.toLocaleString()}
                      {m.unit}
                    </>
                  ) : (
                    <CountUp
                      key={`${i}-${m.label}`}
                      value={m.value}
                      suffix={m.unit}
                      duration={620 + mi * 90}
                    />
                  )}
                </dd>
                <dt className="kicker mt-1.5 text-ink/45">{m.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-7 py-3.5 sm:px-9">
        <p className="text-[13px] text-ink/45">
          Illustrative example. The kitchen — or you — corrects anything off before it counts.
        </p>
        {!reduced && (
          <div className="flex gap-1.5" role="tablist" aria-label="Example">
            {SAMPLES.map((_, d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={d === i}
                aria-label={`Example ${d + 1}`}
                onClick={() => setI(d)}
                className={cls(
                  "h-1.5 rounded-full transition-all",
                  d === i ? "w-6 bg-brand-600" : "w-1.5 bg-ink/15 hover:bg-ink/35",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
