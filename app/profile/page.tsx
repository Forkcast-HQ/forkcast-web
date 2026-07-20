"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, LogOut, Save, Trash2, User, Watch, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/store";
import { cloudEnabled } from "@/lib/supabase";
import {
  getHealthStatus,
  connectGoogleHealth,
  disconnectGoogleHealth,
  connectWhoop,
  disconnectWhoop,
  setAutoSyncMeals,
  type HealthStatus,
} from "@/lib/health";
import {
  ACTIVITY_LABELS,
  BMI_SCREENING_NOTE,
  COMMON_ALLERGENS,
  CONDITIONS,
  GOAL_LABELS,
  bmiInfo,
  computeTargets,
  cmToIn,
  ftInToCm,
  kgToLb,
  lbToKg,
} from "@/lib/nutrition";
import type { ActivityLevel, Goal, HealthProfile, Sex } from "@/lib/types";
import { MacroRing } from "@/components/MacroRing";
import { Avatar } from "@/components/Avatar";
import { usePremium, PRICE_LINE, TRIAL_DAYS } from "@/lib/premium";
import { cls } from "@/lib/format";

const DIETS = ["Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Halal", "Dairy-free"];
const clampNum = (v: string, lo: number, hi: number, fb: number) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? fb : Math.max(lo, Math.min(hi, n));
};

