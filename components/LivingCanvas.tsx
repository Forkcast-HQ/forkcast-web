"use client";

/**
 * LivingCanvas — the page's ground, and it means something.
 *
 * Concentric rings expand slowly from a handful of emitters and fade out:
 * the brand mark's own geometry, repeated at every scale, like plates being
 * set down across a room. Replaces an earlier flow field whose crossing
 * particle trails read as scribble rather than as anything.
 *
 * It is also functional, not just alive: the cursor is its own emitter, so
 * moving the pointer sets off rings under your hand. That's the page's only
 * ambient signal that it's interactive.
 *
 * Cleared every frame (no trail buffer), so the texture stays crisp at any
 * DPR. Stops dead when scrolled out of view, when the tab is hidden, and
 * under prefers-reduced-motion — where it paints one still frame instead,
 * so the composition survives without the movement.
 */

import { useEffect, useRef } from "react";

type Ring = {
  x: number;
  y: number;
  born: number;
  dur: number;
  max: number;
  accent: boolean;
};

/** Emitter positions as fractions of the canvas, with their own periods. */
const EMITTERS = [
  { fx: 0.16, fy: 0.24, period: 3400, phase: 0 },
  { fx: 0.78, fy: 0.18, period: 4300, phase: 1200 },
  { fx: 0.62, fy: 0.82, period: 3900, phase: 2400 },
  { fx: 0.28, fy: 0.71, period: 5200, phase: 600 },
];

const MAX_RINGS = 64;

export function LivingCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let rings: Ring[] = [];
    let raf = 0;
    let t = 0;
    let visible = true;
    const nextAt = EMITTERS.map((e) => e.phase);
    const pointer = { x: 0, y: 0, lastX: -9999, lastY: -9999, seen: false };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const emit = (x: number, y: number, scale = 1, accent = Math.random() < 0.2) => {
      if (rings.length >= MAX_RINGS) rings.shift();
      const span = Math.max(w, h);
      rings.push({
        x,
        y,
        born: t,
        dur: (11000 + Math.random() * 7000) * scale,
        max: span * (0.16 + Math.random() * 0.4) * scale,
        accent,
      });
    };

    /** Ease-out: rings sprint outward then coast, like a real ripple. */
    const ease = (p: number) => 1 - Math.pow(1 - p, 2.2);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        const p = (t - ring.born) / ring.dur;
        if (p >= 1) {
          rings.splice(i, 1);
          continue;
        }
        // In fast, out slow — so the field always has faint old rings in it.
        const alpha = p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9;
        const r = ease(p) * ring.max;
        ctx.strokeStyle = ring.accent
          ? `rgba(236, 48, 19, ${(alpha * 0.3).toFixed(3)})`
          : `rgba(32, 30, 29, ${(alpha * 0.13).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const step = () => {
      t += 16;
      EMITTERS.forEach((e, i) => {
        if (t >= nextAt[i]) {
          emit(e.fx * w, e.fy * h);
          nextAt[i] = t + e.period * (0.75 + Math.random() * 0.5);
        }
      });
      draw();
      if (visible) raf = requestAnimationFrame(step);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      pointer.x = x;
      pointer.y = y;
      // Only emit once the pointer has actually travelled, so a resting
      // hand doesn't machine-gun rings.
      const dx = x - pointer.lastX;
      const dy = y - pointer.lastY;
      if (!pointer.seen || dx * dx + dy * dy > 12000) {
        pointer.lastX = x;
        pointer.lastY = y;
        pointer.seen = true;
        emit(x, y, 0.5, Math.random() < 0.42);
      }
    };

    resize();

    if (reduced) {
      // One still frame: a composed set of rings, mid-life, no motion.
      EMITTERS.forEach((e, i) => {
        emit(e.fx * w, e.fy * h, 1, i === 1);
        const r = rings[rings.length - 1];
        r.born = -r.dur * 0.42;
      });
      draw();
      return () => {};
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(step);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      visible = !document.hidden;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(step);
    };

    // Seed the field so the first paint isn't an empty canvas.
    EMITTERS.forEach((e, i) => {
      emit(e.fx * w, e.fy * h, 1, i === 2);
      const r = rings[rings.length - 1];
      r.born = -r.dur * (0.2 + i * 0.18);
    });

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
