"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthShell, AuthField } from "@/components/AuthShell";

export default function SignUp() {
  const router = useRouter();
  const { signUp, user, hydrated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = signUp({ name, email, password });
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    router.push("/onboarding");
  };

  return (
    <AuthShell title="Create your account" subtitle="60 seconds to your first personalized recommendation.">
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Name">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" autoComplete="name" />
        </AuthField>
        <AuthField label="Email">
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" required />
        </AuthField>
        <AuthField label="Password" hint="At least 6 characters.">
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

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
        >
          Create account <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-ink/40">
        Demo prototype — your account is stored locally on this device.
      </p>
    </AuthShell>
  );
}
