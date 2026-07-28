"use client";

// Checkout — fulfillment choice + prototype-safe integration state.
// HONESTY: no live restaurant ordering API or payment processing exists.
// This screen never pretends otherwise: totals are real math, the "Place
// order" action is clearly labeled a demo, and every missing integration is shown as
// an integration-required state.

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Bike, Info, ShieldAlert, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useOrder, DELIVERY_FEE, MA_MEALS_TAX } from "@/lib/order";
import { useCatalog } from "@/lib/catalogContext";
import { money, cls } from "@/lib/format";
import type { Fulfillment } from "@/lib/types";

// Pickup or delivery only — paying at the counter after ordering in-app was
// a confusing third path (pilot feedback), so it's gone.
const OPTIONS: { key: Fulfillment; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "pickup", label: "Pickup", desc: "Free · pay in app, collect at the restaurant", icon: <Store className="h-5 w-5" /> },
  { key: "delivery", label: "Delivery", desc: `${money(DELIVERY_FEE)} fee · via delivery partner ($5–7/order, validated with restaurant owners)`, icon: <Bike className="h-5 w-5" /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, hydrated: authHydrated } = useAuth();
  const { hydrated, cartItems, cartTotals, cartRestaurantSlug, placeOrder } = useOrder();
  const { getRestaurant, loading: catalogLoading } = useCatalog();
  const [fulfill, setFulfill] = useState<Fulfillment>("pickup");
  const [payMethod, setPayMethod] = useState<"Palatify Pay" | "Card">("Palatify Pay");
  const [placed, setPlaced] = useState(false);

  if (!hydrated || !authHydrated || catalogLoading) return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;

  const items = cartItems();
  const rest = cartRestaurantSlug ? getRestaurant(cartRestaurantSlug) : null;
  if (!items.length || !rest) {
    // placeOrder clears the basket — don't let the empty-basket state race
    // the navigation to the tracking page.
    if (placed) {
      return <Shell><p className="py-20 text-center text-ink/40">Order placed — opening tracking…</p></Shell>;
    }
    return (
      <Shell>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Nothing to check out</h1>
          <p className="mt-2 text-ink/55">Your basket is empty.</p>
          <Link href="/discover" className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Discover restaurants
          </Link>
        </div>
      </Shell>
    );
  }

  // Placing an order requires an account: the order confirms into a daily
  // log, carries the customer's allergy flags to the kitchen, and keeps an
  // evidence trail — none of which exists for an anonymous visitor. The
  // basket survives signup (guest baskets are adopted on sign-in).
  if (!user) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-16 text-center">
          <h1 className="font-display text-2xl font-extrabold text-ink">Almost there — sign in to place your order</h1>
          <p className="mt-3 text-sm text-ink/60">
            Your basket is saved. An account lets your order carry your allergy flags to the
            restaurant and log the meal to your day once it&apos;s confirmed.
          </p>
          <div className="mt-7 space-y-3">
            <Link href="/signup" className="flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700">
              Create a free account
            </Link>
            <Link href="/login" className="flex w-full items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-base font-semibold text-ink/70 transition hover:border-black/25">
              Log in
            </Link>
            <Link href="/basket" className="block text-sm font-medium text-ink/50 hover:text-ink">
              Back to basket
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const t = cartTotals();
  const deliveryFee = fulfill === "delivery" ? DELIVERY_FEE : 0;
  const tax = t.subtotal * MA_MEALS_TAX;
  const total = t.subtotal + deliveryFee + tax;

  const submit = () => {
    const order = placeOrder(fulfill);
    if (order) {
      setPlaced(true);
      router.push("/order");
    }
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
              {(["Palatify Pay", "Card"] as const).map((m) => (
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
                    {m === "Palatify Pay" ? "Planned wallet — mock" : "No card entry — payment processing not connected"}
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
