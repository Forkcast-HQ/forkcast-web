import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-stretch gap-0 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
      {/* Marketing side */}
      <div className="relative hidden overflow-hidden rounded-3xl bg-brand-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 mesh opacity-80" />
        <div className="relative">
          <Logo textClass="text-white" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-brand-200">
            <Sparkles className="h-4 w-4" /> Know before you go
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-balance">
            Eat out without losing the plot on your goals.
          </h2>
          <ul className="mt-7 space-y-3 text-white/80">
            {[
              "Personal targets from real clinical formulas",
              "Fit Scores on every nearby dish",
              "One-tap logging + AI photo tracking",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/30 text-brand-200">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-white/70">
            <span className="font-bold text-white">58.5%</span> of U.S. food spending is now eaten away from home — the moment your goals are won or lost.
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">USDA ERS, 2023</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center py-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink lg:mt-0">{title}</h1>
          <p className="mt-2 text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/40">{hint}</span>}
    </label>
  );
}

export { Link };
