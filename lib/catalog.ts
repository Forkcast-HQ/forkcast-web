// Public restaurant/menu catalog — reads the same Supabase tables the
// restaurant self-serve flow writes to (supabase/migrations/0006, 0008),
// so web, mobile, and any future client all read one source of truth.
// Anon-key reads are safe: RLS only exposes status='published' rows.
// Server components can call fetchCatalog() directly; client components
// should go through lib/catalogContext.tsx's useCatalog() instead.

import { supa } from "@/lib/supabase";
import type { Restaurant, MenuItem } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMenuItem(m: any): MenuItem {
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
    photoUrl: m.photo_url ?? undefined,
  };
}

function mapRestaurant(r: any, menu: MenuItem[]): Restaurant {
  return {
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine ?? "",
    neighborhood: r.neighborhood ?? "",
    address: r.address ?? "",
    priceLevel: (r.price_level ?? 2) as 1 | 2 | 3,
    rating: Number(r.rating ?? 0),
    reviews: Number(r.reviews ?? 0),
    deliveryMins: [Number(r.delivery_min ?? 0), Number(r.delivery_max ?? 0)],
    distanceMi: Number(r.distance_mi ?? 0),
    lat: Number(r.lat ?? 0),
    lng: Number(r.lng ?? 0),
    partner: !!r.partner,
    dataSource: r.data_source ?? undefined,
    sourceNote: r.source_note ?? undefined,
    blurb: r.blurb ?? "",
    photoUrl: r.photo_url ?? undefined,
    category: r.category ?? "",
    tags: Array.isArray(r.tags) ? r.tags : [],
    menu,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Every published, available restaurant + its menu. Returns [] if Supabase
 * isn't configured or the fetch fails — every caller already treats an empty
 * catalog as a valid (if uninteresting) state, same as the old static array
 * would be if it were empty.
 */
export async function fetchCatalog(): Promise<Restaurant[]> {
  const s = supa();
  if (!s) return [];

  const { data: restaurants, error: rErr } = await s
    .from("restaurants")
    .select("*")
    .eq("status", "published")
    .eq("available", true)
    .order("rating", { ascending: false });
  if (rErr || !restaurants?.length) return [];

  const { data: menuItems } = await s
    .from("menu_items")
    .select("*")
    .in(
      "restaurant_id",
      restaurants.map((r) => r.id),
    )
    .eq("available", true)
    .order("position", { ascending: true });

  const menuByRestaurant = new Map<string, MenuItem[]>();
  for (const m of menuItems ?? []) {
    const list = menuByRestaurant.get(m.restaurant_id) ?? [];
    list.push(mapMenuItem(m));
    menuByRestaurant.set(m.restaurant_id, list);
  }

  return restaurants.map((r) => mapRestaurant(r, menuByRestaurant.get(r.id) ?? []));
}

export function getRestaurantFrom(restaurants: Restaurant[], slug: string): Restaurant | undefined {
  return restaurants.find((r) => r.slug === slug);
}

export interface MenuItemWithContext extends MenuItem {
  restaurantSlug: string;
  restaurantName: string;
  restaurantNeighborhood: string;
  distanceMi: number;
  partner: boolean;
}

export function allMenuItemsFrom(restaurants: Restaurant[]): MenuItemWithContext[] {
  return restaurants.flatMap((r) =>
    r.menu.map((m) => ({
      ...m,
      restaurantSlug: r.slug,
      restaurantName: r.name,
      restaurantNeighborhood: r.neighborhood,
      distanceMi: r.distanceMi,
      partner: r.partner,
    })),
  );
}

export function cuisinesFrom(restaurants: Restaurant[]): string[] {
  return Array.from(new Set(restaurants.map((r) => r.cuisine)));
}
