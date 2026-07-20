import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { getValidAccessToken } from "@/lib/healthConnection";
import { getDailyActivity } from "@/lib/googleHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pulls today's steps + active-calories-burned from Fitbit (via the Google
// Health API) for the dashboard's energy-balance tiles. `?date=YYYY-MM-DD`
// optional, defaults to today.
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ connected: false }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return NextResponse.json({ connected: false });

  try {
    const activity = await getDailyActivity(accessToken, date);
    return NextResponse.json({ connected: true, ...activity });
  } catch (e) {
    console.error("[health/daily] failed:", e);
    return NextResponse.json({ connected: true, steps: 0, activeCaloriesBurned: 0, error: "fetch_failed" });
  }
}
