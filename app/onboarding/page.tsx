"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Activity, Target, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import {
  ACTIVITY_LABELS,
  ACTIVITY_FACTORS,
  GOAL_LABELS,
  bmiInfo,
  computeTargets,
  ftInToCm,
  cmToIn,
  healthyWeightRangeKg,
  kgToLb,
  lbToKg,
} from "@/lib/nutrition";
import type { ActivityLevel, Goal, HealthProfile, Sex } from "@/lib/types";
import { MacroRing } from "@/components/MacroRing";
import { cls } from "@/lib/format";

const DIETS = ["Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Halal", "Dairy-free"];
const STEPS = ["About you", "Your body", "Lifestyle", "Your plan"];

const clampNum = (v: string, lo: number, hi: number, fb: number) => {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fb;
  return Math.max(lo, Math.min(hi, n));
};

export default function Onboarding() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { profile: existing, setProfile, hydrated: storeHydrated } = useUser();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [units, setUnits] = useState<"imperial" | "metric">("imperial");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("9");
  const [lb, setLb] = useState("175");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("79");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");
  const [dietary, setDietary] = useState<string[]>([]);

  useEffect(() => {
    if (hydrated && !user) router.replace("/signup");
  }, [hydrated, user, router]);

  // Prefill from existing profile or account name.
  useEffect(() => {
    if (!storeHydrated) return;
    if (existing) {
      setName(existing.name || user?.name || "");
      setSex(existing.sex);
      setAge(String(existing.age));
      setActivity(existing.activity);
      setGoal(existing.goal);
      setDietary(existing.dietary || []);
      const inches = cmToIn(existing.heightCm);
      setFt(String(Math.floor(inches / 12)));
      setInch(String(Math.round(inches % 12)));
      setLb(String(Math.round(kgToLb(existing.weightKg))));
      setCm(String(Math.round(existing.heightCm)));
      setKg(String(Math.round(existing.weightKg)));
    } else if (user?.name) {
      setName(user.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeHydrated]);

  const heightCm = units === "imperial" ? ftInToCm(clampNum(ft, 3, 8, 5), clampNum(inch, 0, 11, 9)) : clampNum(cm, 120, 230, 175);
  const weightKg = units === "imperial" ? lbToKg(clampNum(lb, 70, 600, 175)) : clampNum(kg, 35, 270, 79);
  const ageNum = clampNum(age, 14, 100, 30);

  const profile: HealthProfile = useMemo(
    () => ({ name, sex, age: ageNum, heightCm, weightKg, activity, goal, dietary, avoid: [], createdAt: Date.now() }),
    [name, sex, ageNum, heightCm, weightKg, activity, goal, dietary],
  );
  const bmi = bmiInfo(weightKg, heightCm);
  const targets = computeTargets(profile);
  const [loKg, hiKg] = healthyWeightRangeKg(heightCm);

  const save = () => {
    setProfile(profile);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Progress */}
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className={cls("grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition", i <= step ? "bg-brand-600 text-white" : "bg-black/[0.06] text-ink/40")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cls("mx-2 h-0.5 flex-1 rounded transition", i < step ? "bg-brand-500" : "bg-black/[0.08]")} />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-sm font-semibold uppercase tracking-wide text-brand-600">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Step content */}
        <div className="animate-rise rounded-3xl border border-black/5 bg-white p-6 sm:p-8" key={step}>
          {step === 0 && (
            <div className="space-y-6">
              <H title="Let's start with the basics" sub="We use sex and age in the metabolic-rate formula." />
              <Field label="First name">
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Age">
                  <input className="field" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} onBlur={() => setAge(String(clampNum(age, 14, 100, 30)))} />
                </Field>
                <Field label="Sex">
                  <Toggle options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} value={sex} onChange={(v) => setSex(v as Sex)} />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <H title="Your measurements" sub="Drives your BMI and calorie needs." />
                <Toggle small options={[{ value: "imperial", label: "lb / ft" }, { value: "metric", label: "kg / cm" }]} value={units} onChange={(v) => setUnits(v as "imperial" | "metric")} />
              </div>
              {units === "imperial" ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Height">
                    <div className="flex gap-2">
                      <Suffixed v={ft} set={setFt} clamp={[3, 8, 5]} suffix="ft" />
                      <Suffixed v={inch} set={setInch} clamp={[0, 11, 9]} suffix="in" />
                    </div>
                  </Field>
                  <Field label="Weight"><Suffixed v={lb} set={setLb} clamp={[70, 600, 175]} suffix="lb" /></Field>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Height"><Suffixed v={cm} set={setCm} clamp={[120, 230, 175]} suffix="cm" /></Field>
                  <Field label="Weight"><Suffixed v={kg} set={setKg} clamp={[35, 270, 79]} suffix="kg" /></Field>
                </div>
              )}
              <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
                Your healthy weight range for this height: <strong>{Math.round(kgToLb(loKg))}–{Math.round(kgToLb(hiKg))} lb</strong> ({loKg}–{hiKg} kg).
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div>
                <H title="Activity level" sub="How active are you in a typical week?" icon={<Activity className="h-5 w-5" />} />
                <div className="mt-4 space-y-2">
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                    <button key={a} onClick={() => setActivity(a)} className={cls("flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition", activity === a ? "border-brand-500 bg-brand-50 text-ink" : "border-black/10 bg-white text-ink/70 hover:border-black/20")}>
                      <span className="font-medium">{ACTIVITY_LABELS[a]}</span>
                      <span className="text-xs text-ink/40">×{ACTIVITY_FACTORS[a]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <H title="Your goal" sub="We'll set a safe deficit or surplus." icon={<Target className="h-5 w-5" />} />
                <div className="mt-4">
                  <Toggle options={[{ value: "lose", label: GOAL_LABELS.lose }, { value: "maintain", label: GOAL_LABELS.maintain }, { value: "gain", label: GOAL_LABELS.gain }]} value={goal} onChange={(v) => setGoal(v as Goal)} />
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-ink/70">Dietary preferences (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => {
                      const on = dietary.includes(d);
                      return (
                        <button key={d} onClick={() => setDietary((c) => (on ? c.filter((x) => x !== d) : [...c, d]))} className={cls("rounded-full border px-3.5 py-1.5 text-sm font-medium transition", on ? "border-brand-500 bg-brand-600 text-white" : "border-black/10 bg-white text-ink/70 hover:border-black/20")}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <H title="Your plan is ready" sub="Here's what we'll target. You can change any of this later in settings." />
              <div className="grid grid-cols-2 gap-3">
                <Big label="Daily calories" value={`${targets.calories}`} accent />
                <Big label="BMI" value={`${bmi.value}`} note={bmi.category} />
                <Small label="Protein" value={`${targets.protein}g`} />
                <Small label="Carbs" value={`${targets.carbs}g`} />
                <Small label="Fat" value={`${targets.fat}g`} />
                <Small label="Fiber" value={`${targets.fiber}g`} />
              </div>
              <p className="text-sm text-ink/55">
                Based on a {targets.bmr} kcal BMR (Mifflin-St Jeor) × {ACTIVITY_FACTORS[activity]} activity = {targets.tdee} kcal TDEE,
                {goal === "lose" ? " minus a 500 kcal deficit (~1 lb/week)." : goal === "gain" ? " plus a lean surplus." : " held at maintenance."}
              </p>
              <button onClick={save} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
                Save &amp; go to my dashboard <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Nav */}
          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink/60 transition hover:bg-black/5 disabled:opacity-0">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep((s) => Math.min(3, s + 1))} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live plan preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white card-shadow">
            <div className="bg-brand-950 px-6 py-5 text-white">
              <p className="text-sm font-medium text-brand-200">Live preview</p>
              <p className="font-display text-xl font-bold">{name ? `${name.split(" ")[0]}'s plan` : "Your plan"}</p>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <MacroRing value={bmi.value} max={40} size={104} color={bmi.color} centerTop="BMI" centerMain={String(bmi.value)} centerSub={bmi.category} />
                <div className="text-sm">
                  <p className="font-semibold text-ink">{GOAL_LABELS[goal]}</p>
                  <p className="mt-1 text-ink/55">{ACTIVITY_LABELS[activity].split(" — ")[0]}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-brand-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Daily target</p>
                <p className="font-display text-4xl font-extrabold text-brand-700">{targets.calories}</p>
                <p className="text-xs text-brand-700/70">calories</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Mini label="Protein" value={`${targets.protein}g`} c="#059669" />
                <Mini label="Carbs" value={`${targets.carbs}g`} c="#0284c7" />
                <Mini label="Fat" value={`${targets.fat}g`} c="#d97706" />
                <Mini label="Fiber" value={`${targets.fiber}g`} c="#65a30d" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function H({ title, sub, icon }: { title: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        {icon && <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      </div>
      <p className="mt-1.5 text-ink/55">{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function Suffixed({ v, set, clamp, suffix }: { v: string; set: (s: string) => void; clamp: [number, number, number]; suffix: string }) {
  return (
    <div className="relative flex-1">
      <input className="field pr-9" type="number" inputMode="numeric" value={v} onChange={(e) => set(e.target.value)} onBlur={() => set(String(clampNum(v, clamp[0], clamp[1], clamp[2])))} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">{suffix}</span>
    </div>
  );
}

function Toggle({ options, value, onChange, small }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; small?: boolean }) {
  return (
    <div className="flex gap-1 rounded-xl bg-black/[0.04] p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cls("flex-1 rounded-lg font-semibold transition", small ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-sm", value === o.value ? "bg-white text-ink card-shadow" : "text-ink/55 hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Big({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className={cls("rounded-2xl p-4 text-center", accent ? "bg-brand-600 text-white" : "bg-black/[0.03]")}>
      <p className={cls("text-xs font-semibold uppercase tracking-wide", accent ? "text-white/70" : "text-ink/45")}>{label}</p>
      <p className="font-display text-3xl font-extrabold">{value}</p>
      {note && <p className={cls("text-xs", accent ? "text-white/70" : "text-ink/50")}>{note}</p>}
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-3 text-center">
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink/45">{label}</p>
    </div>
  );
}

function Mini({ label, value, c }: { label: string; value: string; c: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
      <span className="flex items-center gap-1.5 text-ink/65"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
