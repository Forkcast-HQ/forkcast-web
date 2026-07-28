"use client";

/**
 * KineticHero — the first screen.
 *
 * Ground: a live flow field (LivingCanvas) under a grain pass, so the page
 * is never static even when nothing is being interacted with.
 * Object: the palatify mark as an actual plate, with food in it.
 * Type: word-by-word entrance, and one accent word that stays in motion.
 *
 * Six words of copy, two buttons. Everything else is one click away.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { LivingCanvas } from "@/components/LivingCanvas";
import { PlateOrbit } from "@/components/PlateOrbit";
import { SignInPanel } from "@/components/SignInPanel";

/** Split a line into word-masked spans with a running stagger. */
function Words({ text, from, accent }: { text: string; from: number; accent?: boolean }) {
  return (
    <span className="block">
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="word mr-[0.22em]">
          <span
            className={accent ? "text-brand-600" : undefined}
            style={{ ["--d" as string]: `${from + i * 85}ms` }}
          >
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}

export function KineticHero() {
  const [signIn, setSignIn] = useState(false);

  return (
    <section className="grain relative overflow-hidden bg-cream">
      <LivingCanvas className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* 4.5rem = the sticky Navbar's height. Keep these in sync. */}
      <div className="relative z-[2] mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          {/* ---- Type ---- */}
          <div>
            <p className="kicker word text-brand-700">
              <span style={{ ["--d" as string]: "60ms" }}>Boston · live catalog</span>
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.9rem,8.6vw,6.75rem)] font-extrabold leading-[0.9] tracking-[-0.035em] text-ink">
              <Words text="Eat out." from={160} />
              <Words text="Stay on plan." from={330} accent />
            </h1>

            <p className="word mt-7 max-w-md text-lg leading-relaxed text-ink/65">
              <span style={{ ["--d" as string]: "620ms" }}>
                Set your goals once. Every menu near you re-ranks around
              </span>
            </p>
            <p className="word max-w-md text-lg leading-relaxed text-ink/65">
              <span style={{ ["--d" as string]: "690ms" }}>what&apos;s left of your day.</span>
            </p>

            <div className="stagger mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                style={{ animationDelay: "780ms" }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-8 py-4 text-base font-bold text-cream"
              >
                {/* Accent wipes across on hover rather than a colour swap */}
                <span className="absolute inset-0 -translate-x-full bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                <span className="relative">Start free</span>
                <ArrowRight className="relative h-4.5 w-4.5 transition group-hover:translate-x-1" />
              </Link>
              <button
                type="button"
                onClick={() => setSignIn(true)}
                style={{ animationDelay: "850ms" }}
                className="inline-flex items-center rounded-full border-2 border-ink/15 bg-cream/60 px-8 py-4 text-base font-bold text-ink backdrop-blur-sm transition hover:border-ink"
              >
                Sign in
              </button>
            </div>
          </div>

          {/* ---- The object ---- */}
          <div className="relative mx-auto w-full max-w-[560px] lg:justify-self-end">
            <PlateOrbit />
          </div>
        </div>

        <a
          href="#engine"
          className="group mt-12 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.1em] text-ink/60 transition hover:text-ink"
        >
          <ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-0.5" />
          See it work
        </a>
      </div>

      <SignInPanel open={signIn} onClose={() => setSignIn(false)} />
    </section>
  );
}
