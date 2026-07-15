"use client";

// Order tracking + post-order "Log this meal?" confirmation.
// - Status timeline is SIMULATED (labeled) — no restaurant is connected yet.
// - Once the order is accepted, the user confirms what they actually ate:
//   per-item portion (0.25x steps) + substitution note. Only then does the
//   meal reach the daily log, carrying full provenance: source "order",
//   restaurant, timestamp, order ref, and nutrition-confidence metadata.

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, ChefHat, ClipboardCheck, Minus, Package, Plus, Send, ShieldAlert } from "lucide-react";
import { useUser } from "@/lib/store";
import { useOrder, orderStatus, STATUS_STEP } from "@/lib/order";
import { cls } from "@/lib/format";
import type { Order } from "@/lib/types";

const STEPS = [
  { key: "sent", label: "Order sent", icon: <Send className="h-4 w-4" /> },
  { key: "accepted", label: "Accepted", icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: "preparing", label: "Preparing", icon: <ChefHat className="h-4 w-4" /> },
  { key: "ready", label: "Ready / handed off", icon: <Package className="h-4 w-4" /> },
];

export default function OrderPage() {
  const { hydrated, orders, activeOrder, now } = useOrder();

  if (!hydrated) return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;

  const order = activeOrder() ?? (orders.length ? orders[orders.length - 1] : null);
  if (!order) {
    return (
      <Shell>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">No orders yet</h1>
          <p className="mt-2 text-ink/55">Build a basket from a restaurant menu to see the full order-to-log flow.</p>
          <Link href="/discover" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Discover restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  return <OrderView key={order.id} order={order} now={now} />;
}

function OrderView({ order, now }: { order: Order; now: number }) {
  const status = orderStatus(order, now);
  const step = STATUS_STEP[status];
  const placed = new Date(order.placedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <Shell>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-extrabold text-ink">Order {order.ref}</h1>
        <span className="text-sm text-ink/50">{order.restaurantName} · placed {placed} · {order.fulfill}</span>
      </div>

      {/* Simulation disclosure */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
        <p className="flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span><strong>Simulated kitchen.</strong> No restaurant is connected to this order — the status timeline below advances automatically to demonstrate the intended integration. Live status requires a restaurant partner terminal.</span>
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Timeline */}
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-ink">Status</h2>
          <ol className="mt-5 space-y-0">
            {STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span className={cls("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", done ? "bg-brand-500" : "bg-black/10")} />
                  )}
                  <span
                    className={cls(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
                      done && "border-brand-500 bg-brand-500 text-white",
                      current && "animate-pulse border-brand-500 bg-brand-50 text-brand-700",
                      !done && !current && "border-black/10 bg-white text-ink/30",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.icon}
                  </span>
                  <div className="pt-1">
                    <p className={cls("text-sm font-semibold", done || current ? "text-ink" : "text-ink/40")}>{s.label}</p>
                    {current && <p className="text-xs text-ink/50">{status === "ready" ? (order.fulfill === "delivery" ? "Would hand off to the delivery partner here." : "Ready for pickup.") : "In progress (simulated)…"}</p>}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 border-t border-black/5 pt-4 text-sm text-ink/60">
            {order.items.map((it) => (
              <div key={it.itemId} className="py-1">
                <div className="flex justify-between">
                  <span>{it.qty}× {it.name}</span>
                  <span className="tabular-nums">{it.calories * it.qty} cal</span>
                </div>
                {it.note && <p className="text-xs italic text-ink/45">“{it.note}”</p>}
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-black/5 pt-2 font-semibold text-ink">
              <span>Total paid (demo)</span><span className="tabular-nums">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Log this meal? */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {step >= 1 ? <LogCard order={order} /> : (
            <div className="rounded-2xl border border-black/5 bg-white p-5 text-sm text-ink/55">
              <ClipboardCheck className="h-5 w-5 text-ink/30" />
              <p className="mt-2">Once the restaurant accepts, you&apos;ll confirm the meal here and it will be added to your day — with the order reference attached as evidence.</p>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function LogCard({ order }: { order: Order }) {
  const router = useRouter();
  const { logMeal } = useUser();
  const { markLogged } = useOrder();
  const [portions, setPortions] = useState<Record<string, number>>(
    () => Object.fromEntries(order.items.map((it) => [it.itemId, 1])),
  );
  const [note, setNote] = useState("");

  const bump = (id: string, d: number) =>
    setPortions((p) => ({ ...p, [id]: Math.max(0, Math.min(2, Math.round(((p[id] ?? 1) + d) * 4) / 4)) }));

  const totals = useMemo(() => {
    return order.items.reduce(
      (acc, it) => {
        const f = (portions[it.itemId] ?? 1) * it.qty;
        return { cal: acc.cal + it.calories * f, p: acc.p + it.protein * f };
      },
      { cal: 0, p: 0 },
    );
  }, [order.items, portions]);

  const confirm = () => {
    const confidence = order.partner ? "partner-verified" : "estimated";
    order.items.forEach((it) => {
      const f = portions[it.itemId] ?? 1;
      if (f <= 0) return;
      const mult = f * it.qty;
      logMeal({
        restaurantSlug: order.slug,
        restaurantName: order.restaurantName,
        itemId: it.itemId,
        name: it.qty > 1 ? `${it.qty}× ${it.name}` : it.name,
        calories: Math.round(it.calories * mult),
        protein: Math.round(it.protein * mult),
        carbs: Math.round(it.carbs * mult),
        fat: Math.round(it.fat * mult),
        fiber: Math.round(it.fiber * mult),
        sodium: Math.round(it.sodium * mult),
        sugar: Math.round(it.sugar * mult),
        source: "order",
        orderRef: order.ref,
        portion: f,
        confidence,
        note: [it.note && `Sub: ${it.note}`, note.trim()].filter(Boolean).join(" · ") || undefined,
      });
    });
    markLogged(order.id);
    router.push("/dashboard");
  };

  if (order.logged) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Logged to your day</p>
        <p className="mt-1.5">This meal is on your dashboard with order {order.ref} attached as provenance.</p>
        <Link href="/dashboard" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-800 underline">
          View dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-brand-500 bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <ClipboardCheck className="h-5 w-5 text-brand-600" /> Log this meal?
      </h2>
      <p className="mt-1 text-xs text-ink/55">
        Confirm what you actually ate. Nutrition here is {order.partner ? "partner-verified" : "an estimate"} — adjust portions if you shared or saved some.
      </p>

      <div className="mt-4 space-y-3">
        {order.items.map((it) => {
          const f = portions[it.itemId] ?? 1;
          return (
            <div key={it.itemId} className="rounded-xl border border-black/5 bg-black/[0.02] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-ink">{it.qty > 1 ? `${it.qty}× ` : ""}{it.name}</p>
                <span className="shrink-0 text-xs tabular-nums text-ink/50">{Math.round(it.calories * it.qty * f)} cal</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-ink/50">Portion eaten</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button onClick={() => bump(it.itemId, -0.25)} className="grid h-7 w-7 place-items-center rounded-full bg-black/5 text-ink/70 hover:bg-black/10"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-12 text-center text-sm font-bold tabular-nums text-ink">{f === 0 ? "none" : `${f}×`}</span>
                  <button onClick={() => bump(it.itemId, 0.25)} className="grid h-7 w-7 place-items-center rounded-full bg-black/5 text-ink/70 hover:bg-black/10"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Substitutions or changes (optional)"
        className="mt-3 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-brand-500 focus:outline-none"
      />

      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span className="text-ink/55">Will log</span>
        <span className="font-bold tabular-nums text-ink">{Math.round(totals.cal)} cal · {Math.round(totals.p)}g protein</span>
      </div>

      <button onClick={confirm} className="mt-3 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">
        Log to my day
      </button>
      <button onClick={() => markLogged(order.id, true)} className="mt-2 w-full rounded-full px-5 py-2 text-sm font-medium text-ink/45 hover:text-ink/70">
        Don&apos;t log this meal
      </button>
      <p className="mt-2 text-center text-[10px] text-ink/40">
        Saved with source, restaurant, timestamp, order {order.ref}, and confidence level.
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
