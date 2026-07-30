"use client";

/**
 * LiquidField — the page's ground.
 *
 * A domain-warped noise field, rendered per-pixel and coloured through a
 * brand ramp, so the page sits on something that moves like liquid rather
 * than on a flat fill. It replaces an earlier field of expanding rings: the
 * rings were legible as a *diagram* of the mark, but four concentric
 * emitters on a grey ground read as a loading state, not as a surface.
 *
 * How it stays cheap enough to run behind a landing page:
 *
 *   - The whole thing is drawn into a 112-pixel-wide backing store and
 *     stretched by CSS. At that size a full frame is ~7k pixels, and the
 *     browser's own bilinear filter does the upscale on the GPU for free.
 *     A CSS blur on top removes the interpolation creasing that a 17×
 *     upscale would otherwise show as faint diamonds.
 *   - The two warp passes run at two octaves and only the final lookup runs
 *     at three, because the warps are displacement — detail in them is
 *     invisible by construction.
 *   - Capped at 24fps. The field's slowest feature takes the better part of
 *     a minute to cross the frame; nothing about it needs 60.
 *
 * It is interactive, quietly: the pointer both displaces the domain and
 * warms it, so the liquid gathers under your hand. That is the page's only
 * ambient signal that it responds to you at all.
 *
 * Stops dead when scrolled out of view and when the tab is hidden. Under
 * prefers-reduced-motion it paints exactly one frame — the composition
 * survives, the movement does not.
 */

import { useEffect, useRef } from "react";

/** Colour ramps: [stop, r, g, b]. Must start at 0 and end at 1. */
type Ramp = [number, number, number, number][];

const BONE_RAMP: Ramp = [
  [0.0, 250, 248, 245],
  [0.3, 244, 240, 232],
  [0.5, 234, 239, 232], // the cool breath — herb, not mint
  [0.68, 246, 234, 224],
  [0.84, 250, 218, 201],
  [0.94, 245, 188, 162],
  [1.0, 236, 144, 110], // persimmon, heavily diluted
];

const INK_RAMP: Ramp = [
  [0.0, 20, 16, 15],
  [0.34, 26, 21, 19],
  [0.56, 22, 27, 26],
  [0.74, 42, 26, 20],
  [0.9, 82, 35, 22],
  [1.0, 132, 52, 28], // ember
];

const TONES = {
  bone: { ramp: BONE_RAMP, base: [247, 244, 240] as const },
  ink: { ramp: INK_RAMP, base: [20, 16, 15] as const },
};

/* ---------------- noise ----------------
   Integer hash + bilinear value noise. The hash matters more than it looks:
   the field only ever touches a lattice a dozen cells across, so a weakly
   mixed hash shows up immediately as a flat, colourless field. */

function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

function fbm(x: number, y: number, oct: number) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f);
    f *= 2.02;
    amp *= 0.5;
  }
  return s / 0.9375;
}

/* ---------------- tuning ----------------
   LO/HI are the measured 2nd and 98th percentiles of the raw field. Without
   the stretch the whole picture lands inside a tenth of the ramp and reads
   as a flat wash. */
const SCALE = 3.2;
const WARP = 3;
const LO = 0.38;
const HI = 0.8;
const VEIN = 0.24; // how much of the value comes from the marbling term
const VEIN_FREQ = 4;

const GRID_W = 112;
const FRAME_MS = 1000 / 24;

