// ---------------------------------------------------------------------------
// Forkcast AI layer (swappable).
//
// TODAY: realistic, deterministic mock so the demo is fully functional with no
// API keys. The estimates are drawn from a curated library of real dishes.
//
// PRODUCTION: flip `USE_REAL_AI` to true. `analyzeMealPhoto` will POST the image
// to /api/analyze, which calls Claude (Anthropic) vision with a structured
// schema to return calories + macros. The rest of the app is unchanged — this
// file is the single integration seam.
//
// NOTE: the /api/analyze route was removed so the app could be statically
// exported to GitHub Pages. Restore it from docs/snippets/analyze-route.ts.txt
// when deploying to an SSR host (Netlify/Vercel/Node).
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
}

const USE_REAL_AI = false;

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

function hashFile(file: File): number {
  const s = `${file.name}-${file.size}-${file.type}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function analyzeMealPhoto(file: File): Promise<MealEstimate> {
  if (USE_REAL_AI) {
    const body = new FormData();
    body.append("image", file);
    const res = await fetch("/api/analyze", { method: "POST", body });
    if (!res.ok) throw new Error("analysis failed");
    return (await res.json()) as MealEstimate;
  }

  // --- MOCK ---
  await delay(1300 + (hashFile(file) % 700)); // feels like real inference
  const base = LIBRARY[hashFile(file) % LIBRARY.length];
  // small deterministic jitter so repeated uploads vary a little
  const j = (hashFile(file) % 11) - 5; // -5..5
  const scale = 1 + j / 100;
  return {
    ...base,
    calories: Math.round((base.calories * scale) / 5) * 5,
    protein: Math.round(base.protein * scale),
    carbs: Math.round(base.carbs * scale),
    fat: Math.round(base.fat * scale),
  };
}

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
