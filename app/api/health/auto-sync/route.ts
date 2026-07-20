import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Toggles whether logMeal() auto-pushes to Google Health (see lib/health.ts
// syncMealToGoogleHealth, called from lib/store.tsx logMeal).
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let enabled: boolean;
  try {
    const body = await req.json();
    enabled = Boolean(body.enabled);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const admin = supaAdmin();
  if (!admin) return NextResponse.json({ error: "Server not configured." }, { status: 500 });

  const { error } = await admin
    .from("device_connections")
    .update({ auto_sync_meals: enabled, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
