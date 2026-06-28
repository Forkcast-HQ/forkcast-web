import { cls } from "@/lib/format";
import { fitColor } from "@/lib/nutrition";

export function FitBadge({
  score,
  grade,
  size = "md",
}: {
  score: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
}) {
  const color = fitColor(score);
  const dims =
    size === "lg"
      ? "h-14 w-14 text-xl"
      : size === "sm"
        ? "h-9 w-9 text-xs"
        : "h-11 w-11 text-sm";
  return (
    <div className="flex flex-col items-center">
      <div
        className={cls(
          "grid place-items-center rounded-full font-display font-bold text-white shadow-sm",
          dims,
        )}
        style={{ background: color }}
        title={`Fit Score ${score}/100`}
      >
        {score}
      </div>
      {grade && size !== "sm" && (
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink/45">
          Fit {grade}
        </span>
      )}
    </div>
  );
}

export function FitPill({ score }: { score: number }) {
  const color = fitColor(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm"
      style={{ background: color }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {score} fit
    </span>
  );
}
