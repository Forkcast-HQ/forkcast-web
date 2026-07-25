"use client";

// Client-side access to the restaurant/menu catalog (lib/catalog.ts), fetched
// once from Supabase and shared app-wide. Mirrors the old static
// data/restaurants.ts API (RESTAURANTS/getRestaurant/allMenuItems/CUISINES)
// so call sites mostly just swap the import for useCatalog() — but the data
// now arrives async, so `loading` must be checked wherever an empty
// catalog would otherwise be indistinguishable from "really not found".

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Restaurant } from "./types";
import {
  allMenuItemsFrom,
  cuisinesFrom,
  fetchCatalog,
  getRestaurantFrom,
  type MenuItemWithContext,
} from "./catalog";

interface CatalogValue {
  restaurants: Restaurant[];
  loading: boolean;
  getRestaurant: (slug: string) => Restaurant | undefined;
  allMenuItems: () => MenuItemWithContext[];
  cuisines: string[];
}

const Ctx = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then((data) => {
      if (cancelled) return;
      setRestaurants(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogValue>(
    () => ({
      restaurants,
      loading,
      getRestaurant: (slug: string) => getRestaurantFrom(restaurants, slug),
      allMenuItems: () => allMenuItemsFrom(restaurants),
      cuisines: cuisinesFrom(restaurants),
    }),
    [restaurants, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
