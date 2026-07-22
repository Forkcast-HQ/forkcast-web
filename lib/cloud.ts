// Cloud data sync — thin, fire-and-forget mirror of the local stores into
// Supabase. Local state (localStorage) stays the source of truth for the UI:
// the app never blocks on the network, and works fully offline / in demo mode.
//
// Sync model (v1, deliberately simple):
// - On sign-in: pull everything for the user. If the cloud has data, cloud
//   wins (it is the cross-device truth). If the cloud is empty but the device
//   has data (pre-backend account), push the local data up once.
// - On every mutation: push that row (upsert/delete). Errors are logged and
//   swallowed — the local copy is never rolled back.
// - Mobile (React Native/Expo) uses these same tables via supabase-js.

import type { HealthProfile, LoggedMeal, Order, WeightEntry } from "./types";
import type { AccountRole } from "./auth";
import { supa } from "./supabase";

const warn = (op: string) => (e: unknown) =>
  console.warn(`[cloud] ${op} failed:`, e instanceof Error ? e.message : e);

// Photo data-URLs can be hundreds of KB — strip before cloud writes (v1).
// Photos remain visible on the device that captured them.
const stripPhoto = (m: LoggedMeal): LoggedMeal =>
  m.photo ? { ...m, photo: undefined } : m;

export interface CloudPull {
  profile: HealthProfile | null;
  role: AccountRole | null;
  name: string | null;
  meals: LoggedMeal[];
  weights: WeightEntry[];
  orders: Order[];
}

export async function pullAll(userId: string): Promise<CloudPull | null> {
  const s = supa();
  if (!s) return null;
  try {
    const [prof, meals, weights, orders] = await Promise.all([
      s.from("profiles").select("name, role, profile").eq("user_id", userId).maybeSingle(),
      s.from("meal_logs").select("data").eq("user_id", userId).order("logged_at"),
      s.from("weight_entries").select("date, weight_kg").eq("user_id", userId).order("date"),
      s.from("orders").select("data").eq("user_id", userId).order("placed_at"),
    ]);
    return {
      profile: (prof.data?.profile as HealthProfile | null) ?? null,
      role: (prof.data?.role as AccountRole | null) ?? null,
      name: prof.data?.name ?? null,
      meals: (meals.data ?? []).map((r) => r.data as LoggedMeal),
      weights: (weights.data ?? []).map((r) => ({ date: r.date as string, weightKg: Number(r.weight_kg) })),
      orders: (orders.data ?? []).map((r) => r.data as Order),
    };
  } catch (e) {
    warn("pullAll")(e);
    return null;
  }
}

export function pushAccount(userId: string, name: string, role: AccountRole): void {
  const s = supa();
  if (!s) return;
  s.from("profiles")
    .upsert({ user_id: userId, name, role, updated_at: new Date().toISOString() })
    .then(({ error }) => error && warn("pushAccount")(error));
}

export function pushProfile(userId: string, profile: HealthProfile): void {
  const s = supa();
  if (!s) return;
  s.from("profiles")
    .upsert({ user_id: userId, name: profile.name, profile, updated_at: new Date().toISOString() })
    .then(({ error }) => error && warn("pushProfile")(error));
}

export function pushMeal(userId: string, m: LoggedMeal): void {
  const s = supa();
  if (!s) return;
  const lean = stripPhoto(m);
  s.from("meal_logs")
    .upsert({
      id: m.id,
      user_id: userId,
      logged_at: new Date(m.loggedAt).toISOString(),
      name: m.name,
      source: m.source,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      fiber: m.fiber,
      sodium: m.sodium,
      sugar: m.sugar,
      data: lean,
    })
    .then(({ error }) => error && warn("pushMeal")(error));
}

export function deleteMeal(userId: string, id: string): void {
  const s = supa();
  if (!s) return;
  s.from("meal_logs")
    .delete()
    .eq("user_id", userId)
    .eq("id", id)
    .then(({ error }) => error && warn("deleteMeal")(error));
}

export function pushWeight(userId: string, w: WeightEntry): void {
  const s = supa();
  if (!s) return;
  s.from("weight_entries")
    .upsert({ user_id: userId, date: w.date, weight_kg: w.weightKg, updated_at: new Date().toISOString() })
    .then(({ error }) => error && warn("pushWeight")(error));
}

export function pushOrder(userId: string, o: Order, live?: { customer: string; flags: string[] }): void {
  const s = supa();
  if (!s) return;
  const row: Record<string, unknown> = {
    id: o.id,
    user_id: userId,
    ref: o.ref,
    slug: o.slug,
    restaurant_name: o.restaurantName,
    fulfill: o.fulfill,
    placed_at: new Date(o.placedAt).toISOString(),
    subtotal: o.subtotal,
    total: o.total,
    logged: o.logged,
    dismissed_log: o.dismissedLog ?? false,
    data: o,
  };
  // On initial placement, stamp the live-order fields the restaurant terminal
  // reads. Omitted on later re-pushes (e.g. markLogged) so terminal-driven
  // status and flags are preserved (upsert only updates provided columns).
  if (live) {
    row.status = "sent";
    row.customer_name = live.customer;
    row.flags = live.flags;
    row.updated_at = new Date().toISOString();
  }
  s.from("orders")
    .upsert(row)
    .then(({ error }) => error && warn("pushOrder")(error));
}

export async function pullOrders(userId: string): Promise<Order[] | null> {
  const s = supa();
  if (!s) return null;
  try {
    const { data, error } = await s
      .from("orders")
      .select("data")
      .eq("user_id", userId)
      .order("placed_at");
    if (error) throw error;
    return (data ?? []).map((r) => r.data as Order);
  } catch (e) {
    warn("pullOrders")(e);
    return null;
  }
}

export function pushMealsBulk(userId: string, meals: LoggedMeal[]): void {
  for (const m of meals) pushMeal(userId, m);
}

export function pushWeightsBulk(userId: string, weights: WeightEntry[]): void {
  for (const w of weights) pushWeight(userId, w);
}

export function pushOrdersBulk(userId: string, orders: Order[]): void {
  for (const o of orders) pushOrder(userId, o);
}
