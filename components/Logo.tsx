import { cls } from "@/lib/format";

export function Logo({
  className,
  withText = true,
  textClass,
}: {
  className?: string;
  withText?: boolean;
  textClass?: string;
}) {
  return (
    <span className={cls("inline-flex items-center gap-2", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {/* fork */}
          <path d="M6 3v6a2 2 0 0 0 4 0V3" />
          <path d="M8 11v10" />
          {/* leaf */}
          <path d="M18 3c-3 0-5 2.5-5 6 0 2 1.2 3.6 3 4 0-3.5 1-5.5 3-7-1.2 2.6-1.6 4.4-1.6 7.2V21" />
        </svg>
      </span>
      {withText && (
        <span className={cls("font-display text-xl font-bold tracking-tight text-ink", textClass)}>
          Fork<span className="text-brand-600">cast</span>
        </span>
      )}
    </span>
  );
}
