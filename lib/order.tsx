"use client";

// Palatify ordering layer — basket, prototype-safe checkout, simulated kitchen
// status, and the post-order "Log this meal?" confirmation workflow.
//
// HONESTY CONSTRAINTS (carry into production):
// - No live restaurant/payment integration exists yet. Every order is stamped
//   integration: "prototype" and the UI must always say so.
// - Kitchen status is SIMULATED, derived deterministically from elapsed time,
//   and labeled as simulated wherever shown.
// - Auto-log never happens silently: the user confirms via "Log this meal?"
//   with portion edits before anything reaches the daily log.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, Fulfillment, Order, OrderItem, OrderStatus } from "./types";
import { useCatalog } from "./catalogContext";
import { uid } from "./format";
import { useAuth } from "./auth";
import { useUser } from "./store";
import { readBus, writeBus } from "./bus";
import { cloudEnabled } from "./supabase";
import { pullOrders, pushOrder as cloudPushOrder, pushOrdersBulk } from "./cloud";

export const DELIVERY_FEE = 5.99;
export const MA_MEALS_TAX = 0.07; // Massachusetts meals tax

// Simulated kitchen timeline (ms after placedAt). Labeled "simulated" in UI.
const SIM_ACCEPT_MS = 8_000;
const SIM_PREP_MS = 25_000;
const SIM_READY_MS = 55_000;

// Live status: if a partner terminal has claimed this order on the sync bus,
// its updates drive the timeline. Otherwise fall back to the labeled
// time-based simulation.
export function orderStatus(o: Order, now = Date.now()): OrderStatus {
  const bus = readBus();
  if (bus && bus.orderId === o.id && bus.claimed) return bus.status;
  const age = now - o.placedAt;
  if (age >= SIM_READY_MS) return "ready";
  if (age >= SIM_PREP_MS) return "preparing";
  if (age >= SIM_ACCEPT_MS) return "accepted";
  return "sent";
}

export const STATUS_STEP: Record<OrderStatus, number> = {
  sent: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
};

const ordersKey = (id: string) => `palatify.orders.${id}`;

interface PersistShape {
  cart: CartLine[];
  orders: Order[];
}

interface OrderStoreValue {
  cart: CartLine[];
  orders: Order[];
  hydrated: boolean;
  cartRestaurantSlug: string | null;
  cartCount: number;
  addToCart: (slug: string, itemId: string) => void;
  changeQty: (itemId: string, delta: number) => void;
  setLineNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  placeOrder: (fulfill: Fulfillment) => Order | null;
  markLogged: (orderId: string, dismissed?: boolean) => void;
  reorder: (orderId: string) => void;
  activeOrder: () => Order | null;
  cartItems: () => (OrderItem & { line: CartLine })[];
  cartTotals: () => { subtotal: number; calories: number; protein: number; carbs: number; fat: number; count: number };
  now: number; // ticks every second while an order is live, drives status UI
}

