"use client";

// Forkcast Coach — floating AI chat for diners. Honest constraints:
// answers carry a not-medical-advice footer; when the server AI key isn't
// available (e.g. the static demo site), the widget says so instead of faking.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Crown, MessageCircle, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import { usePremium, PRICE_LINE, TRIAL_DAYS, FREE_DAILY_MESSAGES } from "@/lib/premium";
import { cls } from "@/lib/format";

interface Msg { role: "user" | "assistant"; content: string }

const HIDE_ON = ["/partner", "/login", "/signup", "/forgot-password", "/onboarding"];
// Personalized starters when a profile exists; general ones when not.
const QUICK_PERSONAL = [
  "What should I order tonight?",
  "How is my Fit Score calculated?",
  "High-protein picks under 600 cal?",
];
const QUICK_GENERAL = [
  "How does Forkcast work?",
  "What makes a restaurant meal balanced?",
  "Why should I set up a profile?",
];

export function CoachChat() {
  const pathname = usePathname();
  const { user, hydrated: authHydrated } = useAuth();
  const { profile, targets, calibration, consumedToday, hydrated } = useUser();
  const { isPremium, trialActive, trialDaysLeft, hasAccess, messagesLeftToday, consumeMessage, upgradeDemo, cloud, premiumRequested } = usePremium();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  if (!authHydrated || !user || user.role === "restaurant") return null;
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy || !hasAccess) return;
    // Daily allowance for non-premium (trial) users — Premium is unlimited.
    if (messagesLeftToday <= 0) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `You've used today's ${FREE_DAILY_MESSAGES} trial messages. Premium (${PRICE_LINE}) removes the limit — or come back tomorrow.` },
      ]);
      return;
    }
    consumeMessage();
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const consumed = hydrated ? consumedToday() : null;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: profile && targets ? {
            goal: profile.goal,
            dailyTargets: targets,
            consumedToday: consumed,
            remainingCalories: consumed ? Math.max(0, targets.calories - consumed.calories) : targets.calories,
            allergies: profile.avoid,
            conditions: profile.conditions,
            calibration: calibration?.status === "active" ? { observedTdee: calibration.observedTdee, blendedTdee: calibration.blendedTdee } : undefined,
          } : undefined,
        }),
      });
      const body = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: res.ok && body.reply
            ? body.reply
            : "I can't reach the AI service on this deployment — the coach runs where the server AI key is configured (local dev or the SSR site). Everything else in Forkcast still works.",
        },
      ]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Connection hiccup — try that again in a moment." }]);
    }
    setBusy(false);
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Forkcast Coach"
          className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-ink text-white shadow-[0_8px_30px_-6px_rgba(32,30,29,0.5)] transition hover:scale-105 hover:bg-black"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[min(34rem,85vh)] w-full flex-col overflow-hidden border border-black/10 bg-white shadow-2xl sm:bottom-4 sm:right-4 sm:w-96 sm:rounded-3xl">
          <div className="flex items-center gap-2.5 border-b-2 border-ink/40 bg-ink px-4 py-3 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600"><Sparkles className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-display text-sm font-bold">
                Forkcast Coach
                {isPremium ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"><Crown className="h-2.5 w-2.5" /> Premium</span>
                ) : trialActive ? (
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">Trial · {trialDaysLeft}d left</span>
                ) : null}
              </p>
              <p className="text-[11px] text-white/60">
                {profile ? "Personalized to your plan" : "General guidance"} — not medical advice
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {/* Trial expired: honest, demo-labeled upgrade gate */}
            {!hasAccess && (
              <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-4">
                <p className="flex items-center gap-1.5 font-display font-bold text-ink"><Crown className="h-4 w-4 text-brand-600" /> Your {TRIAL_DAYS}-day trial has ended</p>
                <p className="mt-1.5 text-sm text-ink/65">
                  The coach, unlimited photo AI, and metabolic calibration are part of <strong>Forkcast Premium</strong> ({PRICE_LINE}).
                  Everything core stays free forever: Fit Scores, discovery, ordering, and confirmed meal logging.
                </p>
                {premiumRequested ? (
                  <p className="mt-3 rounded-full bg-brand-100 px-4 py-2.5 text-center text-sm font-bold text-brand-800">Request sent — Premium will be enabled on your account shortly.</p>
                ) : (
                  <button
                    onClick={upgradeDemo}
                    className="mt-3 w-full rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    {cloud ? "Request Premium access" : "Activate Premium (demo — no payment)"}
                  </button>
                )}
                <p className="mt-1.5 text-center text-[10px] text-ink/45">{cloud ? "Purchases open soon — until then, access is granted on request." : "Demo prototype: this flips a local flag so the flow can be evaluated. Production uses real billing."}</p>
              </div>
            )}
            {hasAccess && msgs.length === 0 && (
              <div>
                <p className="text-sm text-ink/60">
                  {profile
                    ? <>Hi{profile.name ? ` ${profile.name.split(" ")[0]}` : ""} — I can help you pick dishes for what&apos;s left of your day, explain your numbers, or navigate menus with your flags in mind.</>
                    : <>Hi — I can answer general nutrition and Forkcast questions. <Link href="/onboarding" className="font-semibold text-brand-700 underline" onClick={() => setOpen(false)}>Set up your profile</Link> and I&apos;ll tailor everything to your own targets, allergies, and remaining budget.</>}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {(profile ? QUICK_PERSONAL : QUICK_GENERAL).map((qp) => (
                    <button key={qp} onClick={() => send(qp)} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-left text-sm font-medium text-ink/70 transition hover:border-brand-600 hover:text-ink">
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cls("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-black/[0.05] text-ink")}>
                {m.content}
              </div>
            ))}
            {busy && <div className="w-16 animate-pulse rounded-2xl bg-black/[0.05] px-3.5 py-2.5 text-sm text-ink/40">…</div>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-black/5 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={!hasAccess ? "Premium required — activate above" : !isPremium && Number.isFinite(messagesLeftToday) ? `Ask away — ${messagesLeftToday} trial messages left today` : "Ask about your day, a dish, a goal…"}
              disabled={!hasAccess}
              className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brand-600 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim() || !hasAccess}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
