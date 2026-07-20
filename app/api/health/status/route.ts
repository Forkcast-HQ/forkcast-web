import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reports connection status for every provider a user might have connected
// (Fitbit/Google Health, WHOOP) in one round trip, keyed by provider — the
// Profile page's device picker needs the state of all of them at once, not
// just one, since a user can have both connected simultaneously (see
// migration 0005).
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ providers: {} }, { status: 401 });

  const admin = supaAdmin();
  if (!admin) return NextResponse.json({ providers: {} });

  const { data } = await admin
    .from("device_connections")
    .select("provider, connected_at, auto_sync_meals")
    .eq("user_id", userId);

  const providers: Record<string, { connected: true; connectedAt: string; autoSyncMeals?: boolean }> = {};
  for (const row of data ?? []) {
    providers[row.provider as string] = {
      connected: true,
      connectedAt: row.connected_at as string,
      ...(row.provider === "google_health" ? { autoSyncMeals: Boolean(row.auto_sync_meals) } : {}),
    };
  }

  return NextResponse.json({ providers });
}
