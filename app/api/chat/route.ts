import { NextResponse } from "next/server";

// POST /api/chat  { messages: [{role:"user"|"assistant", content}], context? }
// AI nutrition coach. Providers: Gemini (GEMINI_API_KEY, preferred) then
// Groq (GROQ_API_KEY). Keys stay server-side. Never runs on the static export.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are the Palatify Coach — a friendly, evidence-minded nutrition assistant inside Palatify, an app that scores restaurant dishes against a person's daily calorie/macro targets and lets them order and log meals.

Rules:
- Be brief and practical: 2-5 short sentences unless asked for more. No markdown headers.
- Ground advice in the user's context (targets, remaining budget, goal) when provided.
- You may suggest dish types and trade-offs (protein, sodium, fiber, portions) and explain Palatify concepts (Fit Score, calibration, verified vs estimated data).
- You are NOT a medical professional. Never diagnose, never prescribe, never advise on medications (including GLP-1 dosing). For medical questions, recommend a clinician or registered dietitian.
- Allergies: advise checking with the restaurant directly — menu-text flags are advisories, not guarantees.
- Never invent restaurants, dishes, or nutrition numbers. If unsure, say so.
- No weight-loss guilt language. Encourage sustainable habits.`;

interface ChatMessage { role: "user" | "assistant"; content: string }

function contextLine(ctx: Record<string, unknown> | undefined): string {
  if (!ctx) return "No profile context provided (user may not be signed in).";
  return `User context: ${JSON.stringify(ctx)}`;
}

async function callGemini(key: string, messages: ChatMessage[], ctx?: Record<string, unknown>) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SYSTEM}\n\n${contextLine(ctx)}` }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      contents,
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  const text = (body?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
  return text || null;
}

// DataRobot LLM Gateway (OpenAI-compatible) — routes to GPT/Claude/etc.
async function callDataRobot(token: string, messages: ChatMessage[], ctx?: Record<string, unknown>) {
  const base = (process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2").replace(/\/$/, "");
  const res = await fetch(`${base}/genai/llmgw/chat/completions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DATAROBOT_CHAT_MODEL || "anthropic/claude-opus-4-8",
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "system", content: `${SYSTEM}\n\n${contextLine(ctx)}` }, ...messages],
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.choices?.[0]?.message?.content ?? null;
}

async function callGroq(key: string, messages: ChatMessage[], ctx?: Record<string, unknown>) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "system", content: `${SYSTEM}\n\n${contextLine(ctx)}` }, ...messages],
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.choices?.[0]?.message?.content ?? null;
}

export async function POST(req: Request) {
  const datarobot = process.env.DATAROBOT_API_TOKEN;
  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  if (!datarobot && !gemini && !groq) {
    return NextResponse.json({ error: "No AI key configured on the server." }, { status: 500 });
  }

  let messages: ChatMessage[] = [];
  let context: Record<string, unknown> | undefined;
  try {
    const body = await req.json();
    messages = (body.messages ?? []).slice(-12); // bound the window
    context = body.context;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!messages.length) return NextResponse.json({ error: "No messages." }, { status: 400 });

  try {
    // Provider priority: DataRobot gateway → Gemini → Groq
    let reply: string | null = null;
    let provider = "";
    if (datarobot) { reply = await callDataRobot(datarobot, messages, context); if (reply) provider = "datarobot"; }
    if (!reply && gemini) { reply = await callGemini(gemini, messages, context); if (reply) provider = "gemini"; }
    if (!reply && groq) { reply = await callGroq(groq, messages, context); if (reply) provider = "groq"; }
    if (!reply) return NextResponse.json({ error: "AI providers unavailable." }, { status: 502 });
    return NextResponse.json({ reply, provider });
  } catch {
    return NextResponse.json({ error: "Chat request failed." }, { status: 502 });
  }
}
