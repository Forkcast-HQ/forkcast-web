"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, Sparkles, X, AlertTriangle } from "lucide-react";
import { analyzeMealPhoto, mockEstimate, type MealEstimate } from "@/lib/ai";
import { useUser } from "@/lib/store";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    try {
      setEstimate(await analyzeMealPhoto(dataUrl));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI analysis failed");
      setEstimate(await mockEstimate(dataUrl));
    }
    setStatus("review");
  };

  const reset = () => {
    setStatus("idle");
    setPreview(null);
    setEstimate(null);
    setErr(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const confirm = () => {
    if (!estimate) return;
    logMeal({
      name: estimate.name,
      calories: estimate.calories,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      fiber: estimate.fiber,
      sodium: estimate.sodium,
      sugar: estimate.sugar,
      source: "photo",
      photo: preview ?? undefined,
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
          AI estimate
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

        {status === "idle" && (
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

              {status === "review" && estimate && (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{estimate.name}</p>
                        <span className={cls("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", estimate.source === "ai" ? "bg-brand-600 text-white" : "bg-black/[0.06] text-ink/55")}>
                          {estimate.source === "ai" ? "Groq AI" : "estimate"}
                        </span>
                      </div>
                      <p className="text-xs text-ink/50">
                        {Math.round(estimate.confidence * 100)}% confidence · not quite right? Retake below.
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
                    <Stat label="Cal" value={estimate.calories} />
                    <Stat label="Protein" value={`${estimate.protein}g`} />
                    <Stat label="Carbs" value={`${estimate.carbs}g`} />
                    <Stat label="Fat" value={`${estimate.fat}g`} />
                  </div>

                  <p className="mt-3 text-xs text-ink/50">
                    Detected: {estimate.items.join(", ")}
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-black/[0.03] py-2">
      <p className="font-display text-lg font-bold text-ink">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink/45">{label}</p>
    </div>
  );
}