export default function Profile() {
  const router = useRouter();
  const { user, hydrated, logOut, updateName } = useAuth();
  const { profile, hydrated: storeHydrated, setProfile, resetAll } = useUser();
  const { isPremium, trialActive, trialDaysLeft, upgradeDemo, cancelDemo, cloud, plan, premiumRequested } = usePremium();

  // Connected apps — Fitbit/Google Health and WHOOP (cloud accounts only;
  // there's nowhere durable to store a token in device-only demo mode).
  // Apple Watch and Samsung Health are listed in the picker but not wired
  // up: HealthKit and the Samsung Health SDK are on-device only, so they'll
  // need the not-yet-built native mobile app rather than a cloud OAuth flow
  // like Fitbit/WHOOP.
  const DISCONNECTED_STATUS = { connected: false } as const;
  const [health, setHealth] = useState<HealthStatus>({ googleHealth: DISCONNECTED_STATUS, whoop: DISCONNECTED_STATUS });
  const [healthLoading, setHealthLoading] = useState<string | null>(null); // provider key currently in-flight
  const [healthNotice, setHealthNotice] = useState<string | null>(null);
  const [devicePick, setDevicePick] = useState("whoop");

  const PROVIDER_LABEL: Record<string, string> = {
    google_health: "Fitbit / Google Health",
    whoop: "WHOOP",
    apple_watch: "Apple Watch",
    samsung_health: "Samsung Health",
  };

  useEffect(() => {
    if (!cloudEnabled() || !user) return;
    getHealthStatus().then(setHealth);
    // window.location (not useSearchParams) keeps the static export
    // Suspense-free — same convention as app/signup/page.tsx.
    try {
      const params = new URLSearchParams(window.location.search);
      const result = params.get("health");
      const provider = params.get("provider") ?? "google_health";
      const label = PROVIDER_LABEL[provider] ?? provider;
      if (result === "connected") {
        setHealthNotice(`${label} connected.`);
        router.replace("/profile");
      } else if (result === "error") {
        const reason = params.get("reason");
        setHealthNotice(`Couldn't connect ${label}${reason ? ` (${reason.replace(/_/g, " ")})` : ""} — try again.`);
        router.replace("/profile");
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleConnectHealth = async () => {
    setHealthLoading("google_health");
    const err = await connectGoogleHealth();
    if (err) {
      setHealthNotice(err);
      setHealthLoading(null);
    }
    // On success the browser navigates away to Google's consent screen.
  };

  const handleDisconnectHealth = async () => {
    if (!confirm("Disconnect Fitbit / Google Health? Forkcast will stop syncing meals and steps/calories won't show on your dashboard.")) return;
    setHealthLoading("google_health");
    const ok = await disconnectGoogleHealth();
    setHealth((h) => (ok ? { ...h, googleHealth: { connected: false } } : h));
    setHealthNotice(ok ? "Disconnected." : "Couldn't disconnect — try again.");
    setHealthLoading(null);
  };

  const handleConnectWhoop = async () => {
    setHealthLoading("whoop");
    const err = await connectWhoop();
    if (err) {
      setHealthNotice(err);
      setHealthLoading(null);
    }
    // On success the browser navigates away to WHOOP's consent screen.
  };

  const handleDisconnectWhoop = async () => {
    if (!confirm("Disconnect WHOOP? Recovery, strain, and sleep won't show on your dashboard.")) return;
    setHealthLoading("whoop");
    const ok = await disconnectWhoop();
    setHealth((h) => (ok ? { ...h, whoop: { connected: false } } : h));
    setHealthNotice(ok ? "Disconnected." : "Couldn't disconnect — try again.");
    setHealthLoading(null);
  };

  const handleToggleAutoSync = async (enabled: boolean) => {
    setHealth((h) => ({ ...h, googleHealth: { ...h.googleHealth, autoSyncMeals: enabled } }));
    await setAutoSyncMeals(enabled);
  };

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
  const [goalW, setGoalW] = useState(""); // in current display unit
  const [dietary, setDietary] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!storeHydrated) return;
    setName(user?.name || "");
    if (profile) {
      setSex(profile.sex);
      setAge(String(profile.age));
      setActivity(profile.activity);
      setGoal(profile.goal);
      setGoalW(profile.goalWeightKg ? String(Math.round(kgToLb(profile.goalWeightKg))) : "");
      setDietary(profile.dietary || []);
      setAvoid(profile.avoid || []);
      setConditions(profile.conditions || []);
      const inches = cmToIn(profile.heightCm);
      setFt(String(Math.floor(inches / 12)));
      setInch(String(Math.round(inches % 12)));
      setLb(String(Math.round(kgToLb(profile.weightKg))));
      setCm(String(Math.round(profile.heightCm)));
      setKg(String(Math.round(profile.weightKg)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeHydrated]);

  const heightCm = units === "imperial" ? ftInToCm(clampNum(ft, 3, 8, 5), clampNum(inch, 0, 11, 9)) : clampNum(cm, 120, 230, 175);
  const weightKg = units === "imperial" ? lbToKg(clampNum(lb, 70, 600, 175)) : clampNum(kg, 35, 270, 79);
  const ageNum = clampNum(age, 14, 100, 30);
  const draft: HealthProfile = useMemo(
    () => {
      const gw = parseFloat(goalW);
      const goalWeightKg = Number.isNaN(gw) || gw <= 0 ? undefined : units === "imperial" ? lbToKg(gw) : gw;
      return { name, sex, age: ageNum, heightCm, weightKg, activity, goal, goalWeightKg, dietary, avoid, conditions, createdAt: profile?.createdAt ?? Date.now() };
    },
    [name, sex, ageNum, heightCm, weightKg, activity, goal, goalW, units, dietary, avoid, conditions, profile?.createdAt],
  );
  const targets = computeTargets(draft);
  const bmi = bmiInfo(weightKg, heightCm);

  const save = () => {
    updateName(name);
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  if (!hydrated || !storeHydrated) return <div className="py-24 text-center text-ink/40">Loading…</div>;
  if (!user) return null;

  // Restaurant accounts: terminal-focused settings — no diner health cabinet.
  if (user.role === "restaurant") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} email={user.email} size={56} />
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Restaurant account</h1>
            <p className="text-ink/55">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Card icon={<User className="h-5 w-5" />} title="Account">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Restaurant / contact name"><input className="field" value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Email"><input className="field opacity-60" value={user.email} disabled /></Field>
            </div>
            <button onClick={() => { updateName(name); setSaved(true); setTimeout(() => setSaved(false), 2200); }} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save changes</>}
            </button>
          </Card>

          <Card title="Your tools">
            <p className="text-sm text-ink/60">
              Receive live orders with customer allergy/diet flags, quote prep times, and review or correct your menu&apos;s
              nutrition data — every correction versioned and timestamped.
            </p>
            <Link href="/partner" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black">
              Open the partner terminal <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card title="Danger zone" danger>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { logOut(); router.push("/"); }} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} email={user.email} size={56} />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Profile &amp; settings</h1>
          <p className="text-ink/55">{user.email}</p>
        </div>
      </div>

      {!profile && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/70"><strong>Finish setting up</strong> to get your targets and recommendations.</p>
          <Link href="/onboarding" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Complete onboarding</Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card icon={<User className="h-5 w-5" />} title="Account">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name"><input className="field" value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Email"><input className="field opacity-60" value={user.email} disabled /></Field>
            </div>
          </Card>

          <Card title="Body & goal">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Age"><input className="field" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} onBlur={() => setAge(String(clampNum(age, 14, 100, 30)))} /></Field>
              <Field label="Sex"><Toggle options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} value={sex} onChange={(v) => setSex(v as Sex)} /></Field>
              <Field label="Units">
                <Toggle options={[{ value: "imperial", label: "lb / ft" }, { value: "metric", label: "kg / cm" }]} value={units} onChange={(v) => {
                  const next = v as "imperial" | "metric";
                  const gw = parseFloat(goalW);
                  if (!Number.isNaN(gw) && gw > 0 && next !== units) {
                    setGoalW(String(Math.round(next === "metric" ? lbToKg(gw) : kgToLb(gw))));
                  }
                  setUnits(next);
                }} />
              </Field>
              <div className="hidden sm:block" />
              {units === "imperial" ? (
                <>
                  <Field label="Height">
                    <div className="flex gap-2">
                      <Suffixed v={ft} set={setFt} clamp={[3, 8, 5]} suffix="ft" />
                      <Suffixed v={inch} set={setInch} clamp={[0, 11, 9]} suffix="in" />
                    </div>
                  </Field>
                  <Field label="Weight"><Suffixed v={lb} set={setLb} clamp={[70, 600, 175]} suffix="lb" /></Field>
                </>
              ) : (
                <>
                  <Field label="Height"><Suffixed v={cm} set={setCm} clamp={[120, 230, 175]} suffix="cm" /></Field>
                  <Field label="Weight"><Suffixed v={kg} set={setKg} clamp={[35, 270, 79]} suffix="kg" /></Field>
                </>
              )}
            </div>
            <Field label="Goal"><Toggle options={[{ value: "lose", label: GOAL_LABELS.lose }, { value: "maintain", label: GOAL_LABELS.maintain }, { value: "gain", label: GOAL_LABELS.gain }]} value={goal} onChange={(v) => setGoal(v as Goal)} /></Field>
            <Field label={`Goal weight (${units === "imperial" ? "lb" : "kg"}, optional)`}>
              <input className="field" inputMode="decimal" value={goalW} onChange={(e) => setGoalW(e.target.value)} placeholder={units === "imperial" ? "e.g. 165" : "e.g. 75"} />
            </Field>
            <Field label="Activity">
              <select className="field" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (<option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>))}
              </select>
            </Field>
            <Field label="Dietary preferences">
              <ChipGroup options={DIETS} value={dietary} onChange={setDietary} />
            </Field>
            <Field label="Allergies — dishes that may contain these get flagged">
              <ChipGroup options={[...COMMON_ALLERGENS]} value={avoid} onChange={setAvoid} />
              <p className="mt-2 text-xs text-ink/45">
                Flags are advisories from menu text — never a guarantee. Always confirm allergens directly with the restaurant.
              </p>
            </Field>
            <Field label="Health conditions — adds sodium / sugar / fat advisories to dishes">
              <ChipGroup options={[...CONDITIONS]} value={conditions} onChange={setConditions} />
              <p className="mt-2 text-xs text-ink/45">
                Self-reported, stored only on your device, and used solely to flag dishes. Informational — not medical advice.
              </p>
            </Field>
            <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save changes</>}
            </button>
          </Card>

          {cloud && (
            <Card icon={<Watch className="h-5 w-5" />} title="Connected apps">
              {healthNotice && (
                <p className="rounded-lg bg-black/[0.03] px-3 py-2 text-xs text-ink/60">{healthNotice}</p>
              )}

              {health.googleHealth.connected && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Fitbit / Google Health</p>
                    <p className="mt-0.5 text-sm text-ink/60">
                      Connected — logged meals sync to your Fitbit nutrition log, and steps / active calories show on your dashboard.
                    </p>
                    <label className="mt-2 flex items-center gap-2.5 text-sm text-ink/70">
                      <input
                        type="checkbox"
                        checked={health.googleHealth.autoSyncMeals ?? true}
                        onChange={(e) => handleToggleAutoSync(e.target.checked)}
                        className="h-4 w-4 rounded border-black/20 text-brand-600 focus:ring-brand-500"
                      />
                      Auto-sync every logged meal to Fitbit
                    </label>
                  </div>
                  <button
                    onClick={handleDisconnectHealth}
                    disabled={healthLoading === "google_health"}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20 disabled:opacity-50"
                  >
                    {healthLoading === "google_health" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Disconnect
                  </button>
                </div>
              )}

              {health.whoop.connected && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">WHOOP</p>
                    <p className="mt-0.5 text-sm text-ink/60">
                      Connected — recovery score, day strain, and sleep performance show on your dashboard. (WHOOP has no food log, so meal sync stays Fitbit-only.)
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnectWhoop}
                    disabled={healthLoading === "whoop"}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20 disabled:opacity-50"
                  >
                    {healthLoading === "whoop" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Disconnect
                  </button>
                </div>
              )}

              {(!health.googleHealth.connected || !health.whoop.connected) && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={devicePick}
                    onChange={(e) => setDevicePick(e.target.value)}
                    className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none"
                  >
                    {!health.whoop.connected && <option value="whoop">WHOOP</option>}
                    {!health.googleHealth.connected && <option value="google_health">Fitbit / Google Health</option>}
                    <option value="apple_watch">Apple Watch (coming soon)</option>
                    <option value="samsung_health">Samsung Health (coming soon)</option>
                  </select>
                  {devicePick === "apple_watch" || devicePick === "samsung_health" ? (
                    <p className="text-xs text-ink/45">
                      Needs Forkcast's mobile app — {devicePick === "apple_watch" ? "Apple Health" : "Samsung Health"} data lives on-device, not in a cloud API like Fitbit/WHOOP.
                    </p>
                  ) : (
                    <button
                      onClick={devicePick === "whoop" ? handleConnectWhoop : handleConnectHealth}
                      disabled={healthLoading !== null}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Connect
                    </button>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card title="Membership">
            <p className="text-sm text-ink/65">
              {isPremium ? (
                <><strong className="text-brand-700">{cloud ? (plan === "pilot_comp" ? "Premium (complimentary)" : "Premium") : "Premium (demo)"}</strong> — unlimited coach chat and photo AI. </>
              ) : trialActive ? (
                <><strong className="text-ink">Free trial</strong> — {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left of your {TRIAL_DAYS}-day full-access trial. </>
              ) : (
                <><strong className="text-ink">Free plan</strong> — trial ended. </>
              )}
              The core loop — Fit Scores, discovery, ordering, confirmed logging — is free forever. Premium ({PRICE_LINE})
              adds the AI coach, unlimited photo AI, and calibration depth.
            </p>
            {isPremium ? (
              cloud ? (
                <a
                  href={`mailto:support@prosperiumars.com?subject=Forkcast%20membership%20—%20manage%20or%20cancel&body=Account%20email%3A%20${encodeURIComponent(user?.email ?? "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20"
                >
                  Manage or cancel membership
                </a>
              ) : (
                <button onClick={cancelDemo} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20">
                  Cancel Premium (demo)
                </button>
              )
            ) : premiumRequested ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-bold text-brand-800">
                Request sent — Premium will be enabled on your account shortly.
              </p>
            ) : (
              <button onClick={upgradeDemo} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                {cloud ? "Request Premium access" : "Activate Premium (demo — no payment)"}
              </button>
            )}
            <p className="text-xs text-ink/40">
              {cloud
                ? "Purchases open soon. Until then, Premium access is granted on request — no payment needed."
                : "Demo prototype: no billing exists; this toggles a local flag so the gating flow can be evaluated."}
              {" "}
              <Link href="/pricing" className="font-semibold text-brand-700 hover:underline">Compare plans</Link>
            </p>
          </Card>

          <Card title="Danger zone" danger>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { logOut(); router.push("/"); }} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-black/20">
                <LogOut className="h-4 w-4" /> Log out
              </button>
              <button onClick={() => { if (confirm("Delete your profile and all logged meals? This cannot be undone.")) resetAll(); }} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                <Trash2 className="h-4 w-4" /> Reset my data
              </button>
            </div>
          </Card>
        </div>

        {/* Live targets */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white card-shadow">
            <div className="bg-brand-950 px-6 py-5 text-white">
              <p className="text-sm font-medium text-brand-200">Your targets update live</p>
              <p className="font-display text-xl font-bold">Daily plan</p>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <MacroRing value={bmi.value} max={45} size={100} color={bmi.color} centerTop="BMI" centerMain={String(bmi.value)} centerSub="" />
                <div>
                  <p className="text-sm font-bold" style={{ color: bmi.color }}>{bmi.category}</p>
                  <div className="mt-1.5 rounded-2xl bg-brand-50 px-4 py-2.5 text-center">
                    <p className="font-display text-2xl font-extrabold text-brand-700">{targets.calories}</p>
                    <p className="text-xs text-brand-700/70">kcal / day</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink/45">{BMI_SCREENING_NOTE}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[["Protein", `${targets.protein}g`, "#059669"], ["Carbs", `${targets.carbs}g`, "#0284c7"], ["Fat", `${targets.fat}g`, "#d97706"], ["Fiber", `${targets.fiber}g`, "#65a30d"]].map(([l, v, c]) => (
                  <div key={l} className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                    <span className="flex items-center gap-1.5 text-ink/65"><span className="h-2 w-2 rounded-full" style={{ background: c as string }} />{l}</span>
                    <span className="font-semibold text-ink">{v}</span>
                  </div>
                ))}
              </div>
              <Link href="/discover" className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Find a meal that fits <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((d) => {
        const on = value.includes(d);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== d) : [...value, d])}
            className={cls(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              on ? "border-brand-500 bg-brand-600 text-white" : "border-black/10 bg-white text-ink/70 hover:border-black/20",
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function Card({ icon, title, children, danger }: { icon?: React.ReactNode; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={cls("rounded-2xl border bg-white p-6", danger ? "border-red-200" : "border-black/5")}>
      <div className="mb-5 flex items-center gap-2.5">
        {icon && <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
        <h2 className={cls("font-display text-lg font-bold", danger ? "text-red-600" : "text-ink")}>{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
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

function Toggle({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-black/[0.04] p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cls("flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition", value === o.value ? "bg-white text-ink card-shadow" : "text-ink/55 hover:text-ink")}>{o.label}</button>
      ))}
    </div>
  );
}
