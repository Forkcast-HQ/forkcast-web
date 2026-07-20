# Forkcast — Hero Teaser Video Prompt (Google Veo)

**Spec:** Silent autoplay background loop · 16:9 · ~15–20s · clean/confident tone
**Placement:** Landing page hero, behind/beside the existing headline ("Know before you go.")

---

## Quick note: Veo vs. NotebookLM

These two tools do different jobs, so only one fits this spec:

- **Google Veo** generates original video from a text prompt (and optionally a reference image). This is the right tool for a silent, cinematic hero loop like this one.
- **NotebookLM's "Video Overview"** turns uploaded documents/sources into a narrated slideshow-style explainer — it doesn't generate live-action or UI-motion footage. It's a better fit later if you want a *narrated* explainer video (e.g., for a pitch deck or About page), not for this silent hero loop.

So: use **Veo** for this one. The prompts below are written for it.

Most Veo access (Gemini app / Vertex AI) caps a single generation at **~8 seconds**. To get a 15–20s hero loop, generate **3 short clips** and stitch them in any editor (or Veo's own extend feature if available) rather than asking for one 20s shot — one long-shot prompts tend to degrade in quality past ~8s anyway.

---

## Brand facts to keep the model grounded

- **Product:** Forkcast — a nutrition-aware restaurant discovery, ordering, and logging app.
- **Tagline:** "Know before you go." (already used in-app footer copy)
- **Core loop:** discover restaurants → see a Fit Score + per-dish nutrition with a provenance badge → order → snap/log the meal with AI photo estimation → track progress on a dashboard.
- **Design system (must appear in every shot):** Archivo/geometric sans typography, warm off-white background (`#f3f2f2`), near-black ink text (`#201e1d`), a single confident red-orange accent (`#ec3013`) used sparingly for CTAs/badges/highlights — never as a full-frame color. Generous whitespace, rounded 12–16px cards, soft drop shadows, no clutter, no gradients beyond subtle scrims.
- **Mood reference:** modern fintech/health-tech app trailers (think Oura, Whoop, Linear, Arc browser) — minimal, confident, a little architectural. NOT a food-delivery-app energy (no bright yellow, no cartoon mascots, no fisheye lens).

---

## Master prompt (use if your Veo access supports a single ~15–20s generation)

```
A clean, minimal product teaser for a nutrition app called Forkcast, 16:9,
15-18 seconds, no dialogue, no voiceover, no on-screen logos other than a
simple wordmark at the very end. Cinematic but restrained motion-graphics
style, shot like a modern health-tech or fintech app trailer (Oura, Whoop,
Linear) — NOT a food-delivery ad. Warm off-white background (#f3f2f2), near-
black text (#201e1d), a single confident red-orange accent color (#ec3013)
used sparingly on buttons and small badges. Geometric sans-serif typography
throughout. Soft, even studio lighting, shallow depth of field, subtle
parallax camera moves (slow push-ins, gentle pans) — no shaky handheld, no
fast whip pans, no flashing cuts.

Sequence:
1. Open on a phone/tablet screen floating in soft light, showing a tidy grid
   of restaurant cards with small rounded nutrition score badges in the
   corner of each card. Camera slowly pushes in.
2. Cut to a single dish detail card expanding — clean nutrition breakdown
   (calories, protein, carbs, fat) with a small checkmark "verified" badge
   appearing with a subtle pop animation.
3. Cut to a hand (soft focus, minimal, no visible face) placing a plate of
   real, appetizing food on a light wood or marble surface, with a phone
   beside it showing the same dish on-screen — implying the app matched
   reality.
4. Cut to the same phone screen now showing a simple, elegant weekly
   progress chart (soft line graph, rounded bar chart) with a small streak
   counter ticking up.
5. Final beat: everything fades to the warm off-white background with the
   Forkcast wordmark fading in center-frame, small and confident, no tagline
   text needed.

Color palette strictly limited to: warm off-white, near-black, one red-
orange accent, soft neutral grays. No blue, no green, no purple. No stock-
photo-style oversaturated food. No text glitches or garbled UI labels — keep
any on-screen text large, simple, and legible (e.g., generic labels like
"420 cal", "92% match" are fine; avoid trying to render small paragraphs).
Ambient, minimal — this is a background loop, not a narrative ad.
```

---

## Scene-by-scene version (recommended — 3 clips of ~6–8s each, stitched)

**Clip 1 — Discover (6-8s)**
```
Minimal motion-graphics product shot, 16:9, no dialogue, no voiceover.
Warm off-white background (#f3f2f2), near-black text (#201e1d), a single
red-orange accent (#ec3013) used only on a small rounded badge. A phone
screen floats in soft studio light showing a clean grid of restaurant
cards, each with a small circular "match score" badge in one corner.
Camera does a slow, smooth push-in toward one card. Geometric sans-serif
typography. Soft shadows, shallow depth of field, no clutter, no logos,
no flashing, no fast cuts. Calm, confident, architectural mood — like a
modern fintech app trailer, not a food-delivery ad.
```

**Clip 2 — Verified nutrition + real food match (6-8s)**
```
Minimal motion-graphics product shot, 16:9, no dialogue, no voiceover.
Same warm off-white / near-black / red-orange accent palette as a modern
health-tech app trailer. A dish detail card on a phone screen expands
smoothly to reveal a tidy nutrition breakdown (simple large numbers,
generic labels like calories/protein/carbs) with a small checkmark
"verified" badge popping in gently. Cut to a real plate of appetizing,
naturally lit food (soft focus, no visible faces) resting beside the same
phone, subtly implying the on-screen numbers match the real dish. Soft
studio lighting, shallow depth of field, slow camera drift, no clutter,
no glitching text.
```

**Clip 3 — Progress + close (4-6s)**
```
Minimal motion-graphics product shot, 16:9, no dialogue, no voiceover.
Warm off-white background, near-black text, single red-orange accent used
sparingly. A phone screen shows a simple elegant weekly progress chart
(soft rounded line or bar chart) animating in, with a small streak counter
ticking upward. Camera pulls back slowly and the scene dissolves into the
plain warm off-white background as a small, confident wordmark reading
"Forkcast" fades in center-frame — no tagline, no other logos. Calm,
architectural, minimal motion throughout, no fast cuts or flashing.
```

**Stitch order:** Clip 1 → Clip 2 → Clip 3, with a 0.3–0.5s cross-dissolve between each (avoid hard cuts on a silent loop — they read as jarring without music to mask them). Loop clip 3's end back into clip 1's start with a matching dissolve if you want a true seamless loop rather than a one-shot play.

---

## Practical tips for higher fidelity

- If your Veo access supports **image-conditioning** (image-to-video), feed it an actual screenshot of the Discover page or Dish Detail page as the starting frame instead of describing the UI from scratch — Veo is much more accurate at motion-from-a-real-frame than at inventing UI chrome from text alone.
- Keep every on-screen "number" generic and short (`420 cal`, `92% match`, `Verified`) — text-heavy UI (menus, paragraphs) tends to render as garbled nonsense in current video models.
- Generate 2-3 seed variations per clip and pick the best rather than trying to get one perfect generation — Veo's per-shot consistency (especially typography) varies run to run.
- Mute is assumed throughout (autoplay hero loops on the web must be silent/muted per browser policy anyway) — don't budget time writing a score or SFX prompt for this placement.
