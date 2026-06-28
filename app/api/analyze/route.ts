import { NextResponse } from "next/server";

// POST /api/analyze — meal photo -> nutrition estimate.
//
// This is the production seam. Today it returns a mock so the demo runs with no
// API key. To go live, install `@anthropic-ai/sdk`, set ANTHROPIC_API_KEY, and
// uncomment the Claude block below. The client (lib/ai.ts) already posts the
// image here when USE_REAL_AI is true — no other changes needed.

const MOCK = {
  name: "Grilled chicken & quinoa bowl",
  confidence: 0.9,
  calories: 560,
  protein: 44,
  carbs: 52,
  fat: 18,
  fiber: 9,
  sodium: 680,
  sugar: 7,
  items: ["grilled chicken breast", "quinoa", "roasted vegetables", "tahini"],
};

export async function POST(_req: Request) {
  return NextResponse.json(MOCK);

  /* ---- REAL IMPLEMENTATION (Claude Opus 4.8 vision + structured output) ----

  import Anthropic from "@anthropic-ai/sdk";
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  const form = await _req.formData();
  const file = form.get("image") as File;
  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";

  // Structured output guarantees a parseable nutrition object.
  const NUTRITION_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      confidence: { type: "number" },
      calories: { type: "integer" },
      protein: { type: "integer" },
      carbs: { type: "integer" },
      fat: { type: "integer" },
      fiber: { type: "integer" },
      sodium: { type: "integer" },
      sugar: { type: "integer" },
      items: { type: "array", items: { type: "string" } },
    },
    required: ["name","confidence","calories","protein","carbs","fat","fiber","sodium","sugar","items"],
  };

  const res = await client.messages.create({
    model: "claude-opus-4-8",        // vision-capable; ~$0.015 / photo at this size
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: NUTRITION_SCHEMA } },
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
        { type: "text", text: "Identify this restaurant meal and estimate its nutrition (calories, protein, carbs, fat, fiber in g; sodium in mg; sugar in g) for the portion shown. List the main components. Be realistic about portion size." },
      ],
    }],
  });

  const json = res.content.find((b) => b.type === "text")?.text ?? "{}";
  return NextResponse.json(JSON.parse(json));

  ---------------------------------------------------------------------------- */
}
