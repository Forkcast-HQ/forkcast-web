import { cls } from "@/lib/format";

export function Avatar({
  name,
  email,
  size = 36,
  className,
}: {
  name?: string;
  email?: string;
  size?: number;
  className?: string;
}) {
  const base = name?.trim()
    ? name.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("")
    : email?.[0] ?? "?";
  return (
    <span
      className={cls(
        "inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white shadow-sm",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {base.toUpperCase()}
    </span>
  );
}
