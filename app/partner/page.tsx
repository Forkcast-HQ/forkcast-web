"use client";

// Partner terminal — restaurant-side order console.
//
// Two modes:
//  • LIVE   — the signed-in restaurant owns a published listing (Supabase).
//             Orders placed to that restaurant arrive here (polled from the
//             orders table, RLS-scoped to the owner's slug), and accept →
//             preparing → ready → complete writes status back to the DB.
//  • DEMO   — no cloud backend configured: the original same-device sync-bus
//             demonstration, clearly labeled.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ChefHat,
  ClipboardCheck,
  History,
  Inbox,
  MonitorSmartphone,
  Package,
  ShieldAlert,
  Store,
} from "lucide-react";
import { RESTAURANTS, getRestaurant } from "@/data/restaurants";
import { useAuth } from "@/lib/auth";
import { cloudEnabled } from "@/lib/supabase";
import { readBus, writeBus, clearBus, correctionsFor, addCorrection } from "@/lib/bus";
import { getMyRestaurant, type OwnedMenuItem, type OwnedRestaurant } from "@/lib/restaurant";
import { fetchActiveOrders, fetchCompletedOrders, setOrderStatus } from "@/lib/restaurantOrders";
import type { LiveOrderBus, MenuCorrection } from "@/lib/types";
import { MA_MEALS_TAX } from "@/lib/order";
import { cls, money } from "@/lib/format";

const FIELDS: MenuCorrection["field"][] = ["calories", "protein", "carbs", "fat", "fiber", "sodium", "sugar"];

