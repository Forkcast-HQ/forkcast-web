import { cls } from "@/lib/format";
import {
  accentArcPath,
  CUT_PCT,
  CUT_ROTATE,
  DRAWN_PCT,
  MARK_CX,
  MARK_CY,
  MARK_R,
  STROKE_RATIO,
} from "@/lib/mark";

/**
 * Palatify combination mark — the primary identity: The Lift + the lowercase
 * wordmark, reproduced from brand/lockup/palatify-horizontal.svg.
 *
 * Two details that are easy to get wrong and were both wrong before:
 *
 *   - The mark's centre is (50, 52) and the lift's radius is 41, so the
 *     drawn artwork occupies x 16.5→90.7, y 7.5→85.5 of the 100×100 box.
 *     The viewBox below is cropped to exactly that, which is what lets the
 *     mark be sized in `em` against the wordmark and land on the official
 *     proportion (mark height ≈ 1.06 × the wordmark's ink height).
 *   - The wordmark is DM Sans — 500 on `palat`, 400 with a touch of positive
 *     tracking on `ify` — not the UI face. `--font-wordmark` is wired up in
 *     app/layout.tsx; the fallback stack only matters before it loads.
 *
 * `variant="dark"` renders the lockup reversed inside a solid ink pill, per
 * brand/lockup/palatify-horizontal-reversed.svg. Persimmon stays persimmon in
 * both — the brand rules allow the ring and wordmark to flip, never the lift.
 */
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const ink = isDark ? "var(--color-cream)" : "var(--color-ink)";

  return (
    <span
      className={cls(
        // Metrics read off the official lockup, expressed against the
        // wordmark's font size: mark 85.8/84 em tall, 36.3/84 em of clear
        // space before the "p", and its centre riding 0.09em above the
        // text's em-box centre.
        "inline-flex items-center gap-[0.43em] text-[1.3rem] leading-none",
        isDark && "rounded-full bg-ink px-[0.55em] py-[0.34em]",
        className,
      )}
    >
      <svg
        viewBox="16.5 7.5 74.2 78"
        className="h-[1.02em] w-auto shrink-0 -translate-y-[0.09em]"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx={MARK_CX}
          cy={MARK_CY}
          r={MARK_R}
          pathLength={100}
          stroke={ink}
          strokeWidth={MARK_R * STROKE_RATIO}
          strokeLinecap="round"
          strokeDasharray={`${DRAWN_PCT} ${CUT_PCT}`}
          transform={`rotate(${CUT_ROTATE} ${MARK_CX} ${MARK_CY})`}
        />
        <path
          d={accentArcPath(MARK_CX, MARK_CY, MARK_R)}
          stroke="var(--color-brand-600)"
          strokeWidth={MARK_R * STROKE_RATIO}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cls("wordmark", isDark ? "text-cream" : "text-ink")}
        style={{ letterSpacing: "-0.035em" }}
      >
        <span style={{ fontWeight: 500 }}>palat</span>
        <span style={{ fontWeight: 400, letterSpacing: "-0.023em" }}>ify</span>
      </span>
    </span>
  );
}
