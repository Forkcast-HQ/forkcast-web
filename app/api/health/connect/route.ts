import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";
import { buildAuthUrl } from "@/lib/googleHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts the Google Health (Fitbit) OAuth flow. Called via fetch from the
// Profile page with the user's Supabase bearer token; returns a consent URL
// for the browser to navigate to (can't redirect directly since this is a
// same-origin fetch, not a top-level navigation).
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = supaAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Server not configured (missing SUPABASE_SERVICE_ROLE_KEY) — see docs/GOOGLE_HEALTH_SETUP.md." },
      { status: 500 },
    );
  }

  const state = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await admin.from("oauth_states").insert({
    id: state,
    user_id: userId,
    provider: "google_health",
    expires_at: expiresAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    return NextResponse.json({ url: buildAuthUrl(state) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Config error" }, { status: 500 });
  }
}
