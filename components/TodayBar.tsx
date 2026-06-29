"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";

const HIDE_ON = ["/dashboard", "/onboarding", "/login", "/signup", "/profile"];

export function TodayBar() {
  const pathname = usePathname();
  const { user, hydrated: authHydrated } = useAuth();
  const { profile, targets, hydrated, consumedToday, todaysMeals } = useUser();

  if (!authHydrated || !hydrated || !user || !profile || !targets) return null;
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const consumed = consumedToday();
  const meals = todaysMeals().length;
  const remaining = Math.max(0, targets.calories - consumed.calories);
  const ratio = Math.min(1, consumed.calories / targets.calories);
  const over = consumed.calories > targets.calories;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-2.5 pl-4 shadow-[0_8px_30px_-8px_rgba(32,22,15,0.25)] backdrop-blur">
        <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 sm:grid">
          <Flame className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-ink">
              Today{meals > 0 ? ` · ${meals} ${meals === 1 ? "meal" : "meals"}` : ""}
            </span>
            <span className="tabular-nums text-ink/55">
              <span className={over ? "font-bold text-red-500" : "font-bold text-ink"}>{consumed.calories}</span>
              <span className="text-ink/40"> / {targets.calories} kcal · </span>
              <span className="font-semibold text-brand-700">{remaining} left</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${ratio * 100}%`, background: over ? "#ef4444" : "var(--color-brand-500)" }} />
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <span className="hidden sm:inline">View </span>plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
