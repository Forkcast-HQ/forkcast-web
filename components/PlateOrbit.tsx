"use client";

/**
 * PlateOrbit — the hero object.
 *
 * The palatify mark taken literally: the ring IS a plate, and there's real
 * food on it. Dishes crossfade through it with a slow push-in, the ink rim
 * carries the mark's 54° cut, and the accent arc sits concentric just
 * outside. Nutrient chips ride the rim — hover one and everything stops,
 * the chip locks, and its number takes the readout.
 *
 * The chips deliberately do NOT orbit a full circle. A continuously
 * rotating ring means every chip eventually passes through the bottom of
 * the frame, where it collides with the score readout — which is exactly
 * what was happening. Instead they occupy the top 160° and the whole group
 * sways a few degrees, so the bottom sector stays permanently clear and the
 * motion reads as breathing rather than spinning.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { PalatifyMark } from "@/components/PalatifyMark";
import { SmartImage } from "@/components/SmartImage";
import { categoryImg } from "@/lib/images";
import { MARK_CX, MARK_CY } from "@/lib/mark";
import { cls } from "@/lib/format";

type Chip = {
  id: string;
  label: string;
  value: string;
  /** Degrees clockwise from 12 o'clock. All within the top 160°. */
  angle: number;
  accent?: boolean;
};

const CHIPS: Chip[] = [
  { id: "sodium", label: "Sodium", value: "780mg", angle: 282 },
  { id: "fat", label: "Fat", value: "18g", angle: 321 },
  { id: "protein", label: "Protein", value: "42g", angle: 0, accent: true },
  { id: "carbs", label: "Carbs", value: "51g", angle: 39 },
  { id: "left", label: "Left today", value: "1,140 cal", angle: 78 },
];

const DISHES = [
  { key: "salmon-plate", name: "Miso salmon", score: 92 },
  { key: "grain-bowl", name: "Harvest grain bowl", score: 88 },
  { key: "poke", name: "Ahi poke", score: 94 },
  { key: "mediterranean", name: "Mezze plate", score: 86 },
];

/**
 * Plate radius and chip-orbit radius, in viewBox units (box is 100 wide).
 *
 * ORBIT is not a free choice. The brand's lift arc is concentric at 1.367×
 * the plate radius — much further out than it looks in a 24px logo — so at
 * PLATE_R 29 its outer edge lands at 43. Any chip ring inside ~46 puts
 * nutrient chips straight through the one persimmon element in the
 * identity, which is exactly what happened the first time these numbers
 * were picked against the old (wrong) 1.13 ratio.
 */
const PLATE_R = 29;
const ORBIT = 47.5;

/**
 * Rim weight. Deliberately lighter than the brand's own 0.233 ratio, which
 * is tuned for a mark read at 24px — at 450px across it renders as a black
 * tyre and buries the food it is supposed to be holding. Both arcs are
 * thinned by the same amount, so the ring and the lift stay in the
 * relationship the brand book fixes; only the absolute weight changes. The
 * logo, favicon and share card all keep the exact brand ratio.
 */
const PLATE_SW = PLATE_R * 0.07;
/** Food disc radius — tucked a hair under the rim's inner edge. */
const FOOD_R = PLATE_R - PLATE_SW / 2 + 0.5;

/**
 * The mark's centre is (50, 52), not the box centre, so everything that has
 * to register against the plate — the food, the orbit guides, the rotation
 * origin of the chip rig — is offset by the same two units. As a percentage
 * of a square box those units are percentages directly.
 */
const CENTRE = `${MARK_CX}% ${MARK_CY}%`;

