// Server-only helpers for the WHOOP API v2 (developer.whoop.com). Used
// exclusively by app/api/health/whoop/** route handlers; never import this
// into a "use client" component.
//
// WHOOP is read-only for Forkcast: it has no nutrition-log endpoint (unlike
// the Google Health/Fitbit integration in lib/googleHealth.ts), so there is
// no meal auto-sync here — just recovery score, day strain, and sleep
// performance surfaced on the dashboard.
//
// Endpoints confirmed directly from developer.whoop.com/docs (OAuth page +
// API reference) rather than guessed, to avoid repeating the trial-and-error
// that the Google Health nutrition-log payload took:
//   - Auth URL:  https://api.prod.whoop.com/oauth/oauth2/auth
//   - Token URL: https://api.prod.whoop.com/oauth/oauth2/token
//   - Data API base: https://api.prod.whoop.com/developer
//   - Revoke: DELETE /developer/v2/user/access
//   - Recovery: GET /developer/v2/recovery (paginated, sorted newest-first)
//   - Cycle (strain): GET /developer/v2/cycle (paginated, sorted newest-first)
//   - Sleep: GET /developer/v2/activity/sleep (paginated, sorted newest-first)

const AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const REVOKE_URL = "https://api.prod.whoop.com/developer/v2/user/access";
const API_BASE = "https://api.prod.whoop.com/developer";

// `offline` is required to receive a refresh_token at all (WHOOP omits it
// otherwise). read:profile identifies the account on first connect.
export const SCOPES = [
  "read:recovery",
  "read:cycles",
  "read:sleep",
  "read:profile",
  "offline",
];

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} — see docs/WHOOP_SETUP.md`);
  return v;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env("WHOOP_CLIENT_ID"),
    redirect_uri: env("WHOOP_REDIRECT_URI"),
    response_type: "code",
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
    client_id: env("WHOOP_CLIENT_ID"),
    client_secret: env("WHOOP_CLIENT_SECRET"),
    redirect_uri: env("WHOOP_REDIRECT_URI"),
    grant_type: "authorization_code",
    code,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  // WHOOP's docs sample includes `scope: "offline"` on the refresh request
  // (see developer.whoop.com/docs/developing/oauth#refreshing-an-access-token).
  return postForm(TOKEN_URL, {
    client_id: env("WHOOP_CLIENT_ID"),
    client_secret: env("WHOOP_CLIENT_SECRET"),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: "offline",
  });
}

export async function revokeToken(accessToken: string): Promise<void> {
  await fetch(REVOKE_URL, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {});
}

export interface WhoopProfile {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export async function getProfile(accessToken: string): Promise<WhoopProfile> {
  const res = await fetch(`${API_BASE}/v2/user/profile/basic`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`getProfile failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return {
    userId: data.user_id != null ? String(data.user_id) : undefined,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
  };
}

export interface WhoopDailyResult {
  recoveryScore: number | null;
  restingHeartRate: number | null;
  hrvMilli: number | null;
  strain: number | null;
  caloriesBurned: number | null;
  sleepPerformancePct: number | null;
}

const KJ_PER_KCAL = 4.184;

async function getLatest(accessToken: string, path: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${API_BASE}${path}?limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const record = data.records?.[0];
  return record ?? null;
}

/** Pulls the most recent recovery, cycle (strain), and sleep records — WHOOP
 * has no per-calendar-day rollup like Google Health's steps/calories, so
 * "latest" is the right unit here (matches how the WHOOP app itself
 * surfaces "today's recovery" / "today's strain"). */
export async function getLatestSummary(accessToken: string): Promise<WhoopDailyResult> {
  const [recovery, cycle, sleep] = await Promise.all([
    getLatest(accessToken, "/v2/recovery").catch((e) => {
      console.warn("[whoop] recovery fetch failed:", e);
      return null;
    }),
    getLatest(accessToken, "/v2/cycle").catch((e) => {
      console.warn("[whoop] cycle fetch failed:", e);
      return null;
    }),
    getLatest(accessToken, "/v2/activity/sleep").catch((e) => {
      console.warn("[whoop] sleep fetch failed:", e);
      return null;
    }),
  ]);

  const recoveryScore = recovery as { score_state?: string; score?: { recovery_score?: number; resting_heart_rate?: number; hrv_rmssd_milli?: number } } | null;
  const cycleScore = cycle as { score_state?: string; score?: { strain?: number; kilojoule?: number } } | null;
  const sleepScore = sleep as { score_state?: string; score?: { sleep_performance_percentage?: number } } | null;

  const kilojoule = cycleScore?.score_state === "SCORED" ? cycleScore.score?.kilojoule ?? null : null;

  return {
    recoveryScore: recoveryScore?.score_state === "SCORED" ? recoveryScore.score?.recovery_score ?? null : null,
    restingHeartRate: recoveryScore?.score_state === "SCORED" ? recoveryScore.score?.resting_heart_rate ?? null : null,
    hrvMilli: recoveryScore?.score_state === "SCORED" ? recoveryScore.score?.hrv_rmssd_milli ?? null : null,
    strain: cycleScore?.score_state === "SCORED" ? cycleScore.score?.strain ?? null : null,
    // WHOOP reports energy expenditure as kilojoules (the cycle's `score.
    // kilojoule` field) — converted to kcal here since that's the unit
    // Forkcast uses everywhere else (dashboard, Fitbit sync).
    caloriesBurned: kilojoule != null ? Math.round(kilojoule / KJ_PER_KCAL) : null,
    sleepPerformancePct: sleepScore?.score_state === "SCORED" ? sleepScore.score?.sleep_performance_percentage ?? null : null,
  };
}
