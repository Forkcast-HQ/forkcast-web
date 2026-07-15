"use client";

// Daily log with evidence (handoff screen 8).
// Every entry shows its full provenance: source, restaurant, timestamp,
// order reference, data confidence, diner confidence, portion, and notes.
// The log is exportable as JSON — an evidence artifact, not just a UI.

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Camera, Download, PencilLine, ReceiptText, ShoppingBag, Trash2, Utensils } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import type { LoggedMeal } from "@/lib/types";
import { cls, todayKey } from "@/lib/format";

const SOURCE_META: Record<LoggedMeal["source"], { label: string; icon: React.ReactNode }> = {
  order: { label: "Confirmed order", icon: <ShoppingBag className="h-4 w-4" /> },
  photo: { label: "Photo-logged", icon: <Camera className="h-4 w-4" /> },
  manual: { label: "Manual entry", icon: <PencilLine className="h-4 w-4" /> },
  planned: { label: "Planned dish", icon: <Utensils className="h-4 w-4" /> },
};

export default function LogPage() {
  const router = useRouter();
  const { user, hydrated: authHydrated } = useAuth();
  const { meals, targets, hydrated, removeMeal } = useUser();

  useEffect(() => {
    if (authHydrated && !user) router.replace("/login");
  }, [authHydrated, user, router]);

  const days = useMemo(() => {
    const byDay = new Map<string, LoggedMeal[]>();
    for (const m of meals) {
      const k = todayKey(new Date(m.loggedAt));
      byDay.set(k, [...(byDay.get(k) ?? []), m]);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) => b.loggedAt - a.loggedAt),
        total: entries.reduce((s, m) => s + m.calories, 0),
      }));
  }, [meals]);

  const exportLog = () => {
    const payload = {
      exported: new Date().toISOString(),
      disclaimer:
        "Forkcast meal log export. Nutrition values are estimates or partner-reviewed data, not measurements. Order references refer to demo (prototype) orders unless otherwise stated.",
      entries: meals.map((m) => ({
        loggedAt: new Date(m.loggedAt).toISOString(),
        name: m.name,
        restaurant: m.restaurantName ?? null,
        source: m.source,
        orderRef: m.orderRef ?? null,
        dataConfidence: m.confidence ?? null,
        dinerConfidence: m.userConfidence ?? null,
        portion: m.portion ?? null,
        note: m.note ?? null,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        fiber: m.fiber,
        sodium: m.sodium,
        sugar: m.sugar,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forkcast-log-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authHydrated || !hydrated) {
    return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;
  }
  if (!user) return null;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Meal log</h1>
          <p className="mt-1 text-sm text-ink/55">
            Every entry keeps its evidence: source, restaurant, timestamp, order reference, and confidence.
          </p>
        </div>
        {meals.length > 0 && (
          <button
            onClick={exportLog}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink"
          >
            <Download className="h-4 w-4" /> Export (JSON)
          </button>
        )}
      </div>

      {days.length === 0 ? (
        <div className="mt-14 text-center">
          <ReceiptText className="mx-auto h-10 w-10 text-ink/20" />
          <p className="mt-4 text-ink/55">Nothing logged yet. Order a meal or log a dish to start the record.</p>
          <Link href="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Discover restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {days.map(({ date, entries, total }) => (
            <section key={date}>
              <div className="flex items-baseline justify-between border-b-2 border-ink/40 pb-2">
                <h2 className="font-display text-lg font-extrabold text-ink">
                  {date === todayKey() ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h2>
                <p className="text-sm tabular-nums text-ink/60">
                  <strong className={cls("text-ink", targets && total > targets.calories && "text-amber-700")}>{total.toLocaleString()}</strong>
                  {targets ? ` / ${targets.calories.toLocaleString()} cal` : " cal"}
                </p>
              </div>

              <ul className="mt-3 space-y-3">
                {entries.map((m) => {
                  const src = SOURCE_META[m.source] ?? SOURCE_META.manual;
                  return (
                    <li key={m.id} className="rounded-2xl border border-black/5 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <span className={cls("grid h-9 w-9 shrink-0 place-items-center rounded-lg", m.source === "order" ? "bg-brand-50 text-brand-700" : "bg-black/5 text-ink/50")}>
                          {src.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="font-semibold text-ink">{m.name}</p>
                            <span className="text-xs text-ink/45">
                              {new Date(m.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-ink/55">
                            {m.calories} cal · {m.protein}g P · {m.carbs}g C · {m.fat}g F
                            {m.restaurantName ? <> · {m.restaurantSlug ? <Link href={`/restaurant/${m.restaurantSlug}`} className="underline hover:text-ink">{m.restaurantName}</Link> : m.restaurantName}</> : null}
                          </p>
                          {/* Evidence chips */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <EvidenceChip>{src.label}</EvidenceChip>
                            {m.orderRef && (
                              <Link href="/orders">
                                <EvidenceChip tone="accent">
                                  <ReceiptText className="h-3 w-3" /> Order {m.orderRef}
                                </EvidenceChip>
                              </Link>
                            )}
                            {m.confidence && (
                              <EvidenceChip tone={m.confidence === "partner-verified" ? "accent" : "neutral"}>
                                {m.confidence === "partner-verified" ? (<><BadgeCheck className="h-3 w-3" /> Verified data</>) : "Estimated data"}
                              </EvidenceChip>
                            )}
                            {m.portion !== undefined && m.portion !== 1 && <EvidenceChip>{m.portion}× portion</EvidenceChip>}
                            {m.userConfidence && m.userConfidence !== "as-served" && (
                              <EvidenceChip tone="warn">{m.userConfidence === "modified" ? "Modified by diner" : "Diner unsure"}</EvidenceChip>
                            )}
                          </div>
                          {m.note && <p className="mt-1.5 text-xs italic text-ink/50">“{m.note}”</p>}
                        </div>
                        <button
                          onClick={() => removeMeal(m.id)}
                          className="rounded-lg p-1.5 text-ink/30 transition hover:bg-brand-50 hover:text-brand-700"
                          aria-label={`Remove ${m.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Shell>
  );
}

function EvidenceChip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "warn" }) {
  return (
    <span
      className={cls(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone === "accent" && "border-brand-600 bg-brand-50 text-brand-700",
        tone === "warn" && "border-amber-300 bg-amber-50 text-amber-700",
        tone === "neutral" && "border-neutral-300 bg-white text-ink/55",
      )}
    >
      {children}
    </span>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
