"use client";

// Forkcast ordering layer — basket, prototype-safe checkout, simulated kitchen
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
import { getRestaurant } from "@/data/restaurants";
import { uid } from "./format";
import { useAuth } from "./auth";
import { useUser } from "./store";
import { readBus, writeBus } from "./bus";

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

const ordersKey = (id: string) => `forkcast.orders.${id}`;

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
      setCart(p?.cart ?? []);
      setOrders(p?.orders ?? []);
    } catch {
      setCart([]);
      setOrders([]);
    }
    setLoadedFor(storeId);
  }, [storeId, authHydrated]);

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

  const addToCart = useCallback((slug: string, itemId: string) => {
    setCart((prev) => {
      // One restaurant per basket — starting a new restaurant clears the basket.
      const same = prev.filter((l) => l.slug === slug);
      const ex = same.find((l) => l.itemId === itemId);
      return ex
        ? same.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l))
        : [...same, { slug, itemId, qty: 1 }];
    });
  }, []);

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
  }, [cart]);

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

      // Publish to the sync bus so a partner terminal can claim it.
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
      writeBus({
        orderId: order.id,
        ref: order.ref,
        slug,
        restName: r.name,
        customer: profile?.name || user?.name || "Forkcast diner",
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
    [cart, cartItems, profile, user],
  );

  const markLogged = useCallback((orderId: string, dismissed = false) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, logged: !dismissed, dismissedLog: dismissed } : o,
      ),
    );
  }, []);

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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrder(): OrderStoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOrder must be used within OrderProvider");
  return v;
}
