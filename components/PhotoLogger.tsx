"use client";

import { useRef, useState } from "react";
import { Camera, Check, Crown, Loader2, Sparkles, X, AlertTriangle } from "lucide-react";
import { analyzeMealPhoto, mockEstimate, type MealEstimate } from "@/lib/ai";
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
  const { isPremium, trialActive, trialDaysLeft, hasAccess, upgradeDemo, cloud } = usePremium();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Correctable copy of the estimate — the AI is a starting point, never the record.
  const [edit, setEdit] = useState<{ name: string; calories: string; protein: string; carbs: string; fat: string } | null>(null);

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
    try {
      est = await analyzeMealPhoto(dataUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI analysis failed");
      est = await mockEstimate(dataUrl);
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

  const reset = () => {
    setStatus("idle");
    setPreview(null);
    setEstimate(null);
    setEdit(null);
    setErr(null);
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
      calories,
      protein: num(edit.protein, estimate.protein),
      carbs: num(edit.carbs, estimate.carbs),
      fat: num(edit.fat, estimate.fat),
      fiber: Math.round(estimate.fiber * ratio),
      sodium: Math.round(estimate.sodium * ratio),
      sugar: Math.round(estimate.sugar * ratio),
      source: "photo",
      photo: preview ?? undefined,
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
            <button onClick={upgradeDemo} className="mt-4 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
              {cloud ? "Request Premium access (pilot)" : "Activate Premium (demo — no payment)"}
            </button>
          </div>
        )}

        {status === "idle" && hasAccess && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-black/15 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
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
        )}

        {status !== "idle" && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-black/5 sm:w-40">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Meal" className="h-full w-full object-cover" />
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

                  <p className="mt-3 text-xs text-ink/50">
                    Detected: {estimate.items.join(", ")} — wrong? Fix the name and values above; corrections are recorded with the entry.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={confirm}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Check className="h-4 w-4" /> Log to today
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
    <label className="block cursor-text rounded-lg bg-black/[0.03] py-2 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-600/40">
      <span className="relative inline-flex items-baseline justify-center">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          className="w-14 bg-transparent text-center font-display text-lg font-bold text-ink focus:outline-none"
          aria-label={`${label} — editable`}
        />
        {unit && <span className="text-xs text-ink/40">{unit}</span>}
      </span>
      <span className="block text-[11px] uppercase tracking-wide text-ink/45">{label}</span>
    </label>
  );
}
