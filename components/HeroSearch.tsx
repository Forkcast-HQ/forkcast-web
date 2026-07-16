"use client";

// DoorDash-style hero action: one big search that drops you straight into
// personalized discovery.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/discover?q=${encodeURIComponent(q.trim())}` : "/discover");
  };

  return (
    <form onSubmit={go} className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-black/10 bg-white p-2 pl-5 card-shadow-lg transition focus-within:border-brand-600">
      <Search className="h-5 w-5 shrink-0 text-ink/40" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search restaurants, dishes, cuisines…"
        className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink/40 focus:outline-none"
        aria-label="Search restaurants"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
      >
        Find food <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
