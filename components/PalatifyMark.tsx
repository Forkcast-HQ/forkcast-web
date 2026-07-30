import {
  accentArcPath,
  CUT_PCT,
  CUT_ROTATE,
  DRAWN_PCT,
  INK,
  MARK_CX,
  MARK_CY,
  MARK_R,
  PERSIMMON,
  STROKE_RATIO,
} from "@/lib/mark";

/**
 * PalatifyMark — the brand mark at any size, drawing itself in.
 *
 * Geometry lives in lib/mark.ts and matches brand/mark/*.svg exactly. Two
 * things to be careful about here:
 *
 *   1. The ring's cut-out IS its dash pattern, so the draw-in animation has
 *      to animate `stroke-dasharray` between two *pairs* (0 100 → 83.3 16.7).
 *      Animating dashoffset, or letting a CSS class set a single dasharray
 *      value, silently fills the cut back in.
 *   2. The mark's centre is (50, 52), not (50, 50) — the lift reaches above
 *      the ring and the brand file reserves that room. Callers that need to
 *      register other artwork against the plate should read MARK_CX/MARK_CY
 *      rather than assuming the box centre.
 */
export function PalatifyMark({
  /** Plate radius in viewBox units (the viewBox is 100×100). */
  r = MARK_R,
  /** Stroke weight. Defaults to the brand's own ratio (7 at r=30). */
  stroke,
  cx = MARK_CX,
  cy = MARK_CY,
  inkColor = INK,
  accentColor = PERSIMMON,
  animate = true,
  className,
}: {
  r?: number;
  stroke?: number;
  cx?: number;
  cy?: number;
  inkColor?: string;
  accentColor?: string;
  animate?: boolean;
  className?: string;
}) {
  const sw = stroke ?? r * STROKE_RATIO;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      {/* The plate — a ring with a real 60° cut in it */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        pathLength={100}
        stroke={inkColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${DRAWN_PCT} ${CUT_PCT}`}
        transform={`rotate(${CUT_ROTATE} ${cx} ${cy})`}
        className="mark-draw"
        style={
          animate
            ? {
                animation: "markRing 1.4s cubic-bezier(0.16,1,0.3,1) 0.15s both",
                ["--drawn" as string]: String(DRAWN_PCT),
                ["--cut" as string]: String(CUT_PCT),
              }
            : undefined
        }
      />

      {/* The lift — same centre, radius ×41/30, sitting over the cut */}
      <path
        d={accentArcPath(cx, cy, r)}
        pathLength={100}
        stroke={accentColor}
        strokeWidth={sw}
        strokeLinecap="round"
        className="mark-draw"
        style={
          animate
            ? { animation: "markArc 1s cubic-bezier(0.16,1,0.3,1) 0.55s both" }
            : undefined
        }
      />
    </svg>
  );
}
