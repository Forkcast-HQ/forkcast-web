"use client";

// Order history — every order with its evidence trail:
// reference, restaurant, timestamp, fulfillment, totals, confidence,
// and whether it was confirmed into the daily log.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, ReceiptText, RotateCcw } from "lucide-react";
import { useOrder, orderStatus } from "@/lib/order";
import { money, cls } from "@/lib/format";

export default function OrdersPage() {
  const router = useRouter();
  const { hydrated, orders, reorder, now } = useOrder();

  if (!hydrated) return <Shell><p className="py-20 text-center text-ink/40">Loading…</p></Shell>;

  const list = orders.slice().reverse();

  return (
    <Shell>
      <h1 className="font-display text-3xl font-extrabold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-ink/55">Every order keeps its reference, timestamp, and nutrition-confidence metadata — the evidence trail behind your daily log.</p>

      {list.length === 0 ? (
        <div className="mt-14 text-center">
          <ReceiptText className="mx-auto h-10 w-10 text-ink/20" />
          <p className="mt-4 text-ink/55">No orders yet.</p>
          <Link href="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Discover restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((o) => {
            const status = orderStatus(o, now);
            const live = !o.logged && !o.dismissedLog && status !== "ready";
            return (
              <div key={o.id} className={cls("rounded-2xl border bg-white p-5", live ? "border-brand-300" : "border-black/5")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                      {o.ref} · {o.restaurantName}
                      {live && <span className="animate-pulse rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">Live · {status}</span>}
                      {o.logged && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">Logged to day</span>}
                      {o.dismissedLog && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-ink/50">Not logged</span>}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(o.placedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      {" · "}{o.fulfill}{" · "}{o.items.reduce((s, i) => s + i.qty, 0)} items · {money(o.total)} (demo)
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
                      {o.partner ? (<><BadgeCheck className="h-3.5 w-3.5 text-brand-600" /> Partner-verified nutrition</>) : "Estimated nutrition"}
                      {" · prototype integration"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => { reorder(o.id); router.push("/basket"); }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3.5 py-2 text-sm font-semibold text-ink/70 hover:bg-black/10"
                    >
                      <RotateCcw className="h-4 w-4" /> Reorder
                    </button>
                    <Link href="/order" className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
