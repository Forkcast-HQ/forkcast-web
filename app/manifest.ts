import type { MetadataRoute } from "next";

/**
 * Installable-app metadata. Icons are generated from the brand files — see
 * public/icons/ — and the two 512s are deliberately different drawings:
 * `any` keeps the brand's rounded-square frame, `maskable` is full-bleed
 * with the mark pulled inside the 80% safe circle, because Android crops
 * maskable icons to whatever shape the launcher uses.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palatify — Eat out. Stay on plan.",
    short_name: "Palatify",
    description:
      "Set your goals once and every restaurant menu near you re-ranks around what's left of your day.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4f0",
    theme_color: "#f7f4f0",
    categories: ["food", "health", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
