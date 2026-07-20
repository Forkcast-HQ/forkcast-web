// Server-only: resolves a valid access token for a Forkcast user's connected
// device, transparently refreshing it (and persisting the refresh) when
// expired. Provider-aware since migration 0005 (a user can hold both a
// Fitbit/Google Health connection and a WHOOP connection at once). Used by
// app/api/health/sync-meal, app/api/health/daily, and app/api/health/whoop/daily.

import { supaAdmin } from "./supabase-admin";
import { refreshAccessToken as refreshGoogleHealthToken } from "./googleHealth";
import { refreshAccessToken as refreshWhoopToken } from "./whoop";

export type DeviceProvider = "google_health" | "whoop";

const EXPIRY_BUFFER_MS = 60_000; // refresh a minute early to avoid edge races

type RefreshResult = { access_token: string; refresh_token?: string; expires_in: number };
const REFRESHERS: Record<DeviceProvider, (refreshToken: string) => Promise<RefreshResult>> = {
  google_health: refreshGoogleHealthToken,
  whoop: refreshWhoopToken,
};

export async function getValidAccessToken(userId: string, provider: DeviceProvider = "google_health"): Promise<string | null> {
  const admin = supaAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("device_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (!data?.refresh_token) return null;

  const expiresAtMs = data.token_expires_at ? new Date(data.token_expires_at as string).getTime() : 0;
  const stillValid = Boolean(data.access_token) && expiresAtMs - Date.now() > EXPIRY_BUFFER_MS;
  if (stillValid) return data.access_token as string;

  try {
    const tokens = await REFRESHERS[provider](data.refresh_token as string);
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await admin
      .from("device_connections")
      .update({
        access_token: tokens.access_token,
        token_expires_at: tokenExpiresAt,
        // Neither provider always rotates the refresh token on refresh;
        // keep the existing one unless a new one was actually issued.
        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", provider);
    return tokens.access_token;
  } catch (e) {
    console.error(`[healthConnection] ${provider} token refresh failed:`, e);
    return null;
  }
}

/** Auto-sync-meals only applies to the Fitbit/Google Health connection —
 * WHOOP has no nutrition-log endpoint to sync meals into. */
export async function isAutoSyncEnabled(userId: string): Promise<boolean> {
  const admin = supaAdmin();
  if (!admin) return false;
  const { data } = await admin
    .from("device_connections")
    .select("auto_sync_meals")
    .eq("user_id", userId)
    .eq("provider", "google_health")
    .maybeSingle();
  return Boolean(data?.auto_sync_meals);
}
