import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase-admin";
import { exchangeCodeForTokens, getProfile } from "@/lib/whoop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// WHOOP's OAuth redirect lands here as a plain browser GET — same shape as
// app/api/health/callback/route.ts (Google Health): no Authorization header,
// no live Supabase session, so the `state` param (minted in
// app/api/health/whoop/connect, stored in oauth_states) recovers which
// Forkcast user was connecting.
function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(new URL(path, origin));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return redirectTo(origin, `/profile?health=error&provider=whoop&reason=${encodeURIComponent(oauthError)}`);
  if (!code || !state) return redirectTo(origin, "/profile?health=error&provider=whoop&reason=missing_params");

  const admin = supaAdmin();
  if (!admin) return redirectTo(origin, "/profile?health=error&provider=whoop&reason=server_not_configured");

  const { data: stateRow, error: stateErr } = await admin
    .from("oauth_states")
    .select("user_id, expires_at")
    .eq("id", state)
    .maybeSingle();

  // Single-use: consume immediately regardless of outcome below.
  await admin.from("oauth_states").delete().eq("id", state);

  if (stateErr || !stateRow) return redirectTo(origin, "/profile?health=error&provider=whoop&reason=invalid_state");
  if (new Date(stateRow.expires_at as string).getTime() < Date.now()) {
    return redirectTo(origin, "/profile?health=error&provider=whoop&reason=expired_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      console.error("[health/whoop/callback] token exchange returned no refresh_token");
      return redirectTo(origin, "/profile?health=error&provider=whoop&reason=no_refresh_token");
    }

    const profile = await getProfile(tokens.access_token).catch((e) => {
      console.warn("[health/whoop/callback] getProfile failed (non-fatal):", e);
      return {};
    });
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await admin.from("device_connections").upsert(
      {
        user_id: stateRow.user_id as string,
        provider: "whoop",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
        scope: tokens.scope,
        health_user_id: (profile as { userId?: string }).userId ?? null,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    );
    if (error) throw error;
  } catch (e) {
    console.error("[health/whoop/callback] failed:", e);
    return redirectTo(origin, "/profile?health=error&provider=whoop&reason=token_exchange_failed");
  }

  return redirectTo(origin, "/profile?health=connected&provider=whoop");
}
