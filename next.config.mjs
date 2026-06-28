/** @type {import('next').NextConfig} */

// Static export (for GitHub Pages) is gated behind STATIC_EXPORT so the default
// `next dev` / `next build` still run as a normal SSR app (e.g. on Netlify).
const isExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // We render food imagery with plain <img>, so image optimization isn't needed.
  images: { unoptimized: true },
  // Allow viewing the dev server from other devices on your LAN (e.g. your phone).
  allowedDevOrigins: ["192.168.1.167", "localhost", "127.0.0.1"],
  ...(isExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
        assetPrefix: basePath || undefined,
      }
    : {}),
};

export default nextConfig;
