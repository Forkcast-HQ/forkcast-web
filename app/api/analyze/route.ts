import { NextResponse } from "next/server";

// POST /api/analyze  { image: "data:image/jpeg;base64,..." }
// Calls a Groq vision model (OpenAI-compatible) to estimate a meal's nutrition.
// Key stays server-side (GROQ_API_KEY). Never runs on the static export build.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Maverick = most accurate vision model on Groq; override via GROQ_MODEL.
const DEFAULT_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";

const PROMPT = `You are a nutrition estimator. Look at this meal photo and estimate its nutrition for the portion actually shown.
Return ONLY a JSON object (no prose, no code fences) with exactly these keys:
{"name": string, "confidence": number 0-1, "calories": integer kcal, "protein": integer grams, "carbs": integer grams, "fat": integer grams, "fiber": integer grams, "sodium": integer mg, "sugar": integer grams, "items": string[] of the main components}
Be realistic about portion size. If unsure, give your best estimate and lower the confidence.`;

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function extractJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GROQ_API_KEY is not set on the server." }, { status: 500 });
  }

  let image: string | undefined;
  try {
    ({ image } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!image || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "Missing image data URL." }, { status: 400 });
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  try {
    const groqRes = await fetch(GROQ_URL, {
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

    const raw = await groqRes.text();
    if (!groqRes.ok) {
      let detail = raw.slice(0, 300);
      try {
        detail = JSON.parse(raw)?.error?.message ?? detail;
      } catch {
        /* keep raw */
      }
      return NextResponse.json({ error: `Groq ${groqRes.status}: ${detail}` }, { status: 502 });
    }

    const body = JSON.parse(raw);
    const content: string = body?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      return NextResponse.json({ error: "Model did not return valid JSON." }, { status: 502 });
    }

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
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Request to Groq failed: ${msg}` }, { status: 502 });
  }
}
