"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  DailyTargets,
  HealthProfile,
  LoggedMeal,
  WeightEntry,
} from "./types";
import { calibrateTdee, computeTargets, type CalibrationResult } from "./nutrition";
import { todayKey, uid } from "./format";
import { useAuth } from "./auth";
import { cloudEnabled } from "./supabase";
import {
  pullAll,
  pushProfile as cloudPushProfile,
  pushMeal as cloudPushMeal,
  deleteMeal as cloudDeleteMeal,
  pushWeight as cloudPushWeight,
  pushMealsBulk,
  pushWeightsBulk,
} from "./cloud";
import { syncMealToGoogleHealth } from "./health";

const dataKey = (id: string) => `palatify.data.${id}`;

interface PersistShape {
  profile: HealthProfile | null;
  meals: LoggedMeal[];
  weights: WeightEntry[];
}

interface StoreValue extends PersistShape {
  hydrated: boolean;
  targets: DailyTargets | null;
  calibration: CalibrationResult | null; // adaptive TDEE from the user's own logs
  setProfile: (p: HealthProfile) => void;
  logMeal: (m: Omit<LoggedMeal, "id" | "loggedAt"> & { loggedAt?: number }) => void;
  removeMeal: (id: string) => void;
  addWeight: (kg: number) => void;
  resetAll: () => void;
  todaysMeals: () => LoggedMeal[];
  consumedToday: () => Totals;
  streak: () => number;
}

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

const empty: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 };

const Ctx = createContext<StoreValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const userId = user?.id ?? null;

  const [profile, setProfileState] = useState<HealthProfile | null>(null);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);

  // Load the active user's data whenever the session changes.
  useEffect(() => {
    if (!authHydrated) return;
    if (!userId) {
      setProfileState(null);
      setMeals([]);
      setWeights([]);
      setLoadedFor(null);
      return;
    }
    try {
      const raw = localStorage.getItem(dataKey(userId));
      const p: PersistShape | null = raw ? JSON.parse(raw) : null;
      setProfileState(p?.profile ?? null);
      setMeals(p?.meals ?? []);
      setWeights(p?.weights ?? []);
    } catch {
      setProfileState(null);
      setMeals([]);
      setWeights([]);
    }
    setLoadedFor(userId);
  }, [userId, authHydrated]);

  // Cloud sync (Supabase configured): after the local copy loads, pull the
  // cross-device truth. Cloud data wins when present; a device-only history
  // (account predating the backend) is pushed up once instead.
  useEffect(() => {
    if (!userId || loadedFor !== userId || !cloudEnabled()) return;
    let cancelled = false;
    pullAll(userId).then((remote) => {
      if (!remote || cancelled) return;
      const hasRemote = remote.profile || remote.meals.length || remote.weights.length;
      if (hasRemote) {
        if (remote.profile) setProfileState(remote.profile);
        if (remote.meals.length) setMeals(remote.meals);
        if (remote.weights.length) setWeights(remote.weights);
      } else {
        // First cloud sign-in from this device: seed the backend.
        setProfileState((p) => {
          if (p) cloudPushProfile(userId, p);
          return p;
        });
        setMeals((m) => {
          if (m.length) pushMealsBulk(userId, m);
          return m;
        });
        setWeights((w) => {
          if (w.length) pushWeightsBulk(userId, w);
          return w;
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, loadedFor]);

  // Persist on change (only once this user's data is loaded).
  useEffect(() => {
    if (!authHydrated || !userId || loadedFor !== userId) return;
    try {
      localStorage.setItem(dataKey(userId), JSON.stringify({ profile, meals, weights }));
    } catch {
      /* ignore */
    }
  }, [profile, meals, weights, userId, authHydrated, loadedFor]);

  const setProfile = useCallback(
    (p: HealthProfile) => {
      setProfileState(p);
      const entry = { date: todayKey(), weightKg: p.weightKg };
      setWeights((w) => {
        const next = w.filter((e) => e.date !== entry.date);
        return [...next, entry].sort((a, b) => a.date.localeCompare(b.date));
      });
      if (userId) {
        cloudPushProfile(userId, p);
        cloudPushWeight(userId, entry);
      }
    },
    [userId],
  );

  const logMeal = useCallback(
    (m: Omit<LoggedMeal, "id" | "loggedAt"> & { loggedAt?: number }) => {
      const meal: LoggedMeal = { ...m, id: uid(), loggedAt: m.loggedAt ?? Date.now() };
      setMeals((prev) => [...prev, meal]);
      if (userId) {
        cloudPushMeal(userId, meal);
        syncMealToGoogleHealth(meal); // no-op unless Fitbit/Google Health is connected + auto-sync is on
      }
    },
    [userId],
  );

  const removeMeal = useCallback(
    (id: string) => {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      if (userId) cloudDeleteMeal(userId, id);
    },
    [userId],
  );

  const addWeight = useCallback(
    (kg: number) => {
      const entry = { date: todayKey(), weightKg: kg };
      setWeights((w) => {
        const next = w.filter((e) => e.date !== entry.date);
        return [...next, entry].sort((a, b) => a.date.localeCompare(b.date));
      });
      setProfileState((p) => (p ? { ...p, weightKg: kg } : p));
      if (userId) cloudPushWeight(userId, entry);
    },
    [userId],
  );

  const resetAll = useCallback(() => {
    setProfileState(null);
    setMeals([]);
    setWeights([]);
    try {
      if (userId) localStorage.removeItem(dataKey(userId));
    } catch {
      /* ignore */
    }
  }, [userId]);

  // Adaptive calibration: once enough logs + weigh-ins exist, the target is
  // computed from the user's OWN observed energy balance, blended with the
  // formula in proportion to data confidence. Fit Scores and budgets follow.
  const calibration = useMemo(
    () => (profile ? calibrateTdee(profile, meals, weights) : null),
    [profile, meals, weights],
  );

  const targets = useMemo(
    () =>
      profile
        ? computeTargets(profile, calibration?.status === "active" ? calibration.blendedTdee : undefined)
        : null,
    [profile, calibration],
  );

  const todaysMeals = useCallback(() => {
    const key = todayKey();
    return meals.filter((m) => todayKey(new Date(m.loggedAt)) === key);
  }, [meals]);

  const consumedToday = useCallback((): Totals => {
    return todaysMeals().reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
        fiber: acc.fiber + m.fiber,
        sodium: acc.sodium + m.sodium,
        sugar: acc.sugar + m.sugar,
      }),
      { ...empty },
    );
  }, [todaysMeals]);

  // Consecutive days (ending today or yesterday) with at least one logged meal.
  const streak = useCallback(() => {
    const days = new Set(meals.map((m) => todayKey(new Date(m.loggedAt))));
    let count = 0;
    const d = new Date();
    if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1); // allow today not-yet-logged
    while (days.has(todayKey(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [meals]);

  const hydrated = authHydrated && (userId ? loadedFor === userId : true);

  const value: StoreValue = {
    profile,
    meals,
    weights,
    hydrated,
    targets,
    calibration,
    setProfile,
    logMeal,
    removeMeal,
    addWeight,
    resetAll,
    todaysMeals,
    consumedToday,
    streak,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUser must be used within UserProvider");
  return v;
}
