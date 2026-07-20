"use client";

// Membership plans for diners — the public counterpart to the restaurant
// cards on /for-restaurants. CTAs are LIVE: they reflect the viewer's real
// state (signed out, trial running, trial ended, request pending, Premium)
// instead of dumb marketing buttons.

import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePremium, PRICE_LINE, TRIAL_DAYS, FREE_DAILY_MESSAGES } from "@/lib/premium";
import { cls } from "@/lib/format";

const FREE_FEATURES = [
  "Personal Fit Score on every dish",
  "Discovery, search, and maps",
  "Ordering with allergy flags to the kitchen",
  "Confirmed meal logging with evidence trail",
  "Daily targets (Mifflin–St Jeor) + weight tracking",
];

const PREMIUM_FEATURES = [
  "AI nutrition coach — unlimited chats",
  "Unlimited AI photo & description meal logging",
  "Metabolic calibration from your own logs",
  "Goal-weight trend coaching",
  "Priority support",
];

export default function PricingPage() {
  const { user, hydrated } = useAuth();
  const { isPremium, trialActive, trialDaysLeft, premiumRequested, upgradeDemo, cloud } = usePremium();

  // The Premium card's CTA, tied to the viewer's real membership state.
  const premiumCta = () => {
    if (!hydrated) return null;
    if (!user) {
      return (
        <Link href="/signup" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">
          Start your {TRIAL_DAYS}-day free trial
        </Link>
      );
    }
    if (isPremium) {
      return (
        <p className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-100 px-5 py-3 font-bold text-brand-800">
          <Crown className="h-4 w-4" /> You&apos;re Premium
        </p>
      );
    }
    if (premiumRequested) {
      return (
        <p className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-100 px-5 py-3 text-sm font-bold text-brand-800">
          Request sent — Premium will be enabled shortly.
        </p>
      );
    }
    return (
      <button onClick={upgradeDemo} className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">
        {cloud ? "Request Premium access" : "Activate Premium (demo — no payment)"}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Membership</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          The core loop is free. Forever.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink/65">
          Every new account starts with a {TRIAL_DAYS}-day full-access trial — no card required.
          After that, everything core stays free; Premium adds the AI extras.
        </p>
        {hydrated && user && trialActive && !isPremium && (
          <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
            <Sparkles className="h-4 w-4" /> Your trial is active — {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-3xl border border-black/10 bg-white p-7">
          <h2 className="font-display text-xl font-bold text-ink">Free</h2>
          <p className="mt-3">
            <span className="font-display text-4xl font-extrabold text-ink">$0</span>
            <span className="ml-1 text-sm text-ink/50">forever</span>
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Includes {FREE_DAILY_MESSAGES} coach messages/day during your trial.
          </p>
          <ul className="mt-5 space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
              </li>
            ))}
          </ul>
          {hydrated && !user ? (
            <Link href="/signup" className="mt-6 flex w-full items-center justify-center rounded-full border border-black/10 px-5 py-3 font-semibold text-ink/70 transition hover:border-black/25">
              Get started free
            </Link>
          ) : hydrated && user ? (
            <Link href="/dashboard" className="mt-6 flex w-full items-center justify-center rounded-full border border-black/10 px-5 py-3 font-semibold text-ink/70 transition hover:border-black/25">
              Go to your dashboard
            </Link>
          ) : null}
        </div>

        {/* Premium */}
        <div className={cls("relative rounded-3xl border-2 p-7", "border-brand-500 bg-brand-50/40")}>
          <span className="absolute -top-3 right-6 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">
            {TRIAL_DAYS}-day free trial
          </span>
          <h2 className="flex items-center gap-1.5 font-display text-xl font-bold text-ink">
            <Crown className="h-5 w-5 text-brand-600" /> Premium
          </h2>
          <p className="mt-3">
            <span className="font-display text-4xl font-extrabold text-ink">$4.99</span>
            <span className="ml-1 text-sm text-ink/50">/month</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-700">
            or $39.99/year — save 33%
          </p>
          <ul className="mt-5 space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
              </li>
            ))}
          </ul>
          {premiumCta()}
          <p className="mt-3 text-center text-xs text-ink/45">
            {cloud
              ? "Purchases open soon — until then, access is granted on request."
              : `Premium is ${PRICE_LINE}. Demo build: no billing exists yet.`}
          </p>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-ink/50">
        Run a restaurant?{" "}
        <Link href="/for-restaurants" className="font-semibold text-brand-700 hover:underline">
          Partner plans live here
        </Link>
        {" "}— free forever, pay only for orders we bring you.
      </p>
    </div>
  );
}