const Ctx = createContext<OrderStoreValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const { profile } = useUser();
  const { getRestaurant } = useCatalog();
  const userId = user?.id ?? null;

  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [now, setNow] = useState(() => Date.now());

  // Guests get a persistent basket too ("guest" key) — otherwise any full
  // page load wipes an unauthenticated basket and checkout bounces to empty.
  const storeId = userId ?? "guest";

  useEffect(() => {
    if (!authHydrated) return;
    try {
      const raw = localStorage.getItem(ordersKey(storeId));
      const p: PersistShape | null = raw ? JSON.parse(raw) : null;
      let cartNext = p?.cart ?? [];
      // A guest who filled a basket and then signed in keeps that basket:
      // adopt the guest cart into the account (once), so the funnel never
      // dumps someone back to an empty basket after signup.
      if (userId && cartNext.length === 0) {
        try {
          const guestRaw = localStorage.getItem(ordersKey("guest"));
          const guest: PersistShape | null = guestRaw ? JSON.parse(guestRaw) : null;
          if (guest?.cart?.length) {
            cartNext = guest.cart;
            localStorage.setItem(ordersKey("guest"), JSON.stringify({ ...guest, cart: [] }));
          }
        } catch { /* ignore */ }
      }
      setCart(cartNext);
      setOrders(p?.orders ?? []);
    } catch {
      setCart([]);
      setOrders([]);
    }
    setLoadedFor(storeId);
  }, [storeId, userId, authHydrated]);

  // Cloud sync: signed-in users pull their cross-device order history.
  // Cloud wins when present; a device-only history is seeded up once.
  useEffect(() => {
    if (!userId || loadedFor !== userId || !cloudEnabled()) return;
    let cancelled = false;
    pullOrders(userId).then((remote) => {
      if (!remote || cancelled) return;
      if (remote.length) setOrders(remote);
      else
        setOrders((local) => {
          if (local.length) pushOrdersBulk(userId, local);
          return local;
        });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, loadedFor]);

  useEffect(() => {
    if (!authHydrated || loadedFor !== storeId) return;
    try {
      localStorage.setItem(ordersKey(storeId), JSON.stringify({ cart, orders }));
    } catch {
      /* ignore */
    }
  }, [cart, orders, storeId, authHydrated, loadedFor]);

  // Tick while any order is still progressing or awaiting log confirmation.
  const hasLive = orders.some(
    (o) => !o.logged && !o.dismissedLog && Date.now() - o.placedAt < SIM_READY_MS + 120_000,
  );
  useEffect(() => {
    if (!hasLive) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasLive]);

  // One restaurant per basket. Adding from the SAME restaurant merges lines;
  // adding from a DIFFERENT restaurant never clears silently — it opens a
  // confirmation dialog (rendered by the provider below).
  const [pendingAdd, setPendingAdd] = useState<{ slug: string; itemId: string } | null>(null);

  const addToCart = useCallback((slug: string, itemId: string) => {
    setCart((prev) => {
      if (prev.length && prev[0].slug !== slug) {
        // Conflict: ask before replacing the basket.
        setPendingAdd({ slug, itemId });
        return prev;
      }
      const ex = prev.find((l) => l.itemId === itemId);
      return ex
        ? prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { slug, itemId, qty: 1 }];
    });
  }, []);

  const confirmNewBasket = useCallback(() => {
    setPendingAdd((p) => {
      if (p) setCart([{ slug: p.slug, itemId: p.itemId, qty: 1 }]);
      return null;
    });
  }, []);

  const dismissPendingAdd = useCallback(() => setPendingAdd(null), []);

  const changeQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const setLineNote = useCallback((itemId: string, note: string) => {
    setCart((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, note: note || undefined } : l)),
    );
  }, []);

  const cartItems = useCallback((): (OrderItem & { line: CartLine })[] => {
    return cart.flatMap((line) => {
      const r = getRestaurant(line.slug);
      const m = r?.menu.find((x) => x.id === line.itemId);
      if (!r || !m) return [];
      return [
        {
          line,
          itemId: m.id,
          name: m.name,
          price: m.price,
          qty: line.qty,
          note: line.note,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          fiber: m.fiber,
          sodium: m.sodium,
          sugar: m.sugar,
        },
      ];
    });
  }, [cart, getRestaurant]);

  const cartTotals = useCallback(() => {
    return cartItems().reduce(
      (acc, it) => ({
        subtotal: acc.subtotal + it.price * it.qty,
        calories: acc.calories + it.calories * it.qty,
        protein: acc.protein + it.protein * it.qty,
        carbs: acc.carbs + it.carbs * it.qty,
        fat: acc.fat + it.fat * it.qty,
        count: acc.count + it.qty,
      }),
      { subtotal: 0, calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
    );
  }, [cartItems]);

  const placeOrder = useCallback(
    (fulfill: Fulfillment): Order | null => {
      const items = cartItems();
      if (!items.length) return null;
      const slug = cart[0].slug;
      const r = getRestaurant(slug);
      if (!r) return null;
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const deliveryFee = fulfill === "delivery" ? DELIVERY_FEE : 0;
      const tax = subtotal * MA_MEALS_TAX;
      const order: Order = {
        id: uid(),
        ref: "F-" + (1000 + Math.floor(Math.random() * 9000)),
        slug,
        restaurantName: r.name,
        partner: r.partner,
        items: items.map(({ line: _line, ...it }) => it),
        fulfill,
        placedAt: Date.now(),
        subtotal,
        deliveryFee,
        tax,
        total: subtotal + deliveryFee + tax,
        logged: false,
        integration: "prototype",
      };
      setOrders((prev) => [...prev, order]);
      setCart([]);
      setNow(Date.now());

      // Kitchen flags: profile allergens / dietary preferences vs item text.
      const flags: string[] = [];
      const menuById = new Map(r.menu.map((m) => [m.id, m]));
      for (const it of items) {
        const m = menuById.get(it.itemId);
        const text = `${it.name} ${m?.description ?? ""} ${(m?.tags ?? []).join(" ")}`.toLowerCase();
        for (const a of profile?.avoid ?? []) {
          if (text.includes(a.toLowerCase())) {
            flags.push(`${a} allergy on the customer's profile — ${it.name} may contain ${a.toLowerCase()}. Confirm before preparing.`);
          }
        }
        for (const d of profile?.dietary ?? []) {
          if (!(m?.tags ?? []).map((t) => t.toLowerCase()).includes(d.toLowerCase())) {
            flags.push(`Customer prefers ${d} — ${it.name} is not tagged ${d}. Preference conflict acknowledged by the customer.`);
          }
        }
        if (it.note) flags.push(`Request for ${it.name}: "${it.note}"`);
      }
      const customer = profile?.name || user?.name || "Palatify diner";

      // Persist to Supabase with the live-order fields the restaurant terminal
      // reads (status/customer/flags), so a real restaurant receives it.
      if (userId) cloudPushOrder(userId, order, { customer, flags });

      // Also publish to the same-device sync bus (consumer tracking + demo terminal).
      writeBus({
        orderId: order.id,
        ref: order.ref,
        slug,
        restName: r.name,
        customer,
        placedAt: order.placedAt,
        fulfill,
        items: items.map((it) => ({ itemId: it.itemId, name: it.name, qty: it.qty, price: it.price, calories: it.calories, note: it.note })),
        flags,
        status: "sent",
        claimed: false,
        ts: Date.now(),
      });
      return order;
    },
    [cart, cartItems, profile, user, getRestaurant],
  );

  const markLogged = useCallback(
    (orderId: string, dismissed = false) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const next = { ...o, logged: !dismissed, dismissedLog: dismissed };
          if (userId) cloudPushOrder(userId, next);
          return next;
        }),
      );
    },
    [userId],
  );

  const reorder = useCallback((orderId: string) => {
    setOrders((prev) => {
      const o = prev.find((x) => x.id === orderId);
      if (o) setCart(o.items.map((it) => ({ slug: o.slug, itemId: it.itemId, qty: it.qty, note: it.note })));
      return prev;
    });
  }, []);

  const activeOrder = useCallback((): Order | null => {
    const live = orders.filter((o) => !o.logged && !o.dismissedLog);
    return live.length ? live[live.length - 1] : null;
  }, [orders]);

  const cartRestaurantSlug = cart.length ? cart[0].slug : null;
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const hydrated = authHydrated && (userId ? loadedFor === userId : true);

  const value = useMemo<OrderStoreValue>(
    () => ({
      cart,
      orders,
      hydrated,
      cartRestaurantSlug,
      cartCount,
      addToCart,
      changeQty,
      setLineNote,
      clearCart,
      placeOrder,
      markLogged,
      reorder,
      activeOrder,
      cartItems,
      cartTotals,
      now,
    }),
    [cart, orders, hydrated, cartRestaurantSlug, cartCount, addToCart, changeQty, setLineNote, clearCart, placeOrder, markLogged, reorder, activeOrder, cartItems, cartTotals, now],
  );

  // Basket-conflict dialog (one restaurant per basket, never cleared silently)
  const pendingRest = pendingAdd ? getRestaurant(pendingAdd.slug) : null;
  const currentRest = cart.length ? getRestaurant(cart[0].slug) : null;
  const pendingDish = pendingRest?.menu.find((m) => m.id === pendingAdd?.itemId);

  return (
    <Ctx.Provider value={value}>
      {children}
      {pendingAdd && pendingRest && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={dismissPendingAdd}
          role="dialog"
          aria-modal="true"
          aria-label="Start a new basket?"
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-extrabold text-ink">Start a new basket?</h2>
            <p className="mt-2 text-sm text-ink/65">
              Orders are one restaurant at a time. Adding{" "}
              <strong className="text-ink">{pendingDish?.name ?? "this dish"}</strong> from{" "}
              <strong className="text-ink">{pendingRest.name}</strong> will clear your current basket
              {currentRest ? <> ({cartCount} item{cartCount === 1 ? "" : "s"} from <strong className="text-ink">{currentRest.name}</strong>)</> : null}.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={confirmNewBasket}
                className="flex-1 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Start new basket
              </button>
              <button
                onClick={dismissPendingAdd}
                className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-black/20"
              >
                Keep {currentRest?.name ?? "current basket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useOrder(): OrderStoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOrder must be used within OrderProvider");
  return v;
}
