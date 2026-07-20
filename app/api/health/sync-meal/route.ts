import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiAuth";
import { getValidAccessToken, isAutoSyncEnabled } from "@/lib/healthConnection";
import { pushNutritionLog, type MealForSync } from "@/lib/googleHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called fire-and-forget from lib/health.ts syncMealToGoogleHealth(), right
// after logMeal() — mirrors the existing cloudPushMeal fire-and-forget
// pattern in lib/store.tsx. Never blocks or breaks meal logging: any
// failure here is swallowed by the caller.
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  let meal: MealForSync;
  try {
    const body = await req.json();
    meal = body.meal;
    if (!meal || typeof meal.calories !== "number" || !meal.id) throw new Error("bad meal payload");
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const enabled = await isAutoSyncEnabled(userId);
  if (!enabled) return NextResponse.json({ ok: false, error: "not_connected_or_disabled" });

  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return NextResponse.json({ ok: false, error: "not_connected" });

  try {
    await pushNutritionLog(accessToken, meal);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[health/sync-meal] push failed:", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "push_failed" }, { status: 502 });
  }
}
