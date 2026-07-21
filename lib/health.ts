// Client-side helpers for wearable/device integrations (Fitbit via Google
// Health, WHOOP). Every function attaches the current Supabase session's
// access token as a bearer header — see lib/apiAuth.ts for how the server
// verifies it. Requires cloud mode (Supabase configured): there's no
// meaningful "connect a device" in device-only demo mode since there'd be
// nowhere durable to store the token.

import { supa, cloudEnabled } from "./supabase";
import type { LoggedMeal } from "./types";

async function authHeaders(): Promise<Record<string, string> | null> {
  const s = supa();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export interface ProviderStatus {
  connected: boolean;
  connectedAt?: string;
  autoSyncMeals?: boolean;
}

export interface HealthStatus {
  googleHealth: ProviderStatus;
  whoop: ProviderStatus;
}

const DISCONNECTED: ProviderStatus = { connected: false };

/** Fetches connection status for every provider (Fitbit/Google Health,
 * WHOOP) in one round trip — a user can have both connected at once. */
export async function getHealthStatus(): Promise<HealthStatus> {
  if (!cloudEnabled()) return { googleHealth: DISCONNECTED, whoop: DISCONNECTED };
  const headers = await authHeaders();
  if (!headers) return { googleHealth: DISCONNECTED, whoop: DISCONNECTED };
  try {
    const res = await fetch("/api/health/status", { headers });
    if (!res.ok) return { googleHealth: DISCONNECTED, whoop: DISCONNECTED };
    const body: { providers?: Record<string, ProviderStatus> } = await res.json();
    const providers = body.providers ?? {};
    return {
      googleHealth: providers.google_health ?? DISCONNECTED,
      whoop: providers.whoop ?? DISCONNECTED,
    };
  } catch {
    return { googleHealth: DISCONNECTED, whoop: DISCONNECTED };
  }
}

/** Kicks off the Google Health (Fitbit) OAuth flow: fetches a consent URL,
 * then navigates the browser to it. Returns an error string on failure
 * (shown inline). */
export async function connectGoogleHealth(): Promise<string | null> {
  const headers = await authHeaders();
  if (!headers) return "Sign in again and retry.";
  try {
    const res = await fetch("/api/health/connect", { method: "POST", headers });
    const body = await res.json();
    if (!res.ok || !body.url) return body.error ?? "Couldn't start the connection.";
    window.location.href = body.url;
    return null;
  } catch {
    return "Network error — try again.";
  }
}

export async function disconnectGoogleHealth(): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;
  try {
    const res = await fetch("/api/health/disconnect", { method: "POST", headers });
    return res.ok;
  } catch {
    return false;
  }
}

/** Kicks off the WHOOP OAuth flow — same shape as connectGoogleHealth. */
export async function connectWhoop(): Promise<string | null> {
  const headers = await authHeaders();
  if (!headers) return "Sign in again and retry.";
  try {
    const res = await fetch("/api/health/whoop/connect", { method: "POST", headers });
    const body = await res.json();
    if (!res.ok || !body.url) return body.error ?? "Couldn't start the connection.";
    window.location.href = body.url;
    return null;
  } catch {
    return "Network error — try again.";
  }
}

export async function disconnectWhoop(): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;
  try {
    const res = await fetch("/api/health/whoop/disconnect", { method: "POST", headers });
    return res.ok;
  } catch {
    return false;
  }
}

export async function setAutoSyncMeals(enabled: boolean): Promise<void> {
  const headers = await authHeaders();
  if (!headers) return;
  await fetch("/api/health/auto-sync", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  }).catch(() => {});
}

/** Fire-and-forget, called right after logMeal() — never throws into the
 * caller, mirrors cloudPushMeal's resilience in lib/cloud.ts. Logs the
 * actual response body (not just network-level failures) so a failed push
 * is debuggable from the browser console — open DevTools, log a meal, and
 * look for "[health] sync-meal ...". Fitbit/Google Health only: WHOOP has no
 * nutrition-log endpoint. */
export function syncMealToGoogleHealth(meal: LoggedMeal): void {
  if (!cloudEnabled()) return;
  authHeaders().then((headers) => {
    if (!headers) return;
    fetch("/api/health/sync-meal", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ meal }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok || body?.ok === false) {
          console.warn("[health] sync-meal did not succeed:", res.status, body);
        } else {
          console.info("[health] sync-meal ok:", body);
        }
      })
      .catch((e) => console.warn("[health] sync-meal network error:", e));
  });
}

export interface DailyActivity {
  connected: boolean;
  steps?: number;
  activeCaloriesBurned?: number;
}

export async function getDailyActivity(date?: string): Promise<DailyActivity> {
  if (!cloudEnabled()) return { connected: false };
  const headers = await authHeaders();
  if (!headers) return { connected: false };
  try {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    const res = await fetch(`/api/health/daily${qs}`, { headers });
    if (!res.ok) return { connected: false };
    return await res.json();
  } catch {
    return { connected: false };
  }
}

export interface WhoopDaily {
  connected: boolean;
  recoveryScore?: number | null;
  strain?: number | null;
  caloriesBurned?: number | null;
  sleepPerformancePct?: number | null;
  restingHeartRate?: number | null;
  hrvMilli?: number | null;
}

/** Latest recovery score / day strain / sleep performance from WHOOP — no
 * date param, since WHOOP has no per-calendar-day rollup (see
 * lib/whoop.ts getLatestSummary). */
export async function getWhoopDaily(): Promise<WhoopDaily> {
  if (!cloudEnabled()) return { connected: false };
  const headers = await authHeaders();
  if (!headers) return { connected: false };
  try {
    const res = await fetch("/api/health/whoop/daily", { headers });
    if (!res.ok) return { connected: false };
    return await res.json();
  } catch {
    return { connected: false };
  }
}
