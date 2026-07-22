// Restaurant-side order transport (Supabase). The partner terminal reads
// orders placed to a restaurant it owns (RLS by owned slug, migration 0007)
// and drives their status. Orders are mapped to the LiveOrderBus shape so the
// terminal UI renders them unchanged. Reads are polled by the terminal;
// realtime is enabled on the table for future push delivery.

import { supa } from "@/lib/supabase";
import type { LiveOrderBus, Order, OrderStatus } from "@/lib/types";

export type TerminalStatus = OrderStatus | "completed";
const ACTIVE: TerminalStatus[] = ["sent", "accepted", "preparing", "ready"];
const DAY_MS = 24 * 60 * 60 * 1000;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): LiveOrderBus {
  const o = (r.data ?? {}) as Order;
  return {
    orderId: r.id,
    ref: r.ref,
    slug: r.slug,
    restName: r.restaurant_name,
    customer: r.customer_name || "Forkcast diner",
    placedAt: new Date(r.placed_at).getTime(),
    fulfill: r.fulfill,
    items: (o.items ?? []).map((it) => ({
      itemId: it.itemId,
      name: it.name,
      qty: it.qty,
      price: it.price,
      calories: it.calories,
      note: it.note,
    })),
    flags: Array.isArray(r.flags) ? r.flags : [],
    // completed rows only appear in the completed list; clamp to a display status
    status: (r.status === "completed" ? "ready" : r.status) as OrderStatus,
    prepMin: r.prep_min ?? undefined,
    claimed: r.status !== "sent",
    ts: r.updated_at ? new Date(r.updated_at).getTime() : Date.now(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Active (not-yet-completed) orders for a restaurant, oldest first (FIFO). */
export async function fetchActiveOrders(slug: string): Promise<LiveOrderBus[]> {
  const s = supa();
  if (!s) return [];
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const { data, error } = await s
    .from("orders")
    .select("*")
    .eq("slug", slug)
    .in("status", ACTIVE)
    .gte("placed_at", since)
    .order("placed_at", { ascending: true });
  if (error || !data) return [];
  return data.map(mapRow);
}

/** Recently completed orders for a restaurant, newest first. */
export async function fetchCompletedOrders(slug: string): Promise<LiveOrderBus[]> {
  const s = supa();
  if (!s) return [];
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const { data } = await s
    .from("orders")
    .select("*")
    .eq("slug", slug)
    .eq("status", "completed")
    .gte("placed_at", since)
    .order("placed_at", { ascending: false })
    .limit(10);
  return (data ?? []).map(mapRow);
}

export async function setOrderStatus(orderId: string, status: TerminalStatus, prepMin?: number): Promise<void> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (prepMin !== undefined) patch.prep_min = prepMin;
  const { error } = await s.from("orders").update(patch).eq("id", orderId);
  if (error) throw new Error(error.message);
}
