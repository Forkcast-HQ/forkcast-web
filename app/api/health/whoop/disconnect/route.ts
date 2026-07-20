import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { supaAdmin } from "@/lib/supabase-admin";
import { revokeToken } from "@/lib/whoop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = supaAdmin();
  if (!admin) return NextResponse.json({ error: "Server not configured." }, { status: 500 });

  const { data } = await admin
    .from("device_connections")
    .select("access_token")
    .eq("user_id", userId)
    .eq("provider", "whoop")
    .maybeSingle();

  // WHOOP's revoke endpoint takes the access token (not the refresh token,
  // unlike Google's revoke) — see developer.whoop.com/docs "Revoking an
  // Access Token."
  if (data?.access_token) await revokeToken(data.access_token as string);

  const { error } = await admin
    .from("device_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "whoop");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
