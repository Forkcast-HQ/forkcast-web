"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Store, User } from "lucide-react";
import { useAuth, lastEmail } from "@/lib/auth";
import { AuthShell, AuthField, type AuthPanelContent } from "@/components/AuthShell";
import { cls } from "@/lib/format";

const RESTAURANT_PANEL: AuthPanelContent = {
  kicker: "Forkcast for restaurants",
  headline: "Your order terminal and menu tools.",
  bullets: [
    "Live orders with customer allergy flags",
    "Review & correct your menu's nutrition — versioned",
    "Sponsored placement never changes Fit Scores",
  ],
  factBold: "2 in 3",
  fact: "diners underestimate restaurant-meal calories. Verified menus turn that trust gap into your advantage.",
  factCite: "Peer-reviewed, BMJ/JAMA",
};

export default function LogIn() {
  const router = useRouter();
  const { logIn, user, hydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asRestaurant, setAsRestaurant] = useState(false);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("as") === "restaurant") setAsRestaurant(true);
    } catch { /* ignore */ }
    // Prefill the last-used email (never the password — that's the browser's
    // password manager's job, which the autocomplete attributes trigger).
    const remembered = lastEmail();
    if (remembered) setEmail(remembered);
  }, []);

  useEffect(() => {
    if (hydrated && user) router.replace(user.role === "restaurant" ? "/partner" : "/dashboard");
  }, [hydrated, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await logIn({ email, password });
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    // Redirect happens in the effect above once the session updates
    // (restaurants go to the partner terminal, diners to the dashboard).
  };

  return (
    <AuthShell
      title={asRestaurant ? "Restaurant sign in" : "Welcome back"}
      subtitle={asRestaurant ? "Log in to open your order terminal." : "Log in to pick up your plan."}
      panel={asRestaurant ? RESTAURANT_PANEL : undefined}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: false, label: "I'm a diner", icon: <User className="h-4 w-4" /> },
              { key: true, label: "I'm a restaurant", icon: <Store className="h-4 w-4" /> },
            ] as const
          ).map((o) => (
            <button
              key={String(o.key)}
              type="button"
              onClick={() => setAsRestaurant(o.key)}
              aria-pressed={asRestaurant === o.key}
              className={cls(
                "flex items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 text-sm font-bold text-ink transition",
                asRestaurant === o.key ? "border-ink bg-black/[0.03]" : "border-black/10 hover:border-black/25",
              )}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>

        <AuthField label="Email">
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" required />
          {email && email === lastEmail() && (
            <p className="mt-1 text-xs text-ink/45">
              Welcome back.{" "}
              <button type="button" onClick={() => setEmail("")} className="font-semibold text-brand-700 hover:underline">
                Not you?
              </button>
            </p>
          )}
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
        <Link href={asRestaurant ? "/signup?role=restaurant" : "/signup"} className="font-semibold text-brand-700 hover:underline">
          {asRestaurant ? "Register your restaurant" : "Create an account"}
        </Link>
      </p>
    </AuthShell>
  );
}
