import { cls } from "@/lib/format";

/**
 * Palatify combination mark: an open ring with a short accent stroke,
 * paired with the lowercase "palatify" wordmark. `variant="dark"` renders
 * the mark in a solid dark pill for use on dark backgrounds.
 */
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const ringStroke = isDark ? "#F7F4EC" : "#171310";
  const textClass = isDark ? "text-white" : "text-ink";

  return (
    <span
      className={cls(
        "inline-flex items-center gap-2",
        isDark && "rounded-full bg-ink px-3.5 py-1.5",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
        <circle
          cx="16"
          cy="17"
          r="10"
          stroke={ringStroke}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeDasharray="52 15"
          transform="rotate(-35 16 17)"
        />
        <path
          d="M18 5.5c3 .6 5.2 2.8 6 5.6"
          stroke="#D9552E"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className={cls("font-display text-xl font-semibold tracking-tight lowercase", textClass)}>
        palatify
      </span>
    </span>
  );
}
