"use client";

// Premium entitlements — matching the financial model: the closed loop
// (scores, discovery, ordering, confirmed logging) is FREE forever; Premium
// gates the AI extras (coach chat, photo AI, calibration depth). Every new
// account gets a 7-day full trial from creation.
//
// Two modes:
// - CLOUD (Supabase configured): entitlement lives server-side in
//   profiles.plan / premium_until ('premium' | 'pilot_comp'), written only by
//   the founders/billing — a DB trigger blocks end users from granting
//   themselves premium (see supabase/migrations/0002_entitlements.sql).
//   During the pilot, "Upgrade" opens a comp-request email: purchases open
//   at launch (mobile: store IAP via RevenueCat; web: Stripe if demand).
// - DEMO (no keys): "Upgrade" flips a local, clearly demo-labeled flag so
//   the gating UX can be evaluated. No payment processing exists.

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { supa, cloudEnabled } from "./supabase";

export const TRIAL_DAYS = 7;
export const FREE_DAILY_MESSAGES = 25; // coach-chat cap during trial (Premium: unlimited)
export const PRICE_LINE = "$4.99/mo or $39.99/yr";

const DAY = 86400000;
const premiumKey = (id: string) => `forkcast.premium.${id}`;
const chatCountKey = (id: string) => {
  const d = new Date();
  return `forkcast.chatcount.${id}.${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export interface PremiumState {
  hydrated: boolean;
  cloud: boolean; // true = entitlement is server-side (spoof-proof)
  isPremium: boolean;
  plan: "free" | "premium" | "pilot_comp";
  trialActive: boolean;
  trialDaysLeft: number;
  /** Premium OR inside the 7-day trial */
  hasAccess: boolean;
  messagesLeftToday: number; // Infinity when premium
  consumeMessage: () => void;
  /** Demo mode: flips the demo flag. Cloud mode: opens a pilot comp-request email. */
  upgradeDemo: () => void;
  cancelDemo: () => void;
}

export function usePremium(): PremiumState {
  const { user, hydrated } = useAuth();
  const id = user?.id ?? null;
  const cloud = cloudEnabled();
  const [plan, setPlan] = useState<PremiumState["plan"]>("free");
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [demoFlag, setDemoFlag] = useState(false);
  const [used, setUsed] = useState(0);

  const refresh = useCallback(() => {
    if (!id) {
      setPlan("free");
      setPremiumUntil(null);
      setDemoFlag(false);
      setUsed(0);
      return;
    }
    try {
      setDemoFlag(localStorage.getItem(premiumKey(id)) === "1");
      setUsed(parseInt(localStorage.getItem(chatCountKey(id)) ?? "0", 10) || 0);
    } catch {
      /* ignore */
    }
    const s = supa();
    if (s) {
      s.from("profiles")
        .select("plan, premium_until")
        .eq("user_id", id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPlan((data.plan as PremiumState["plan"]) ?? "free");
            setPremiumUntil(data.premium_until ?? null);
          }
        });
    }
  }, [id]);

  useEffect(() => {
    refresh();
    window.addEventListener("forkcast-premium-change", refresh);
    return () => window.removeEventListener("forkcast-premium-change", refresh);
  }, [refresh]);

  // Cloud: server-side plan decides (with optional expiry). Demo: local flag.
  const entitled =
    plan !== "free" && (!premiumUntil || new Date(premiumUntil).getTime() > Date.now());
  const isPremium = cloud ? entitled : demoFlag;

  const trialMsLeft = user ? Math.max(0, user.createdAt + TRIAL_DAYS * DAY - Date.now()) : 0;
  const trialActive = trialMsLeft > 0;
  const trialDaysLeft = Math.ceil(trialMsLeft / DAY);

  const consumeMessage = useCallback(() => {
    if (!id || isPremium) return;
    try {
      const k = chatCountKey(id);
      const next = (parseInt(localStorage.getItem(k) ?? "0", 10) || 0) + 1;
      localStorage.setItem(k, String(next));
      setUsed(next);
    } catch {
      /* ignore */
    }
  }, [id, isPremium]);

  const upgradeDemo = useCallback(() => {
    if (!id) return;
    if (cloud) {
      // Pilot: purchases open at launch; testers are comped by the founders.
      window.location.href =
        "mailto:shasanov@seas.harvard.edu?subject=Forkcast%20Premium%20(pilot)&body=Hi%20—%20I%27d%20like%20Premium%20access%20during%20the%20pilot.%20My%20account%20email%3A%20" +
        encodeURIComponent(user?.email ?? "");
      return;
    }
    try {
      localStorage.setItem(premiumKey(id), "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("forkcast-premium-change"));
  }, [id, cloud, user]);

  const cancelDemo = useCallback(() => {
    if (!id || cloud) return; // cloud entitlements are managed server-side
    try {
      localStorage.removeItem(premiumKey(id));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("forkcast-premium-change"));
  }, [id, cloud]);

  return {
    hydrated,
    cloud,
    isPremium,
    plan: cloud ? plan : demoFlag ? "premium" : "free",
    trialActive,
    trialDaysLeft,
    hasAccess: isPremium || trialActive,
    messagesLeftToday: isPremium ? Infinity : Math.max(0, FREE_DAILY_MESSAGES - used),
    consumeMessage,
    upgradeDemo,
    cancelDemo,
  };
}
