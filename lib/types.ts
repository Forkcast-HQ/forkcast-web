// Shared domain types for Forkcast

export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface HealthProfile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  // Optional preferences
  dietary: string[]; // e.g. ["vegetarian", "gluten-free"]
  avoid: string[]; // allergens / dislikes
  conditions?: string[]; // self-reported conditions (advisory flags only)
  createdAt: number;
}

export interface DailyTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  bmr: number;
  tdee: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number; // mg
  sugar: number; // g
  category: string; // image + grouping key
  tags: string[]; // dietary + attribute tags
  // Partner-provided dish photo (licensed via the partner agreement).
  // When present it overrides the stock category photo.
  photoUrl?: string;
}

export interface Restaurant {
  slug: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  address: string;
  priceLevel: 1 | 2 | 3;
  rating: number;
  reviews: number;
  deliveryMins: [number, number];
  distanceMi: number;
  lat: number;
  lng: number;
  partner: boolean; // featured Forkcast partner (demo verification pattern)
  // Nutrition-data provenance for real restaurants:
  //  "published" — values from the restaurant's own public nutrition disclosure
  //  "estimated" — Forkcast engine estimates from the public menu
  // (undefined = original demo catalog entry)
  dataSource?: "published" | "estimated";
  sourceNote?: string; // what was published, what was estimated, retrieval date
  blurb: string;
  // Partner-provided hero photo (licensed via the partner agreement).
  photoUrl?: string;
  category: string; // hero image key
  tags: string[];
  menu: MenuItem[];
}

export interface LoggedMeal {
  id: string;
  restaurantSlug?: string;
  restaurantName?: string;
  itemId?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  loggedAt: number; // epoch ms
  source: "planned" | "photo" | "manual" | "order";
  photo?: string; // data URL for photo-logged meals
  // Provenance (order-confirmed meals) — evidence trail for every entry
  orderRef?: string; // e.g. "F-1042"
  portion?: number; // fraction consumed, 1 = full serving
  confidence?: "partner-verified" | "estimated"; // nutrition-data confidence
  userConfidence?: "as-served" | "modified" | "unsure"; // diner's own confidence in the entry
  note?: string; // substitutions / user corrections
}

// ---- Ordering ------------------------------------------------------

export type Fulfillment = "pickup" | "delivery" | "partner";

export interface CartLine {
  slug: string; // restaurant slug (one restaurant per basket)
  itemId: string;
  qty: number;
  note?: string; // substitution / preparation request
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  note?: string; // substitution / preparation request

  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

export type OrderStatus = "sent" | "accepted" | "preparing" | "ready";

// Cross-surface sync (design-handoff protocol; localStorage is the prototype
// transport — replace with a real backend channel in production)
export interface LiveOrderBus {
  orderId: string;
  ref: string;
  slug: string;
  restName: string;
  customer: string;
  placedAt: number;
  fulfill: Fulfillment;
  items: { itemId: string; name: string; qty: number; price: number; calories: number; note?: string }[];
  flags: string[]; // allergy / diet notices for the kitchen
  status: OrderStatus;
  prepMin?: number;
  claimed: boolean; // a terminal has taken over status updates
  ts: number;
}

// Versioned, timestamped menu correction (never silent)
export interface MenuCorrection {
  id: string;
  slug: string;
  itemId: string;
  dishName: string;
  field: "calories" | "protein" | "carbs" | "fat" | "fiber" | "sodium" | "sugar";
  oldValue: number;
  newValue: number;
  version: number;
  correctedAt: number;
  source: "restaurant-demo"; // demo terminal on this device — no restaurant is authorized yet
}

export interface Order {
  id: string;
  ref: string; // human order reference, e.g. "F-1042"
  slug: string;
  restaurantName: string;
  partner: boolean; // partner-verified nutrition data at time of order
  items: OrderItem[];
  fulfill: Fulfillment;
  placedAt: number; // epoch ms
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  logged: boolean; // meal-log confirmation completed
  dismissedLog?: boolean; // user chose not to log
  integration: "prototype"; // no live restaurant/payment integration — never fake it
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}
