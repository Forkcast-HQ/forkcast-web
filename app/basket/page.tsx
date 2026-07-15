"use client";

// Basket — items, quantity edits, and nutrition impact BEFORE checkout.
// Shows how this order lands against today's remaining budget.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, BadgeCheck, AlertTriangle } from "lucide-react";
import { useUser } from "@/lib/store";
import { useOrder } from "@/lib/order";
import { getRestaurant } from "@/data/restaurants";
import { money, cls, pct } from "@/lib/format";

export default function BasketPage() {
  const router = useRouter();
  const { targets, consumedToday, hydrated: userHydrated } = useUser();
  const { hydrated, cartItems, cartTotals, changeQty, clearCart, cartRestaurantSlug } = useOrder();

  if (!hydrated || !userHydrated) return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;

  const items = cartItems();
  const t = cartTotals();
  const rest = cartRestaurantSlug ? getRestaurant(cartRestaurantSlug) : null;

  if (!items.length || !rest) {
    return (
      <Shell>
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-ink/20" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Your basket is empty</h1>
          <p className="mt-2 text-ink/55">Find a dish that fits your day and add it to an order.</p>
          <Link href="/discover" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Discover restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  const consumed = consumedToday();
  const dayCal = targets ? targets.calories : null;
  const afterCal = consumed.calories + t.calories;
  const over = dayCal !== null && afterCal > dayCal;
  const proteinBehind =
    targets && pct(consumed.protein + t.protein, targets.protein) < pct(afterCal, targets.calories) - 15;

  return (
    <Shell>
      <Link href={`/restaurant/${rest.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to {rest.name}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Your basket</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
            {rest.name}
            {rest.partner ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                <BadgeCheck className="h-3 w-3" /> Partner-verified nutrition
              </span>
            ) : (
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-ink/60">Estimated nutrition</span>
            )}
          </p>
        </div>
        <button onClick={clearCart} className="text-sm font-medium text-ink/40 hover:text-red-500">Clear</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.itemId} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{it.name}</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {it.calories} cal · {it.protein}g P · {it.carbs}g C · {it.fat}g F
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QtyBtn onClick={() => changeQty(it.itemId, -1)}><Minus className="h-4 w-4" /></QtyBtn>
                <span className="w-6 text-center font-bold tabular-nums text-ink">{it.qty}</span>
                <QtyBtn onClick={() => changeQty(it.itemId, 1)}><Plus className="h-4 w-4" /></QtyBtn>
              </div>
              <span className="w-16 text-right font-semibold text-ink">{money(it.price * it.qty)}</span>
            </div>
          ))}

          <p className="px-1 pt-2 text-xs text-ink/40">
            One restaurant per order. Nutrition values are {rest.partner ? "partner-verified" : "estimates"} — allergen and
            preparation details should always be confirmed with the restaurant.
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Day impact */}
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-ink">Day impact</h2>
            {targets ? (
              <>
                <ImpactBar label="Calories" unit="cal" logged={consumed.calories} adding={t.calories} target={targets.calories} />
                <ImpactBar label="Protein" unit="g" logged={consumed.protein} adding={t.protein} target={targets.protein} />
                <ImpactBar label="Carbs" unit="g" logged={consumed.carbs} adding={t.carbs} target={targets.carbs} />
                <ImpactBar label="Fat" unit="g" logged={consumed.fat} adding={t.fat} target={targets.fat} />
              </>
            ) : (
              <p className="mt-3 text-sm text-ink/50">
                <Link href="/onboarding" className="text-brand-700 underline">Set up your profile</Link> to see how this order fits your day.
              </p>
            )}
          </div>

          {/* Balance check */}
          {targets && (
            <div className={cls("rounded-2xl border p-4 text-sm", over ? "border-amber-200 bg-amber-50 text-amber-800" : "border-brand-200 bg-brand-50 text-brand-800")}>
              <p className="flex items-start gap-2 font-medium">
                {over && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                {over
                  ? `This order puts you ${afterCal - targets.calories} cal over today's budget. Consider a smaller portion or swapping a side.`
                  : proteinBehind
                    ? "Calories fit, but protein is falling behind pace for today — a higher-protein dish would balance the day."
                    : "On track — this order fits your remaining budget for today."}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex justify-between text-sm text-ink/60"><span>Subtotal</span><span className="font-semibold text-ink">{money(t.subtotal)}</span></div>
            <div className="mt-1 flex justify-between text-sm text-ink/60"><span>Order calories</span><span className="font-semibold text-ink">{Math.round(t.calories)} cal</span></div>
            <button
              onClick={() => router.push("/checkout")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}

function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-ink/70 transition hover:bg-black/10">
      {children}
    </button>
  );
}

function ImpactBar({ label, unit, logged, adding, target }: { label: string; unit: string; logged: number; adding: number; target: number }) {
  const loggedPct = Math.min(100, pct(logged, target));
  const addPct = Math.min(100 - loggedPct, pct(adding, target));
  const total = logged + adding;
  const over = total > target;
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-ink">{label}</span>
        <span className={cls("tabular-nums", over ? "font-bold text-amber-600" : "text-ink/50")}>
          {Math.round(total)} / {target} {unit}
        </span>
      </div>
      <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-black/5">
        <div className="h-full rounded-l-full bg-ink/70" style={{ width: `${loggedPct}%` }} />
        <div className={cls("h-full", over ? "bg-amber-500" : "bg-brand-500")} style={{ width: `${addPct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-ink/40">already logged + this order</p>
    </div>
  );
}
