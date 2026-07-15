"use client";

// Checkout — fulfillment choice + prototype-safe integration state.
// HONESTY: no live restaurant ordering API or payment processing exists.
// This screen never pretends otherwise: totals are real math, the "Place
// order" action is clearly labeled a demo, and partner handoff is shown as
// an integration-required state.

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Bike, Handshake, Info, ShieldAlert } from "lucide-react";
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

          {/* Integration state — never fake a live connection */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-start gap-2.5 text-sm text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Prototype checkout — restaurant ordering integration required.</strong>{" "}
                {fulfill === "partner"
                  ? `This flow would hand you off to ${rest.name}'s own ordering system once a partner integration is in place. No handoff link is live yet.`
                  : "No live payment is processed and no order is transmitted to the restaurant. This demonstrates the intended flow: totals, tax, and the post-order meal-log workflow are fully functional."}
              </span>
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
                <div key={it.itemId} className="flex justify-between gap-3 text-ink/70">
                  <span className="min-w-0 truncate">{it.qty}× {it.name}</span>
                  <span className="shrink-0 tabular-nums">{money(it.price * it.qty)}</span>
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
            <button
              onClick={submit}
              className="mt-5 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Place order (demo)
            </button>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink/60">
      <span>{label}</span><span className="tabular-nums font-medium text-ink">{value}</span>
    </div>
  );
}
