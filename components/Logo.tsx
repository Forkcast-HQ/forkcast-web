import { cls } from "@/lib/format";
import { accentArcPath, CUT_PCT, CUT_ROTATE, DRAWN_PCT } from "@/lib/mark";

/**
 * Palatify combination mark. The plate is a ring with a 54° cut at the
 * upper-right; the accent arc is CONCENTRIC with it — same centre, radius
 * ×1.13 — sitting just outside the cut. `variant="dark"` renders the mark
 * in a solid dark pill for use on dark backgrounds.
 *
 * At this size the stroke is deliberately heavier than the mark's drawn
 * ratio: a hairline rim disappears at 24px. The geometry is identical.
 */
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const ink = isDark ? "#F3F2F2" : "#201e1d";
  const textClass = isDark ? "text-cream" : "text-ink";

  return (
    <span
      className={cls(
        "inline-flex items-center gap-2",
        isDark && "rounded-full bg-ink px-3.5 py-1.5",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="h-6 w-6 shrink-0 overflow-visible" fill="none" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="30"
          pathLength={100}
          stroke={ink}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${DRAWN_PCT} ${CUT_PCT}`}
          transform={`rotate(${CUT_ROTATE} 50 50)`}
        />
        <path
          d={accentArcPath(50, 50, 30)}
          stroke="#D9552E"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      <span className={cls("font-display text-xl font-semibold tracking-tight lowercase", textClass)}>
        palatify
      </span>
    </span>
  );
}
