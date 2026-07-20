// Server-only: resolves a valid Google Health API access token for a
// Forkcast user, transparently refreshing it (and persisting the refresh)
// when expired. Used by app/api/health/sync-meal and app/api/health/daily.

import { supaAdmin } from "./supabase-admin";
import { refreshAccessToken } from "./googleHealth";

const EXPIRY_BUFFER_MS = 60_000; // refresh a minute early to avoid edge races

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const admin = supaAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("device_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.refresh_token) return null;

  const expiresAtMs = data.token_expires_at ? new Date(data.token_expires_at as string).getTime() : 0;
  const stillValid = Boolean(data.access_token) && expiresAtMs - Date.now() > EXPIRY_BUFFER_MS;
  if (stillValid) return data.access_token as string;

  try {
    const tokens = await refreshAccessToken(data.refresh_token as string);
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await admin
      .from("device_connections")
      .update({
        access_token: tokens.access_token,
        token_expires_at: tokenExpiresAt,
        // Google doesn't always rotate the refresh token on refresh; keep
        // the existing one unless a new one was actually issued.
        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return tokens.access_token;
  } catch (e) {
    console.error("[healthConnection] token refresh failed:", e);
    return null;
  }
}

export async function isAutoSyncEnabled(userId: string): Promise<boolean> {
  const admin = supaAdmin();
  if (!admin) return false;
  const { data } = await admin
    .from("device_connections")
    .select("auto_sync_meals")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.auto_sync_meals);
}
