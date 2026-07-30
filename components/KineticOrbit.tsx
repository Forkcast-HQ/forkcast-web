"use client";

/**
 * KineticOrbit — the landing page's hero object.
 *
 * It is the palatify mark, scaled up and set in motion: the open ink ring
 * plus the short accent arc, with nutrient nodes orbiting the rim. Hovering
 * a node pauses the rig and snaps that node's value into the centre, so the
 * logo doubles as a live explanation of what a Fit Score is made of.
 *
 * No canvas, no WebGL — pure SVG + CSS transforms, so it costs nothing on
 * mobile and disappears cleanly under prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cls } from "@/lib/format";

type Node = {
  id: string;
  label: string;
  value: string;
  /** Position on the rim, in degrees clockwise from 12 o'clock. */
  angle: number;
  accent?: boolean;
};

const NODES: Node[] = [
  { id: "protein", label: "Protein", value: "42g", angle: 0, accent: true },
  { id: "carbs", label: "Carbs", value: "51g", angle: 72 },
  { id: "fat", label: "Fat", value: "18g", angle: 144 },
  { id: "sodium", label: "Sodium", value: "780mg", angle: 216 },
  { id: "budget", label: "Left today", value: "1,140 cal", angle: 288 },
];

/** Radius of the node ring as a fraction of the box. */
const R = 42;

export function KineticOrbit({ className }: { className?: string }) {
  const rigRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Node | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cursor parallax — the whole rig leans a few pixels toward the pointer.
  // Throttled to one write per animation frame and skipped entirely on
  // coarse pointers, where there is no cursor to follow.
  const frame = useRef<number | null>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = rigRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.setProperty("--mx", String(Math.max(-1, Math.min(1, dx)) * 14));
      el.style.setProperty("--my", String(Math.max(-1, Math.min(1, dy)) * 14));
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = rigRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
    setActive(null);
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <div
      className={cls("relative aspect-square w-full select-none", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={rigRef}
        data-paused={active ? "true" : "false"}
        className="orbit-rig magnetic absolute inset-0"
      >
        {/* ---- The mark itself, scaled to fill the box ---- */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {/* Faint outer guide rings — the "orbit" the nodes travel on */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(32 30 29 / 0.12)" strokeWidth="0.35" />
          <circle
            cx="50"
            cy="50"
            r={R - 9}
            fill="none"
            stroke="rgb(32 30 29 / 0.07)"
            strokeWidth="0.35"
            strokeDasharray="1.5 3"
          />

          {/* The logo ring — open, exactly as in the combination mark */}
          <g transform="rotate(-35 50 50)">
            <circle
              cx="50"
              cy="50"
              r="24"
              fill="none"
              stroke="#201e1d"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="125 26"
              className="arc-draw"
              style={{ ["--len" as string]: "151" }}
            />
          </g>

          {/* The accent arc — the one red gesture in the mark */}
          <path
            d="M55 22c7.2 1.4 12.5 6.7 14.4 13.4"
            fill="none"
            stroke="#ec3013"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="arc-draw drift"
            style={{ ["--len" as string]: "24" }}
          />
        </svg>

        {/* ---- Orbiting nodes ---- */}
        {mounted && (
          <div className="orbit-spin absolute inset-0" style={{ ["--dur" as string]: "48s" }}>
            {NODES.map((n) => (
              // Rotating arm: a full-box layer turned to the node's angle, so
              // the node lands on the rim. (A zero-size box can't be offset
              // with a percentage translate — the arm has to carry the size.)
              <div
                key={n.id}
                className="absolute inset-0"
                style={{ transform: `rotate(${n.angle}deg)` }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${50 - R}%` }}
                >
                  {/* Undo the rig's continuous spin… */}
                  <div className="orbit-spin-rev" style={{ ["--dur" as string]: "48s" }}>
                    {/* …then undo this arm's static angle, so labels stay level. */}
                    <div style={{ transform: `rotate(${-n.angle}deg)` }}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(n)}
                        onFocus={() => setActive(n)}
                        onBlur={() => setActive(null)}
                        aria-label={`${n.label}: ${n.value}`}
                        className={cls(
                          "whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold transition duration-300",
                          active?.id === n.id
                            ? "scale-110 border-transparent bg-ink text-cream shadow-lg"
                            : n.accent
                              ? "border-brand-600/35 bg-brand-50 text-brand-700 hover:scale-105"
                              : "border-black/10 bg-white/80 text-ink/70 backdrop-blur-sm hover:scale-105",
                        )}
                      >
                        {n.label}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- Centre readout ---- */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="kicker text-ink/60">
              {active ? active.label : "Fit Score"}
            </p>
            <p
              key={active?.id ?? "base"}
              className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-extrabold leading-none tracking-tight text-ink"
              style={{ animation: "pop 380ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {active ? active.value : "92"}
            </p>
            {!active && (
              <p className="mt-1 text-[11px] font-semibold text-ink/60">out of 100</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
