/**
 * The palatify mark's geometry, in one place, framework-free.
 *
 * Two elements sharing one centre:
 *   1. The plate — a ring with a 54° cut-out centred at 45° (upper-right).
 *   2. The accent arc — CONCENTRIC with the plate (same centre, radius
 *      ×1.13), spanning 20°→73°, so it sits just outside the cut and
 *      closes it optically without touching.
 *
 * Kept out of any "use client" module so server components can call it.
 */

/** Cut-out: 54° of 360°, i.e. 15% of the circumference. */
export const CUT_PCT = 15;
/** Drawn portion of the ring, as a percentage (pathLength is normalised to 100). */
export const DRAWN_PCT = 100 - CUT_PCT;
/** Rotation that moves the cut to 45°, given SVG circles start at 3 o'clock. */
export const CUT_ROTATE = -18;
/** Accent arc radius, as a multiple of the plate radius. */
export const ARC_RATIO = 1.13;

/** Point on a circle. Angle measured clockwise from 12 o'clock. */
function pt(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
}

/** The accent arc's `d`, concentric with a plate of radius `r` at (cx, cy). */
export function accentArcPath(cx: number, cy: number, r: number): string {
  const ar = r * ARC_RATIO;
  const [x1, y1] = pt(cx, cy, ar, 20);
  const [x2, y2] = pt(cx, cy, ar, 73);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${ar.toFixed(2)} ${ar.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
