"use client";

/**
 * LivingCanvas — the page's ground is never still.
 *
 * A flow field: a few hundred particles tracing a slowly-evolving vector
 * field, painted as fading trails on a cream canvas. Ink-coloured with a
 * small accent minority. The cursor pushes the field around it, so the
 * background reacts to the reader without ever demanding attention.
 *
 * Deliberately dependency-free: the "noise" is a sum of sines, which is
 * cheap, smooth, and good enough at this scale. Costs ~1ms/frame.
 *
 * It stops completely when scrolled out of view, when the tab is hidden,
 * and when the reader prefers reduced motion (one static frame is drawn
 * instead, so the texture is still there — just frozen).
 */

import { useEffect, useRef } from "react";

const INK = "32, 30, 29";
const ACCENT = "236, 48, 19";

type P = { x: number; y: number; life: number; max: number; accent: boolean };

export function LivingCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: P[] = [];
    let raf = 0;
    let t = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999, on: false };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#f3f2f2";
      ctx.fillRect(0, 0, w, h);

      // Density scales with area, capped so phones stay smooth.
      const count = Math.min(560, Math.round((w * h) / 3400));
      particles = Array.from({ length: count }, () => spawn());
    };

    const spawn = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      life: 0,
      max: 120 + Math.random() * 260,
      accent: Math.random() < 0.07,
    });

    // Smooth pseudo-noise → an angle. Three sine octaves at different
    // scales, drifting on `t`, gives lazy braided currents.
    const angleAt = (x: number, y: number) => {
      const a =
        Math.sin(x * 0.0032 + t * 0.00022) * 1.7 +
        Math.sin(y * 0.0027 - t * 0.00019) * 1.7 +
        Math.sin((x + y) * 0.0016 + t * 0.00013) * 1.1;
      return a;
    };

    const step = () => {
      t += 16;

      // Fade the previous frame toward the ground colour instead of
      // clearing — this is what turns dots into silky trails.
      ctx.fillStyle = "rgba(243, 242, 242, 0.055)";
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let ang = angleAt(p.x, p.y);

        // Cursor: swirl the field around the pointer, falling off fast.
        if (pointer.on) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 42000) {
            const f = 1 - Math.sqrt(d2) / 205;
            ang += Math.atan2(dy, dx) * f * 1.5;
          }
        }

        const nx = p.x + Math.cos(ang) * 0.85;
        const ny = p.y + Math.sin(ang) * 0.85;

        ctx.strokeStyle = p.accent
          ? `rgba(${ACCENT}, 0.22)`
          : `rgba(${INK}, 0.085)`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.life++;

        if (p.life > p.max || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          particles[i] = spawn();
        }
      }

      if (visible) raf = requestAnimationFrame(step);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.on = true;
    };
    const offPointer = () => {
      pointer.on = false;
    };

    resize();

    if (reduced) {
      // One static pass — texture without motion.
      for (let k = 0; k < 260; k++) step();
      cancelAnimationFrame(raf);
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

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", offPointer);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", offPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
