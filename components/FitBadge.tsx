// Fit Score ring — Modernist DS (from the design handoff):
// SVG circle, stroke-dasharray = score/100 × circumference, rotated −90°,
// accent stroke when score ≥ 65, neutral otherwise. Number in the middle.

import { cls } from "@/lib/format";
import { fitColor } from "@/lib/nutrition";

const SIZES = {
  sm: { box: 40, r: 16, stroke: 3.5, text: "text-[11px]" },
  md: { box: 46, r: 19, stroke: 4, text: "text-xs" },
  lg: { box: 72, r: 30, stroke: 5, text: "text-lg" },
} as const;

export function FitBadge({
  score,
  grade,
  size = "md",
}: {
  score: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = SIZES[size];
  const c = 2 * Math.PI * s.r;
  const dash = (score / 100) * c;
  const color = fitColor(score);
  const mid = s.box / 2;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative grid place-items-center rounded-full bg-white/95 shadow-sm"
        style={{ width: s.box, height: s.box }}
        title={`Fit Score ${score}/100`}
      >
        <svg width={s.box} height={s.box} viewBox={`0 0 ${s.box} ${s.box}`} className="absolute inset-0 -rotate-90">
          <circle cx={mid} cy={mid} r={s.r} fill="none" stroke="#eae7e7" strokeWidth={s.stroke} />
          <circle
            cx={mid}
            cy={mid}
            r={s.r}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash.toFixed(1)} ${c.toFixed(1)}`}
          />
        </svg>
        <span className={cls("font-display font-extrabold tabular-nums text-ink", s.text)}>{score}</span>
      </div>
      {grade && size !== "sm" && (
        <span className="kicker mt-1 text-ink/45">Fit {grade}</span>
      )}
    </div>
  );
}

export function FitPill({ score }: { score: number }) {
  const strong = score >= 65;
  return (
    <span
      className={cls(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        strong ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-300 bg-white text-neutral-600",
      )}
    >
      <span className={cls("h-1.5 w-1.5 rounded-full", strong ? "bg-brand-600" : "bg-neutral-400")} />
      {score} fit
    </span>
  );
}
