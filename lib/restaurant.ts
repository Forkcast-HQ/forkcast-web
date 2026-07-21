// Restaurant self-serve data access (Supabase).
// Tables live in supabase/migrations/0006_restaurants.sql. RLS guarantees an
// owner only ever reads/writes their own rows; published rows are world-readable.
// Every call guards supa() so the app still builds in local/demo mode.

import { supa } from "@/lib/supabase";

export type MenuSource = "published" | "estimated" | "verified";
export type RestaurantStatus = "draft" | "published";

export interface OwnedMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  category: string;
  tags: string[];
  nutritionSource: MenuSource;
  position: number;
}

export interface OwnedRestaurant {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  address: string;
  priceLevel: number;
  blurb: string;
  status: RestaurantStatus;
  verified: boolean;
}

export interface RestaurantInput {
  name: string;
  cuisine: string;
  neighborhood: string;
  address: string;
  blurb?: string;
  priceLevel?: number;
}

const uid = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "restaurant"}-${Math.random().toString(36).slice(2, 6)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRestaurant(r: any): OwnedRestaurant {
  return {
    id: r.id,
    ownerId: r.owner_id,
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine ?? "",
    neighborhood: r.neighborhood ?? "",
    address: r.address ?? "",
    priceLevel: r.price_level ?? 2,
    blurb: r.blurb ?? "",
    status: (r.status as RestaurantStatus) ?? "draft",
    verified: !!r.verified,
  };
}

function mapMenuItem(m: any): OwnedMenuItem {
  return {
    id: m.id,
    name: m.name,
    description: m.description ?? "",
    price: Number(m.price ?? 0),
    calories: Number(m.calories ?? 0),
    protein: Number(m.protein ?? 0),
    carbs: Number(m.carbs ?? 0),
    fat: Number(m.fat ?? 0),
    fiber: Number(m.fiber ?? 0),
    sodium: Number(m.sodium ?? 0),
    sugar: Number(m.sugar ?? 0),
    category: m.category ?? "",
    tags: Array.isArray(m.tags) ? m.tags : [],
    nutritionSource: (m.nutrition_source as MenuSource) ?? "estimated",
    position: m.position ?? 0,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** The signed-in owner's listing + menu, or null if they haven't created one. */
export async function getMyRestaurant(
  ownerId: string,
): Promise<{ restaurant: OwnedRestaurant; menu: OwnedMenuItem[] } | null> {
  const s = supa();
  if (!s) return null;
  const { data: r, error } = await s
    .from("restaurants")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !r) return null;
  const { data: items } = await s
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", r.id)
    .order("position", { ascending: true });
  return { restaurant: mapRestaurant(r), menu: (items ?? []).map(mapMenuItem) };
}

export async function createRestaurant(ownerId: string, input: RestaurantInput): Promise<OwnedRestaurant> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const row = {
    id: uid(),
    owner_id: ownerId,
    slug: slugify(input.name),
    name: input.name.trim(),
    cuisine: input.cuisine.trim(),
    neighborhood: input.neighborhood.trim(),
    address: input.address.trim(),
    blurb: (input.blurb ?? "").trim(),
    price_level: input.priceLevel ?? 2,
    status: "draft",
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await s.from("restaurants").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapRestaurant(data);
}

export async function updateRestaurant(id: string, patch: Partial<RestaurantInput>): Promise<void> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.cuisine !== undefined) row.cuisine = patch.cuisine.trim();
  if (patch.neighborhood !== undefined) row.neighborhood = patch.neighborhood.trim();
  if (patch.address !== undefined) row.address = patch.address.trim();
  if (patch.blurb !== undefined) row.blurb = patch.blurb.trim();
  if (patch.priceLevel !== undefined) row.price_level = patch.priceLevel;
  const { error } = await s.from("restaurants").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveMenuItem(restaurantId: string, item: OwnedMenuItem): Promise<void> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const { error } = await s.from("menu_items").upsert({
    id: item.id,
    restaurant_id: restaurantId,
    name: item.name.trim(),
    description: item.description.trim(),
    price: item.price,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    fiber: item.fiber,
    sodium: item.sodium,
    sugar: item.sugar,
    category: item.category,
    tags: item.tags,
    nutrition_source: item.nutritionSource,
    position: item.position,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const { error } = await s.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function publishRestaurant(id: string): Promise<void> {
  const s = supa();
  if (!s) throw new Error("Cloud storage is not available.");
  const { error } = await s
    .from("restaurants")
    .update({ status: "published", verified: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  confidence: number;
}

/** Estimate a dish's nutrition from its name + description via /api/analyze. */
export async function estimateNutrition(name: string, description: string): Promise<NutritionEstimate | null> {
  const note = `${name}. ${description}`.trim();
  if (note.length < 3) return null;
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      calories: Number(d.calories ?? 0),
      protein: Number(d.protein ?? 0),
      carbs: Number(d.carbs ?? 0),
      fat: Number(d.fat ?? 0),
      fiber: Number(d.fiber ?? 0),
      sodium: Number(d.sodium ?? 0),
      sugar: Number(d.sugar ?? 0),
      confidence: Number(d.confidence ?? 0),
    };
  } catch {
    return null;
  }
}

export function newMenuItem(position: number): OwnedMenuItem {
  return {
    id: uid(),
    name: "",
    description: "",
    price: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    category: "",
    tags: [],
    nutritionSource: "estimated",
    position,
  };
}
