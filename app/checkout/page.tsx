"use client";

// Checkout — fulfillment choice + prototype-safe integration state.
// HONESTY: no live restaurant ordering API or payment processing exists.
// This screen never pretends otherwise: totals are real math, the "Place
// order" action is clearly labeled a demo, and partner handoff is shown as
// an integration-required state.

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Bike, Handshake, Info, ShieldAlert, CreditCard, ExternalLink } from "lucide-react";
import { useOrder, DELIVERY_FEE, MA_MEALS_TAX } from "@/lib/order";
import { getRestaurant } from "@/data/restaurants";
import { money, cls } from "@/lib/format";
import type { Fulfillment } from "@/lib/types";

const OPTIONS: { key: Fulfillment; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "pickup", label: "Pickup", desc: "Free · collect at the restaurant", icon: <Store className="h-5 w-5" /> },
  { key: "delivery", label: "Delivery", desc: `${money(DELIVERY_FEE)} fee · via delivery partner`, icon: <Bike className="h-5 w-5" /> },
  { key: "partner", label: "Order through restaurant", desc: "Handoff to the restaurant's own checkout", icon: <Handshake className="h-5 w-5" /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { hydrated, cartItems, cartTotals, cartRestaurantSlug, placeOrder } = useOrder();
  const [fulfill, setFulfill] = useState<Fulfillment>("pickup");
  const [payMethod, setPayMethod] = useState<"Forkcast Pay" | "Card">("Forkcast Pay");

  if (!hydrated) return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;

  const items = cartItems();
  const rest = cartRestaurantSlug ? getRestaurant(cartRestaurantSlug) : null;
  if (!items.length || !rest) {
    router.replace("/basket");
    return <Shell><p className="py-20 text-center text-ink/40">Redirecting…</p></Shell>;
  }

  const t = cartTotals();
  const deliveryFee = fulfill === "delivery" ? DELIVERY_FEE : 0;
  const tax = t.subtotal * MA_MEALS_TAX;
  const total = t.subtotal + deliveryFee + tax;

  const submit = () => {
    const order = placeOrder(fulfill);
    if (order) router.push("/order");
  };

  return (
    <Shell>
      <Link href="/basket" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to basket
      </Link>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">Checkout</h1>
      <p className="mt-1 text-sm text-ink/60">{rest.name} · {t.count} {t.count === 1 ? "item" : "items"} · {Math.round(t.calories)} cal</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-ink">How do you want it?</h2>
            <div className="mt-4 space-y-2.5">
              {OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setFulfill(o.key)}
                  className={cls(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition",
                    fulfill === o.key ? "border-ink bg-black/[0.03]" : "border-black/10 hover:border-black/25",
                  )}
                >
                  <span className={cls("grid h-10 w-10 shrink-0 place-items-center rounded-full", fulfill === o.key ? "bg-brand-600 text-white" : "bg-black/5 text-ink/60")}>
                    {o.icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{o.label}</span>
                    <span className="block text-xs text-ink/50">{o.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment method — demo only, no real entry fields ever */}
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Payment</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Demo — nothing is charged</span>
            </div>
            <div className="mt-4 flex gap-2.5">
              {(["Forkcast Pay", "Card"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={cls(
                    "flex-1 rounded-xl border-2 p-3 text-left transition",
                    payMethod === m ? "border-ink bg-black/[0.03]" : "border-black/10 hover:border-black/25",
                  )}
                >
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <CreditCard className="h-4 w-4 text-ink/50" /> {m}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink/50">
                    {m === "Forkcast Pay" ? "Planned wallet — mock" : "No card entry — payment processing not connected"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Integration state board — prototype vs live, per channel. Never fake a connection. */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <p className="flex items-center gap-2 font-display text-sm font-extrabold text-amber-900">
              <ShieldAlert className="h-4 w-4" /> Integration state — prototype
            </p>
            <div className="mt-3 space-y-2">
              <IntegrationRow
                label="Restaurant order transmission"
                state="Not connected"
                detail={`Orders are not sent to ${rest.name}. A partner terminal (in development) will receive them live.`}
              />
              <IntegrationRow
                label="Payment processing"
                state="Not connected"
                detail="Demo totals only — real math (tax, fees), no charge, no card data collected."
              />
              <IntegrationRow
                label="Delivery partner API"
                state="Not connected"
                detail="No courier is dispatched and no delivery ETA is real."
                hidden={fulfill !== "delivery"}
              />
              <IntegrationRow
                label={`Handoff to ${rest.name}'s checkout`}
                state="Link not live"
                detail="Once a partner agreement exists, this option opens the restaurant's own ordering flow with your basket attached."
                hidden={fulfill !== "partner"}
              />
              <IntegrationRow
                label="Kitchen status updates"
                state="Simulated"
                detail="The tracking timeline after you place this demo order advances on a timer, clearly labeled."
              />
            </div>
            <p className="mt-3 border-t border-amber-200 pt-3 text-xs text-amber-800">
              Everything else on this page is live product: nutrition math, day-impact preview, order records, and the
              confirmed meal-log workflow.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-4">
            <p className="flex items-start gap-2.5 text-xs text-ink/50">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Nutrition data for this order is {rest.partner ? "partner-verified" : "estimated from the menu"}. Allergen and
              preparation questions should be confirmed directly with the restaurant.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-ink">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              {items.map((it) => (
                <div key={it.itemId}>
                  <div className="flex justify-between gap-3 text-ink/70">
                    <span className="min-w-0 truncate">{it.qty}× {it.name}</span>
                    <span className="shrink-0 tabular-nums">{money(it.price * it.qty)}</span>
                  </div>
                  {it.note && <p className="text-xs italic text-ink/45">“{it.note}”</p>}
                </div>
              ))}
              <div className="border-t border-black/5 pt-2" />
              <Row label="Subtotal" value={money(t.subtotal)} />
              <Row label={fulfill === "delivery" ? "Delivery fee" : "Fulfillment"} value={deliveryFee ? money(deliveryFee) : "Free"} />
              <Row label="MA meals tax (7%)" value={money(tax)} />
              <div className="flex justify-between border-t border-black/5 pt-2 text-base font-bold text-ink">
                <span>Total</span><span className="tabular-nums">{money(total)}</span>
              </div>
            </div>
            {fulfill === "partner" ? (
              <>
                <button
                  disabled
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-300 px-5 py-3 font-semibold text-ink/45"
                  title="No partner handoff link is live yet"
                >
                  <ExternalLink className="h-4 w-4" /> Open {rest.name}&apos;s checkout
                </button>
                <p className="mt-1.5 text-center text-[11px] font-semibold text-amber-700">Integration required — link not live</p>
                <button
                  onClick={submit}
                  className="mt-3 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
                >
                  Simulate handoff (demo order)
                </button>
              </>
            ) : (
              <button
                onClick={submit}
                className="mt-5 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                Place order (demo)
              </button>
            )}
            <p className="mt-2 text-center text-[11px] text-ink/40">No payment is charged. Demo order for flow validation.</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}

function IntegrationRow({
  label,
  state,
  detail,
  hidden = false,
}: {
  label: string;
  state: string;
  detail: string;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-white/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="shrink-0 rounded-full border border-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          {state}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/55">{detail}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink/60">
      <span>{label}</span><span className="tabular-nums font-medium text-ink">{value}</span>
    </div>
  );
}
