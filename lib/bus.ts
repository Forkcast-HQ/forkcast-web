// Cross-surface sync bus + versioned menu corrections.
// Design-handoff protocol: localStorage is the prototype transport
// (`palatify-live-order`, `palatify-corrections`). Replace with a real
// backend channel (e.g. Postgres + subscriptions) in production.

import type { LiveOrderBus, MenuCorrection } from "./types";
import { uid } from "./format";

const BUS_KEY = "palatify-live-order";
const CORRECTIONS_KEY = "palatify-corrections";

export function readBus(): LiveOrderBus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUS_KEY);
    return raw ? (JSON.parse(raw) as LiveOrderBus) : null;
  } catch {
    return null;
  }
}

export function writeBus(bus: LiveOrderBus): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUS_KEY, JSON.stringify(bus));
  } catch {
    /* ignore */
  }
}

export function clearBus(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BUS_KEY);
  } catch {
    /* ignore */
  }
}

// ---- Corrections (versioned, timestamped — never silent) -----------

export function readCorrections(): MenuCorrection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CORRECTIONS_KEY);
    return raw ? (JSON.parse(raw) as MenuCorrection[]) : [];
  } catch {
    return [];
  }
}

export function correctionsFor(slug: string, itemId?: string): MenuCorrection[] {
  return readCorrections()
    .filter((c) => c.slug === slug && (itemId === undefined || c.itemId === itemId))
    .sort((a, b) => b.correctedAt - a.correctedAt);
}

export function addCorrection(
  input: Omit<MenuCorrection, "id" | "version" | "correctedAt" | "source">,
): MenuCorrection {
  const all = readCorrections();
  const version =
    all.filter((c) => c.slug === input.slug && c.itemId === input.itemId && c.field === input.field).length + 1;
  const rec: MenuCorrection = {
    ...input,
    id: uid(),
    version,
    correctedAt: Date.now(),
    source: "restaurant-demo",
  };
  try {
    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify([...all, rec]));
  } catch {
    /* ignore */
  }
  return rec;
}
