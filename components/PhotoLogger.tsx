"use client";

import { useRef, useState } from "react";
import { Camera, Check, Crown, Loader2, Sparkles, X, AlertTriangle, Minus, Plus, PencilLine, Wand2 } from "lucide-react";
import { analyzeMeal, mockEstimate, type MealEstimate } from "@/lib/ai";
import { useUser } from "@/lib/store";
import { usePremium, PRICE_LINE, TRIAL_DAYS } from "@/lib/premium";
import { cls } from "@/lib/format";

type Status = "idle" | "analyzing" | "review";

// Downscale to a max edge + JPEG so uploads are small and within model limits.
function resizeImage(file: File, maxEdge = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unsupported"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("could not load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("could not read file"));
    reader.readAsDataURL(file);
  });
}

export function PhotoLogger() {
  const { logMeal } = useUser();
  const { isPremium, trialActive, trialDaysLeft, hasAccess, upgradeDemo, cloud, premiumRequested } = usePremium();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Correctable copy of the estimate — the AI is a starting point, never the record.
  const [edit, setEdit] = useState<{ name: string; calories: string; protein: string; carbs: string; fat: string } | null>(null);
  // Cal AI-class accuracy levers: describe the meal (biggest lever), fix
  // results with a follow-up note, and a portion multiplier.
  const [desc, setDesc] = useState("");
  const [fixNote, setFixNote] = useState("");
  const [fixing, setFixing] = useState(false);
  const [portion, setPortion] = useState(1);

  const handleFile = async (file: File) => {
    setStatus("analyzing");
    setEstimate(null);
    setErr(null);
    let dataUrl: string;
    try {
      dataUrl = await resizeImage(file);
    } catch {
      dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });
    }
    setPreview(dataUrl);
    let est: MealEstimate;
    const note = desc.trim() || undefined;
    try {
      est = await analyzeMeal({ image: dataUrl, note });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI analysis failed");
      est = await mockEstimate(dataUrl, note);
    }
    setEstimate(est);
    setEdit({
      name: est.name,
      calories: String(est.calories),
      protein: String(est.protein),
      carbs: String(est.carbs),
      fat: String(est.fat),
    });
    setStatus("review");
  };

  const applyEstimate = (est: MealEstimate) => {
    setEstimate(est);
    setEdit({
      name: est.name,
      calories: String(est.calories),
      protein: String(est.protein),
      carbs: String(est.carbs),
      fat: String(est.fat),
    });
    setStatus("review");
  };

  // Describe-only estimation (no photo) — same engine, user's words as input.
  const handleDescribe = async () => {
    const note = desc.trim();
    if (note.length < 3) return;
    setStatus("analyzing");
    setPreview(null);
    setEstimate(null);
    setErr(null);
    let est: MealEstimate;
    try {
      est = await analyzeMeal({ note });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI analysis failed");
      est = await mockEstimate(note, note);
    }
    applyEstimate(est);
  };

  // "Fix results": tell the AI what it got wrong; it re-estimates with the
  // previous answer + your correction as context.
  const handleFix = async () => {
    const note = fixNote.trim();
    if (note.length < 3 || !estimate) return;
    setFixing(true);
    setErr(null);
    try {
      const est = await analyzeMeal({ image: preview ?? undefined, note, prior: estimate });
      applyEstimate(est);
      setFixNote("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI fix failed — edit the values directly instead");
    }
    setFixing(false);
  };

  const reset = () => {
    setStatus("idle");
    setPreview(null);
    setEstimate(null);
    setEdit(null);
    setErr(null);
    setDesc("");
    setFixNote("");
    setFixing(false);
    setPortion(1);
    if (inputRef.current) inputRef.current.value = "";
  };

  const num = (s: string, fb: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : fb;
  };

  const confirm = () => {
    if (!estimate || !edit) return;
    const calories = num(edit.calories, estimate.calories);
    // Scale minor nutrients with the calorie correction (proportional estimate).
    const ratio = estimate.calories > 0 ? calories / estimate.calories : 1;
    const changed =
      edit.name.trim() !== estimate.name ||
      calories !== estimate.calories ||
      num(edit.protein, estimate.protein) !== estimate.protein ||
      num(edit.carbs, estimate.carbs) !== estimate.carbs ||
      num(edit.fat, estimate.fat) !== estimate.fat;
    logMeal({
      name: edit.name.trim() || estimate.name,
      calories: Math.round(calories * portion),
      protein: Math.round(num(edit.protein, estimate.protein) * portion),
      carbs: Math.round(num(edit.carbs, estimate.carbs) * portion),
      fat: Math.round(num(edit.fat, estimate.fat) * portion),
      fiber: Math.round(estimate.fiber * ratio * portion),
      sodium: Math.round(estimate.sodium * ratio * portion),
      sugar: Math.round(estimate.sugar * ratio * portion),
      source: "photo",
      photo: preview ?? undefined,
      portion: portion !== 1 ? portion : undefined,
      confidence: "estimated",
      userConfidence: changed ? "modified" : undefined,
      note: changed ? "AI estimate corrected by you" : undefined,
    });
    reset();
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
      <div className="flex items-center gap-2 border-b border-black/5 bg-brand-950 px-5 py-3.5 text-white">
        <Sparkles className="h-4 w-4 text-brand-300" />
        <span className="font-semibold">Snap &amp; log a meal</span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
          {isPremium ? "Premium · AI estimate" : trialActive ? `Trial ${trialDaysLeft}d · AI estimate` : "Premium feature"}
        </span>
      </div>

      <div className="p-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {status === "idle" && !hasAccess && (
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-6 py-8 text-center">
            <Crown className="mx-auto h-8 w-8 text-brand-600" />
            <p className="mt-2 font-display font-bold text-ink">Photo AI is a Premium feature</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-ink/60">
              Your {TRIAL_DAYS}-day trial has ended. Premium ({PRICE_LINE}) includes unlimited photo logging —
              ordering and confirmed logging stay free forever.
            </p>
            {premiumRequested ? (
              <p className="mx-auto mt-4 max-w-xs rounded-full bg-brand-100 px-5 py-2.5 text-sm font-bold text-brand-800">Request sent — Premium will be enabled shortly.</p>
            ) : (
              <button onClick={upgradeDemo} className="mt-4 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
                {cloud ? "Request Premium access" : "Activate Premium (demo — no payment)"}
              </button>
            )}
          </div>
        )}

        {status === "idle" && hasAccess && (
          <div>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-black/15 px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Camera className="h-7 w-7" />
              </span>
              <span className="font-semibold text-ink">Upload or take a photo</span>
              <span className="text-sm text-ink/50">
                We&apos;ll estimate calories &amp; macros, then add it to today.
              </span>
              {justLogged && (
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  <Check className="h-4 w-4" /> Logged to today
                </span>
              )}
            </button>

            {/* Description = the biggest accuracy lever. Works with a photo or alone. */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <PencilLine className="h-4 w-4 shrink-0 text-ink/40" />
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleDescribe(); }}
                  placeholder={'What\u2019s in it? e.g. "chicken burrito, no cheese, large" — boosts accuracy'}
                  className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-brand-500"
                  aria-label="Describe the meal and quantity"
                />
              </div>
              {desc.trim().length >= 3 && (
                <button
                  onClick={handleDescribe}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <Wand2 className="h-4 w-4" /> Estimate from description — no photo needed
                </button>
              )}
            </div>
          </div>
        )}

        {status !== "idle" && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className={cls("relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-neutral-900/90 sm:w-48", !preview && status === "review" && "hidden")}>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Meal" className="h-full w-full object-contain" />
              )}
              {status === "analyzing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs font-medium">Analyzing…</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {status === "analyzing" && (
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-black/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-black/10" />
                </div>
              )}

              {status === "review" && estimate && edit && (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          value={edit.name}
                          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-semibold text-ink hover:border-neutral-300 focus:border-brand-600 focus:bg-white focus:outline-none"
                          aria-label="Meal name — edit if the AI got it wrong"
                        />
                        <span className={cls("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", estimate.source === "ai" ? "bg-brand-600 text-white" : "bg-black/[0.06] text-ink/55")}>
                          {estimate.source === "ai" ? "AI estimate" : "sample"}
                        </span>
                      </div>
                      <p className="text-xs text-ink/50">
                        {Math.round(estimate.confidence * 100)}% confidence · <strong>tap any value to correct it</strong> — you decide what gets logged.
                      </p>
                      {err && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-amber-700">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>AI unavailable — showing a sample estimate. ({err})</span>
                        </p>
                      )}
                    </div>
                    <button onClick={reset} className="rounded-full p-1 text-ink/40 hover:bg-black/5">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <EditStat label="Cal" value={edit.calories} onChange={(v) => setEdit({ ...edit, calories: v })} />
                    <EditStat label="Protein" unit="g" value={edit.protein} onChange={(v) => setEdit({ ...edit, protein: v })} />
                    <EditStat label="Carbs" unit="g" value={edit.carbs} onChange={(v) => setEdit({ ...edit, carbs: v })} />
                    <EditStat label="Fat" unit="g" value={edit.fat} onChange={(v) => setEdit({ ...edit, fat: v })} />
                  </div>

                  {/* Portion multiplier — values above are per serving */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">Portion</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPortion((p) => Math.max(0.25, Math.round((p - 0.25) * 4) / 4))} className="grid h-7 w-7 place-items-center rounded-full bg-black/5 text-ink/70 hover:bg-black/10" aria-label="Smaller portion">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-12 text-center font-display text-sm font-bold tabular-nums text-ink">×{portion}</span>
                      <button onClick={() => setPortion((p) => Math.min(4, Math.round((p + 0.25) * 4) / 4))} className="grid h-7 w-7 place-items-center rounded-full bg-black/5 text-ink/70 hover:bg-black/10" aria-label="Larger portion">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-ink/45">of the serving shown</span>
                  </div>

                  <p className="mt-3 text-xs text-ink/50">
                    Detected: {estimate.items.join(", ")} — wrong? Edit any value, or tell the AI below.
                  </p>

                  {/* Fix results: correction note re-runs the estimate with context */}
                  <div className="mt-2 flex gap-2">
                    <input
                      value={fixNote}
                      onChange={(e) => setFixNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleFix(); }}
                      placeholder={'Fix it: e.g. "it\u2019s brown rice, add sour cream, half eaten"'}
                      className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm outline-none placeholder:text-ink/35 focus:border-brand-500"
                      aria-label="Tell the AI what it got wrong"
                    />
                    <button
                      onClick={handleFix}
                      disabled={fixing || fixNote.trim().length < 3}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-40"
                    >
                      {fixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Fix
                    </button>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={confirm}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Check className="h-4 w-4" /> Log {Math.round(num(edit.calories, estimate.calories) * portion)} cal to today
                    </button>
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-black/20"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditStat({ label, value, unit, onChange }: { label: string; value: string; unit?: string; onChange: (v: string) => void }) {
  return (
    <label className="block min-w-0 cursor-text rounded-lg bg-black/[0.03] px-1 py-2 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-600/40">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        className="w-full min-w-0 bg-transparent text-center font-display text-lg font-bold text-ink focus:outline-none"
        aria-label={`${label}${unit ? ` in ${unit}` : ""} — editable`}
      />
      <span className="block truncate text-center text-[10px] uppercase tracking-wide text-ink/45">
        {label}{unit ? ` · ${unit}` : ""}
      </span>
    </label>
  );
}