export function LiquidField({
  className,
  tone = "bone",
}: {
  className?: string;
  /** Which ramp to colour through — `ink` for use on the dark sections. */
  tone?: "bone" | "ink";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { ramp, base } = TONES[tone];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = GRID_W;
    let h = Math.max(1, Math.round(GRID_W * 0.56));
    let image = ctx.createImageData(w, h);
    let raf = 0;
    let last = 0;
    let t = 0;
    let running = false;

    /** Pointer position in field space, plus how much of it is being felt. */
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, amt: 0, target: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const next = Math.max(1, Math.round(GRID_W * (r.height / r.width)));
      if (next === h && canvas.width === w) return;
      h = next;
      canvas.width = w;
      canvas.height = h;
      image = ctx.createImageData(w, h);
    };

    /** Colour lookup. `v` is already clamped to 0..1. */
    const shade = (v: number, out: [number, number, number]) => {
      let i = 0;
      while (i < ramp.length - 2 && v > ramp[i + 1][0]) i++;
      const [p0, r0, g0, b0] = ramp[i];
      const [p1, r1, g1, b1] = ramp[i + 1];
      const k = (v - p0) / (p1 - p0);
      out[0] = r0 + (r1 - r0) * k;
      out[1] = g0 + (g1 - g0) * k;
      out[2] = b0 + (b1 - b0) * k;
    };

    const rgb: [number, number, number] = [0, 0, 0];

    const draw = () => {
      const data = image.data;
      const aspect = h / w;
      let p = 0;

      for (let py = 0; py < h; py++) {
        const v0 = (py / h) * aspect;
        // Fade out at the bottom so the section's seam is a clean edge
        // rather than a torn-off gradient.
        const yy = py / h;
        const sy = yy < 0.82 ? 1 : 1 - (yy - 0.82) / 0.18;

        for (let px = 0; px < w; px++) {
          const u0 = px / w;
          let x = u0 * SCALE;
          let y = v0 * SCALE;

          // Pointer: displace the domain away from the cursor, and warm it.
          let heat = 0;
          if (ptr.amt > 0.001) {
            const dx = u0 - ptr.x;
            const dy = v0 - ptr.y * aspect;
            const g = Math.exp(-(dx * dx + dy * dy) * 16) * ptr.amt;
            x += dx * g * 2.6;
            y += dy * g * 2.6;
            heat = g * 0.3;
          }

          const qx = fbm(x, y + t * 0.036, 2);
          const qy = fbm(x + 5.2, y + 1.3 - t * 0.03, 2);
          const rx = fbm(x + WARP * qx + 1.7, y + WARP * qy + 9.2 + t * 0.024, 2);
          const ry = fbm(x + WARP * qx + 8.3, y + WARP * qy + 2.8 - t * 0.018, 2);
          const f = fbm(x + WARP * rx, y + WARP * ry, 3);

          const n = (f - LO) / (HI - LO);
          const vein = 0.5 + 0.5 * Math.sin((rx + ry) * Math.PI * VEIN_FREQ + t * 0.05);
          let v = n * (1 - VEIN) + vein * VEIN + heat;
          v = v < 0 ? 0 : v > 1 ? 1 : v;

          shade(v, rgb);

          // Presence: quiet on the left, where the headline sits, and full
          // on the right around the hero object. The ground carries more
          // energy where the thing you are meant to look at already is.
          const sx = u0 < 0.28 ? 0 : u0 > 0.86 ? 1 : (u0 - 0.28) / 0.58;
          const amt = (0.52 + 0.48 * sx * sx * (3 - 2 * sx)) * sy;

          data[p++] = base[0] + (rgb[0] - base[0]) * amt;
          data[p++] = base[1] + (rgb[1] - base[1]) * amt;
          data[p++] = base[2] + (rgb[2] - base[2]) * amt;
          data[p++] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(now - last, 200) / 1000;
      last = now;
      t += dt;
      // Ease the pointer so a flick doesn't snap the field.
      ptr.x += (ptr.tx - ptr.x) * 0.08;
      ptr.y += (ptr.ty - ptr.y) * 0.08;
      ptr.amt += (ptr.target - ptr.amt) * 0.05;
      draw();
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now() - FRAME_MS;
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();

    if (reduced) {
      t = 18; // a composed moment, not the flat opening frame
      draw();
      return () => {};
    }

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x < -0.1 || y < -0.1 || x > 1.1 || y > 1.1) {
        ptr.target = 0;
        return;
      }
      ptr.tx = x;
      ptr.ty = y;
      ptr.target = 1;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    draw(); // paint once immediately so the first frame is never blank

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tone]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
