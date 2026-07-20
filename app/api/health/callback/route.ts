import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase-admin";
import { exchangeCodeForTokens, getIdentity } from "@/lib/googleHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Google's OAuth redirect lands here as a plain browser GET — no
// Authorization header, no live Supabase session. The `state` param (minted
// in app/api/health/connect and stored in oauth_states) is how we recover
// which Forkcast user was connecting.
function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(new URL(path, origin));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return redirectTo(origin, `/profile?health=error&reason=${encodeURIComponent(oauthError)}`);
  if (!code || !state) return redirectTo(origin, "/profile?health=error&reason=missing_params");

  const admin = supaAdmin();
  if (!admin) return redirectTo(origin, "/profile?health=error&reason=server_not_configured");

  const { data: stateRow, error: stateErr } = await admin
    .from("oauth_states")
    .select("user_id, expires_at")
    .eq("id", state)
    .maybeSingle();

  // Single-use: consume immediately regardless of outcome below.
  await admin.from("oauth_states").delete().eq("id", state);

  if (stateErr || !stateRow) return redirectTo(origin, "/profile?health=error&reason=invalid_state");
  if (new Date(stateRow.expires_at as string).getTime() < Date.now()) {
    return redirectTo(origin, "/profile?health=error&reason=expired_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Shouldn't happen — buildAuthUrl always sends prompt=consent +
      // access_type=offline — but fail loudly rather than silently storing
      // a connection with no way to refresh.
      console.error("[health/callback] token exchange returned no refresh_token");
      return redirectTo(origin, "/profile?health=error&reason=no_refresh_token");
    }

    const identity = await getIdentity(tokens.access_token).catch((e) => {
      console.warn("[health/callback] getIdentity failed (non-fatal):", e);
      return {};
    });
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await admin.from("device_connections").upsert({
      user_id: stateRow.user_id as string,
      provider: "google_health",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokenExpiresAt,
      scope: tokens.scope,
      health_user_id: (identity as { healthUserId?: string }).healthUserId ?? null,
      legacy_user_id: (identity as { legacyUserId?: string }).legacyUserId ?? null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.error("[health/callback] failed:", e);
    return redirectTo(origin, "/profile?health=error&reason=token_exchange_failed");
  }

  return redirectTo(origin, "/profile?health=connected");
}
