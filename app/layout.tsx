import type { Metadata, Viewport } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/lib/auth";
import { UserProvider } from "@/lib/store";
import { OrderProvider } from "@/lib/order";
import { CatalogProvider } from "@/lib/catalogContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TodayBar } from "@/components/TodayBar";
import { CartBar } from "@/components/CartBar";
import { CoachChat } from "@/components/CoachChat";
import { ComingSoon } from "@/components/ComingSoon";

const isDevelopmentExport = process.env.STATIC_EXPORT === "true";

/**
 * Fonts are self-hosted through next/font rather than pulled in with an
 * `@import` at the top of globals.css. The old arrangement cost a DNS
 * lookup, a TLS handshake and two round trips to fonts.googleapis.com
 * *before* the first paint — on the landing page that was the single
 * largest thing standing between the visitor and the headline.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

/** Wordmark only — see components/Logo.tsx and the .wordmark rule. */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://palatify.com"),
  title: {
    default: isDevelopmentExport
      ? "Palatify — Eat out. Stay on plan."
      : "Palatify — Coming Soon",
    template: "%s · Palatify",
  },
  description: isDevelopmentExport
    ? "Set your goals once and every restaurant menu near you re-ranks around what's left of your day. Nutrition-aware dining for Boston, with a source behind every number."
    : "Palatify is building a more personal way to discover restaurant meals that fit your goals.",
  applicationName: "Palatify",
  keywords: [
    "restaurant nutrition",
    "calorie tracking",
    "healthy eating out",
    "Boston restaurants",
    "macro tracking",
    "menu nutrition",
  ],
  openGraph: {
    type: "website",
    siteName: "Palatify",
    title: "Palatify — Eat out. Stay on plan.",
    description:
      "Every menu near you, re-ranked around what's left of your day. Boston first.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Palatify — Eat out. Stay on plan.",
    description:
      "Every menu near you, re-ranked around what's left of your day. Boston first.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f4f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDevelopmentExport) {
    return (
      <html lang="en" className={`${archivo.variable} ${dmSans.variable}`}>
        <body>
          <ComingSoon />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${archivo.variable} ${dmSans.variable}`}>
      <body className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CatalogProvider>
          <AuthProvider>
            <UserProvider>
              <OrderProvider>
                <Navbar />
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
                <TodayBar />
                <CartBar />
                <CoachChat />
              </OrderProvider>
            </UserProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
