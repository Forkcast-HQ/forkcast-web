import { NextResponse } from "next/server";

// POST /api/analyze  { image: "data:image/jpeg;base64,..." } -> nutrition estimate.
// GET  /api/analyze  -> provider/model debug info.
//
// Providers (server-side keys only, set in .env.local — never committed):
//   1. Google Gemini vision — preferred when GEMINI_API_KEY is set.
//      Optional: GEMINI_MODEL (default gemini-2.5-flash, falls back to older flash models).
//   2. Groq vision (OpenAI-compatible) — used when GROQ_API_KEY is set.
//      Auto-discovers an accessible vision model and remembers what worked.
// Never runs on the static export build.

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

// ---- DataRobot LLM Gateway (OpenAI-compatible, multimodal) ---------

async function callDataRobotVision(token: string, image: string) {
  const base = (process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2").replace(/\/$/, "");
  const res = await fetch(`${base}/genai/llmgw/chat/completions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DATAROBOT_VISION_MODEL || "azure/gpt-5-5-2026-04-23",
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

// ---- Gemini -------------------------------------------------------

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_FALLBACKS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

function splitDataUrl(image: string): { mime: string; data: string } | null {
  const m = image.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/i);
  return m ? { mime: m[1], data: m[2] } : null;
}

async function callGemini(key: string, model: string, image: string) {
  const img = splitDataUrl(image);
  if (!img) return { ok: false, status: 400, raw: "Unsupported image data URL" };
  const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: img.mime, data: img.data } },
          ],
        },
      ],
    }),
  });
  return { ok: res.ok, status: res.status, raw: await res.text() };
}

function geminiText(raw: string): string {
  try {
    const body = JSON.parse(raw);
    const parts = body?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p: { text?: string }) => p.text ?? "").join("");
  } catch {
    return "";
  }
}

async function analyzeWithGemini(key: string, image: string) {
  const preferred = process.env.GEMINI_MODEL;
  const models = preferred ? [preferred, ...GEMINI_FALLBACKS.filter((m) => m !== preferred)] : GEMINI_FALLBACKS;
  let last = { ok: false, status: 0, raw: "" };
  for (const model of models) {
    const r = await callGemini(key, model, image);
    if (r.ok) return { r, model };
    last = r;
    // Only fall through on model-availability errors; real errors surface immediately.
    if (!(r.status === 404 || r.status === 400)) return { r, model };
  }
  return { r: last, model: models[models.length - 1] };
}

// ---- Groq ---------------------------------------------------------

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
  const datarobot = Boolean(process.env.DATAROBOT_API_TOKEN);
  const gemini = Boolean(process.env.GEMINI_API_KEY);
  const groqKey = process.env.GROQ_API_KEY;
  const groqModels = groqKey ? await listModels(groqKey) : [];
  return NextResponse.json({
    providers: {
      datarobot: datarobot
        ? {
            configured: true,
            endpoint: process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2",
            visionModel: process.env.DATAROBOT_VISION_MODEL || "azure/gpt-5-5-2026-04-23",
            chatModel: process.env.DATAROBOT_CHAT_MODEL || "anthropic/claude-opus-4-8",
          }
        : { configured: false },
      gemini: gemini ? { configured: true, model: process.env.GEMINI_MODEL || GEMINI_FALLBACKS[0] } : { configured: false },
      groq: groqKey
        ? { configured: true, available: groqModels.sort(), suggestedVisionModel: pickVisionModel(groqModels) ?? null }
        : { configured: false },
    },
    active: datarobot ? "datarobot" : gemini ? "gemini" : groqKey ? "groq" : null,
  });
}

export async function POST(req: Request) {
  const drToken = process.env.DATAROBOT_API_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const key = process.env.GROQ_API_KEY;
  if (!drToken && !geminiKey && !key) {
    return NextResponse.json({ error: "No AI key configured. Set DATAROBOT_API_TOKEN, GEMINI_API_KEY, or GROQ_API_KEY in .env.local." }, { status: 500 });
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

  // ---- DataRobot gateway path (first priority) ----
  if (drToken) {
    try {
      const r = await callDataRobotVision(drToken, image);
      if (r.ok) {
        const content: string = JSON.parse(r.raw)?.choices?.[0]?.message?.content ?? "";
        const parsed = extractJson(content);
        if (parsed) return shapeResponse(parsed, `datarobot:${process.env.DATAROBOT_VISION_MODEL || "azure/gpt-5-5-2026-04-23"}`);
      } else if (!geminiKey && !key) {
        let detail = r.raw.slice(0, 300);
        try { detail = JSON.parse(r.raw)?.error?.message ?? detail; } catch { /* keep raw */ }
        return NextResponse.json({ error: `DataRobot ${r.status}: ${detail}` }, { status: 502 });
      }
      // fall through to Gemini/Groq if configured
    } catch {
      if (!geminiKey && !key) return NextResponse.json({ error: "Request to DataRobot failed." }, { status: 502 });
    }
  }

  // ---- Gemini path ----
  if (geminiKey) {
    try {
      const { r, model } = await analyzeWithGemini(geminiKey, image);
      if (r.ok) {
        const parsed = extractJson(geminiText(r.raw));
        if (parsed) return shapeResponse(parsed, `gemini:${model}`);
        if (!key) return NextResponse.json({ error: "Gemini did not return valid JSON." }, { status: 502 });
      } else if (!key) {
        let detail = r.raw.slice(0, 300);
        try {
          detail = JSON.parse(r.raw)?.error?.message ?? detail;
        } catch {
          /* keep raw */
        }
        return NextResponse.json({ error: `Gemini ${r.status}: ${detail}` }, { status: 502 });
      }
      // fall through to Groq if configured
    } catch {
      if (!key) return NextResponse.json({ error: "Request to Gemini failed." }, { status: 502 });
    }
  }

  if (!key) return NextResponse.json({ error: "GROQ_API_KEY is not set on the server." }, { status: 500 });

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
    return shapeResponse(parsed, model);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Request to Groq failed: ${msg}` }, { status: 502 });
  }
}
