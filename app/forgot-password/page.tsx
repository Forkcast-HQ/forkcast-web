"use client";

// Forgot password — works for diner and restaurant accounts alike.
// Demo-grade: accounts live only on this device, so the reset is immediate
// (no email round-trip). Production replaces this with an email-verified
// reset without changing the UI.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthShell, AuthField } from "@/components/AuthShell";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const res = await resetPassword({ email, newPassword: password });
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  };

  return (
    <AuthShell title="Reset your password" subtitle="Works for diner and restaurant accounts.">
      {done ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-brand-600" />
          <p className="mt-3 font-display text-xl font-bold text-ink">Password updated</p>
          <p className="mt-1.5 text-sm text-ink/60">You can log in with your new password now.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Go to log in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AuthField label="Account email">
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </AuthField>
          <AuthField label="New password" hint="At least 6 characters.">
            <div className="relative">
              <input
                className="field pr-11"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </AuthField>
          <AuthField label="Confirm new password">
            <input
              className="field"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </AuthField>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            <KeyRound className="h-5 w-5" /> Reset password
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink/60">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-ink/40">
        Demo prototype — accounts are stored on this device, so the reset applies immediately. The production app will
        send an email verification link instead.
      </p>
    </AuthShell>
  );
}
