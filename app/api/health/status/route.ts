import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ connected: false }, { status: 401 });

  const admin = supaAdmin();
  if (!admin) return NextResponse.json({ connected: false });

  const { data } = await admin
    .from("device_connections")
    .select("provider, connected_at, auto_sync_meals")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return NextResponse.json({ connected: false });
  return NextResponse.json({
    connected: true,
    provider: data.provider,
    connectedAt: data.connected_at,
    autoSyncMeals: data.auto_sync_meals,
  });
}
