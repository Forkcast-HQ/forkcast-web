// Forkcast nutrition engine — real, citable formulas (no black boxes).
//
// BMR: Mifflin-St Jeor (1990) — the most accurate widely-used predictive equation.
// TDEE: BMR x activity factor (Harris-Benedict activity multipliers).
// Calorie target: TDEE +/- deficit/surplus, floored at safe minimums (NIH/ACSM guidance).
// Macros: protein scaled by bodyweight (ISSN position stand), fat ~25% kcal, carbs remainder.

import type {
  ActivityLevel,
  DailyTargets,
  Goal,
  HealthProfile,
  MenuItem,
  Sex,
} from "./types";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary — desk job, little exercise",
  light: "Light — exercise 1-3 days/week",
  moderate: "Moderate — exercise 3-5 days/week",
  active: "Active — exercise 6-7 days/week",
  very_active: "Very active — hard training / physical job",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Lose weight",
  maintain: "Maintain",
  gain: "Build muscle",
};

// ---- Unit helpers -------------------------------------------------
export const lbToKg = (lb: number) => lb * 0.45359237;
export const kgToLb = (kg: number) => kg / 0.45359237;
export const inToCm = (inch: number) => inch * 2.54;
export const cmToIn = (cm: number) => cm / 2.54;
export const ftInToCm = (ft: number, inch: number) => inToCm(ft * 12 + inch);

// ---- BMI ----------------------------------------------------------
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (!m) return 0;
  return weightKg / (m * m);
}

// CDC adult BMI categories (screening tool, not a diagnosis):
// Underweight <18.5 · Healthy 18.5–24.9 · Overweight 25–29.9 ·
// Obesity Class 1 30–34.9 · Class 2 35–39.9 · Class 3 ≥40.
export interface BmiInfo {
  value: number;
  category:
    | "Underweight"
    | "Healthy weight"
    | "Overweight"
    | "Obesity — Class 1"
    | "Obesity — Class 2"
    | "Obesity — Class 3";
  color: string; // tailwind text/bg friendly hex
}

export const BMI_SCREENING_NOTE =
  "BMI is a screening measure, not a diagnosis — it doesn't account for muscle mass, bone density, or body composition. Discuss results with a healthcare provider.";

export function bmiInfo(weightKg: number, heightCm: number): BmiInfo {
  const value = bmi(weightKg, heightCm);
  let category: BmiInfo["category"] = "Healthy weight";
  let color = "#4a7c59"; // muted tones — Modernist palette-adjacent
  if (value < 18.5) {
    category = "Underweight";
    color = "#605d5d";
  } else if (value < 25) {
    category = "Healthy weight";
    color = "#4a7c59";
  } else if (value < 30) {
    category = "Overweight";
    color = "#e0853a";
  } else if (value < 35) {
    category = "Obesity — Class 1";
    color = "#c94b39";
  } else if (value < 40) {
    category = "Obesity — Class 2";
    color = "#ae1800";
  } else {
    category = "Obesity — Class 3";
    color = "#7c1405";
  }
  return { value: Math.round(value * 10) / 10, category, color };
}

// Body weight at the top of the healthy BMI range (for goal context)
export function healthyWeightRangeKg(heightCm: number): [number, number] {
  const m = heightCm / 100;
  return [Math.round(18.5 * m * m), Math.round(24.9 * m * m)];
}

// ---- BMR / TDEE ---------------------------------------------------
export function bmrMifflin(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// ---- Daily targets ------------------------------------------------
const GOAL_DELTA: Record<Goal, number> = {
  lose: -500, // ~0.45 kg (1 lb) / week
  maintain: 0,
  gain: 300, // lean surplus
};

const PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 2.0, // preserve lean mass in a deficit (ISSN: 1.8-2.7 g/kg when cutting)
  maintain: 1.6,
  gain: 1.8,
};

