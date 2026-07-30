/**
 * The palatify mark — "The Lift" — in one place, framework-free.
 *
 * These numbers are NOT invented here. They are read back out of the shipped
 * brand files (Forkcast-Docs-Local/brand/mark/*.svg), which draw:
 *
 *   ring   M57.76,23.02 A30,30 0 1 0 78.98,44.24   stroke 7
 *   lift   M67.33,14.84 A41,41 0 0 1 87.16,34.67   stroke 7  (#EC3013)
 *
 * Solving those two arcs gives a shared centre of (50, 52) — the mark sits
 * low in its 100×100 box on purpose, so the lift has room to reach above the
 * ring. Everything below is that same geometry, parameterised:
 *
 *   1. The plate — a ring of radius r with a 60° cut centred at 45° (upper
 *      right, clockwise from 12 o'clock).
 *   2. The lift — CONCENTRIC with the plate, radius ×41/30, spanning 25°→65°,
 *      so it closes the cut optically without ever touching the ring.
 *
 * The brand rules are explicit that the two arcs are never re-spaced and that
 * the lift is the only persimmon element, so treat these as fixed. Only the
 * radius and the centre are free.
 *
 * Kept out of any "use client" module so server components can call it.
 */

/** Shared centre of both arcs, in viewBox units. */
export const MARK_CX = 50;
export const MARK_CY = 52;

/** Plate radius in the canonical drawing. */
export const MARK_R = 30;

/** Ring cut: 60° of 360°, i.e. 16.667% of the circumference. */
export const CUT_PCT = (60 / 360) * 100;
/** Drawn portion of the ring, as a percentage (pathLength is normalised to 100). */
export const DRAWN_PCT = 100 - CUT_PCT;
/**
 * Rotation applied to an SVG `<circle>` so its dash pattern starts where the
 * cut ends. Circles begin at 3 o'clock (90° clockwise from 12) and run
 * clockwise; the cut spans 15°→75°, so the drawn run must start at 75°.
 */
export const CUT_ROTATE = 75 - 90;

/** Lift radius, as a multiple of the plate radius. */
export const ARC_RATIO = 41 / 30;
/** Lift sweep, in degrees clockwise from 12 o'clock. */
export const ARC_START_DEG = 25;
export const ARC_END_DEG = 65;

/** Stroke weight as a multiple of the plate radius (7 at r=30). */
export const STROKE_RATIO = 7 / 30;

/** Point on a circle. Angle measured clockwise from 12 o'clock. */
function pt(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
}

/** The lift arc's `d`, concentric with a plate of radius `r` at (cx, cy). */
export function accentArcPath(cx: number, cy: number, r: number): string {
  const ar = r * ARC_RATIO;
  const [x1, y1] = pt(cx, cy, ar, ARC_START_DEG);
  const [x2, y2] = pt(cx, cy, ar, ARC_END_DEG);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${ar.toFixed(2)},${ar.toFixed(2)} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

/** Brand colours, verbatim from brand/README.md. */
export const INK = "#14100F";
export const PERSIMMON = "#EC3013";
export const BONE = "#F7F4F0";
