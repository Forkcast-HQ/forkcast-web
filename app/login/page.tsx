"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthShell, AuthField } from "@/components/AuthShell";

export default function LogIn() {
  const router = useRouter();
  const { logIn, user, hydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) router.replace(user.role === "restaurant" ? "/partner" : "/dashboard");
  }, [hydrated, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = logIn({ email, password });
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    // Redirect happens in the effect above once the session updates
    // (restaurants go to the partner terminal, diners to the dashboard).
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up your plan.">
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Email">
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" required />
        </AuthField>
        <AuthField label="Password">
          <div className="relative mb-0">
            <input
              className="field pr-11"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </AuthField>
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
        >
          Log in <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