export function computeTargets(p: HealthProfile): DailyTargets {
  const bmr = bmrMifflin(p.weightKg, p.heightCm, p.age, p.sex);
  const tdee = bmr * ACTIVITY_FACTORS[p.activity];
  const floor = p.sex === "male" ? 1500 : 1200; // safe minimum intake
  const calories = Math.max(floor, Math.round((tdee + GOAL_DELTA[p.goal]) / 10) * 10);

  const proteinG = Math.round(PROTEIN_PER_KG[p.goal] * p.weightKg);
  const proteinCal = proteinG * 4;
  const fatCal = calories * 0.27;
  const fatG = Math.round(fatCal / 9);
  const carbCal = Math.max(0, calories - proteinCal - fatCal);
  const carbG = Math.round(carbCal / 4);
  const fiberG = Math.round((calories / 1000) * 14); // Dietary Guidelines: 14g/1000 kcal

  return {
    calories,
    protein: proteinG,
    carbs: carbG,
    fat: fatG,
    fiber: fiberG,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

// ---- Fit Score ----------------------------------------------------
// Explainable 0-100 score: how well a dish fits THIS person's goals for a
// single main meal. Each sub-score is 0..1, weighted, then scaled.
export interface FitResult {
  score: number; // 0..100
  reasons: string[]; // positive highlights
  warnings: string[]; // things to watch
  grade: "A" | "B" | "C" | "D";
}

const MEAL_FRACTION = 0.35; // a main meal ~ 35% of daily budget

function gaussian(x: number, mu: number, sigma: number) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
}

export function fitScore(item: MenuItem, targets: DailyTargets, goal: Goal): FitResult {
  const calT = targets.calories * MEAL_FRACTION;
  const proteinDensity = (item.protein * 4) / Math.max(1, item.calories); // 0..~0.5

  // 1) Calorie appropriateness (asymmetric: overshooting is worse than under)
  const sigma = item.calories > calT ? calT * 0.5 : calT * 0.85;
  const calScore = gaussian(item.calories, calT, sigma);

  // 2) Protein density (>=30% of calories from protein => full marks)
  const proteinScore = clamp01(proteinDensity / 0.3);

  // 3) Fiber (>=8g in a meal is excellent)
  const fiberScore = clamp01(item.fiber / 8);

  // 4) Sodium (<=600mg full marks, >=2000mg zero)
  const sodiumScore = clamp01(1 - (item.sodium - 600) / 1400);

  // 5) Added/total sugar (<=8g full marks, >=35g zero)
  const sugarScore = clamp01(1 - (item.sugar - 8) / 27);

  // Goal-dependent weighting
  let w = { cal: 0.3, protein: 0.3, fiber: 0.12, sodium: 0.14, sugar: 0.14 };
  if (goal === "lose") w = { cal: 0.34, protein: 0.32, fiber: 0.12, sodium: 0.12, sugar: 0.1 };
  if (goal === "gain") w = { cal: 0.22, protein: 0.36, fiber: 0.12, sodium: 0.16, sugar: 0.14 };

  const raw =
    w.cal * calScore +
    w.protein * proteinScore +
    w.fiber * fiberScore +
    w.sodium * sodiumScore +
    w.sugar * sugarScore;

  const score = Math.round(clamp01(raw) * 100);

  // Explanations
  const reasons: string[] = [];
  const warnings: string[] = [];
  if (proteinDensity >= 0.3 || item.protein >= 30) reasons.push("High protein");
  if (item.fiber >= 6) reasons.push("Good fiber");
  if (item.calories <= calT * 1.05) reasons.push("Fits your calorie budget");
  if (item.sodium <= 600) reasons.push("Low sodium");
  if (item.sugar <= 8) reasons.push("Low sugar");

  if (item.calories > calT * 1.3) warnings.push("Calorie-heavy for one meal");
  if (item.sodium > 1400) warnings.push("High sodium");
  if (item.sugar > 25) warnings.push("High sugar");
  if (proteinDensity < 0.15 && item.protein < 20) warnings.push("Low protein");

  let grade: FitResult["grade"] = "D";
  if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";

  return { score, reasons: reasons.slice(0, 3), warnings: warnings.slice(0, 2), grade };
}

export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// ---- Condition-aware advisories -----------------------------------
// Dietary advisories for self-reported conditions (from the design handoff).
// These are informational flags, not medical advice — thresholds follow
// common dietary guidance (e.g., sodium limits for hypertension).
export const CONDITIONS = [
  "Hypertension",
  "Type 2 diabetes",
  "High cholesterol",
  "Heart disease",
  "Kidney disease",
] as const;

export const COMMON_ALLERGENS = [
  "Peanut",
  "Tree nut",
  "Shellfish",
  "Fish",
  "Dairy",
  "Egg",
  "Soy",
  "Sesame",
  "Wheat",
] as const;

export function conditionWarnings(item: MenuItem, conditions: string[] | undefined): string[] {
  if (!conditions?.length) return [];
  const out: string[] = [];
  const has = (c: string) => conditions.includes(c);
  if ((has("Hypertension") || has("Heart disease") || has("Kidney disease")) && item.sodium > 800) {
    out.push("High sodium for your profile");
  }
  if (has("Type 2 diabetes") && item.sugar > 15) {
    out.push("High sugar for your profile");
  }
  if ((has("High cholesterol") || has("Heart disease")) && item.fat > 28) {
    out.push("High fat for your profile");
  }
  return out;
}

// Allergen matches from menu text (advisory — never a guarantee).
export function allergenMatches(item: MenuItem, avoid: string[] | undefined): string[] {
  if (!avoid?.length) return [];
  const text = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  return avoid.filter((a) => text.includes(a.toLowerCase()));
}

// Personalization for RECOMMENDATION lists (top matches, shortlists):
// - dishes matching a profile allergen are EXCLUDED from recommendations
//   (still visible on menus, clearly flagged — we never hide the menu itself);
// - dishes with condition advisories are pushed below clean alternatives.
export function personalAdjust(
  item: MenuItem,
  profile: { avoid?: string[]; conditions?: string[] } | null | undefined,
): { exclude: boolean; penalty: number } {
  if (!profile) return { exclude: false, penalty: 0 };
  if (allergenMatches(item, profile.avoid).length) return { exclude: true, penalty: 100 };
  return { exclude: false, penalty: conditionWarnings(item, profile.conditions).length * 12 };
}

// Derived attribute tags for a dish (used for filter chips / badges)
export function deriveTags(item: MenuItem): string[] {
  const t = new Set(item.tags);
  const proteinDensity = (item.protein * 4) / Math.max(1, item.calories);
  if (item.protein >= 25 || proteinDensity >= 0.3) t.add("high-protein");
  if (item.carbs <= 25) t.add("low-carb");
  if (item.fiber >= 6) t.add("high-fiber");
  if (item.calories <= 500) t.add("under-500");
  return Array.from(t);
}

// Modernist DS: accent red = strong fit, warm neutrals = weaker fit.
export function fitColor(score: number): string {
  if (score >= 80) return "#dd2b0f";
  if (score >= 65) return "#ec3013";
  if (score >= 50) return "#7d7979";
  return "#9b9797";
}
