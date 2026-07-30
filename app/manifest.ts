import type { MetadataRoute } from "next";

/**
 * Installable-app metadata. Icons are generated from the brand files — see
 * public/icons/ — and the two 512s are deliberately different drawings:
 * `any` keeps the brand's rounded-square frame, `maskable` is full-bleed
 * with the mark pulled inside the 80% safe circle, because Android crops
 * maskable icons to whatever shape the launcher uses.
 */

/**
 * Required for the GitHub Pages build. `output: export` has no server to
 * run a route handler on, so Next refuses to collect this route unless it
 * is explicitly static — without it the export build fails outright with
 * "export const dynamic = force-static ... not configured on route
 * /manifest.webmanifest". The SSR build does not care either way.
 */
export const dynamic = "force-static";

/**
 * Manifest URLs are NOT rewritten with basePath by Next — unlike `<Link>`
 * or next/image, this is plain JSON the browser resolves against the
 * origin. On Pages the app is served from a subdirectory, so a bare
 * "/icons/icon-192.png" would resolve to the domain root and 404.
 * Mirrors the convention in lib/images.ts.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.PAGES_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palatify — Eat out. Stay on plan.",
    short_name: "Palatify",
    description:
      "Set your goals once and every restaurant menu near you re-ranks around what's left of your day.",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#f7f4f0",
    theme_color: "#f7f4f0",
    categories: ["food", "health", "lifestyle"],
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${BASE}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
