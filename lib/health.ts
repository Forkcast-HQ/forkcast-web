// Client-side helpers for the Google Health (Fitbit) integration. Every
// function attaches the current Supabase session's access token as a bearer
// header — see lib/apiAuth.ts for how the server verifies it. Requires cloud
// mode (Supabase configured): there's no meaningful "connect Fitbit" in
// device-only demo mode since there'd be nowhere durable to store the token.

import { supa, cloudEnabled } from "./supabase";
import type { LoggedMeal } from "./types";

async function authHeaders(): Promise<Record<string, string> | null> {
  const s = supa();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export interface HealthStatus {
  connected: boolean;
  provider?: string;
  connectedAt?: string;
  autoSyncMeals?: boolean;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  if (!cloudEnabled()) return { connected: false };
  const headers = await authHeaders();
  if (!headers) return { connected: false };
  try {
    const res = await fetch("/api/health/status", { headers });
    if (!res.ok) return { connected: false };
    return await res.json();
  } catch {
    return { connected: false };
  }
}

/** Kicks off the OAuth flow: fetches a consent URL, then navigates the
 * browser to it. Returns an error string on failure (shown inline). */
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
 * caller, mirrors cloudPushMeal's resilience in lib/cloud.ts. */
export function syncMealToGoogleHealth(meal: LoggedMeal): void {
  if (!cloudEnabled()) return;
  authHeaders().then((headers) => {
    if (!headers) return;
    fetch("/api/health/sync-meal", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ meal }),
    }).catch((e) => console.warn("[health] sync-meal failed:", e));
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
