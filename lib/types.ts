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
  partner: boolean; // featured Forkcast partner
  blurb: string;
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
  source: "planned" | "photo" | "manual";
  photo?: string; // data URL for photo-logged meals
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}
