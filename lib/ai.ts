// ---------------------------------------------------------------------------
// Palatify AI layer (swappable).
//
// REAL AI: analyzeMeal always POSTs to /api/analyze, which calls a vision
// model server-side. On deployments without the API (static export) or
// without keys, the request fails and the caller falls back to the clearly
// labeled sample below — no build flag involved.
//
// MOCK: deterministic, realistic estimates so the demo works with no key.
// ---------------------------------------------------------------------------

export interface MealEstimate {
  name: string;
  confidence: number; // 0..1
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  items: string[]; // detected components
  source?: "ai" | "mock";
}


// Curated, realistic estimates the mock can return.
const LIBRARY: MealEstimate[] = [
  { name: "Grilled chicken & quinoa bowl", confidence: 0.91, calories: 560, protein: 44, carbs: 52, fat: 18, fiber: 9, sodium: 680, sugar: 7, items: ["grilled chicken breast", "quinoa", "roasted vegetables", "tahini drizzle"] },
  { name: "Salmon poke bowl", confidence: 0.88, calories: 620, protein: 34, carbs: 64, fat: 24, fiber: 8, sodium: 820, sugar: 9, items: ["salmon", "white rice", "edamame", "avocado", "spicy mayo"] },
  { name: "Chicken burrito bowl", confidence: 0.86, calories: 640, protein: 42, carbs: 66, fat: 22, fiber: 14, sodium: 900, sugar: 6, items: ["grilled chicken", "brown rice", "black beans", "pico de gallo", "guacamole"] },
  { name: "Greek salad with feta", confidence: 0.83, calories: 430, protein: 16, carbs: 24, fat: 30, fiber: 7, sodium: 760, sugar: 8, items: ["romaine", "feta", "olives", "cucumber", "olive oil dressing"] },
  { name: "Avocado toast with eggs", confidence: 0.9, calories: 470, protein: 22, carbs: 38, fat: 26, fiber: 11, sodium: 640, sugar: 4, items: ["sourdough", "avocado", "two eggs", "chili flakes"] },
  { name: "Beef & cheese burger with fries", confidence: 0.84, calories: 980, protein: 42, carbs: 78, fat: 54, fiber: 5, sodium: 1340, sugar: 12, items: ["beef patty", "cheese", "brioche bun", "french fries"] },
  { name: "Pad thai with shrimp", confidence: 0.79, calories: 720, protein: 28, carbs: 92, fat: 26, fiber: 5, sodium: 1180, sugar: 22, items: ["rice noodles", "shrimp", "peanuts", "tamarind sauce", "bean sprouts"] },
  { name: "Margherita pizza (2 slices)", confidence: 0.82, calories: 620, protein: 26, carbs: 76, fat: 24, fiber: 4, sodium: 1220, sugar: 8, items: ["pizza dough", "mozzarella", "tomato", "basil"] },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Keyword routing so the demo mock respects a user's description.
const KEYWORDS: [RegExp, number][] = [
  [/burrito|mexican|taco/i, 2],
  [/poke|salmon|sushi|fish/i, 1],
  [/salad|greens|feta|greek/i, 3],
  [/toast|avocado|egg|breakfast/i, 4],
  [/burger|fries|cheeseburger/i, 5],
  [/pad thai|noodle|shrimp|asian/i, 6],
  [/pizza|slice|margherita/i, 7],
  [/chicken|quinoa|bowl|grill/i, 0],
];

// Deterministic realistic estimate (no key needed). `seed` = image data URL or
// description; `note` (the user's own words) steers dish choice and the name.
export async function mockEstimate(seed: string, note?: string): Promise<MealEstimate> {
  const h = hashStr(seed);
  await delay(1100 + (h % 700)); // feels like inference
  let base = LIBRARY[h % LIBRARY.length];
  if (note) {
    const hit = KEYWORDS.find(([re]) => re.test(note));
    if (hit) base = LIBRARY[hit[1]];
  }
  const j = (h % 11) - 5;
  const scale = 1 + j / 100;
  return {
    ...base,
    name: note && note.length > 3 ? note.slice(0, 60) : base.name,
    confidence: note ? Math.min(0.95, base.confidence + 0.06) : base.confidence,
    calories: Math.round((base.calories * scale) / 5) * 5,
    protein: Math.round(base.protein * scale),
    carbs: Math.round(base.carbs * scale),
    fat: Math.round(base.fat * scale),
    source: "mock",
  };
}

export interface AnalyzeOpts {
  image?: string; // (downscaled) JPEG data URL
  note?: string; // user's description of contents/quantity — biggest accuracy lever
  prior?: MealEstimate | null; // previous estimate, for "fix results" re-runs
}

// Real analysis via the server route. Works photo-only, description-only, or
// both. Throws with a readable message on failure so the UI can surface it.
export async function analyzeMeal({ image, note, prior }: AnalyzeOpts): Promise<MealEstimate> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      note,
      prior: prior
        ? JSON.stringify({ name: prior.name, calories: prior.calories, protein: prior.protein, carbs: prior.carbs, fat: prior.fat })
        : undefined,
    }),
  });
  if (!res.ok) {
    let msg = `Analysis failed (${res.status})`;
    try {
      const e = await res.json();
      if (e?.error) msg = e.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as MealEstimate;
  return { ...data, source: "ai" };
}

// Back-compat convenience.
export const analyzeMealPhoto = (image: string) => analyzeMeal({ image });

// AI coaching one-liner for the dashboard. Mock heuristic now; a real Claude
// prompt later can make it conversational and goal-aware.
export function coachTip(opts: {
  goal: string;
  calLeft: number;
  proteinLeft: number;
  name?: string;
}): string {
  const who = opts.name ? `${opts.name}, ` : "";
  if (opts.proteinLeft > 40)
    return `${who}you're ${opts.proteinLeft}g short on protein. A grilled-chicken or poke bowl would close most of that gap.`;
  if (opts.calLeft < 200 && opts.calLeft >= 0)
    return `${who}you're almost at your calorie target — a light salad or broth-based soup keeps you on track.`;
  if (opts.calLeft < 0)
    return `${who}you're ${Math.abs(opts.calLeft)} calories over today. No drama — aim a little lighter tomorrow.`;
  return `${who}you've got room for a solid meal. Filter for "Best fit" and pick something 500-650 calories with 30g+ protein.`;
}
