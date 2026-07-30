import { NextResponse } from "next/server";

// POST /api/analyze  { image?: "data:image/jpeg;base64,...", note?, prior? }
//   -> structured nutrition estimate
// GET  /api/analyze  -> provider/model debug info.
//
// One provider: Anthropic Claude, reached through the DataRobot LLM gateway
// (OpenAI-compatible wire format), key held server-side and never exposed.
//
// The Gemini and Groq paths that used to sit behind this — including a
// runtime model-discovery dance that probed the Groq account for anything
// vision-capable — are gone. Neither was ever configured in production, so
// every estimate the app has produced came from Claude; the fallbacks only
// made the file read as if the answer might come from somewhere else.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Anthropic model served through the gateway. */
const DEFAULT_MODEL = "anthropic/claude-opus-4-8";

const visionModel = () =>
  process.env.DATAROBOT_VISION_MODEL || process.env.DATAROBOT_CHAT_MODEL || DEFAULT_MODEL;

const SCHEMA = `Return ONLY a JSON object (no prose, no code fences) with exactly these keys:
{"name": string, "confidence": number 0-1, "calories": integer kcal, "protein": integer grams, "carbs": integer grams, "fat": integer grams, "fiber": integer grams, "sodium": integer mg, "sugar": integer grams, "items": string[] of the main components}
Be realistic about portion size. If unsure, give your best estimate and lower the confidence.`;

// The user's own description is the single biggest accuracy lever (it names
// hidden ingredients and quantities a photo can't show), so it always
// outranks visual guesses. `prior` supports "fix results" re-runs.
function buildPrompt(note?: string, prior?: string, hasImage = true): string {
  let p = hasImage
    ? "You are a nutrition estimator. Look at this meal photo and estimate its nutrition for the portion actually shown."
    : "You are a nutrition estimator. Estimate the nutrition of the meal the user describes, for the described portion.";
  if (note) {
    p += `\nThe user describes the meal as: "${note}". Trust the user's stated contents, preparation, and quantities over visual guesses — raise your confidence when the description is specific.`;
  }
  if (prior) {
    p += `\nYour previous estimate was ${prior}. The user says it needs correcting per their description above; produce a corrected estimate rather than repeating it.`;
  }
  return p + "\n" + SCHEMA;
}

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

async function callClaudeVision(token: string, image: string | undefined, prompt: string) {
  const base = (process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2").replace(/\/$/, "");
  const res = await fetch(`${base}/genai/llmgw/chat/completions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: visionModel(),
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: image
            ? [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: image } },
              ]
            : prompt,
        },
      ],
    }),
  });
  return { ok: res.ok, status: res.status, raw: await res.text() };
}

function shapeResponse(parsed: Record<string, unknown>, model: string) {
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
}

export async function GET() {
  const configured = Boolean(process.env.DATAROBOT_API_TOKEN);
  return NextResponse.json({
    provider: "anthropic",
    configured,
    endpoint: process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2",
    visionModel: visionModel(),
    chatModel: process.env.DATAROBOT_CHAT_MODEL || DEFAULT_MODEL,
  });
}

export async function POST(req: Request) {
  const token = process.env.DATAROBOT_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "No AI key configured. Set DATAROBOT_API_TOKEN in .env.local." },
      { status: 500 },
    );
  }

  let image: string | undefined;
  let note: string | undefined;
  let prior: string | undefined;
  try {
    const body = await req.json();
    image = body.image;
    note = typeof body.note === "string" ? body.note.slice(0, 400).trim() || undefined : undefined;
    prior = typeof body.prior === "string" ? body.prior.slice(0, 600) : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (image && !image.startsWith("data:image")) {
    return NextResponse.json({ error: "Unsupported image data URL." }, { status: 400 });
  }
  if (!image && (!note || note.length < 3)) {
    return NextResponse.json({ error: "Provide a meal photo or a description." }, { status: 400 });
  }

  const prompt = buildPrompt(note, prior, Boolean(image));

  try {
    const r = await callClaudeVision(token, image, prompt);
    if (!r.ok) {
      let detail = r.raw.slice(0, 200);
      try {
        detail = JSON.parse(r.raw)?.error?.message ?? detail;
      } catch {
        /* keep raw */
      }
      return NextResponse.json({ error: `Estimator unavailable (${r.status}): ${detail}` }, { status: 502 });
    }

    const content: string = JSON.parse(r.raw)?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      return NextResponse.json({ error: "The model did not return valid JSON." }, { status: 502 });
    }
    return shapeResponse(parsed, visionModel());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Estimator request failed: ${msg}` }, { status: 502 });
  }
}
