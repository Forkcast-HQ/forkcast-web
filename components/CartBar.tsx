"use client";

// Sticky basket bar + post-order "Log this meal?" nudge.
// Shown on discovery/restaurant pages when the basket has items or an
// order is awaiting log confirmation.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useOrder, orderStatus } from "@/lib/order";
import { useCatalog } from "@/lib/catalogContext";

const SHOW_ON = ["/discover", "/restaurant"];

export function CartBar() {
  const pathname = usePathname();
  const { user, hydrated: authHydrated } = useAuth();
  const { hydrated, cartCount, cartTotals, cartRestaurantSlug, activeOrder, now } = useOrder();
  const { getRestaurant } = useCatalog();

  if (!authHydrated || !hydrated || !user || user.role === "restaurant") return null;
  if (!SHOW_ON.some((p) => pathname.startsWith(p))) return null;

  const order = activeOrder();
  const awaitingLog = order && orderStatus(order, now) !== "sent" && !order.logged;

  if (!cartCount && !awaitingLog) return null;

  const t = cartTotals();
  const restName = cartRestaurantSlug ? getRestaurant(cartRestaurantSlug)?.name : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-40 px-3 sm:bottom-20">
      <div className="pointer-events-auto mx-auto flex max-w-2xl flex-col gap-2">
        {awaitingLog && order && (
          <Link
            href="/order"
            className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/95 p-3 pl-4 shadow-[0_8px_30px_-8px_rgba(32,22,15,0.25)] backdrop-blur transition hover:bg-brand-100"
          >
            <ClipboardCheck className="h-5 w-5 shrink-0 text-brand-700" />
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-semibold text-brand-900">Order {order.ref} accepted — log this meal?</span>
              <span className="ml-1 text-brand-800/70">Confirm portions to add it to today.</span>
            </div>
          </Link>
        )}
        {cartCount > 0 && (
          <Link
            href="/basket"
            className="flex items-center gap-3 rounded-2xl bg-brand-950 p-3 pl-4 text-white shadow-[0_8px_30px_-8px_rgba(32,22,15,0.4)] transition hover:bg-black"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {t.count} {t.count === 1 ? "item" : "items"}
                {restName ? ` · ${restName}` : ""}
              </p>
              <p className="text-xs text-white/60">{Math.round(t.calories)} cal · ${t.subtotal.toFixed(2)}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-ink">View basket</span>
          </Link>
        )}
      </div>
    </div>
  );
}
