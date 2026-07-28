"use client";

/**
 * SignInPanel — sign-in as an overlay on the landing page rather than a
 * route change, so the hero's motion is never torn down mid-gesture.
 * /login still exists and still works; this is the fast path.
 *
 * Deliberately thin: email + password + the role toggle's *outcome* only.
 * Role is fixed at signup, so there is no toggle here — we route on the
 * role that actually comes back from the session, which is the behaviour
 * /login had to explain with a whole mismatch screen.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, X } from "lucide-react";
import { useAuth, lastEmail } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export function SignInPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { logIn, user, hydrated } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // logIn() resolves before the session state lands, so route off the
  // session itself once it arrives — same contract /login uses.
  useEffect(() => {
    if (!submitted || !hydrated || !user) return;
    onClose();
    router.push(user.role === "restaurant" ? "/partner" : "/dashboard");
  }, [submitted, hydrated, user, router, onClose]);

  // Remember who was focused before the panel opened so Escape returns them
  // there, and prefill the last-used email (never the password).
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    setEmail((e) => e || lastEmail());
    const t = setTimeout(() => firstFieldRef.current?.focus(), 80);
    return () => {
      clearTimeout(t);
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  // Escape to close, Tab cycles within the panel.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await logIn({ email, password });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true); // the effect above routes once the session lands
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        aria-label="Close sign in"
        onClick={onClose}
        className="scrim-in absolute inset-0 cursor-default bg-ink/55 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        className="panel-in relative m-0 w-full max-w-md rounded-t-3xl border border-black/10 bg-cream p-7 shadow-2xl sm:m-4 sm:rounded-3xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-ink/40 transition hover:bg-black/5 hover:text-ink"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <Logo />
        <h2 id="signin-title" className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink">
          Welcome back.
        </h2>
        <p className="mt-1 text-sm text-ink/55">Pick up your plan where you left it.</p>

        <form onSubmit={submit} className="mt-6 space-y-3.5">
          <div>
            <label htmlFor="sp-email" className="kicker mb-1.5 block text-ink/50">
              Email
            </label>
            <input
              id="sp-email"
              ref={firstFieldRef}
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="sp-password" className="kicker mb-1.5 block text-ink/50">
              Password
            </label>
            <div className="relative">
              <input
                id="sp-password"
                className="field pr-11"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-base font-bold text-cream transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"} <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="link-wipe font-semibold text-ink/55 hover:text-ink">
            Forgot password?
          </Link>
          <Link href="/signup" className="link-wipe font-bold text-brand-700">
            Create an account
          </Link>
        </div>

        <p className="mt-4 border-t border-black/10 pt-4 text-center text-xs text-ink/40">
          Running a restaurant?{" "}
          <Link href="/login?as=restaurant" className="font-bold text-ink/60 hover:text-ink">
            Partner sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
