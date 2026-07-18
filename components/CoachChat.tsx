"use client";

// Forkcast Coach — floating AI chat for diners. Honest constraints:
// answers carry a not-medical-advice footer; when the server AI key isn't
// available (e.g. the static demo site), the widget says so instead of faking.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import { cls } from "@/lib/format";

interface Msg { role: "user" | "assistant"; content: string }

const HIDE_ON = ["/partner", "/login", "/signup", "/forgot-password", "/onboarding"];
const QUICK = [
  "What should I order tonight?",
  "How is my Fit Score calculated?",
  "High-protein picks under 600 cal?",
];

export function CoachChat() {
  const pathname = usePathname();
  const { user, hydrated: authHydrated } = useAuth();
  const { profile, targets, calibration, consumedToday, hydrated } = useUser();
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
    if (!content || busy) return;
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
              <p className="font-display text-sm font-bold">Forkcast Coach</p>
              <p className="text-[11px] text-white/60">AI guidance — not medical advice</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && (
              <div>
                <p className="text-sm text-ink/60">
                  Hi{profile?.name ? ` ${profile.name.split(" ")[0]}` : ""} — I can help you pick dishes for what&apos;s
                  left of your day, explain your numbers, or navigate menus with your flags in mind.
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {QUICK.map((qp) => (
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
              placeholder="Ask about your day, a dish, a goal…"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brand-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
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
