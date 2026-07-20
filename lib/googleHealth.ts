// Server-only helpers for the Google Health API — the cloud successor to
// the Fitbit Web API (the legacy Fitbit Web API is being retired by Google
// in September 2026, so this integration targets the new API from day one).
// Used exclusively by app/api/health/** route handlers; never import this
// into a "use client" component.
//
// Docs: https://developers.google.com/health · Base URL: health.googleapis.com/v4
//
// ⚠️ ON EXACT PAYLOAD SHAPES: Google's public docs (as published mid-2026)
// fully confirm the OAuth/token/identity endpoints and the envelope for
// interval-style data points (Active Energy Burned's REST example is quoted
// directly below), but do NOT yet publish a field-level schema for the
// `nutritionLog` sample body specifically. `NUTRITION_PAYLOAD` below is our
// best-informed first attempt, built by analogy to the confirmed `bodyFat`
// Sample shape (`{ sampleTime: {...}, <value fields> }`) and Google Fit's
// prior nutrient-enum conventions. If a push comes back with a 400, Google's
// error names the actual expected field — that's why every call here
// surfaces the raw response body in the thrown Error instead of a generic
// message. Treat the first real sync as the way you confirm/patch this.

const BASE = "https://health.googleapis.com/v4";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

export const SCOPES = [
  "https://www.googleapis.com/auth/googlehealth.nutrition.writeonly",
  "https://www.googleapis.com/auth/googlehealth.nutrition.readonly",
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.writeonly",
];

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} — see docs/GOOGLE_HEALTH_SETUP.md`);
  return v;
}

/** Builds the Google OAuth 2.0 consent URL. `state` should be a random,
 * single-use token you can look up to recover which Forkcast user is
 * connecting (see app/api/health/connect/route.ts). */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env("GOOGLE_HEALTH_CLIENT_ID"),
    redirect_uri: env("GOOGLE_HEALTH_REDIRECT_URI"),
    response_type: "code",
    access_type: "offline", // required to receive a refresh_token
    prompt: "consent", // forces a refresh_token on every connect, not just the first
    include_granted_scopes: "true",
    scope: SCOPES.join(" "),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

async function postForm(url: string, body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`${url} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  return postForm(TOKEN_URL, {
    client_id: env("GOOGLE_HEALTH_CLIENT_ID"),
    client_secret: env("GOOGLE_HEALTH_CLIENT_SECRET"),
    redirect_uri: env("GOOGLE_HEALTH_REDIRECT_URI"),
    grant_type: "authorization_code",
    code,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return postForm(TOKEN_URL, {
    client_id: env("GOOGLE_HEALTH_CLIENT_ID"),
    client_secret: env("GOOGLE_HEALTH_CLIENT_SECRET"),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => {});
}

export interface Identity {
  legacyUserId?: string;
  healthUserId?: string;
}

/** Confirmed endpoint (developers.google.com/health/endpoints): the token
 * response never contains the Fitbit/Google user id — call this right after
 * first connecting to get and store both. */
export async function getIdentity(accessToken: string): Promise<Identity> {
  const res = await fetch(`${BASE}/users/me/identity`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`getIdentity failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { legacyUserId: data.legacyUserId, healthUserId: data.healthUserId };
}

// --------------------------------------------------------------- Nutrition

export interface MealForSync {
  id: string;
  name: string;
  loggedAt: number; // epoch ms
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number; // mg, matching LoggedMeal
  sugar: number;
}

/** dataPoint id must be lowercase letters/numbers/hyphens, 4-63 chars
 * (confirmed in the `DataPoint.name` format docs) — deriving it from the
 * Forkcast meal id makes re-syncing an edited meal idempotent (create once,
 * PATCH thereafter) instead of creating duplicates. */
function nutritionDataPointId(mealId: string): string {
  return `forkcast-${mealId}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 63);
}

export async function pushNutritionLog(accessToken: string, meal: MealForSync): Promise<void> {
  const dataPointId = nutritionDataPointId(meal.id);
  const name = `users/me/dataTypes/nutrition-log/dataPoints/${dataPointId}`;
  const physicalTime = new Date(meal.loggedAt).toISOString();

  // Best-informed first attempt — see the file header note.
  const body = {
    name,
    dataSource: { recordingMethod: "ACTIVELY_MEASURED" },
    nutritionLog: {
      sampleTime: { physicalTime },
      name: meal.name,
      calories: { kcal: meal.calories },
      nutrients: [
        { nutrient: "PROTEIN", quantity: { grams: meal.protein } },
        { nutrient: "TOTAL_CARBOHYDRATE", quantity: { grams: meal.carbs } },
        { nutrient: "TOTAL_FAT", quantity: { grams: meal.fat } },
        { nutrient: "DIETARY_FIBER", quantity: { grams: meal.fiber } },
        { nutrient: "SODIUM", quantity: { grams: meal.sodium / 1000 } },
        { nutrient: "SUGAR", quantity: { grams: meal.sugar } },
      ],
    },
  };

  let res = await fetch(`${BASE}/users/me/dataTypes/nutrition-log/dataPoints`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    // Already exists (re-sync after the user edited the meal) — update it.
    res = await fetch(`${BASE}/${name}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  if (!res.ok) {
    throw new Error(`nutrition-log push failed: ${res.status} ${await res.text()}`);
  }
}

// ------------------------------------------------- Daily activity (read)

export interface DailyActivityResult {
  steps: number;
  activeCaloriesBurned: number;
}

/** Confirmed schema (developers.google.com/health/endpoints + data-types/calories):
 * `steps` dailyRollUp → { steps: { countSum } }; `active-energy-burned`
 * dailyRollUp → { activeEnergyBurned: { kcalSum } } (the type's own REST
 * example uses a flat `kcal` field for a single interval point — dailyRollUp
 * responses use the `<field>Sum` convention seen on every other rollup type
 * in the data-types index, e.g. StepsRollupValue/countSum). */
async function dailyRollup(accessToken: string, dataType: string, dateStr: string): Promise<number> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const res = await fetch(`${BASE}/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      range: {
        start: { date: { year, month, day }, time: { hours: 0, minutes: 0, seconds: 0 } },
        end: { date: { year, month, day }, time: { hours: 23, minutes: 59, seconds: 59 } },
      },
      windowSizeDays: 1,
    }),
  });
  if (!res.ok) throw new Error(`${dataType} dailyRollUp failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const point = data.rollupDataPoints?.[0];
  if (!point) return 0;
  if (dataType === "steps") return Number(point.steps?.countSum ?? 0);
  if (dataType === "active-energy-burned") {
    return Number(point.activeEnergyBurned?.kcalSum ?? point.activeEnergyBurned?.kcal ?? 0);
  }
  return 0;
}

export async function getDailyActivity(accessToken: string, dateStr: string): Promise<DailyActivityResult> {
  const [steps, activeCaloriesBurned] = await Promise.all([
    dailyRollup(accessToken, "steps", dateStr).catch((e) => {
      console.warn("[googleHealth] steps rollup failed:", e);
      return 0;
    }),
    dailyRollup(accessToken, "active-energy-burned", dateStr).catch((e) => {
      console.warn("[googleHealth] active-energy-burned rollup failed:", e);
      return 0;
    }),
  ]);
  return { steps, activeCaloriesBurned };
}
