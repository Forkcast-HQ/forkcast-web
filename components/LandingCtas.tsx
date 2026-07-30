"use client";

/**
 * The landing page's call-to-action pairs.
 *
 * These exist as a separate client component for one reason: the landing
 * page was the only interactive surface in the app that never read auth
 * state. The navbar, cart bar, coach and dish pages all swap on `useAuth`,
 * so a signed-in visitor got a page that argued with itself — their account
 * menu in the header, and "Start free / Sign in" in the hero underneath it.
 *
 * Both pairs render the signed-out labels until `hydrated` is true. That is
 * deliberate and matches Navbar: the page is statically prerendered, the
 * session only exists in the browser, so anything else is a hydration
 * mismatch. The swap lands within the hero's own entrance animation.
 *
 * Signed-in customers go to /dashboard rather than being branched on
 * whether they have a profile yet — /dashboard already redirects
 * restaurants to /partner and renders its own "set up your profile" state,
 * and reading the profile store here would flicker between two labels while
 * it loads from localStorage.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

function useLandingTarget() {
  const { user, hydrated } = useAuth();
  const signedIn = hydrated && !!user;
  const isRestaurant = user?.role === "restaurant";

  return {
    signedIn,
    isRestaurant: signedIn && isRestaurant,
    href: !signedIn ? "/signup" : isRestaurant ? "/partner" : "/dashboard",
    // Link straight to the terminal for restaurant accounts. /dashboard
    // would bounce them there anyway; this avoids the flash.
    label: !signedIn
      ? "Start free"
      : isRestaurant
        ? "Open partner terminal"
        : "Open my dashboard",
  };
}

/** Hero pair. `onSignIn` opens the panel that KineticHero owns. */
export function HeroCtas({ onSignIn }: { onSignIn: () => void }) {
  const { signedIn, href, label } = useLandingTarget();

  return (
    <div className="stagger mt-10 flex flex-wrap items-center gap-3">
      <Link
        href={href}
        style={{ animationDelay: "780ms" }}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-8 py-4 text-base font-bold text-cream"
      >
        {/* Accent wipes across on hover rather than a colour swap */}
        <span className="absolute inset-0 -translate-x-full bg-brand-600 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
        <span className="relative">{label}</span>
        <ArrowRight className="relative h-4.5 w-4.5 transition group-hover:translate-x-1" />
      </Link>

      {signedIn ? (
        <Link
          href="/discover"
          style={{ animationDelay: "850ms" }}
          className="inline-flex items-center rounded-full border-2 border-ink/15 bg-cream/60 px-8 py-4 text-base font-bold text-ink backdrop-blur-sm transition hover:border-ink"
        >
          Browse Boston
        </Link>
      ) : (
        <button
          type="button"
          onClick={onSignIn}
          style={{ animationDelay: "850ms" }}
          className="inline-flex items-center rounded-full border-2 border-ink/15 bg-cream/60 px-8 py-4 text-base font-bold text-ink backdrop-blur-sm transition hover:border-ink"
        >
          Sign in
        </button>
      )}
    </div>
  );
}

/**
 * Closing pair, on ink. Carries its own supporting line because "Free to
 * start, no card" is a claim aimed at someone who has not signed up.
 */
export function ClosingCtas() {
  const { signedIn, isRestaurant, href, label } = useLandingTarget();

  return (
    <>
      <p className="mt-5 max-w-md text-lg text-cream/60">
        {!signedIn
          ? "Sixty seconds to a plan. Free to start, no card."
          : isRestaurant
            ? // Restaurant accounts have no nutrition targets of their own.
              "Your menu, your numbers, reviewed by you."
            : "Your targets are already set. Pick up where you left off."}
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white"
        >
          <span className="absolute inset-0 -translate-x-full bg-cream transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
          <span className="relative transition-colors group-hover:text-ink">
            {signedIn ? label : "Build my plan"}
          </span>
          <ArrowRight className="relative h-4.5 w-4.5 transition group-hover:translate-x-1 group-hover:text-ink" />
        </Link>
        <Link
          href="/discover"
          className="inline-flex items-center rounded-full border-2 border-cream/35 px-8 py-4 text-base font-bold text-cream transition hover:border-cream"
        >
          {signedIn ? "Browse Boston" : "Browse Boston first"}
        </Link>
      </div>
    </>
  );
}
