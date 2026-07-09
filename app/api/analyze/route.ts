import { NextResponse } from "next/server";

// POST /api/analyze  { image: "data:image/jpeg;base64,..." } -> nutrition estimate.
// GET  /api/analyze  -> lists the Groq models your account can access (debug).
//
// Uses a Groq vision model (OpenAI-compatible). Because model availability
// varies by account/tier and Groq deprecates models over time, this route
// AUTO-DISCOVERS an accessible vision model and remembers what worked.
// Key stays server-side (GROQ_API_KEY). Never runs on the static export build.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_BASE = "https://api.groq.com/openai/v1";

const PROMPT = `You are a nutrition estimator. Look at this meal photo and estimate its nutrition for the portion actually shown.
Return ONLY a JSON object (no prose, no code fences) with exactly these keys:
{"name": string, "confidence": number 0-1, "calories": integer kcal, "protein": integer grams, "carbs": integer grams, "fat": integer grams, "fiber": integer grams, "sodium": integer mg, "sugar": integer grams, "items": string[] of the main components}
Be realistic about portion size. If unsure, give your best estimate and lower the confidence.`;

// Remember the model that worked (persists for the life of the dev server).
let cachedModel: string | null = null;

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function extractJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function listModels(key: string): Promise<string[]> {
  const res = await fetch(`${GROQ_BASE}/models`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) return [];
  const body = await res.json();
  return (body?.data ?? []).map((m: { id: string }) => m.id);
}

// Rank accessible model ids by how likely they are to be a good vision model.
function pickVisionModel(ids: string[]): string | undefined {
  const score = (id: string) => {
    const l = id.toLowerCase();
    if (l.includes("maverick")) return 7;
    if (l.includes("scout")) return 6;
    if (l.includes("-vl") || l.includes("vl-") || l.includes("vision")) return 5;
    if (l.includes("llama-4")) return 4;
    if (l.includes("llava")) return 3;
    return 0;
  };
  return ids.filter((id) => score(id) > 0).sort((a, b) => score(b) - score(a))[0];
}

async function callVision(key: string, model: string, image: string) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    }),
  });
  return { ok: res.ok, status: res.status, raw: await res.text() };
}

function isModelError(status: number, raw: string) {
  if (status === 404) return true;
  const l = raw.toLowerCase();
  return status === 400 && (l.includes("model") && (l.includes("does not exist") || l.includes("decommission") || l.includes("not found") || l.includes("access")));
}

export async function GET() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
  const ids = await listModels(key);
  return NextResponse.json({ available: ids.sort(), suggestedVisionModel: pickVisionModel(ids) ?? null });
}

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "GROQ_API_KEY is not set on the server." }, { status: 500 });

  let image: string | undefined;
  try {
    ({ image } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!image || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "Missing image data URL." }, { status: 400 });
  }

  try {
    let model = cachedModel || process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
    let r = await callVision(key, model, image);

    // If the configured model isn't accessible, discover one that is and retry.
    if (!r.ok && isModelError(r.status, r.raw)) {
      const ids = await listModels(key);
      const picked = pickVisionModel(ids);
      if (!picked) {
        return NextResponse.json(
          { error: `No vision-capable model is available on this Groq account. Models: ${ids.join(", ") || "(none)"}` },
          { status: 502 },
        );
      }
      model = picked;
      r = await callVision(key, model, image);
    }

    if (!r.ok) {
      let detail = r.raw.slice(0, 300);
      try {
        detail = JSON.parse(r.raw)?.error?.message ?? detail;
      } catch {
        /* keep raw */
      }
      return NextResponse.json({ error: `Groq ${r.status}: ${detail}` }, { status: 502 });
    }

    const content: string = JSON.parse(r.raw)?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) return NextResponse.json({ error: "Model did not return valid JSON." }, { status: 502 });

    cachedModel = model; // remember what worked
    return NextResponse.json({
      name: String(parsed.name || "Meal"),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
      calories: num(parsed.calories),
      protein: num(parsed.protein),
      carbs: num(parsed.carbs),
      fat: num(parsed.fat),
      fiber: num(parsed.fiber),
      sodium: num(parsed.sodium),
      sugar: num(parsed.sugar),
      items: Array.isArray(parsed.items) ? parsed.items.map(String).slice(0, 8) : [],
      model,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Request to Groq failed: ${msg}` }, { status: 502 });
  }
}
