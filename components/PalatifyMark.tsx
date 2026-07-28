import { accentArcPath, CUT_PCT, CUT_ROTATE, DRAWN_PCT } from "@/lib/mark";

/**
 * PalatifyMark — the brand mark at any size, drawing itself in.
 *
 * Geometry lives in lib/mark.ts. The one thing to be careful about here:
 * the ring's cut-out IS its dash pattern, so the draw-in animation has to
 * animate `stroke-dasharray` between two *pairs* (0 100 → 85 15). Animating
 * dashoffset, or letting a CSS class set a single dasharray value, silently
 * fills the cut back in.
 */
export function PalatifyMark({
  /** Plate radius in viewBox units (the viewBox is 100×100). */
  r = 30,
  /** Stroke weight. Defaults to the mark's own ratio — thin and editorial. */
  stroke,
  inkColor = "#201e1d",
  accentColor = "#ec3013",
  animate = true,
  className,
}: {
  r?: number;
  stroke?: number;
  inkColor?: string;
  accentColor?: string;
  animate?: boolean;
  className?: string;
}) {
  const sw = stroke ?? r * 0.115;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      {/* The plate — a ring with a real cut in it */}
      <circle
        cx="50"
        cy="50"
        r={r}
        pathLength={100}
        stroke={inkColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${DRAWN_PCT} ${CUT_PCT}`}
        transform={`rotate(${CUT_ROTATE} 50 50)`}
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

      {/* The accent arc — same centre, larger radius, over the cut */}
      <path
        d={accentArcPath(50, 50, r)}
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
