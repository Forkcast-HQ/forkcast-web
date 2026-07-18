"use client";

// Premium entitlements — demo-grade, matching the financial model:
// the closed loop (scores, discovery, ordering, confirmed logging) is FREE
// forever; Premium gates the AI extras (coach chat, photo AI, calibration
// depth). Every new account gets a 7-day full trial from creation.
//
// HONESTY: there is no payment processing. "Upgrade" flips a local, clearly
// demo-labeled flag so the gating UX can be evaluated. Production swaps this
// for real billing without changing call sites.

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";

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
  isPremium: boolean; // demo flag
  trialActive: boolean;
  trialDaysLeft: number;
  /** Premium OR inside the 7-day trial */
  hasAccess: boolean;
  messagesLeftToday: number; // Infinity when premium
  consumeMessage: () => void;
  upgradeDemo: () => void;
  cancelDemo: () => void;
}

export function usePremium(): PremiumState {
  const { user, hydrated } = useAuth();
  const id = user?.id ?? null;
  const [isPremium, setIsPremium] = useState(false);
  const [used, setUsed] = useState(0);

  const refresh = useCallback(() => {
    if (!id) {
      setIsPremium(false);
      setUsed(0);
      return;
    }
    try {
      setIsPremium(localStorage.getItem(premiumKey(id)) === "1");
      setUsed(parseInt(localStorage.getItem(chatCountKey(id)) ?? "0", 10) || 0);
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    refresh();
    window.addEventListener("forkcast-premium-change", refresh);
    return () => window.removeEventListener("forkcast-premium-change", refresh);
  }, [refresh]);

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
    try {
      localStorage.setItem(premiumKey(id), "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("forkcast-premium-change"));
  }, [id]);

  const cancelDemo = useCallback(() => {
    if (!id) return;
    try {
      localStorage.removeItem(premiumKey(id));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("forkcast-premium-change"));
  }, [id]);

  return {
    hydrated,
    isPremium,
    trialActive,
    trialDaysLeft,
    hasAccess: isPremium || trialActive,
    messagesLeftToday: isPremium ? Infinity : Math.max(0, FREE_DAILY_MESSAGES - used),
    consumeMessage,
    upgradeDemo,
    cancelDemo,
  };
}
