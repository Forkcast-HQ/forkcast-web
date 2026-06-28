/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow viewing the dev server from other devices on your LAN (e.g. your phone)
  allowedDevOrigins: ["192.168.1.167", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
