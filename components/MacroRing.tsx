import { cls } from "@/lib/format";

export function MacroRing({
  value,
  max,
  size = 132,
  stroke = 13,
  color = "#059669",
  track = "rgba(0,0,0,0.08)",
  centerTop,
  centerMain,
  centerSub,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  centerTop?: string;
  centerMain?: string;
  centerSub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const offset = c * (1 - ratio);
  const over = max > 0 && value > max;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? "#ef4444" : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerTop && <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">{centerTop}</span>}
        {centerMain && (
          <span className={cls("font-display text-2xl font-bold leading-none", over ? "text-red-500" : "text-ink")}>
            {centerMain}
          </span>
        )}
        {centerSub && <span className="mt-1 text-[11px] font-medium text-ink/50">{centerSub}</span>}
      </div>
    </div>
  );
}

export function MacroBar({
  label,
  value,
  max,
  unit = "g",
  color = "#059669",
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max * 1.05;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink/80">{label}</span>
        <span className="tabular-nums text-ink/55">
          <span className={cls("font-semibold", over ? "text-red-500" : "text-ink")}>{Math.round(value)}</span>
          <span className="text-ink/40"> / {Math.round(max)}{unit}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${ratio * 100}%`, background: over ? "#ef4444" : color }}
        />
      </div>
    </div>
  );
}
