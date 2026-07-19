#!/usr/bin/env node
// Prints which catalog photos are still missing, in generation order
// (tier 1 first). Any AI agent (Codex, etc.) or human can run this to resume
// an interrupted generation session — done files are simply skipped.
//
//   node scripts/photos-remaining.mjs            # human-readable list
//   node scripts/photos-remaining.mjs --json     # machine-readable (file + prompt)
//   node scripts/photos-remaining.mjs --next     # just the single next item

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/photo-manifest.json"), "utf8"));

const remaining = manifest
  .filter((e) => !fs.existsSync(path.join(root, e.file)))
  .sort((a, b) => a.tier - b.tier);

const done = manifest.length - remaining.length;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(remaining, null, 2));
} else if (process.argv.includes("--next")) {
  if (remaining.length) console.log(JSON.stringify(remaining[0], null, 2));
  else console.log("ALL DONE");
} else {
  console.log(`Photos: ${done}/${manifest.length} done, ${remaining.length} remaining\n`);
  for (const e of remaining) {
    console.log(`[tier ${e.tier}] ${e.file}  (${e.width}x${e.height})  ${e.kind === "hero" ? e.restaurant : `${e.restaurant} — ${e.dish}`}`);
  }
  if (!remaining.length) console.log("ALL DONE ✔");
}
