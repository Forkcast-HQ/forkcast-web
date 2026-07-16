"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Store, User } from "lucide-react";
import { useAuth, type AccountRole } from "@/lib/auth";
import { AuthShell, AuthField, type AuthPanelContent } from "@/components/AuthShell";
import { cls } from "@/lib/format";

const RESTAURANT_PANEL: AuthPanelContent = {
  kicker: "Forkcast for restaurants",
  headline: "Health-minded diners find you. You control your data.",
  bullets: [
    "Live order terminal with customer allergy flags",
    "Review & correct your menu's nutrition — versioned, never silent",
    "Sponsored placement never changes Fit Scores",
  ],
  factBold: "2 in 3",
  fact: "diners underestimate restaurant-meal calories. Verified menus turn that trust gap into your advantage.",
  factCite: "Peer-reviewed, BMJ/JAMA",
};

export default function SignUp() {
  const router = useRouter();
  const { signUp, user, hydrated } = useAuth();
  const [role, setRole] = useState<AccountRole>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace(user.role === "restaurant" ? "/partner" : "/dashboard");
  }, [hydrated, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = signUp({ name, email, password, role });
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    router.push(role === "restaurant" ? "/partner" : "/onboarding");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={role === "restaurant" ? "Get your order terminal and menu-verification tools." : "60 seconds to your first personalized recommendation."}
      panel={role === "restaurant" ? RESTAURANT_PANEL : undefined}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Account type */}
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "customer", label: "I'm a diner", desc: "Personal plan, Fit Scores, ordering", icon: <User className="h-4 w-4" /> },
              { key: "restaurant", label: "I'm a restaurant", desc: "Order terminal, menu verification", icon: <Store className="h-4 w-4" /> },
            ] as const
          ).map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setRole(o.key)}
              aria-pressed={role === o.key}
              className={cls(
                "rounded-xl border-2 p-3 text-left transition",
                role === o.key ? "border-ink bg-black/[0.03]" : "border-black/10 hover:border-black/25",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-bold text-ink">{o.icon} {o.label}</span>
              <span className="mt-0.5 block text-xs text-ink/50">{o.desc}</span>
            </button>
          ))}
        </div>

        <AuthField label={role === "restaurant" ? "Restaurant / contact name" : "Name"}>
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
