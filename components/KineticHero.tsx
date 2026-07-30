"use client";

/**
 * KineticHero — the first screen.
 *
 * Ground: a liquid field (LiquidField) under a grain pass, so the page is
 * never static even when nothing is being interacted with. The field is
 * deliberately quietest on the left, behind the type, and fullest on the
 * right around the plate.
 * Object: the palatify mark as an actual plate, with food in it.
 * Type: word-by-word entrance, and one accent word that stays in motion.
 *
 * Six words of copy, two buttons. Everything else is one click away.
 */

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { LiquidField } from "@/components/LiquidField";
import { HeroCtas } from "@/components/LandingCtas";
import { PlateOrbit } from "@/components/PlateOrbit";
import { SignInPanel } from "@/components/SignInPanel";

/** Split a line into word-masked spans with a running stagger. */
function Words({
  text,
  from,
  step = 85,
  accent,
}: {
  text: string;
  from: number;
  step?: number;
  accent?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="word">
            <span
              className={accent ? "text-brand-600" : undefined}
              style={{ ["--d" as string]: `${from + i * step}ms` }}
            >
              {w}
            </span>
          </span>
          {/* A real space, not a margin. The masked spans used to be spaced
              with mr-[0.22em], which looks identical and reads as
              "Eatout.Stayonplan." to a screen reader, to the clipboard and
              to anything parsing the page. */}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

export function KineticHero() {
  const [signIn, setSignIn] = useState(false);

  return (
    <section className="grain relative overflow-hidden bg-cream">
      <LiquidField className="liquid" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* 4.5rem = the sticky Navbar's height. Keep these in sync. */}
      <div className="relative z-[2] mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* The columns are near-even. The plate wants to be the argument,
            but "Stay on plan." has to hold one line at desktop — at the old
            0.92fr it broke to three lines and left "plan." as a widow. */}
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          {/* ---- Type ---- */}
          <div>
            <p className="kicker word text-brand-700">
              <span style={{ ["--d" as string]: "60ms" }}>Boston · live catalog</span>
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.75rem,7.2vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.035em] text-ink">
              <Words text="Eat out." from={160} />
              <Words text="Stay on plan." from={330} accent />
            </h1>

            {/* One paragraph, word-masked — so it breaks wherever the column
                is narrow instead of at a hard-coded midpoint. */}
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
              <Words
                text="Set your goals once. AI reads the menus near you, and every dish is scored against what's left of your day."
                from={600}
                step={34}
              />
            </p>

            {/* Auth-aware — see components/LandingCtas.tsx. The SignInPanel
                stays mounted here, outside the animated .stagger row, so it
                keeps its position in the tree as a section-level overlay. */}
            <HeroCtas onSignIn={() => setSignIn(true)} />
          </div>

          {/* ---- The object ----
               The chips orbit at 47.5% of the square, so they stick out
               roughly half a chip beyond it on both sides. At desktop that
               overhang lands in the page gutter; on a phone it ran off the
               screen, hence the inset. */}
          <div className="relative mx-auto w-full max-w-[680px] px-12 sm:px-14 lg:justify-self-end lg:px-0">
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
