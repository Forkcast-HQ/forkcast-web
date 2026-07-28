"use client";

/**
 * PlateOrbit — the hero object.
 *
 * The palatify mark taken literally: the ring *is* a plate, and there's
 * real food on it. Dishes crossfade through the plate with a slow push-in;
 * the ink rim carries the mark's 54° cut; the accent arc sits concentric
 * just outside it and breathes. Nutrient chips orbit the rim — hover one
 * and the rig stops, the chip locks, and its number takes the readout.
 *
 * The point: the logo isn't decoration next to the product, it's the
 * product's interface.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { PalatifyMark } from "@/components/PalatifyMark";
import { SmartImage } from "@/components/SmartImage";
import { categoryImg } from "@/lib/images";
import { cls } from "@/lib/format";

type Chip = {
  id: string;
  label: string;
  value: string;
  /** Degrees clockwise from 12 o'clock. */
  angle: number;
  accent?: boolean;
};

const CHIPS: Chip[] = [
  { id: "protein", label: "Protein", value: "42g", angle: 8, accent: true },
  { id: "carbs", label: "Carbs", value: "51g", angle: 80 },
  { id: "fat", label: "Fat", value: "18g", angle: 152 },
  { id: "sodium", label: "Sodium", value: "780mg", angle: 224 },
  { id: "left", label: "Left today", value: "1,140 cal", angle: 296 },
];

const DISHES = [
  { key: "salmon-plate", name: "Miso salmon", score: 92 },
  { key: "grain-bowl", name: "Harvest grain bowl", score: 88 },
  { key: "poke", name: "Ahi poke", score: 94 },
  { key: "mediterranean", name: "Mezze plate", score: 86 },
];

/** Chip orbit radius, as a % of the box. Rim sits at 30%. */
const ORBIT = 43;

export function PlateOrbit({ className }: { className?: string }) {
  const rigRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Chip | null>(null);
  const [dish, setDish] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Crossfade dishes. Pauses while a chip is held, so the reader isn't
  // fighting a moving target while inspecting a number.
  useEffect(() => {
    if (active) return;
    const id = setInterval(() => setDish((d) => (d + 1) % DISHES.length), 4200);
    return () => clearInterval(id);
  }, [active]);

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
      el.style.setProperty("--rx", String(Math.max(-1, Math.min(1, dy)) * -7));
      el.style.setProperty("--ry", String(Math.max(-1, Math.min(1, dx)) * 7));
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = rigRef.current;
    if (el) {
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
    }
    setActive(null);
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const current = DISHES[dish];

  return (
    <div
      className={cls("relative aspect-square w-full select-none [perspective:1200px]", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={rigRef}
        data-paused={active ? "true" : "false"}
        className="orbit-rig tilt-rig absolute inset-0"
      >
        {/* ---- The food, inside the plate ---- */}
        <div className="absolute left-1/2 top-1/2 aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
          {DISHES.map((d, i) => (
            <div
              key={d.key}
              className={cls(
                "absolute inset-0 transition-opacity duration-[1100ms] ease-out",
                i === dish ? "opacity-100" : "opacity-0",
              )}
            >
              <SmartImage
                src={categoryImg(d.key, 720, 720)}
                alt=""
                label={d.name}
                className={cls(
                  "h-full w-full object-cover",
                  i === dish && "kenburns",
                )}
              />
            </div>
          ))}
          {/* Rim shadow — makes the food sit *in* the plate, not on top */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_36px_rgba(32,30,29,0.34)]" />
        </div>

        {/* ---- The mark, as the plate's rim ---- */}
        <PalatifyMark r={30} className="absolute inset-0 h-full w-full overflow-visible" />

        {/* ---- Orbit guide + chips ---- */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <circle cx="50" cy="50" r={ORBIT} fill="none" stroke="rgb(32 30 29 / 0.1)" strokeWidth="0.3" />
          <circle
            cx="50"
            cy="50"
            r={ORBIT + 6}
            fill="none"
            stroke="rgb(32 30 29 / 0.06)"
            strokeWidth="0.3"
            strokeDasharray="1 3"
            className="orbit-spin-rev"
            style={{ ["--dur" as string]: "120s", transformOrigin: "50% 50%" }}
          />
        </svg>

        {mounted && (
          <div className="orbit-spin absolute inset-0" style={{ ["--dur" as string]: "52s" }}>
            {CHIPS.map((c) => (
              <div key={c.id} className="absolute inset-0" style={{ transform: `rotate(${c.angle}deg)` }}>
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${50 - ORBIT}%` }}
                >
                  {/* Undo the rig spin, then this arm's fixed angle, so the
                      chip never tips over as it travels. */}
                  <div className="orbit-spin-rev" style={{ ["--dur" as string]: "52s" }}>
                    <div style={{ transform: `rotate(${-c.angle}deg)` }}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(c)}
                        onFocus={() => setActive(c)}
                        onBlur={() => setActive(null)}
                        aria-label={`${c.label}: ${c.value}`}
                        className={cls(
                          "whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm transition duration-300",
                          active?.id === c.id
                            ? "scale-110 border-transparent bg-ink text-cream shadow-lg"
                            : c.accent
                              ? "border-brand-600/40 bg-brand-50 text-brand-700 hover:scale-105"
                              : "border-black/10 bg-white/85 text-ink/75 backdrop-blur-sm hover:scale-105",
                        )}
                      >
                        {c.label}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- Readout, pinned under the plate ---- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex justify-center">
          <div className="rounded-2xl border border-black/10 bg-cream/90 px-5 py-2.5 text-center shadow-lg backdrop-blur-md">
            <p className="kicker text-ink/50">{active ? active.label : current.name}</p>
            <p
              key={active?.id ?? current.key}
              className="font-display text-3xl font-extrabold leading-none tracking-tight text-ink"
              style={{ animation: "pop 380ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {active ? (
                active.value
              ) : (
                <>
                  {current.score}
                  <span className="text-lg text-ink/35">/100</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
