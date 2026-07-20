import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";
import { buildAuthUrl } from "@/lib/whoop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts the WHOOP OAuth flow — mirrors app/api/health/connect/route.ts
// (Google Health), but WHOOP is its own app registration with its own
// redirect URI, so it gets its own connect/callback pair rather than
// branching the existing Fitbit routes by a query param.
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = supaAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Server not configured (missing SUPABASE_SERVICE_ROLE_KEY) — see docs/WHOOP_SETUP.md." },
      { status: 500 },
    );
  }

  const state = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await admin.from("oauth_states").insert({
    id: state,
    user_id: userId,
    provider: "whoop",
    expires_at: expiresAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    return NextResponse.json({ url: buildAuthUrl(state) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Config error" }, { status: 500 });
  }
}