export function PlateOrbit({ className }: { className?: string }) {
  const rigRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Chip | null>(null);
  const [dish, setDish] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => setMounted(true), []);

  // Crossfade dishes. Pauses while a chip is held or the pointer is over the
  // rig, so the reader isn't chasing a moving target while inspecting a
  // number — and holds completely still under prefers-reduced-motion, which
  // the interval used to ignore even though every other animation here
  // respected it.
  useEffect(() => {
    if (active || hover) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setDish((d) => (d + 1) % DISHES.length), 4200);
    return () => clearInterval(id);
  }, [active, hover]);

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
    setHover(false);
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
      className={cls("relative aspect-square w-full select-none [perspective:1400px]", className)}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
    >
      <div
        ref={rigRef}
        data-paused={active || hover ? "true" : "false"}
        className="orbit-rig tilt-rig absolute inset-0"
      >
        {/* ---- The food, sitting in the plate ---- */}
        <div
          className="absolute left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          style={{ width: `${FOOD_R * 2}%`, top: `${MARK_CY}%` }}
        >
          {DISHES.map((d, i) => (
            <div
              key={d.key}
              className={cls(
                "absolute inset-0 transition-opacity duration-[1100ms] ease-out",
                i === dish ? "opacity-100" : "opacity-0",
              )}
            >
              <SmartImage
                src={categoryImg(d.key, 900, 900)}
                alt=""
                label={d.name}
                priority={i === 0}
                className={cls("h-full w-full object-cover", i === dish && "kenburns")}
              />
            </div>
          ))}
          {/* Inner shadow — puts the food *in* the plate, not on top of it */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_44px_rgba(20, 16, 15,0.36)]" />
        </div>

        {/* ---- The mark, as the plate's rim ---- */}
        <PalatifyMark
          r={PLATE_R}
          stroke={PLATE_SW}
          className="absolute inset-0 h-full w-full overflow-visible"
        />

        {/* ---- Orbit guides ---- */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <circle cx={MARK_CX} cy={MARK_CY} r={ORBIT} fill="none" stroke="rgb(var(--ink-rgb) / 0.1)" strokeWidth="0.28" />
          <circle
            cx={MARK_CX}
            cy={MARK_CY}
            r={ORBIT + 5}
            fill="none"
            stroke="rgb(var(--ink-rgb) / 0.07)"
            strokeWidth="0.28"
            strokeDasharray="0.8 3"
          />
        </svg>

        {/* ---- Chips on the upper arc ---- */}
        {mounted && (
          <div className="orbit-sway absolute inset-0" style={{ transformOrigin: CENTRE }}>
            {CHIPS.map((c, i) => (
              <div
                key={c.id}
                className="absolute inset-0"
                style={{ transform: `rotate(${c.angle}deg)`, transformOrigin: CENTRE }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${MARK_CY - ORBIT}%` }}
                >
                  {/* Undo the group's sway, then this arm's fixed angle, so
                      the chip never tips as the ring breathes. */}
                  <div className="orbit-sway-rev">
                    <div style={{ transform: `rotate(${-c.angle}deg)` }}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(c)}
                        onFocus={() => setActive(c)}
                        onBlur={() => setActive(null)}
                        aria-label={`${c.label}: ${c.value}`}
                        className={cls(
                          "chip-bob whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold shadow-sm transition duration-300",
                          active?.id === c.id
                            ? "scale-110 border-transparent bg-ink text-cream shadow-lg"
                            : c.accent
                              ? "border-brand-600/40 bg-brand-50 text-brand-700 hover:scale-105"
                              : "border-black/10 bg-white/85 text-ink/75 backdrop-blur-sm hover:scale-105",
                        )}
                        style={{ animationDelay: `${i * 700}ms` }}
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

        {/* ---- Readout. Hung off the plate's own bottom edge rather than the
             frame's, so it stays tucked under the rim at any PLATE_R instead
             of drifting away as a floating card. Still inside the bottom
             sector the chips never enter. ---- */}
        <div
          className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 justify-center"
          style={{ top: `${MARK_CY + PLATE_R + 6}%` }}
        >
          <div className="rounded-2xl border border-black/10 bg-cream/92 px-6 py-3 text-center shadow-[0_2px_4px_rgba(20,16,15,0.06),0_24px_48px_-24px_rgba(20,16,15,0.4)] backdrop-blur-md">
            <p className="kicker text-ink/55">{active ? active.label : current.name}</p>
            <p
              key={active?.id ?? current.key}
              className="font-display text-[2.25rem] font-extrabold leading-none tracking-tight text-ink"
              style={{ animation: "pop 380ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {active ? (
                active.value
              ) : (
                <>
                  {current.score}
                  <span className="text-xl text-ink/35">/100</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