export default function PartnerTerminal() {
  const { user, hydrated, logOut } = useAuth();
  const cloud = cloudEnabled();

  // owner: undefined = still loading; null = none yet; object = their listing
  const [owner, setOwner] = useState<OwnedRestaurant | null | undefined>(undefined);
  const [ownerMenu, setOwnerMenu] = useState<OwnedMenuItem[]>([]);

  // DEMO transport
  const [bus, setBus] = useState<LiveOrderBus | null>(null);
  const [slug, setSlug] = useState(RESTAURANTS.find((r) => r.partner)?.slug ?? RESTAURANTS[0].slug);
  const [corrections, setCorrections] = useState<MenuCorrection[]>([]);
  const [demoCompleted, setDemoCompleted] = useState<LiveOrderBus[]>([]);

  // LIVE transport
  const [dbActive, setDbActive] = useState<LiveOrderBus[]>([]);
  const [dbCompleted, setDbCompleted] = useState<LiveOrderBus[]>([]);
  const [busy, setBusy] = useState(false);

  const isRestaurant = !!user && user.role === "restaurant";

  // Load the owner's listing (cloud only).
  useEffect(() => {
    if (!hydrated || !isRestaurant || !cloud) return;
    let alive = true;
    getMyRestaurant(user!.id).then((res) => {
      if (!alive) return;
      setOwner(res?.restaurant ?? null);
      setOwnerMenu(res?.menu ?? []);
    });
    return () => {
      alive = false;
    };
  }, [hydrated, isRestaurant, cloud, user]);

  const mode: "loading" | "demo" | "needs-listing" | "live" = !cloud
    ? "demo"
    : owner === undefined
      ? "loading"
      : owner === null
        ? "needs-listing"
        : "live";

  const refreshDemo = useCallback(() => {
    setBus(readBus());
    setCorrections(correctionsFor(slug));
  }, [slug]);

  const refreshLive = useCallback(async (s: string) => {
    const [active, done] = await Promise.all([fetchActiveOrders(s), fetchCompletedOrders(s)]);
    setDbActive(active);
    setDbCompleted(done);
  }, []);

  useEffect(() => {
    if (mode === "demo") {
      refreshDemo();
      const t = setInterval(refreshDemo, 1000);
      return () => clearInterval(t);
    }
    if (mode === "live" && owner) {
      const run = () => refreshLive(owner.slug);
      run();
      const t = setInterval(run, 3000);
      return () => clearInterval(t);
    }
  }, [mode, owner, refreshDemo, refreshLive]);

  // ---- gates ----
  if (!hydrated || mode === "loading") {
    return <div className="py-24 text-center text-ink/40">Loading…</div>;
  }
  if (!user) {
    return (
      <GateShell title="Restaurant partner terminal" body="Sign in with your restaurant account to open the live order queue and menu tools.">
        <Link href="/login?as=restaurant" className="flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700">Restaurant sign in</Link>
        <Link href="/signup?role=restaurant" className="flex w-full items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-base font-semibold text-ink/70 transition hover:border-black/25">Become a partner — register your restaurant</Link>
      </GateShell>
    );
  }
  if (!isRestaurant) {
    return (
      <GateShell title="This area is for restaurant accounts" body={`You're signed in as ${user.name || user.email} (diner). Restaurant tools live on a separate account type.`}>
        <button onClick={() => logOut()} className="flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700">Log out &amp; switch to a restaurant account</button>
        <Link href="/dashboard" className="flex w-full items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-base font-semibold text-ink/70 transition hover:border-black/25">Back to my dashboard</Link>
      </GateShell>
    );
  }
  if (mode === "needs-listing") {
    return (
      <GateShell title="Set up your listing to start receiving orders" body="Claim your restaurant, add your menu, and publish — then diners can find you and orders arrive on this terminal.">
        <Link href="/partner/onboarding" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"><Store className="h-4 w-4" /> Set up my restaurant</Link>
      </GateShell>
    );
  }

  // ---- live/demo order state ----
  const live: LiveOrderBus | null = mode === "live" ? dbActive[0] ?? null : bus;
  const waiting = mode === "live" ? Math.max(0, dbActive.length - 1) : 0;
  const completedList = mode === "live" ? dbCompleted : demoCompleted;
  const subtotal = live ? live.items.reduce((s, it) => s + it.price * it.qty, 0) : 0;

  const demoUpdate = (patch: Partial<LiveOrderBus>) => {
    if (!bus) return;
    const next = { ...bus, ...patch, ts: Date.now() };
    writeBus(next);
    setBus(next);
  };

  const doLive = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      if (owner) await refreshLive(owner.slug);
    } finally {
      setBusy(false);
    }
  };

  const accept = (prepMin: number) => {
    if (mode === "live" && live) doLive(() => setOrderStatus(live.orderId, "accepted", prepMin));
    else demoUpdate({ claimed: true, status: "accepted", prepMin });
  };
  const startPrep = () => {
    if (mode === "live" && live) doLive(() => setOrderStatus(live.orderId, "preparing"));
    else demoUpdate({ status: "preparing" });
  };
  const markReady = () => {
    if (mode === "live" && live) doLive(() => setOrderStatus(live.orderId, "ready"));
    else demoUpdate({ status: "ready" });
  };
  const complete = () => {
    if (mode === "live" && live) {
      doLive(() => setOrderStatus(live.orderId, "completed"));
    } else if (bus) {
      setDemoCompleted((prev) => [{ ...bus }, ...prev].slice(0, 10));
      clearBus();
      setBus(null);
    }
  };

  const seedRestaurant = getRestaurant(slug); // demo menu-verification target

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {mode === "live" ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="flex items-start gap-2.5 text-sm text-brand-900">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span><strong>Live terminal — {owner!.name}.</strong> Orders placed to your restaurant arrive here in real time. Accept one to send the customer a prep-time quote and a &quot;log this meal&quot; card.</span>
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="flex items-start gap-2.5 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span><strong>Demo terminal.</strong> No cloud backend is configured — this console demonstrates the restaurant workflow using same-device orders (place one in another tab and it appears here live).</span>
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker text-brand-700">Forkcast for restaurants</p>
          <h1 className="mt-1 flex items-center gap-2.5 font-display text-3xl font-extrabold text-ink">
            <MonitorSmartphone className="h-7 w-7 text-ink/40" /> {mode === "live" ? owner!.name : "Partner terminal"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {mode === "live" && <Link href="/partner/onboarding" className="text-sm font-semibold text-brand-700 underline hover:text-brand-900">Manage listing</Link>}
          <Link href="/for-restaurants" className="text-sm font-semibold text-brand-700 underline hover:text-brand-900">Why restaurants join →</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Queue */}
        <div className="space-y-3">
          <h2 className="kicker text-ink/45">Order queue{waiting > 0 && <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">{waiting} waiting</span>}</h2>
          {live ? (
            <div className={cls("w-full rounded-2xl border-2 bg-white p-4 text-left", live.status === "sent" ? "animate-pulse border-brand-500" : "border-ink")}>
              <div className="flex items-center justify-between">
                <p className="font-display font-extrabold text-ink">{live.ref}</p>
                <span className={cls("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", live.status === "sent" ? "bg-brand-600 text-white" : "bg-black/10 text-ink/70")}>{live.status === "sent" ? "New" : live.status}</span>
              </div>
              <p className="mt-1 text-sm text-ink/60">{live.customer} · {live.fulfill} · {live.items.reduce((s, i) => s + i.qty, 0)} items</p>
              <p className="mt-0.5 text-xs text-ink/45">{live.restName} · placed {new Date(live.placedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brand-700"><span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> Live {mode === "live" ? "· from a diner" : "· from the app"}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-400 bg-white/50 p-6 text-center">
              <Inbox className="mx-auto h-8 w-8 text-ink/20" />
              <p className="mt-2 text-sm text-ink/55">No live orders. {mode === "live" ? "New orders from diners will appear here." : "Place one in the app to see it arrive here."}</p>
            </div>
          )}

          {completedList.length > 0 && (
            <>
              <h2 className="kicker pt-2 text-ink/45">Completed{mode === "live" ? " today" : " this session"}</h2>
              {completedList.map((o) => (
                <div key={o.orderId} className="rounded-2xl border border-black/5 bg-white p-3.5 opacity-70">
                  <p className="text-sm font-semibold text-ink">{o.ref} · {o.customer}</p>
                  <p className="text-xs text-ink/50">{o.items.reduce((s, i) => s + i.qty, 0)} items · completed</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Detail */}
        <div className="space-y-4">
          {live ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/40 pb-3">
                <h2 className="font-display text-xl font-extrabold text-ink">Order {live.ref}</h2>
                <span className="text-sm text-ink/55">{live.fulfill === "delivery" ? "Hand to delivery partner when ready" : live.fulfill === "partner" ? "Partner-handoff order" : "Customer pickup"}</span>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                {live.items.map((it) => (
                  <div key={it.itemId}>
                    <div className="flex justify-between text-ink/80">
                      <span><strong>{it.qty}×</strong> {it.name}</span>
                      <span className="tabular-nums">{it.calories * it.qty} cal · {money(it.price * it.qty)}</span>
                    </div>
                    {it.note && <p className="text-xs italic text-ink/50">“{it.note}”</p>}
                  </div>
                ))}
                <div className="flex justify-between border-t border-black/5 pt-2 font-semibold text-ink">
                  <span>Subtotal + 7% tax</span>
                  <span className="tabular-nums">{money(subtotal * (1 + MA_MEALS_TAX))}</span>
                </div>
              </div>

              {live.flags.length > 0 && (
                <div className="mt-4 rounded-xl border-2 border-brand-500 bg-brand-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-brand-800"><AlertTriangle className="h-4 w-4" /> Customer flags — confirm in kitchen</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-ink/75">
                    {live.flags.map((f, i) => (<li key={i} className="flex gap-1.5"><span className="text-brand-700">•</span>{f}</li>))}
                  </ul>
                  <p className="mt-2 border-t border-brand-200 pt-2 text-[11px] text-ink/50">Flags come from the diner&apos;s profile. They are advisories, not guarantees — the kitchen must confirm ingredients and cross-contact.</p>
                </div>
              )}

              {live.claimed && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-xs text-brand-900">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Accepting sent a &quot;Log this meal?&quot; card to the customer&apos;s app — the meal reaches their daily log only after they confirm portions.</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {live.status === "sent" && (
                  <>
                    <span className="mr-1 self-center text-sm font-semibold text-ink/60">Accept — quote prep time:</span>
                    {[10, 15, 20].map((m) => (
                      <button key={m} onClick={() => accept(m)} disabled={busy} className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-40"><Check className="mr-1 inline h-4 w-4" />{m} min</button>
                    ))}
                  </>
                )}
                {live.status === "accepted" && (<button onClick={startPrep} disabled={busy} className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-40"><ChefHat className="mr-1.5 inline h-4 w-4" /> Start preparing</button>)}
                {live.status === "preparing" && (<button onClick={markReady} disabled={busy} className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-40"><Package className="mr-1.5 inline h-4 w-4" /> Mark ready</button>)}
                {live.status === "ready" && (<button onClick={complete} disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-black disabled:opacity-40"><Check className="mr-1.5 inline h-4 w-4" /> Complete order</button>)}
                {live.claimed && live.prepMin && live.status !== "ready" && (<span className="self-center text-xs text-ink/45">Quoted {live.prepMin} min</span>)}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/5 bg-white p-10 text-center text-sm text-ink/50">When an order arrives it opens here with the customer&apos;s flags and accept actions.</div>
          )}

          {/* Menu verification */}
          {mode === "live" ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><BadgeCheck className="h-5 w-5 text-brand-600" /> Your menu</h2>
                <Link href="/partner/onboarding" className="text-sm font-semibold text-brand-700 underline hover:text-brand-900">Edit menu</Link>
              </div>
              <p className="mt-1.5 text-xs text-ink/55">{ownerMenu.length} published {ownerMenu.length === 1 ? "dish" : "dishes"}. Add or correct dishes in setup — corrections are versioned and shown to diners.</p>
              <ul className="mt-4 space-y-1.5">
                {ownerMenu.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2 text-sm">
                    <span className="font-medium text-ink">{m.name}</span>
                    <span className="text-xs text-ink/55">{m.calories} cal · P {m.protein}g · {money(m.price)}</span>
                  </li>
                ))}
                {ownerMenu.length === 0 && <li className="text-xs text-ink/50">No dishes yet — add your menu in setup.</li>}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><BadgeCheck className="h-5 w-5 text-brand-600" /> Menu verification</h2>
                <select value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-ink">
                  {RESTAURANTS.map((r) => (<option key={r.slug} value={r.slug}>{r.name}{r.partner ? " · partner" : ""}</option>))}
                </select>
              </div>
              <p className="mt-1.5 text-xs text-ink/55">Restaurants review Forkcast&apos;s nutrition values and correct them. Every correction is <strong>versioned and timestamped, never silent</strong>.</p>
              {seedRestaurant && <CorrectionEditor slug={slug} onSaved={refreshDemo} />}
              <div className="mt-5 border-t border-black/5 pt-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink"><History className="h-4 w-4 text-ink/40" /> Correction log — {seedRestaurant?.name}</p>
                {corrections.length === 0 ? (
                  <p className="mt-2 text-xs text-ink/50">No corrections recorded on this device yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {corrections.slice(0, 8).map((c) => (
                      <li key={c.id} className="rounded-lg bg-black/[0.03] px-3 py-2 text-xs text-ink/70"><strong>{c.dishName}</strong> · {c.field}: {c.oldValue.toLocaleString()} → <strong>{c.newValue.toLocaleString()}</strong><span className="ml-1 text-ink/45">· v{c.version} · restaurant (demo)</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GateShell({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MonitorSmartphone className="h-7 w-7" /></span>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink/60">{body}</p>
      <div className="mt-7 space-y-3">{children}</div>
    </div>
  );
}

function CorrectionEditor({ slug, onSaved }: { slug: string; onSaved: () => void }) {
  const restaurant = getRestaurant(slug)!;
  const [itemId, setItemId] = useState(restaurant.menu[0]?.id ?? "");
  const [field, setField] = useState<MenuCorrection["field"]>("calories");
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setItemId(restaurant.menu[0]?.id ?? "");
    setValue("");
  }, [slug, restaurant.menu]);

  const item = useMemo(() => restaurant.menu.find((m) => m.id === itemId), [restaurant.menu, itemId]);
  const current = item ? item[field] : 0;

  const save = () => {
    const v = Number(value);
    if (!item || !Number.isFinite(v) || v < 0 || v === current) return;
    addCorrection({ slug, itemId: item.id, dishName: item.name, field, oldValue: current, newValue: v });
    setValue("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
      <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink">
        {restaurant.menu.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
      </select>
      <select value={field} onChange={(e) => setField(e.target.value as MenuCorrection["field"])} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink">
        {FIELDS.map((f) => (<option key={f} value={f}>{f}</option>))}
      </select>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={`now ${current.toLocaleString()}`} inputMode="numeric" className="w-32 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm tabular-nums text-ink placeholder:text-ink/35" />
      <button onClick={save} className={cls("rounded-full px-4 py-2 text-sm font-bold transition", saved ? "bg-ink text-white" : "bg-brand-600 text-white hover:bg-brand-700")}>{saved ? "Recorded ✓" : "Record correction"}</button>
    </div>
  );
}
