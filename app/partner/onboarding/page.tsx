"use client";

// Restaurant self-serve onboarding: claim/create a listing → add menu with
// auto-estimated nutrition → verify & publish. Writes to Supabase
// (restaurants / menu_items) under the owner's RLS. Reached from
// /signup?role=restaurant and from the partner terminal.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Loader2,
  Plus,
  Sparkles,
  Store,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cloudEnabled } from "@/lib/supabase";
import {
  createRestaurant,
  deleteMenuItem,
  estimateNutrition,
  getMyRestaurant,
  newMenuItem,
  publishRestaurant,
  saveMenuItem,
  updateRestaurant,
  type OwnedMenuItem,
  type OwnedRestaurant,
} from "@/lib/restaurant";

const STEPS = ["Listing", "Menu", "Publish"];

// "View your public page" must always point at the real public domain, not
// whatever host the owner happens to be browsing the terminal from — a
// per-deployment Vercel preview URL, for instance, is protected by Vercel's
// own login wall and isn't actually public. Override via env var if the
// production domain ever changes (e.g. a custom domain).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://palatify.com";

export default function RestaurantOnboarding() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [rest, setRest] = useState<OwnedRestaurant | null>(null);
  const [menu, setMenu] = useState<OwnedMenuItem[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", cuisine: "", neighborhood: "", address: "", blurb: "" });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const existing = await getMyRestaurant(user.id);
    if (existing) {
      setRest(existing.restaurant);
      setMenu(existing.menu);
      setForm({
        name: existing.restaurant.name,
        cuisine: existing.restaurant.cuisine,
        neighborhood: existing.restaurant.neighborhood,
        address: existing.restaurant.address,
        blurb: existing.restaurant.blurb,
      });
      // Always land on the menu editor for an existing restaurant — both
      // "Edit menu" and "Manage listing" on /partner link here, and this
      // step already gives full access back to listing details (← Back)
      // or forward to the publish/public-page screen (Review & publish →).
      // Forcing published restaurants straight to the publish screen (as
      // before) made "Edit menu" an unreachable dead end once live.
      setStep(1);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [hydrated, user, load]);

  // ---- gates ---------------------------------------------------------
  if (!hydrated || loading) {
    return <Centered><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></Centered>;
  }
  if (!cloudEnabled()) {
    return (
      <Centered>
        <Card>
          <h1 className="font-display text-2xl font-bold text-ink">Cloud storage required</h1>
          <p className="mt-2 text-ink/60">Listing setup needs the connected Palatify backend. This build is running in local demo mode.</p>
        </Card>
      </Centered>
    );
  }
  if (!user) {
    return (
      <Centered>
        <Card>
          <h1 className="font-display text-2xl font-bold text-ink">Sign in to set up your listing</h1>
          <p className="mt-2 text-ink/60">Log in with your restaurant account to claim your listing and add your menu.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/login?as=restaurant" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Log in</Link>
            <Link href="/signup?role=restaurant" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink hover:border-black/25">Create restaurant account</Link>
          </div>
        </Card>
      </Centered>
    );
  }
  if (user.role !== "restaurant") {
    return (
      <Centered>
        <Card>
          <h1 className="font-display text-2xl font-bold text-ink">This is a restaurant tool</h1>
          <p className="mt-2 text-ink/60">You&apos;re signed in as a diner. Create a dedicated restaurant account to set up a listing and order terminal.</p>
          <Link href="/signup?role=restaurant" className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Create restaurant account</Link>
        </Card>
      </Centered>
    );
  }

  // ---- step 1: listing details --------------------------------------
  const canContinueDetails = form.name.trim().length > 1 && form.address.trim().length > 2;
  const saveDetails = async () => {
    setErr("");
    setBusy(true);
    try {
      if (rest) {
        await updateRestaurant(rest.id, form);
        setRest({ ...rest, ...form });
      } else {
        const created = await createRestaurant(user.id, form);
        setRest(created);
      }
      setStep(1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save your listing.");
    } finally {
      setBusy(false);
    }
  };

  const removeDish = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setMenu((m) => m.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not remove the dish.");
    }
  };

  const publish = async () => {
    if (!rest) return;
    setErr("");
    setBusy(true);
    try {
      await publishRestaurant(rest.id);
      setRest({ ...rest, status: "published", verified: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-600">
        <Store className="h-4 w-4" /> Restaurant setup
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">Get your restaurant on Palatify</h1>

      {/* stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-brand-600 text-white" : "bg-neutral-200 text-ink/50"}`}>{i + 1}</span>
            <span className={`text-sm font-semibold ${i === step ? "text-ink" : "text-ink/45"}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-black/10" />}
          </div>
        ))}
      </div>

      {err && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700">{err}</p>}

      {step === 0 && (
        <div className="mt-8 space-y-4 rounded-2xl border border-black/5 bg-white p-6">
          <Field label="Restaurant name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Verdant" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cuisine" value={form.cuisine} onChange={(v) => setForm({ ...form, cuisine: v })} placeholder="Salads & Grain Bowls" />
            <Field label="Neighborhood" value={form.neighborhood} onChange={(v) => setForm({ ...form, neighborhood: v })} placeholder="Back Bay" />
          </div>
          <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="152 Newbury St, Boston, MA" />
          <Field label="One-line description" value={form.blurb} onChange={(v) => setForm({ ...form, blurb: v })} placeholder="Chef-built grain bowls with every macro published." />
          <div className="flex justify-end pt-2">
            <button onClick={saveDetails} disabled={!canContinueDetails || busy} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      )}

      {step === 1 && rest && (
        <MenuStep
          restaurantId={rest.id}
          menu={menu}
          setMenu={setMenu}
          onRemove={removeDish}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          setErr={setErr}
        />
      )}

      {step === 2 && rest && (
        <div className="mt-8 space-y-5">
          {rest.status === "published" ? (
            <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-6 text-center">
              <CircleCheck className="mx-auto h-10 w-10 text-brand-600" />
              <h2 className="mt-3 font-display text-2xl font-bold text-ink">{rest.name} is live on Palatify</h2>
              <p className="mt-1 text-ink/60">Your verified listing and {menu.length} {menu.length === 1 ? "dish" : "dishes"} are now discoverable to diners.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/partner" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Go to order terminal <ArrowRight className="h-4 w-4" /></Link>
                <a
                  href={`${SITE_URL}/restaurant/${rest.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink hover:border-black/25"
                >
                  View your public page
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="font-display text-xl font-bold text-ink">Review &amp; publish</h2>
              <p className="mt-1 text-sm text-ink/60">Publishing makes {rest.name} and its menu visible to diners with a verified badge. You can correct nutrition anytime.</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Summary k="Restaurant" v={rest.name} />
                <Summary k="Cuisine" v={rest.cuisine || "—"} />
                <Summary k="Neighborhood" v={rest.neighborhood || "—"} />
                <Summary k="Menu items" v={String(menu.length)} />
              </dl>
              {menu.length === 0 && <p className="mt-4 text-sm font-medium text-amber-accent">Add at least one dish before publishing.</p>}
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to menu</button>
                <button onClick={publish} disabled={busy || menu.length === 0} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish listing <CircleCheck className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Menu step ------------------------------------------------------
function MenuStep({
  restaurantId,
  menu,
  setMenu,
  onRemove,
  onBack,
  onNext,
  setErr,
}: {
  restaurantId: string;
  menu: OwnedMenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<OwnedMenuItem[]>>;
  onRemove: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  setErr: (s: string) => void;
}) {
  const [draft, setDraft] = useState<OwnedMenuItem>(() => newMenuItem(0));
  const [estimating, setEstimating] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const [saving, setSaving] = useState(false);

  const setMacro = (k: keyof OwnedMenuItem, v: number) => setDraft((d) => ({ ...d, [k]: v }));

  const estimate = async () => {
    setEstimating(true);
    setErr("");
    const est = await estimateNutrition(draft.name, draft.description);
    if (est) {
      setDraft((d) => ({ ...d, ...est, nutritionSource: "estimated" }));
      setEstimated(true);
    } else {
      setErr("Couldn't auto-estimate — enter the values manually.");
    }
    setEstimating(false);
  };

  const add = async () => {
    if (draft.name.trim().length < 2) return;
    setSaving(true);
    setErr("");
    try {
      const item = { ...draft, position: menu.length };
      await saveMenuItem(restaurantId, item);
      setMenu((m) => [...m, item]);
      setDraft(newMenuItem(menu.length + 1));
      setEstimated(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not add the dish.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 space-y-5">
      {/* existing dishes */}
      {menu.length > 0 && (
        <div className="space-y-2">
          {menu.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{m.name}</p>
                <p className="text-xs text-ink/55">{m.calories} cal · P {m.protein}g · C {m.carbs}g · F {m.fat}g · {m.fiber}g fiber</p>
              </div>
              <span className="rounded-full border border-brand-600 px-2 py-0.5 text-[10px] font-bold text-brand-700">Est. ±</span>
              <button onClick={() => onRemove(m.id)} aria-label={`Remove ${m.name}`} className="rounded-lg p-2 text-ink/40 hover:bg-black/5 hover:text-brand-700"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* add dish */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-600"><UtensilsCrossed className="h-4 w-4" /> Add a dish</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field label="Dish name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Harvest Power Bowl" />
          <Field label="Price ($)" type="number" value={draft.price ? String(draft.price) : ""} onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })} placeholder="14.50" />
        </div>
        <div className="mt-4">
          <Field label="Description (ingredients)" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} placeholder="Kale, quinoa, roasted chicken, sweet potato, almonds, lemon-tahini." />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={estimate} disabled={estimating || draft.name.trim().length < 2} className="inline-flex items-center gap-2 rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
            {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Estimate nutrition
          </button>
          {estimated && <span className="text-xs font-medium text-ink/50">Auto-estimated — review and adjust below.</span>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Macro label="Calories" value={draft.calories} onChange={(v) => setMacro("calories", v)} />
          <Macro label="Protein (g)" value={draft.protein} onChange={(v) => setMacro("protein", v)} />
          <Macro label="Carbs (g)" value={draft.carbs} onChange={(v) => setMacro("carbs", v)} />
          <Macro label="Fat (g)" value={draft.fat} onChange={(v) => setMacro("fat", v)} />
          <Macro label="Fiber (g)" value={draft.fiber} onChange={(v) => setMacro("fiber", v)} />
          <Macro label="Sodium (mg)" value={draft.sodium} onChange={(v) => setMacro("sodium", v)} />
          <Macro label="Sugar (g)" value={draft.sugar} onChange={(v) => setMacro("sugar", v)} />
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={add} disabled={saving || draft.name.trim().length < 2} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add dish</>}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button onClick={onNext} disabled={menu.length === 0} className="inline-flex items-center gap-2 rounded-full bg-brand-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-40">Review &amp; publish <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ---- small UI helpers ----------------------------------------------
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500" />
    </label>
  );
}
function Macro({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/45">{label}</span>
      <input type="number" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm tabular-nums outline-none focus:border-brand-500" />
    </label>
  );
}
function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
    </div>
  );
}
function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[60vh] place-items-center px-4">{children}</div>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 text-center">{children}</div>;
}
