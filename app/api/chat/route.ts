import { NextResponse } from "next/server";

// POST /api/chat  { messages: [{role:"user"|"assistant", content}], context? }
//
// The Palatify Coach. One provider: Anthropic Claude, reached through the
// DataRobot LLM gateway (OpenAI-compatible wire format) with the key held
// server-side. The Gemini and Groq fallbacks that used to live here are gone
// — neither was ever configured in production, so they were dead branches
// that made the file read as if the coach were model-agnostic when every
// answer the app has ever given came from Claude.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Anthropic model served through the gateway. */
const DEFAULT_MODEL = "anthropic/claude-opus-4-8";

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

async function callClaude(token: string, messages: ChatMessage[], ctx?: Record<string, unknown>) {
  const base = (process.env.DATAROBOT_ENDPOINT ?? "https://app.datarobot.com/api/v2").replace(/\/$/, "");
  const res = await fetch(`${base}/genai/llmgw/chat/completions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DATAROBOT_CHAT_MODEL || DEFAULT_MODEL,
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
  const token = process.env.DATAROBOT_API_TOKEN;
  if (!token) {
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
    const reply = await callClaude(token, messages, context);
    if (!reply) return NextResponse.json({ error: "The coach is unavailable." }, { status: 502 });
    return NextResponse.json({ reply, provider: "anthropic" });
  } catch {
    return NextResponse.json({ error: "Chat request failed." }, { status: 502 });
  }
}
