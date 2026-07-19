// Real-photo image helper with a reliability cascade:
//   1. Curated Unsplash photos (their CDN is fast and stable; the Unsplash
//      license permits commercial use without attribution) — hand-matched to
//      each dish category and restaurant type.
//   2. LoremFlickr keyword photo as automatic fallback (encoded in the URL
//      fragment; SmartImage swaps to it on error).
//   3. Brand gradient tile as the final fallback (SmartImage).
//
// LICENSING RULE (do not break): only freely-licensed or partner-provided
// photography ships in the app. Restaurant-owned marketing photos may be used
// ONLY once the partner grants a license (photo clause in the partner
// agreement). The catalog supports per-restaurant `photoUrl` for exactly that.

const U = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export function foodImg(keywords: string, seed: number, w = 800, h = 600): string {
  const kw = encodeURIComponent(keywords.replace(/\s+/g, ","));
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${seed}`;
}

// Primary URL + fallback packed into the hash so existing call sites (which
// expect a single string) keep working. SmartImage reads `#fb=` on error.
function cascade(ids: string[], keywords: string, seed: number, w: number, h: number): string {
  const id = ids[Math.abs(seed) % ids.length];
  return `${U(id, w, h)}#fb=${encodeURIComponent(foodImg(keywords, seed, w, h))}`;
}

// Curated, hand-matched Unsplash photo IDs per dish category. Multiple IDs
// where dishes commonly repeat, so a menu doesn't show one photo five times.
const CATEGORY_IMG: Record<string, { ids: string[]; kw: string; seed: number }> = {
  "grain-bowl": { ids: ["1512621776951-a57141f2eefd", "1546069901-ba9599a7e63c", "1540189549336-e6e99c3679fe"], kw: "grain,bowl,quinoa,healthy", seed: 21 },
  salad: { ids: ["1512621776951-a57141f2eefd", "1540189549336-e6e99c3679fe"], kw: "salad,greens,fresh", seed: 32 },
  poke: { ids: ["1553621042-f6e147245754", "1546069901-ba9599a7e63c"], kw: "poke,bowl,salmon,rice", seed: 44 },
  wrap: { ids: ["1626700051175-6818013e1d4f", "1512621776951-a57141f2eefd"], kw: "wrap,burrito,healthy", seed: 53 },
  smoothie: { ids: ["1490474418585-ba9bad8fd0ea", "1511690743698-d9d85f2fbf38"], kw: "smoothie,bowl,acai,berries", seed: 61 },
  soup: { ids: ["1547592180-85f173990554"], kw: "soup,bowl,vegetable", seed: 72 },
  "chicken-plate": { ids: ["1532550907401-a500c9a57435", "1504674900247-0877df9cc836"], kw: "grilled,chicken,plate,vegetables", seed: 83 },
  "salmon-plate": { ids: ["1467003909585-2f8a72700288", "1519708227418-c8fd9a32b7a2"], kw: "salmon,grilled,plate", seed: 94 },
  mediterranean: { ids: ["1505576399279-565b52d4ac71", "1540189549336-e6e99c3679fe"], kw: "mediterranean,hummus,falafel,plate", seed: 105 },
  taco: { ids: ["1613514785940-daed07799d9b", "1551504734-5ee1c4a1479b"], kw: "tacos,mexican,fresh", seed: 116 },
  curry: { ids: ["1601050690597-df0568f70950", "1585032226651-759b368d7246"], kw: "curry,bowl,rice", seed: 127 },
  sandwich: { ids: ["1528735602780-2552fd46c7af", "1482049016688-2d3e1b311543"], kw: "sandwich,healthy,wholegrain", seed: 138 },
  pasta: { ids: ["1473093295043-cdd812d0e601"], kw: "pasta,wholegrain,vegetables", seed: 149 },
  breakfast: { ids: ["1482049016688-2d3e1b311543", "1484723091739-30a097e8f929"], kw: "breakfast,eggs,avocado,toast", seed: 160 },
  dessert: { ids: ["1565958011703-44f9829ba187", "1488477181946-6428a0291777"], kw: "yogurt,parfait,berries", seed: 171 },
  burger: { ids: ["1568901346375-23c9450c58cd", "1571091718767-18b5b1457add"], kw: "burger,turkey,lettuce", seed: 182 },
  steak: { ids: ["1544025162-d76694265947", "1504674900247-0877df9cc836"], kw: "steak,lean,plate,vegetables", seed: 193 },
  juice: { ids: ["1610970881699-44a5587cabec", "1490474418585-ba9bad8fd0ea"], kw: "juice,green,fresh", seed: 204 },
};

const RESTAURANT_IMG: Record<string, { ids: string[]; kw: string; seed: number }> = {
  "salad-bar": { ids: ["1512621776951-a57141f2eefd"], kw: "salad,restaurant,counter,fresh", seed: 211 },
  "poke-shop": { ids: ["1553621042-f6e147245754"], kw: "poke,restaurant,bowl", seed: 222 },
  "mediterranean-resto": { ids: ["1505576399279-565b52d4ac71"], kw: "mediterranean,restaurant,mezze", seed: 233 },
  "mexican-resto": { ids: ["1613514785940-daed07799d9b"], kw: "mexican,restaurant,fresh,tacos", seed: 244 },
  cafe: { ids: ["1554118811-1e0d58224f24"], kw: "cafe,healthy,bowls,interior", seed: 255 },
  "asian-resto": { ids: ["1585032226651-759b368d7246"], kw: "asian,bowl,restaurant,noodles", seed: 266 },
  grill: { ids: ["1544025162-d76694265947"], kw: "grill,chicken,restaurant", seed: 277 },
  "juice-bar": { ids: ["1610970881699-44a5587cabec"], kw: "juice,bar,smoothie,fresh", seed: 288 },
};

// ---- Editorial photography for landing-page storytelling -------------------
// Hand-picked, high-resolution lifestyle shots. Every fallback in the chain is
// another curated Unsplash ID; LoremFlickr is only the very last resort, so
// marketing pages never show a random low-quality photo.
const EDITORIAL: Record<string, { ids: string[]; kw: string; seed: number }> = {
  "dining-together": {
    ids: ["1529156069898-49953e39b3ac", "1414235077428-338989a2e8c0", "1517248135467-4c7edcad34c4"],
    kw: "friends,dinner,restaurant,table",
    seed: 501,
  },
  "restaurant-spread": {
    ids: ["1555396273-367ea4eb4db5", "1517248135467-4c7edcad34c4"],
    kw: "restaurant,food,table,spread",
    seed: 512,
  },
  "healthy-table": {
    ids: ["1512621776951-a57141f2eefd", "1546069901-ba9599a7e63c"],
    kw: "healthy,bowls,fresh,table",
    seed: 523,
  },
};

export function editorialImg(name: string, w = 1200, h = 900): string {
  const e = EDITORIAL[name];
  if (!e) return foodImg("restaurant,healthy,food", 900, w, h);
  // Chain every curated ID before surrendering to LoremFlickr.
  let url = foodImg(e.kw, e.seed, w, h);
  for (let i = e.ids.length - 1; i >= 0; i--) {
    url = `${U(e.ids[i], w, h)}#fb=${encodeURIComponent(url)}`;
  }
  return url;
}

// ---- Local-first resolution for generated/owned photography ---------------
// Drop files into public/img/food/dishes/<slug>__<itemId>.jpg and
// public/img/food/restaurants/<slug>.jpg (see docs/PHOTO_BRIEF.md) and they
// are picked up automatically: the local file is tried first, and if it
// doesn't exist the stock cascade takes over. No code changes needed.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function dishImg(slug: string, itemId: string, category: string, seed = 0, w = 800, h = 600): string {
  const local = `${BASE}/img/food/dishes/${slug}__${itemId}.jpg`;
  return `${local}#fb=${encodeURIComponent(categoryImg(category, seed, w, h))}`;
}

export function restaurantHeroImg(slug: string, category: string, w = 1200, h = 800): string {
  const local = `${BASE}/img/food/restaurants/${slug}.jpg`;
  return `${local}#fb=${encodeURIComponent(restaurantImg(category, w, h))}`;
}

export function categoryImg(category: string, seed = 0, w = 800, h = 600): string {
  const entry = CATEGORY_IMG[category];
  if (entry) return cascade(entry.ids, entry.kw, entry.seed + seed, w, h);
  return foodImg("healthy,food," + category, 300 + seed, w, h);
}

export function restaurantImg(category: string, w = 1200, h = 800): string {
  const entry = RESTAURANT_IMG[category];
  if (entry) return cascade(entry.ids, entry.kw, entry.seed, w, h);
  return foodImg("restaurant,healthy,food", 400, w, h);
}
