// Real-photo image helper. We use LoremFlickr (real Flickr photos by keyword,
// deterministic via the `lock` seed) so the demo shows actual food photography
// rather than illustrations. A gradient fallback (see SmartImage) covers any
// network hiccups so the UI always looks intentional.

export function foodImg(keywords: string, seed: number, w = 800, h = 600): string {
  const kw = encodeURIComponent(keywords.replace(/\s+/g, ","));
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${seed}`;
}

// Stable category -> (keywords, seed) map. Menu items reference a category so
// related dishes share a coherent look, the way real ordering apps do.
const CATEGORY_IMG: Record<string, [string, number]> = {
  "grain-bowl": ["grain,bowl,quinoa,healthy", 21],
  salad: ["salad,greens,fresh", 32],
  poke: ["poke,bowl,salmon,rice", 44],
  wrap: ["wrap,burrito,healthy", 53],
  "smoothie": ["smoothie,bowl,acai,berries", 61],
  soup: ["soup,bowl,vegetable", 72],
  "chicken-plate": ["grilled,chicken,plate,vegetables", 83],
  "salmon-plate": ["salmon,grilled,plate", 94],
  mediterranean: ["mediterranean,hummus,falafel,plate", 105],
  "taco": ["tacos,mexican,fresh", 116],
  curry: ["curry,bowl,rice", 127],
  sandwich: ["sandwich,healthy,wholegrain", 138],
  pasta: ["pasta,wholegrain,vegetables", 149],
  breakfast: ["breakfast,eggs,avocado,toast", 160],
  dessert: ["yogurt,parfait,berries", 171],
  burger: ["burger,turkey,lettuce", 182],
  steak: ["steak,lean,plate,vegetables", 193],
  juice: ["juice,green,fresh", 204],
};

const RESTAURANT_IMG: Record<string, [string, number]> = {
  "salad-bar": ["salad,restaurant,counter,fresh", 211],
  "poke-shop": ["poke,restaurant,bowl", 222],
  "mediterranean-resto": ["mediterranean,restaurant,mezze", 233],
  "mexican-resto": ["mexican,restaurant,fresh,tacos", 244],
  "cafe": ["cafe,healthy,bowls,interior", 255],
  "asian-resto": ["asian,bowl,restaurant,noodles", 266],
  "grill": ["grill,chicken,restaurant", 277],
  "juice-bar": ["juice,bar,smoothie,fresh", 288],
};

export function categoryImg(category: string, seed = 0, w = 800, h = 600): string {
  const entry = CATEGORY_IMG[category];
  if (entry) return foodImg(entry[0], entry[1] + seed, w, h);
  return foodImg("healthy,food," + category, 300 + seed, w, h);
}

export function restaurantImg(category: string, w = 1200, h = 800): string {
  const entry = RESTAURANT_IMG[category];
  if (entry) return foodImg(entry[0], entry[1], w, h);
  return foodImg("restaurant,healthy,food", 400, w, h);
}
