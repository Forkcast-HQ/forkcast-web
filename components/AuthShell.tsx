import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { Logo } from "./Logo";

export interface AuthPanelContent {
  kicker: string;
  headline: string;
  bullets: string[];
  factBold: string;
  fact: string;
  factCite: string;
}

const DINER_PANEL: AuthPanelContent = {
  kicker: "Know before you go",
  headline: "Eat out without losing the plot on your goals.",
  bullets: [
    "Personal targets from real clinical formulas",
    "Fit Scores on every nearby dish",
    "One-tap logging + AI photo tracking",
  ],
  factBold: "58.5%",
  fact: "of U.S. food spending is now eaten away from home — the moment your goals are won or lost.",
  factCite: "USDA ERS, 2023",
};

export function AuthShell({
  title,
  subtitle,
  panel,
  children,
}: {
  title: string;
  subtitle: string;
  panel?: AuthPanelContent;
  children: React.ReactNode;
}) {
  const p = panel ?? DINER_PANEL;
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-stretch gap-0 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
      {/* Marketing side — bold ink panel with accent geometry */}
      <div className="relative hidden overflow-hidden rounded-3xl bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Accent shapes (flat, Modernist — no gradients) */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600 opacity-90" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border-[14px] border-brand-600/40" aria-hidden="true" />
        <div className="relative">
          <Logo textClass="text-white" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-brand-300">
            <Sparkles className="h-4 w-4" /> {p.kicker}
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-balance">
            {p.headline}
          </h2>
          <ul className="mt-7 space-y-3 text-white/85">
            {p.bullets.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-4">
          <p className="text-sm text-white/80">
            <span className="font-display text-lg font-extrabold text-brand-400">{p.factBold}</span>{" "}
            {p.fact}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">{p.factCite}</p>
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
