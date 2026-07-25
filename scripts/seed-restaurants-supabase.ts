// Seeds the Supabase restaurants/menu_items tables from the static
// data/restaurants.ts catalog, so mobile (and eventually web) can read the
// same source of truth. Safe to re-run — upserts by slug/id.
//
// Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
// (loaded manually below since this runs outside the Next.js process).
// Apply supabase/migrations/0008_mobile_catalog_fields.sql BEFORE running this.
//
//   npx tsx scripts/seed-restaurants-supabase.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { RESTAURANTS } from "../data/restaurants";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — aborting.",
  );
  process.exit(1);
}

const supa = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const restaurantRows = RESTAURANTS.map((r) => ({
    slug: r.slug,
    owner_id: null,
    name: r.name,
    cuisine: r.cuisine,
    neighborhood: r.neighborhood,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    price_level: r.priceLevel,
    rating: r.rating,
    reviews: r.reviews,
    delivery_min: r.deliveryMins[0],
    delivery_max: r.deliveryMins[1],
    distance_mi: r.distanceMi,
    partner: r.partner,
    data_source: r.dataSource ?? null,
    source_note: r.sourceNote ?? null,
    blurb: r.blurb,
    photo_url: r.photoUrl ?? null,
    category: r.category,
    tags: r.tags,
    status: "published",
    verified: r.partner || r.dataSource === "published",
    catalog_origin: "seed",
    available: true,
    data: r,
  }));

  const { data: upsertedRestaurants, error: restaurantError } = await supa
    .from("restaurants")
    .upsert(restaurantRows, { onConflict: "slug" })
    .select("id, slug");

  if (restaurantError) {
    console.error("Restaurant upsert failed:", restaurantError.message);
    process.exit(1);
  }

  const idBySlug = new Map((upsertedRestaurants ?? []).map((r) => [r.slug, r.id]));

  const menuRows = RESTAURANTS.flatMap((r) => {
    const restaurantId = idBySlug.get(r.slug);
    if (!restaurantId) {
      console.warn(`No restaurant id found for slug "${r.slug}" — skipping its menu.`);
      return [];
    }
    return r.menu.map((item, position) => ({
      id: item.id,
      restaurant_id: restaurantId,
      name: item.name,
      description: item.description,
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
      nutrition_source: r.partner ? "verified" : (r.dataSource ?? "estimated"),
      photo_url: item.photoUrl ?? null,
      position,
      available: true,
      data: item,
    }));
  });

  const { error: menuError, count: menuCount } = await supa
    .from("menu_items")
    .upsert(menuRows, { onConflict: "id", count: "exact" });

  if (menuError) {
    console.error("Menu item upsert failed:", menuError.message);
    process.exit(1);
  }

  console.log(
    `Seeded ${upsertedRestaurants?.length ?? 0} restaurants and ${menuCount ?? menuRows.length} menu items.`,
  );
}

main();
