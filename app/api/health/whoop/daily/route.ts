import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { getValidAccessToken } from "@/lib/healthConnection";
import { getLatestSummary } from "@/lib/whoop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pulls the latest recovery score, day strain, and sleep performance from
// WHOOP for the dashboard. Unlike Google Health's steps/calories (which
// roll up by calendar day), WHOOP has no such rollup — "latest" recovery/
// cycle/sleep is the right unit, matching how the WHOOP app itself works.
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ connected: false }, { status: 401 });

  const accessToken = await getValidAccessToken(userId, "whoop");
  if (!accessToken) return NextResponse.json({ connected: false });

  try {
    const summary = await getLatestSummary(accessToken);
    return NextResponse.json({ connected: true, ...summary });
  } catch (e) {
    console.error("[health/whoop/daily] failed:", e);
    return NextResponse.json({ connected: true, recoveryScore: null, strain: null, caloriesBurned: null, sleepPerformancePct: null, error: "fetch_failed" });
  }
}
